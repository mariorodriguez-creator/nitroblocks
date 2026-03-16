---
name: speckit-figma-specify
description: Extract visual design context from Figma and save it as design.md. STICK TO FIGMA OUTPUT ONLY—never invent selectors, styles, breakpoints, or structure. When Figma is ambiguous, ask the user. Trigger when user asks to extract Figma design specs, create a design.md from Figma, or capture visual design reference for a feature.
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

**NOT captured here** (owned by spec.md): functional requirements, acceptance criteria, author-configurable content, business-language descriptions, behavioral logic.

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

### Step 3a: Verify Before Writing

For each CSS rule, HTML element, or design decision you plan to include:
1. **Which Figma node does this come from?** If you cannot point to a specific node or layer, do NOT include it.
2. **Is the mapping indirect?** (e.g. child inheriting parent style) — Note the source node in a comment.
3. **Unclear or missing in Figma?** — Stop and ask the user. Do not guess or infer.

### Step 3b: Structure design.md

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
[Each rule MUST map to a Figma node — cite node IDs in comments where practical]
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
[Use Figma viewport widths as breakpoints when the design has multiple frames (e.g. 360, 768, 1440). If Figma breakpoints differ from project breakpoints (EDS: 600px, 900px, 1200px), ask the user which to use—do not assume]
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

**CDD handoff**: When building the block via content-driven-development, provide the design.md path to the building-blocks skill (e.g. `.specify/specs/001-block-name/design.md`). The building-blocks skill uses design.md as the source of truth for HTML structure, CSS, breakpoints, and visual acceptance.

## Key Rules

- **FIGMA ONLY**: Every CSS rule, selector, breakpoint, and structural decision MUST map to a specific Figma node or layer. No exceptions.
- **When in doubt, omit.** Never invent selectors, styles, breakpoints, or structure. If Figma output is ambiguous, ask the user—do not guess.
- For each element or style in design.md, include the Figma node ID in a comment where practical (e.g. `/* Figma node 1:22422 */`).
- design.md is the **source of truth for all HTML/CSS/design-specific content**
- spec.md remains the source of truth for functional requirements
- Do NOT create or modify spec.md — that was already done by `/speckit-specify`
- CSS must be vanilla (no SCSS, no preprocessors) with block-scoped selectors
- Breakpoints: Use Figma viewport widths first. If they differ from project breakpoints (600px, 900px, 1200px), ask the user which to use
- Map Figma values to project CSS custom properties from `styles/styles.css` where they exist
