---
name: speckit-figma-specify
description: Extract visual design context from Figma and save it as design.md. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit figma-specify".
disable-model-invocation: true
---

# Speckit Figma Specify Workflow

Extracts **visual and stylistic** design context from Figma and saves it as `FEATURE_DIR/design.md`.

Runs **after** `/speckit-specify` (spec.md must already exist).

**Scope — visual only:**
- HTML element structure and block-scoped CSS class names
- CSS styles: colours, typography, spacing, layout, breakpoints
- CSS custom properties and resolved values
- Interactive state appearance (hover colours, focus rings)
- Dynamic content element identification

**NOT captured here** (owned by spec.md): functional requirements, acceptance criteria, author-configurable content, business-language descriptions, behavioral logic, content model (block table structure).

**Content Model Alignment (CDD Phase 1.2)**

The spec.md already contains the content model (block table structure, variants, authoring approach) defined during `/speckit-specify`. The Figma design must align with — not override — this content model. When extracting design context:

- **Map visual elements to authored content**: Identify which visual elements correspond to author-provided content (text, images, links from the block table) vs. decoration-added structure (wrappers, icons, layout containers). Note this mapping in the "EDS Block Integration" section of design.md.
- **Validate variant coverage**: Check that Figma design variants (e.g., different visual states or layouts) correspond to the block options defined in the spec's content model. Flag any design variants that have no matching block option, or spec variants missing from the design.
- **Respect the authored structure**: The Figma root frame maps to the block wrapper, but the inner content comes from authored rows/columns. design.md's HTML scaffold must reflect this — authored content is the input, not something to invent.

## Step 1: Locate Spec Directory

Find the most recent spec directory in `.specify/specs/` (or one matching user's input).

Verify `spec.md` exists. If `design.md` already exists, ask user to confirm overwrite.

## Step 2: Read Figma Design

**Option A — Figma desktop app (preferred)**: Ask user to select target frame, then call `get_design_context` on `plugin-figma-figma-desktop` MCP server. If this succeeds, proceed.

**Option B — URL fallback**: If Option A fails, ask for Figma URL. Parse:
- `fileKey`: path segment immediately after `/design/`
- `nodeId`: `node-id` query parameter, converting `-` to `:`

Call `get_design_context` on `plugin-figma-figma` MCP server with `fileKey` and `nodeId`.

**Option C**: If authentication error, call `mcp_auth` on server first, then retry.

## Step 2b: Figma layout extraction (mandatory before writing CSS)

For **each** Figma frame that maps to a breakpoint (mobile base, tablet, desktop, wide), record **auto-layout / layout** facts for every major container (hero rail, teaser group, card stacks, main + aside rows):

- **Primary axis**: horizontal vs vertical (maps to `flex-direction: row` vs `column`, or grid template).
- **Gap** between children (maps to `gap`).
- **Alignment** if it affects design (e.g. `justify-content`, `align-items`).
- If **desktop** matches **tablet** for a container, write **explicitly**: “unchanged from tablet” in the Layout matrix so implementers do not infer a missing override.

**Teaser / card groups**: Frame names like “Cards Stacked” are **not** sufficient — state the **actual** `flex-direction` per breakpoint (Figma is source of truth). If spec.md uses vague language (“horizontal on larger screens”) that **conflicts** with Figma, flag it in the Report: *“Spec vs Figma layout conflict — resolve in spec or design before `/speckit-plan`.”* Do not silently prefer spec prose over Figma.

## Step 3: Generate design.md

Before writing each CSS rule: If the selector targets a Dynamic Content Element or its container, verify you are not adding width/height (element) or max-width/max-height (container) unless that exact property exists in Figma for that node.

### Mobile-first CSS file order (mandatory)

The **`### CSS Skeleton`** section MUST emit rules in this **physical order** so cascade matches the mobile-first mental model and reviews stay predictable:

1. **Base (mobile)** — all rules **without** `@media`, block-scoped under `.blockname` (and descendants). No desktop-only values here.
2. **`@media (width >= 600px)`** — tablet overrides **only** (one contiguous block or clearly labeled subsections).
3. **`@media (width >= 900px)`** — desktop overrides **only**.
4. **`@media (width >= 1200px)`** — only if Figma includes a wide / xl frame.

**Rules:**

- Do **not** place a `@media (width >= 900px)` block **above** base mobile rules for the same component.
- Do **not** scatter the same selector across the file; use **one breakpoint ladder** per logical component.
- When desktop differs from tablet for a property (e.g. `flex-direction`), the **desktop** media block MUST set that property again — otherwise the browser keeps the tablet value (same specificity, later-applicable rule wins only when both match; missing desktop override = inherited tablet behavior).

### Layout matrix (mandatory section)

Add **`## Layout matrix (flex / grid)`** immediately **after** `## Code Scaffold` (after the CSS Skeleton subsection and any Absolute Overlay notes — **before** Design Token Mapping). Use a table derived from Step 2b:

| Container (block-scoped class) | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) | Wide (≥1200px) |
|------------------------|-----------------|------------------|---------------------|----------------|
| e.g. `.blockname-inner` | `flex-direction: column; gap: 24px` | `flex-direction: row; …` | `…` or *unchanged from tablet* | … |

Include **every** flex/grid wrapper that changes or could be misread across breakpoints (inner rows, teaser groups, reversed variants if different).

Structure the design.md with these sections:

```markdown
# Design Reference: [Feature Name]

## Code Scaffold

### HTML Structure
[Semantic HTML element hierarchy decorated by the block's JS]
[Block-scoped class names added during decoration, e.g., .blockname-item, .blockname-image]
[Initial authored structure: nested <div> rows/columns from the block table]

### CSS Skeleton
[Mobile-first vanilla CSS with block-scoped selectors]
[CSS custom properties mapped to project tokens from styles.css]
[Block option variants as additional classes, e.g., .blockname.wide]

**EDS block structure mapping**: The Figma root frame maps to the block wrapper `<div class="blockname">`. Authored content renders as nested `<div>` rows and columns inside the wrapper. The block's `decorate(block)` function reshapes this into the final semantic structure. All CSS selectors MUST be scoped to `.blockname`:

```css
/* 1. Base (mobile) — no @media */
.blockname {
  position: relative;
  width: 100%;
}

.blockname .blockname-content {
  /* descendant mobile styles */
}

/* 2. Tablet */
@media (width >= 600px) {
  .blockname .blockname-content {
    /* tablet overrides */
  }
}

/* 3. Desktop */
@media (width >= 900px) {
  .blockname .blockname-content {
    /* desktop overrides — set again if different from tablet */
  }
}
```

### Absolute Overlay Layout (MANDATORY when applicable)

When the design uses `position: absolute; inset: 0` for both a background element and a content overlay, those children do not contribute to the block's height. The block will collapse to zero unless it has explicit dimensions.

**If the Figma design has this pattern** (full-bleed background + overlaid content):
1. Add to the block root (`.blockname`): `min-height`, `aspect-ratio`, or ensure at least one in-flow child provides height.
2. Include this requirement in the CSS Skeleton. Add a **Layout Caveats** section to design.md when this pattern is detected.
3. Use the design's aspect ratios per breakpoint (e.g. 1:3 mobile, 2:3 tablet, 3:2 desktop) for `aspect-ratio` or equivalent.

**Example** — add to design.md when this pattern is detected:

```markdown
## Layout Caveats
- **Absolute overlay**: Background and content are `position: absolute`. The block root MUST have `aspect-ratio` or `min-height` per breakpoint, or the block will have zero height and nothing will be visible.
```

## Layout matrix (flex / grid)

[Mandatory table — Step 2b + Step 3. Place **after** Code Scaffold. Figma auto-layout → `flex-direction` / `gap` / key alignments per container per breakpoint.]

## Design Token Mapping
[Table: Element | CSS Property | Project variable (e.g., --background-color) | Fallback value]

## Breakpoints & Per-Breakpoint CSS Overrides
[Narrative + table: mobile base → tablet (600px) → desktop (900px) → wide (1200px).]

**Mandatory detail for layout:** Each row that describes a breakpoint MUST include **layout-affecting** properties for flex/grid containers: `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, `gap`, and fixed **rail/column widths** (when Figma has them). Vague phrases (“teasers row”) are insufficient unless the **Layout matrix** already states the exact `flex-direction` and gap for that breakpoint.

**Inheritance warning:** If desktop should **not** inherit tablet layout, say so explicitly in this section and in the **900px** CSS block (set the property again).

## Dynamic Content Elements
[Elements with content-dependent sizing, marked ≈ approximate]
[These must NOT get fixed dimension expectations in design-expectations.json]
[List each dynamic content element and its container. Identify from spec content model + Figma.]
[For each: element name, count/sizing note, container class. Apply dimension rules below.]
**Rule**: No width/height on elements; no max-width/max-height on their containers unless Figma explicitly has that property. Never convert Figma `width` to `max-width`.

## Interactive States
[Hover, focus, active, disabled appearance per element]
[ARIA-driven states: use aria-expanded, aria-selected, etc. for styling]

## Visual Acceptance Checklist
[Specific visual checks: spacing, typography, colour at mobile and desktop]
[Include at least one check per major **Layout matrix** row — e.g. “Desktop: teaser group flex-direction matches matrix.”]

## Embedded Blocks
[Child blocks or referenced fragments and their required styles]

## EDS Block Integration
[Block wrapper provides .blockname class on the outer <div>]
[ARIA attributes and roles go on decorated elements for accessibility]
[Block options (variants) add CSS classes via parenthetical notation in the block name]
```

## Step 4: Write design.md

Write to `FEATURE_DIR/design.md`.

**Optional**: Start from `.specify/templates/design-reference-template.md` for section order and placeholders; replace with Figma-derived content.

## Report

Output: design.md path and summary of what was captured; **confirm** Mobile-first CSS order + Layout matrix sections are present; note any **spec vs Figma layout** conflicts; readiness for next phase: `/speckit-plan` (default when design is ready), or optionally `/speckit-clarify` (if ambiguities remain).

## Dynamic Content Elements — Dimension Rules (MANDATORY)

**Context**: speckit-figma-specify might be run once, detached from the rest of the workflow. design.md is the only artifact. Whatever is wrong, missing, or left implicit will not be corrected later. design.md MUST be self-sufficient and correct on first run.

**Definition**: Dynamic content elements = elements whose size or count varies with authored content (e.g. milestone badges 0–2, repeatable items, JS-updated values). Identify them from spec.md content model and Figma structure.

**For dynamic content elements** — do NOT store in design.md (CSS Skeleton, Design Token Mapping, Breakpoints table, or any section):
- `width`
- `height`
- `min-width` / `min-height` (omit unless Figma explicitly has that property)
- Any fixed dimension

**For containers of dynamic content elements** — do NOT store:
- `max-width` / `max-height` — UNLESS Figma explicitly has that property on that node
- If Figma has `width` on the container, store `width` — NEVER convert it to `max-width`

**NEVER alter Figma properties**: If Figma says `width: 422px`, write `width: 422px`. Do NOT "interpret" or "fix" it as `max-width`. Converting introduces a lie — the design did not specify max-width.

**When in doubt**: Omit the dimension. Prefer natural sizing (flex, no width/height) for dynamic elements. If Figma has a dimension you're unsure about, include it only if it's an explicit Figma property, not an inference.

## Key Rules

- design.md is the **source of truth for all HTML/CSS/design-specific content**
- spec.md remains the source of truth for functional requirements and the **content model** (block table structure, variants, authoring approach)
- Do NOT create or modify spec.md — that was already done by `/speckit-specify`
- If the Figma design implies content model changes (new variants, different content structure), flag them in the Report as requiring a spec update — do not silently diverge from the spec's content model
- CSS must be vanilla (no SCSS, no preprocessors) with block-scoped selectors
- Use `@media (width >= Npx)` with standard EDS breakpoints: 600px, 900px, 1200px
- Map Figma values to project CSS custom properties from `styles/styles.css` where they exist
- **Dynamic content**: Apply dimension rules strictly. design.md is read later without Figma context — if dimensions are wrong here, implementation will be wrong.
- **FIGMA ONLY**: Store only what Figma explicitly has. Do not convert, infer, or "improve" (e.g. width → max-width).
- **Variant colour overrides**: When design.md mentions variant classes for colour or visual overrides, use **EDS-style** names when generating nitroblocks output (e.g. `.blockname.dark`, `.blockname.reversed`) unless the spec explicitly documents strict BEM `--` modifiers. Include the actual CSS rules in the CSS Skeleton—do not leave a variant mentioned without concrete properties and values. If Figma has no frame for that variant, add a "Variant CSS (when used)" section with suggested values and note that implementer should verify.
- **Mobile-first file order**: CSS Skeleton MUST follow base → `@media (width >= 600px)` → `@media (width >= 900px)` → optional 1200px; never interleave desktop before mobile for the same component.
- **Layout matrix**: MUST exist and match Figma auto-layout per breakpoint; implementers and `/speckit-implement` use it to avoid missing desktop overrides.
- **Spec vs Figma**: If spec.md prose conflicts with Figma layout, **flag in Report**; do not overwrite spec.md here.
