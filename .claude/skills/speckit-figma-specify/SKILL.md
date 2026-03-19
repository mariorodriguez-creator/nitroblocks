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

## Step 3: Generate design.md

Before writing each CSS rule: If the selector targets a Dynamic Content Element or its container, verify you are not adding width/height (element) or max-width/max-height (container) unless that exact property exists in Figma for that node.

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
.blockname {
  /* styles from Figma root frame */
  position: relative;
  width: 100%;
}

.blockname .blockname-content {
  /* descendant element styles */
}

@media (width >= 900px) {
  .blockname {
    /* desktop overrides */
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

## Design Token Mapping
[Table: Element | CSS Property | Project variable (e.g., --background-color) | Fallback value]

## Breakpoints & Per-Breakpoint CSS Overrides
[Mobile base → Tablet (600px) → Desktop (900px) → Wide (1200px)]
[Specific property overrides per breakpoint, using @media (width >= Npx)]

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

## Embedded Blocks
[Child blocks or referenced fragments and their required styles]

## EDS Block Integration
[Block wrapper provides .blockname class on the outer <div>]
[ARIA attributes and roles go on decorated elements for accessibility]
[Block options (variants) add CSS classes via parenthetical notation in the block name]
```

## Step 4: Write design.md

Write to `FEATURE_DIR/design.md`.

## Report

Output: design.md path and summary of what was captured, and readiness for next phase: `/speckit-plan` (default when design is ready), or optionally `/speckit-clarify` (if ambiguities remain).

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
- **Variant colour overrides**: When design.md mentions variant classes (e.g. `.blockname--dark`, `.blockname--light`) for colour or visual overrides, include the actual CSS rules in the CSS Skeleton—do not leave "adds .blockname--dark for colour overrides" without the concrete properties and values. If Figma has no frame for that variant, add a "Variant CSS (when used)" section with suggested values and note that implementer should verify.
