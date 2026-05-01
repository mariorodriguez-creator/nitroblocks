---
name: migration-design-system
description: Build a normalized design system from raw designlang extraction using forensic multi-level audits. Follows an audit-first methodology -- every token and component decision is evidence-based. Produces curated tokens (CSS + JSON), component snippets, a Pencil canvas, and full audit documentation. Use after migration-discovery validates the planner assumptions.
---

# Migration Design System Build

Execution Phase 2 of the EDS migration pipeline. Takes the **raw designlang
extraction** and runs a forensic, audit-driven normalization process to produce
a clean, atomic design system. The migration-planner passes through designlang
output without normalization; this skill does the heavy lifting.

## When to Use

- After `migration-discovery` validates the planner assumptions (preferred)
- After `migration-planner` when discovery was skipped (fallback)
- To build the target design system before site development begins
- To normalize a raw designlang extraction into a production-quality token system

## Core Principles

> 1. **Audit first, change second.** No token change without evidence.
> 2. **The extracted/ directory is frozen.** It is the evidence base. Never edit it.
> 3. **CSS is the source of truth.** The Pencil canvas mirrors it, not vice versa.
> 4. **Semantic naming only.** No hue-based (`--color-blue-500`) or magic-number
>    (`--space-13px`) tokens. Everything gets a meaningful role name.
> 5. **Every decision is logged.** The normalization log is the audit trail.

## Input

### Primary source (always)

Raw designlang extraction in `./migration-work/design-extract/`:
- `*-design-tokens.json` -- W3C DTCG tokens (the evidence base)
- `*-variables.css` -- CSS custom properties as extracted
- `*-figma-variables.json` -- variable definitions for Pencil import
- `*-design-language.md` -- 19-section design narrative
- `*-screenshots.json` -- **primary component inventory**: cluster, variant,
  sizeHint, bounds, and path for every component crop designlang produced
  (pairs 1:1 with `screenshots/*.png`)
- `screenshots/*.png` -- component crops (buttons, cards, nav, etc.)
- `screenshots/templates/*.png` -- per-template full-page captures at 3 viewports
- `*-anatomy.tsx` -- **supplementary only**. React-shaped component scaffolds;
  often thinly populated on real sites. Use for cross-check, not as primary
  evidence.
- `*-motion-tokens.json` -- motion language
- `*-agent-rules.md` -- inferred design rules
- `*-grade.html` -- quality grade per dimension

### Context (for scope and mapping)

- `./migration-work/proposal/03-atomic-inventory.md` -- planner's atomic catalogue
- `./migration-work/proposal/04-block-mapping.md` -- block specs and content models
- `./migration-work/proposal/02-design-system-assessment.md` -- flagged issues

### If discovery was run

- `./migration-work/discovery/refined/*` -- validated adjustments from discovery

## Output

All outputs go to `./migration-work/design-system/`:

| File | Purpose |
|------|---------|
| `tokens/tokens.css` | Curated CSS custom properties (source of truth) |
| `tokens/tokens.json` | W3C DTCG JSON mirror of tokens.css |
| `docs/color-audit.md` | Color audit with clustering, consolidation, target palette |
| `docs/typography-audit.md` | Typography audit with weight validation, scale rationalization |
| `docs/spacing-audit.md` | Spacing audit with grid snapping, scale definition |
| `docs/component-audit.md` | Component variant × state matrix, decisions |
| `docs/motion-audit.md` | Motion token audit |
| `docs/accessibility-audit.md` | Contrast failures and fixes |
| `docs/normalization-log.md` | Chronological record of every material change |
| `docs/atomic-map.md` | Authoritative atom/molecule/organism placement |
| `design-system.pen` | Pencil canvas — single source of truth for design |
| `token-mapping.md` | Mapping between Pencil variables and EDS CSS properties |

## Prerequisites

- Pencil MCP server must be connected and available
- Read the Pencil MCP tool schemas before starting:
  - `get_guidelines` -- load guides for working with .pen files
  - `set_variables` -- for token definition
  - `batch_design` -- for component creation
  - `get_screenshot` -- for visual verification
  - `batch_get` -- for reading existing canvas structure

## Workflow

### Step 0: Prepare workspace

Create the target directories and mirror the planner's reference screenshots
into the design-system workspace. These are consumed in later steps for
visual validation of components built on the Pencil canvas, and in the
normalization audits to compare against source proportions.

```bash
mkdir -p ./migration-work/design-system/{tokens,docs,preview/reference,preview/components}

# Copy desktop reference screenshots (prefer pixel-width suffix if present).
# Non-desktop viewports are excluded on purpose: the audit baselines are
# desktop-first. Failing silently is OK — some pipelines skip Phase E.
#
# Primary path is screenshots/templates/ (introduced when Phase E was split
# from designlang's native screenshots/ directory). Two legacy fallbacks
# preserve compatibility with pre-split pipeline runs.
SRC=""
if ls ./migration-work/design-extract/screenshots/templates/*-desktop-1440.png >/dev/null 2>&1; then
  SRC="./migration-work/design-extract/screenshots/templates"
elif ls ./migration-work/design-extract/screenshots/*-desktop-1440.png >/dev/null 2>&1; then
  SRC="./migration-work/design-extract/screenshots"
elif ls ./migration-work/design-extract/screenshots/*-desktop.png >/dev/null 2>&1; then
  SRC="./migration-work/design-extract/screenshots"
fi

if [ -n "$SRC" ]; then
  cp "$SRC"/*-desktop-1440.png \
     ./migration-work/design-system/preview/reference/ 2>/dev/null \
    || cp "$SRC"/*-desktop.png \
       ./migration-work/design-system/preview/reference/ 2>/dev/null || true
fi

# Mirror component-level crops (from designlang --screenshots) so the
# component audit can reference them without reaching back across workspaces.
# These are paired 1:1 with entries in design-extract/*-screenshots.json.
if ls ./migration-work/design-extract/screenshots/*.png >/dev/null 2>&1; then
  # Only copy top-level PNGs (component crops), not the templates/ subdir.
  find ./migration-work/design-extract/screenshots -maxdepth 1 -name '*.png' \
    -exec cp {} ./migration-work/design-system/preview/components/ \; 2>/dev/null || true
fi

REF_COUNT=$(ls ./migration-work/design-system/preview/reference/ 2>/dev/null | wc -l | tr -d ' ')
COMP_COUNT=$(ls ./migration-work/design-system/preview/components/ 2>/dev/null | wc -l | tr -d ' ')
echo "[design-system] Copied ${REF_COUNT} template screenshot(s) and ${COMP_COUNT} component crop(s) from migration-planner output"
```

Announce which source is being used:
- "Building from discovery outputs" (discovery phase completed)
- "Building from planner outputs (discovery was skipped)"

If `REF_COUNT` is 0, announce: "No planner template screenshots found.
Phase E of `run-discovery.sh` may not have run — visual validation steps
will be limited to the Pencil canvas only." If `COMP_COUNT` is 0, announce:
"No planner component crops found. Phase C did not run with `--screenshots`
— the component audit will rely on DOM structure and design-language.md
narrative only." Do not proceed to steps that require reference
screenshots without acknowledging these conditions.

---

### Step 1: Color Audit (`docs/color-audit.md`)

**Method:**
1. Pull the full color inventory from `*-design-tokens.json` and
   `*-design-language.md` (color palette section).
2. Cluster by **perceptual distance** (ΔE₀₀ ≤ 5) AND by **context** -- two
   colors merge only if they look the same AND play the same role.
3. Pick representatives by: highest usage count > site-declared variable value >
   rounder hex.
4. Assign each cluster to a semantic slot in the target palette.
5. Reject single-use, gradient-only, or off-brand accents with no systemic role.
6. Flag derived tokens (success, warning) where no canonical brand value exists --
   pick WCAG-AA-safe stubs.

**Document in the audit:**
- Raw inputs (total unique colors, gradients, site-declared properties)
- Clustering table: cluster name, representative, members with ΔE₀₀, total uses, role
- Consolidation rules: why specific colors were merged or kept separate
- Target palette: brand, surface, text, border, state tokens with values and roles
- Rejected colors: what was dropped and why
- WCAG contrast checks: each text/surface pair with ratio

**Output token groups:**
```
--color-brand-primary       --color-surface-base
--color-brand-primary-hover --color-surface-raised
--color-text-primary        --color-surface-sunken
--color-text-secondary      --color-surface-inverse
--color-text-muted          --color-border-subtle
--color-text-inverse        --color-border-strong
--color-state-error         --color-state-success
--color-state-warning       --color-state-info
--color-focus-ring
```

---

### Step 2: Typography Audit (`docs/typography-audit.md`)

**Method:**
1. Extract all font families, sizes, weights, line-heights, letter-spacings from
   the design-tokens and design-language documents.
2. **Validate font weights against actual font files.** Check what weights the
   declared font family actually ships. If the site uses weight 400 but the font
   only has 300/600/700, the browser is synthesizing -- document this as a
   "weight inversion" and assign the correct weight.
3. Consolidate sizes into a clean typographic scale (e.g., minor-third or
   custom scale). Use raw data as evidence for which steps to keep.
4. Define heading hierarchy (H1-H6) with sizes, weights, line-heights.
5. Define body, caption, label, legal text roles.

**Document in the audit:**
- Raw inputs: font families found, all sizes, all weights, all line-heights
- Font weight validation: what the font file ships vs what the site declares
- Decision: actual weight mapping (e.g., "SemiBold 600 serves as body regular")
- Proposed scale with role assignments
- Letter-spacing decisions

**Output token groups:**
```
--font-family-primary       --font-size-xs through --font-size-xxl
--font-family-secondary     --font-weight-normal, --font-weight-bold
--line-height-tight          --line-height-normal, --line-height-relaxed
--letter-spacing-tight       --letter-spacing-normal, --letter-spacing-wide
```

---

### Step 3: Spacing Audit (`docs/spacing-audit.md`)

**Method:**
1. Pull all spacing values from `*-design-tokens.json`.
2. Determine the target grid base (typically 4px or 8px). Evaluate which base
   produces the fewest off-grid values.
3. Snap each raw value to the nearest grid multiple. Record the delta.
4. Cluster snapped values by role band (hairline / element / block / section / hero).
5. Collapse tokens whose nearest scale step is within ±2px of each other.
6. Define a sparse, intentional scale -- skipped indices are deliberate to force
   consistent rhythm.

**Document in the audit:**
- Raw inputs: total unique values, which are already on-grid, which are off-grid
- Grid base decision with rationale
- Mapping table: raw value → snapped value → delta → token name → notes
- Role bands: when to use each token range
- Container width tokens (layout-specific, separate from spacing scale)

**Output token naming:**
```
--space-0: 0      --space-1: 4px    --space-2: 8px    --space-4: 16px
--space-6: 24px   --space-8: 32px   --space-10: 40px  --space-12: 48px
... (sparse scale, name = value/base)
```

---

### Step 4: Shadows, Radii, and Motion Audit

**Shadows:**
- Extract all box-shadows from the design-tokens.
- Consolidate into 2-4 elevation levels (sm, md, lg, focus).
- Document what was merged and rationale.

**Border radii:**
- Extract all border-radius values.
- Snap to a small scale (none, sm, md, lg, full).
- Document the mapping.

**Motion:**
- Extract duration and easing values from `*-motion-tokens.json`.
- Define fast/base/slow duration tokens and standard easing curves.
- Document which site animations map to which tokens.

**Output tokens:**
```
--shadow-sm, --shadow-md, --shadow-lg, --shadow-focus
--radius-none, --radius-sm, --radius-md, --radius-lg, --radius-full
--motion-fast, --motion-base, --motion-slow
--ease-out, --ease-in, --ease-in-out
```

---

### Step 5: Write `tokens/tokens.css`

Assemble all audit decisions into the single source-of-truth file:

```css
:root {
  /* === Brand === */
  --color-brand-primary: #...;
  /* ... */

  /* === Surface === */
  /* ... */

  /* === Typography === */
  /* ... */

  /* === Spacing === */
  /* ... */

  /* === Shadows === */
  /* ... */

  /* === Radii === */
  /* ... */

  /* === Motion === */
  /* ... */
}
```

Every value must be traceable to an audit decision. No value appears here without
an entry in the corresponding audit document.

Also generate `tokens/tokens.json` in W3C DTCG format mirroring the CSS.

---

### Step 6: Component Audit (`docs/component-audit.md`)

**Primary sources (in order of evidential strength):**
1. `*-screenshots.json` -- the component inventory with cluster, variant,
   sizeHint, bounds, and kind for every crop designlang captured. This is
   grounded in the live DOM, not synthesized from tokens.
2. `preview/components/*.png` -- visual reference for each entry in the manifest
3. `./migration-work/structure/aggregate.json` -- DOM-level organism fingerprints
   (kept / class / tag) per representative template
4. `./migration-work/structure/{slug}.md` -- agent-generated structure reports
   from `identify-page-structure`
5. Planner's `03-atomic-inventory.md` -- the normalized atomic catalogue

**Cross-check source (supplementary):**
- `*-anatomy.tsx` -- React-shaped scaffolds. Often thin; use only to confirm
  or contradict the primary sources, never as the source of truth.

**Method:**
1. Build the component table from `*-screenshots.json`, grouping by
   `cluster` (e.g. `button--primary`, `card--default--md`). Each row captures:
   cluster, kind, variants seen, size hints, bounding-box range, number of
   instances, and a preview thumbnail path.
2. Correlate each cluster with DOM organisms from `structure/aggregate.json`
   and the agent structure reports (molecule ↔ organism placement).
3. Cross-reference with the planner's atomic inventory for naming consistency.
4. For each component, decide: **keep / consolidate / drop / gap**.
   - **Keep**: clearly distinct, multiple uses, grounded in DOM evidence.
   - **Consolidate**: near-duplicate clusters that can be one component
     with variants (e.g. `button--default` + `button--secondary` → one
     Button atom with emphasis variants).
   - **Drop**: single-use, non-systemic, clusters dominated by `kind: "other"`
     fallback, or third-party widget artifacts.
   - **Gap**: needed for the system but not present in the extraction
     (identified from agent structure reports or block mapping).
5. For kept/consolidated components, define:
   - Public CSS API (which tokens it references, which classes it exposes)
   - Variant axes (size, emphasis, state) grounded in observed clusters
   - Reference implementation outline
6. If `*-anatomy.tsx` disagrees with the primary sources (e.g. names a
   component that screenshots.json never clustered), note the disagreement
   but **prefer screenshots.json**. Anatomy is a token-derived React
   scaffold; screenshots are live DOM evidence.

**Document:**
- Full matrix of detected clusters from `*-screenshots.json`
- Decision per component with rationale (link to preview thumbnail)
- Atomic placement (atom / molecule / organism) with reasoning
- Cross-reference to planner's block mapping
- Any anatomy.tsx disagreements, with the chosen resolution

---

### Step 7: Build Atomic Map (`docs/atomic-map.md`)

Authoritative list of every atom, molecule, and organism with explicit reasoning
for placement. Structure:

```markdown
## Atoms
| Component | Reasoning |
|-----------|-----------|
| Button | Standalone interactive primitive; no sub-components |
| Input | Single-purpose form primitive |
| ... | ... |

## Molecules
| Component | Reasoning |
|-----------|-----------|
| FormField | Combines Label (atom) + Input (atom) + Help text |
| ... | ... |

## Organisms
| Component | EDS Block | Reasoning |
|-----------|-----------|-----------|
| Hero | hero | Full-width section with heading, text, CTA, background |
| ... | ... | ... |
```

Rule of thumb: if it stands alone with meaning, it's an organism. If it needs a
parent to make sense, it's a molecule.

---

### Step 8: Build Pencil Canvas

Create the `.pen` file as the single source of truth for the design system.

**Canvas structure:**

The canvas is organized with foundations on the left, organisms in the middle,
and full-page templates on the right. **All elements render at 3 breakpoints**
(desktop 1280px, tablet 768px, mobile 375px) unless noted otherwise.

```
Left column (x: 0, width: 800):
  Foundations + Atoms + Molecules — one frame per element.
  These are the reusable building blocks referenced everywhere else.

  - Typography scale (heading/body/caption samples using $variables)
  - Color Palette (swatches with token names and hex values)
  - Spacing Scale (visual bars with token name + px value)
  - Shadows + Radii (visual samples)
  - Button variants (reusable: Primary, Secondary, CTA, Ghost)
  - Input patterns (reusable: Default, Error, Disabled)
  - Card (reusable molecule)
  - CTA Group (reusable molecule)
  - Media-Text Pair (reusable molecule)
  - Other atoms/molecules identified in the component audit

Middle column (x: ~920):
  Organisms — one set of 3 frames per organism (desktop + tablet + mobile).
  Each organism is labeled with its EDS block name prefix.

  Per organism:
  - Desktop frame (1280px width): "O1: Header (Desktop)"
  - Tablet frame (768px width): "O1: Header (Tablet)"
  - Mobile frame (375px width): "O1: Header (Mobile)"

  Organisms use `ref` nodes pointing to reusable atoms/molecules.
  Show responsive reflow: multi-column → stacked, nav → hamburger, etc.

Right column (x: ~3500+):
  Template compositions — full-page layouts at all 3 breakpoints.
  One set of 3 frames per template type.

  Per template:
  - Desktop frame (1280px): "T1: Homepage (Desktop 1280px)"
  - Tablet frame (768px): "T1: Homepage (Tablet 768px)"
  - Mobile frame (375px): "T1: Homepage (Mobile 375px)"

  Templates use real content from scraped pages (not lorem ipsum).
  Templates compose organisms using ref nodes.
```

**Bottom-to-top composition (critical):**

The canvas must be fully tokenized and componentized so that changes propagate
automatically from the bottom up:

```
$variables (tokens)
  ↓ referenced by
Atoms (reusable: Button/Primary, Input/Default, etc.)
  ↓ referenced via `ref` by
Molecules (reusable: Card/Default, CTA Group, etc.)
  ↓ referenced via `ref` by
Organisms (O1: Header, O2: Hero, etc.)
  ↓ referenced via `ref` by
Templates (T1: Homepage, T3: Blog, etc.)
```

**Rules for propagation:**
- Every atom references `$variables` for ALL visual properties (fill, fontSize,
  gap, padding, cornerRadius, stroke, etc.). Zero hardcoded values in atoms.
- Every molecule is composed of atom `ref` nodes. If a button changes, every
  molecule using that button updates automatically.
- Every organism is composed of molecule and atom `ref` nodes. No duplicated
  structure — always use refs to the canonical reusable component.
- Every template is composed of organism `ref` nodes. Changing an organism
  (e.g., the header) updates every template that includes it.
- **Never copy-paste structure.** If something appears in more than one place,
  it must be a `ref` to a single reusable source. Duplicated frames break
  propagation and create drift.

**Pencil mechanics:**

1. **Variables** use `$variable-name` syntax in properties: `fill: "$color-primary"`,
   `fontSize: "$font-size-md"`, `gap: "$spacing-md"`
2. **Reusable components** have `"reusable": true` and a slash-namespaced name:
   `"Button/Primary"`, `"Button/Secondary"`, `"Card/Default"`
3. **Component instances** use `"type": "ref"` with `"ref": "<source-id>"`:
   ```json
   {"id": "abc", "name": "ctaPrimary", "ref": "dYqDb", "type": "ref"}
   ```
4. **Layout** uses `"layout": "vertical"` or horizontal (default), with `gap`,
   `padding`, `alignItems`, `justifyContent`
5. **Fill containers** use `"width": "fill_container"` or `"height": "fill_container"`
6. **Images** use `"fill": {"type": "image", "mode": "fill", "url": "..."}` with
   generated placeholder images

**Validation rule:** After building the canvas, changing a single variable
(e.g., `$color-primary`) or a single atom (e.g., `Button/Primary`) must
visually propagate to every organism and template that uses it — with no
manual updates needed. If it doesn't, something was hardcoded or duplicated
instead of using a ref.

**Step 8a: Define variables**

Call Pencil MCP `set_variables` with the curated tokens from the audit steps.
Map CSS custom properties to Pencil variable names:
- `--color-brand-primary` → `color-primary`
- `--font-family-primary` → `font-family-primary`
- `--space-4` → `spacing-sm` (use semantic aliases in Pencil)
- etc.

**Step 8b: Build foundation frames**

Use `batch_design` to create:
- Typography frame: sample text at each heading level + body/caption/legal
- Color Palette frame: swatches showing each color token
- Spacing Scale frame: visual bars at each spacing value
- Shadows + Radii frame: samples of each elevation and radius

**Step 8c: Build atoms (reusable, fully tokenized)**

Use `batch_design` to create reusable frames for each atom. Every atom must:
- Have `"reusable": true`
- Use `$variables` for ALL visual properties — no hardcoded colors, sizes, spacing
- Be named with slash namespace: `"Button/Primary"`, `"Input/Default"`, `"Icon/Search"`

These are the lowest-level building blocks. Everything above references them.

**Step 8d: Build molecules (reusable, composed of atom refs)**

Use `batch_design` to create reusable frames for each molecule. Every molecule must:
- Have `"reusable": true`
- Be composed of atom `ref` nodes (not duplicated atom structure)
- Use `$variables` for any additional spacing/layout properties
- Be named with slash namespace: `"Card/Default"`, `"CTA Group"`, `"FormField/Default"`

Example: a Card molecule contains a `ref` to `Button/Primary`, not a copy of the
button frame. When the button changes, the card updates.

**Step 8e: Build organism frames (all 3 breakpoints, composed of refs)**

For each organism identified in the component audit:
- Create a **desktop** frame (1280px width) labeled `"O{n}: {Name} (Desktop)"`
- Create a **tablet** frame (768px width) labeled `"O{n}: {Name} (Tablet)"`
- Create a **mobile** frame (375px width) labeled `"O{n}: {Name} (Mobile)"`

Composition rules:
- Organisms MUST use `ref` nodes pointing to atoms and molecules — never
  duplicate the inner structure of a button, card, input, etc.
- Use `$variables` for layout properties (gap, padding)
- Show responsive reflow: multi-column → stacked, horizontal nav → hamburger,
  image-beside-text → image-above-text, etc.

Use `find_empty_space_on_canvas` to position each set of organism frames.

**Step 8f: Build template compositions (all 3 breakpoints, composed of refs)**

For each template type in the atomic map:
- Create a **desktop** frame (1280px) labeled `"T{n}: {Name} (Desktop 1280px)"`
- Create a **tablet** frame (768px) labeled `"T{n}: {Name} (Tablet 768px)"`
- Create a **mobile** frame (375px) labeled `"T{n}: {Name} (Mobile 375px)"`

Composition rules:
- Templates MUST use `ref` nodes pointing to organisms — never duplicate
  organism structure inside a template
- Header and Footer organisms appear as refs in every template — changing the
  Header source updates all templates automatically
- Populate with real content from `./migration-work/pages/` scraped pages

Use `find_empty_space_on_canvas` to position template frames.

**Step 8g: Visual verification and propagation test**

Use `get_screenshot` on key frames to verify:
- Token application looks correct at all breakpoints
- Component proportions match reference screenshots
- Responsive reflow is logical and consistent
- Templates are cohesive with real content

**Propagation test:** Temporarily change a variable (e.g., `$color-primary`) via
`set_variables`, then use `get_screenshot` on a template frame to confirm the
change propagated through atoms → molecules → organisms → templates. Revert the
variable after testing. If propagation fails, find and fix the hardcoded value
or duplicated frame that broke the chain.

---

### Step 9: Accessibility Audit (`docs/accessibility-audit.md`)

For every text/surface color pair in the token system:
- Calculate WCAG 2.2 contrast ratio
- Flag failures (< 4.5:1 for normal text, < 3:1 for large text)
- Propose fixes (adjust token value or swap pairing)
- Update tokens.css if fixes are approved

---

### Step 10: Final Documentation

**Write `token-mapping.md`:**

```markdown
# Token Mapping: Pencil → EDS CSS

| Pencil Variable | CSS Custom Property | Value | Audit Reference |
|----------------|--------------------:|-------|-----------------|
| color-primary | --color-brand-primary | #182465 | color-audit.md § C1 |
| ... | ... | ... | ... |
```

**Write `normalization-log.md`:**

Chronological record following this schema per entry:

```markdown
## YYYY-MM-DD — Short title

**Change**: what changed, in one sentence.
**Rationale**: cite the audit evidence.
**Impact**: downstream effects (tokens, components, pages).
**Links**: to audit sections, screenshots, issues.
```

---

## Process Invariants

### Audit-first workflow

No change to `tokens/tokens.css` is made without a corresponding entry in one of
the audit documents:

| Change type | Must update |
|---|---|
| Add / remove / rename a color | `docs/color-audit.md` |
| Change a spacing value | `docs/spacing-audit.md` |
| Add / remove a typography role | `docs/typography-audit.md` |
| Add / remove a component variant | `docs/component-audit.md` |
| Change a duration or easing | `docs/motion-audit.md` |
| Fix a contrast issue | `docs/accessibility-audit.md` |

And every material change logs an entry in `docs/normalization-log.md`.

### Source of truth hierarchy

When sources disagree, this precedence applies (higher wins):

1. `design-system.pen` — single source of truth for design (variables, components, layout)
2. `tokens/tokens.css` — derived from Pencil variables, serves as the EDS-consumable export
3. `docs/*.md` — decisions, rationale, and audit evidence
4. `./migration-work/design-extract/` — historical record, never the source

**The Pencil canvas is the design source of truth.** `tokens.css` is generated
from Pencil variables (via `get_variables`). If they disagree, regenerate
`tokens.css` from Pencil. There is no separate `components/` folder — component
structure lives in the canvas as reusable frames.

### Token naming rules

- All tokens are CSS custom properties, prefixed and grouped semantically
- Forbidden: hue-based names (`--color-blue-500`), non-scale spacing
  (`--space-13px`), component-specific tokens (`--button-primary-bg`)
- Use composition at the component level, not new tokens

### Pencil component conventions

- All visual properties in reusable frames must reference `$variables` — no
  hardcoded hex colors, pixel sizes, or spacing values in the canvas.
- Reusable components use slash-namespaced names: `Button/Primary`, `Card/Default`.
- Organism frames use the proposed EDS block name as a label prefix: `O1: Header`.
- Template frames include viewport width in the name: `T1: Homepage (Desktop 1280px)`.
- Composition uses `ref` nodes pointing to reusable atoms/molecules — never
  duplicate structure when a ref will do.

---

## Dos and Don'ts

**DO:**
- Run every audit before writing tokens.css
- Validate font weights against actual font files (not just what the CSS declares)
- Use perceptual distance (ΔE₀₀) for color clustering, not eyeballing
- Snap spacing to a strict grid and document every delta
- Log every material decision in normalization-log.md
- Use reference screenshots for visual verification after building the canvas
- Keep the Pencil canvas in sync with tokens.css at all times
- Create reusable components in Pencil for atoms and molecules

**DON'T:**
- Don't edit files in `./migration-work/design-extract/` -- it's frozen evidence
- Don't write tokens.css without an audit entry supporting the value
- Don't use hue-based or magic-number token names
- Don't introduce build tools or frameworks
- Don't let tokens.css drift from Pencil variables — regenerate it from `get_variables`
- Don't maintain separate HTML/CSS snippets — the .pen file is the single design source
- Don't invent components not found in the extraction without documenting the gap
- Don't skip the accessibility contrast check

---

## Related Skills

- **migration-planner** -- produces the scope and flagged issues this skill addresses
- **migration-discovery** -- validates assumptions before this skill runs
- **eds-styles** -- reference for CSS token naming conventions in EDS context
- **frontend-design** -- reference for design quality principles
- **building-blocks** -- downstream consumer of the token system
- **migration-site-build** -- builds EDS blocks from this skill's output
