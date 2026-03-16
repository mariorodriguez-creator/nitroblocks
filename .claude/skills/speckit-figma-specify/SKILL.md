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

## Design Token Mapping
[Table: Element | CSS Property | Project variable (e.g., --background-color) | Fallback value]

## Breakpoints & Per-Breakpoint CSS Overrides
[Mobile base → Tablet (600px) → Desktop (900px) → Wide (1200px)]
[Specific property overrides per breakpoint, using @media (width >= Npx)]

## Dynamic Content Elements
[Elements with content-dependent sizing, marked ≈ approximate]
[These must NOT get fixed dimension expectations in design-expectations.json]

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

## Key Rules

- design.md is the **source of truth for all HTML/CSS/design-specific content**
- spec.md remains the source of truth for functional requirements and the **content model** (block table structure, variants, authoring approach)
- Do NOT create or modify spec.md — that was already done by `/speckit-specify`
- If the Figma design implies content model changes (new variants, different content structure), flag them in the Report as requiring a spec update — do not silently diverge from the spec's content model
- CSS must be vanilla (no SCSS, no preprocessors) with block-scoped selectors
- Use `@media (width >= Npx)` with standard EDS breakpoints: 600px, 900px, 1200px
- Map Figma values to project CSS custom properties from `styles/styles.css` where they exist
