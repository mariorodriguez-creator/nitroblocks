---
name: pencil-from-design-md
description: Generate a Pencil (.pen) design-system file from a Google-spec DESIGN.md. Translates the YAML token block into Pencil variables and builds a fully tokenized, bottom-up atomic library (tokens → atoms → molecules → organisms) on the canvas. Use when the user asks to build a Pencil file from DESIGN.md, generate a .pen design system from DESIGN.md, componentize a design system in Pencil, or convert a DESIGN.md into a .pen.
---

# Pencil from DESIGN.md

Read a `DESIGN.md` that conforms to the [Google Labs DESIGN.md spec](https://github.com/google-labs-code/design.md), then produce a `.pen` file that materialises the same design system as a tokenized, composable component library on the Pencil canvas.

This skill is the **inverse** of the [extract-design-system](../extract-design-system/SKILL.md) skill: that one reverse-engineers a website into a `DESIGN.md`; this one consumes a `DESIGN.md` and produces a `.pen` design system you can build screens on top of.

## Hard rules

1. **Tokens before geometry.** Translate the entire DESIGN.md YAML front matter into Pencil variables in a single `set_variables` call before placing any node. After this pass, every styled property in every `batch_design` op MUST reference a variable (`fill: "$color-primary"`, `cornerRadius: "$rounded-full"`). No literal hex/px values in component nodes.
2. **No invented tokens.** If a property is not present in the DESIGN.md (YAML or prose), pick the closest existing token. Never introduce a token without DESIGN.md evidence. The output must be reproducible: a second run on the same DESIGN.md should produce an isomorphic .pen file.
3. **Bottom-up composability.** Components are produced in three tiers: atoms → molecules → organisms. A molecule MUST be composed of atoms (use `ref` to embed atom instances), an organism MUST be composed of molecules and atoms. No re-implementing a button inside a card.
4. **Variant states are separate reusable components.** `button-primary-hover` is a peer of `button-primary`, not a theme override. Pencil theme axes are global to the canvas and would force the entire document into one state — never use them for component-level states. Use them only when the DESIGN.md explicitly defines theme axes (e.g., light/dark mode).
5. **Foundation only.** No templates, no full pages, no screen mockups, no marketing imagery. The output is the atomic library plus a token-spec canvas. Higher-level compositions are the user's job, on top of this foundation.
6. **Pencil MCP is the only edit path.** All reads and writes to the .pen file go through the Pencil MCP tools (`open_document`, `set_variables`, `batch_design`, `batch_get`, `snapshot_layout`, `get_screenshot`). Do NOT use `Read`, `Grep`, or any filesystem tool against `.pen` files — they are encrypted on disk.

## Inputs

- **DESIGN.md path** (required). An absolute or workspace-relative path to a file that validates against the Google DESIGN.md spec. The skill assumes the file is well-formed; it does not lint the input. If the user wants to lint the input, run `npx -y @google/design.md lint <path>` separately first.
- **Output path** (optional). Defaults to a sibling of the input named after the input's parent folder: `design-systems/foo/DESIGN.md` → `design-systems/foo/foo.pen`. The user may override with an explicit path.

## Output

A single `.pen` file at the resolved output path. The file contains:

- **Variables**: one Pencil variable per DESIGN.md token (rules in [reference/token-mapping.md](reference/token-mapping.md)).
- **Canvas**: a **set of page-based posters** — each page a self-contained, fixed-size frame absolutely positioned on the document canvas, with a consistent header strip and a two-column inner grid (rules in [reference/canvas-layout.md](reference/canvas-layout.md)).
- **Reusable components**: atoms, molecules, and organisms registered as `reusable: true` and placed inside the relevant pages where they are used / showcased (recipes in [reference/component-recipes.md](reference/component-recipes.md)). Each multi-state component is shown as a **state matrix** (variant × state grid) on its page.

The visual model is a printable design-system poster set, not a single scrolling document. Each page works on its own and can be exported / shared without context from the others.

## Workflow

Copy this checklist into the conversation and tick items off:

```
- [ ] 1. Resolve input + output paths
- [ ] 2. Read DESIGN.md and parse YAML front matter + prose
- [ ] 3. Open the .pen file (existing or new) and load Pencil context
- [ ] 4. Generate variables from tokens (one set_variables call)
- [ ] 5. Decide page roster from DESIGN.md evidence and place page frames on the canvas
- [ ] 6. Render each token page (Cover, Colors, Typography, Spacing & Layout, Effects, Shapes)
- [ ] 7. Build reusable atoms (text styles, icon container, divider, link, list-item) and showcase them on the Atoms page
- [ ] 8. Build reusable molecules (buttons, inputs, form-field-group) and render their state matrices on the Buttons / Fields pages
- [ ] 9. Build reusable organisms (cards, banner, footer-shell) and showcase them on the Cards / Banners / Footer pages
- [ ] 10. Validate (snapshot_layout, screenshots per page, reusable count)
- [ ] 11. Report
```

### 1. Resolve input + output paths

- Input is a `DESIGN.md` path. Convert to absolute.
- Output defaults to `<dirname>/<basename(dirname)>.pen`. Example: `design-systems/foo/DESIGN.md` → `design-systems/foo/foo.pen`.
- If the user supplied an explicit output path, use it verbatim.
- Confirm both paths back to the user before any MCP calls.

### 2. Read DESIGN.md and parse YAML front matter + prose

Use the `Read` tool on the DESIGN.md file. Split on the first two `---` delimiter lines:

- Everything between them is YAML — parse it. The YAML is the source of truth for **tokens**.
- Everything after the closing `---` is the markdown body — keep it indexed by `##` heading. The body is the source of truth for **atoms-to-derive** and component rationale you can't see in the YAML.

Build an in-memory `designSystem` object before touching the MCP:

```
designSystem = {
  name, description, version,
  colors: {<name>: <hex>, ...},
  typography: {<level>: {<prop>: <value>, ...}, ...},
  rounded: {<level>: <px>, ...},
  spacing: {<level>: <px>, ...},
  components: {<name>: {<prop>: <ref>, ...}, ...},
  prose: {overview, colors, typography, layout, elevation, shapes, components, dosAndDonts}
}
```

This object is the input to every subsequent step. Do not re-parse the file later.

### 3. Open the .pen file (existing or new) and load Pencil context

Order matters:

1. `get_editor_state({ include_schema: true })` — primes the schema for all subsequent ops. Run this **once** at the start of the session.
2. `open_document(<output-path>)` — Pencil creates the file if it doesn't exist, opens it if it does. Always pass the absolute output path; never pass `"new"` from this skill.
3. `get_guidelines()` — list available guides. Read whichever guides cover the .pen schema and design-system conventions (`general`, `design-system` if present). These guides may surface naming or layout conventions that override defaults; if they do, follow the guide.

If `open_document` opens a non-empty .pen file (someone has been working on it), do NOT silently overwrite. Run `batch_get({ patterns: [{ reusable: true }] }, readDepth: 1)` and report the existing reusable component count back to the user. Ask whether to merge into the existing file (additive) or start clean. Default to additive.

### 4. Generate variables from tokens (one `set_variables` call)

Translate the entire `designSystem` token block into Pencil variables using the rules in [reference/token-mapping.md](reference/token-mapping.md). The translation is purely mechanical; the reference file is the spec.

Make a **single** `set_variables` call with `replace: true` so re-runs are deterministic. Variable naming is fixed by [reference/token-mapping.md](reference/token-mapping.md) — do not improvise.

After `set_variables`, immediately verify with `get_variables` that every expected variable is present. If any are missing, fix the input and call `set_variables` again before proceeding.

### 5. Decide page roster and place page frames on the canvas

Walk the parsed `designSystem` object and pick which **pages** to render. Each page is a self-contained 1440-px-wide poster (or wider for multi-state component matrices) absolutely positioned on the document canvas. Page selection is evidence-driven:

| Page | Render when |
|---|---|
| Cover | Always |
| Colors | `colors.*` has any tokens |
| Typography | `typography.*` has any tokens |
| Spacing & Layout | `spacing.*` has any tokens, or `## Layout` prose exists |
| Effects | `## Elevation & Depth` prose mentions any elevation pattern (shadow, focus ring, hairline, tonal break). Render minimum focus-ring + tonal-callout if the system is shadow-free. |
| Shapes | `rounded.*` has any tokens |
| Atoms | If any text-style / icon / divider / link / list-item atoms will be rendered |
| Buttons | Any `components.button*` token exists |
| Fields | Any `components.input*` token exists |
| Cards | Any `components.card*` token exists |
| Banners | Any `components.*banner*` token exists, or prose explicitly describes one |
| Footer | `components.footer*` exists, or prose describes a chromed footer |

Page width defaults to **1440 px**. A page is widened to **3736 px** only when it must show a multi-axis state matrix (e.g., Buttons with ≥3 variants × ≥4 states). Width selection is computed from the matrix dimensions, not assumed.

Create all selected page frames in **one** `batch_design` call. Layout details, page-header recipe, and absolute placement strategy are in [reference/canvas-layout.md](reference/canvas-layout.md). Capture the returned binding → page-ID map — every subsequent batch references one of these IDs as its parent.

### 6. Render each token page

For each token page in the roster (Cover, Colors, Typography, Spacing & Layout, Effects, Shapes), run a dedicated `batch_design` call (≤25 ops; split if needed). Each page follows the same internal pattern:

1. **Page header strip** at `y: 0` — light tinted band, page name on the left, page number on the right (recipe in [reference/component-recipes.md](reference/component-recipes.md#page-header-strip)).
2. **Sub-section labels** in the left gutter at `x: 60`, `headline-md` typography, `fill: $color-primary`.
3. **Sub-section content** starting at `x: 508` (or further right). Horizontal `1px` hairlines between sub-sections at `fill: $color-outline`.

Per-page content is in [reference/canvas-layout.md](reference/canvas-layout.md) (one section per page).

If a page would have nothing to render (e.g., the system has no `rounded` tokens but the page made the roster anyway), drop the page from the roster — don't render an empty poster.

### 7. Build reusable atoms and render the Atoms page

Atoms are `reusable: true` so molecules and organisms can embed them via `ref`. The atom set, in render order:

| Atom | Source |
|---|---|
| `text-<level>` (one per typography token) | YAML `typography.*` |
| `icon-container` | always; size from `spacing.md` if no explicit token |
| `divider` | YAML `components.divider` if present, else infer from prose mention of hairlines using `colors.outline` |
| `link` + `link-hover` | infer from prose if present (color + underline pattern) |
| `list-item` | infer from prose if present |

Skip any atom whose evidence is absent from both YAML and prose. Place every reusable atom inside the **Atoms page** in a labeled showcase grid — left column for atom name, right column for the rendered atom (recipe in [reference/component-recipes.md](reference/component-recipes.md)).

### 8. Build reusable molecules and render their pages as state matrices

Molecules compose atoms via `ref`. Each molecule that has more than one state in the DESIGN.md gets a **state matrix**: rows = variants, columns = states. Render the matrix on the molecule's page (Buttons / Fields / etc.).

| Molecule | Variants | States from DESIGN.md |
|---|---|---|
| Button | every distinct base name in `components.button-*` (e.g., `primary`, `secondary`, `tertiary`) | every state suffix present in YAML: default, `-hover`, `-focus`, `-active`, `-disabled`, `-loading` |
| Input | every distinct `components.input*` base | every state suffix in YAML (typically `-error` only) |
| Form field group | derived: pairs the label atom + input molecule + helper-text atom | one cell per input state present |

Variants and states **must be discovered from the DESIGN.md** — never invent them to fill a matrix. If only `default` and `hover` exist in the YAML, the matrix is 2 columns wide; do not pad with greyed-out "Disabled" cells.

Recipes for each molecule and the matrix layout pattern are in [reference/component-recipes.md](reference/component-recipes.md). Every fill/color/typography/spacing/rounded property MUST be a `$variable-name` reference.

### 9. Build reusable organisms and showcase them on their pages

Organisms compose molecules and atoms. Each organism gets its own page (or a shared page when the DESIGN.md only defines one of each):

| Organism | Page | Composition |
|---|---|---|
| `card` (+ YAML variants) | Cards | image slot + headline atom + body atom + button molecule |
| `warning-banner` (+ variants) | Banners | icon-container atom + label atom |
| `footer-shell` | Footer | three-column frame; each column composed of headline atom + N list-item atoms + 1 divider atom |

The page lays out **one labeled instance per variant**, side by side. Image slots in cards are empty `placeholder: true` frames with the `colors.surface` fill. Do NOT run `G` (image generation) ops — this skill produces the foundation, not content.

### 10. Validate

Run all four checks before reporting:

1. `snapshot_layout({ problemsOnly: true })` — must return zero problem nodes. If it returns problems (clipped, overlapping, off-canvas, pages overlapping each other on the canvas), fix with targeted `U` / `R` / `M` ops in a small `batch_design`. Re-run until clean.
2. `get_screenshot` for each page in turn. Inspect each screenshot; if a page is visually broken (text overflow, missing labels, swatches the wrong color, matrix cells misaligned), fix and re-screenshot.
3. `batch_get({ patterns: [{ reusable: true }], readDepth: 1 })` — count reusable components. The count must equal the sum of atoms-rendered + molecules-rendered + organisms-rendered. Mismatches indicate a missing `reusable: true` flag on a recipe; fix and re-verify.
4. **Canvas bounding box check.** Pull the top-level children via `batch_get` and compute the union `(minX, minY, maxX, maxY)` over their `x, y, width, height`. The width must be **≤ 25,000 px**. A wider bbox means a stray node (typically the hidden `library`) is sitting far off-canvas and will force Pencil's initial fit-to-canvas zoom to render real pages as invisible specks. If the bbox is too wide, find the offending top-level node (anything with an `x` or `y` more than ~2,000 px outside the page strip) and `M` it next to the cover at `(0, -200)`.

### 11. Report

Report back to the user:

- Path to the `.pen` file.
- Variable count (broken down: colors, typography, rounded, spacing).
- Page count and the page roster that was rendered.
- Component count by tier: atoms / molecules / organisms.
- Matrix dimensions for any state-matrix component (e.g., "Buttons: 2 variants × 2 states").
- Anything skipped because of absent DESIGN.md evidence (e.g., "no `chip` atom — neither YAML nor prose mentions chips"; "no Calendar page — DESIGN.md does not define a calendar component").
- Any validation issue that was detected and fixed during step 10.

## What this skill does NOT do

- Does **not** lint the input DESIGN.md. Run `npx -y @google/design.md lint <file>` separately if needed.
- Does **not** invent tokens beyond what the DESIGN.md provides.
- Does **not** produce templates, full pages, or screen mockups. Higher-level compositions are the user's job.
- Does **not** generate images via `G`. Cards, banners, and footers use solid fills and typographic placeholders only.
- Does **not** use Pencil theme axes for component states. Use theme axes only when the DESIGN.md explicitly defines theme modes (e.g., light/dark).
- Does **not** modify `DESIGN.md`. The input file is read-only.

## Reference files

- [reference/token-mapping.md](reference/token-mapping.md) — DESIGN.md token → Pencil variable rules. Read before step 4.
- [reference/canvas-layout.md](reference/canvas-layout.md) — page-based poster structure, page header strip, two-column inner grid, absolute placement, per-page content specs. Read before steps 5–9.
- [reference/component-recipes.md](reference/component-recipes.md) — `batch_design` recipes per component, plus the page-header-strip recipe and the state-matrix recipe. Read before steps 7–9.
