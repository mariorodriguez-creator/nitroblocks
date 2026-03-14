---
name: speckit-figma-specify
description: Extract visual design context from Figma and save it as design.md. Trigger when user asks to extract Figma design specs, create a design.md from Figma, or capture visual design reference for a feature.
disable-model-invocation: true
---

# Speckit Figma Specify Workflow

Extracts **visual and stylistic** design context from Figma and saves it as `FEATURE_DIR/design.md`.

Runs **after** `/speckit-specify` (spec.md must already exist).

**Scope — visual only:**
- HTML element structure and BEM class names
- CSS/SCSS styles: colours, typography, spacing, layout, breakpoints
- Design tokens and resolved values
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

Structure the design.md with these sections:

```markdown
# Design Reference: [Feature Name]

## Code Scaffold

### HTML Structure
[BEM element hierarchy, class names, semantic elements]

### SCSS Skeleton
[Structural styles using project mixins: @include tablet-up, @include desktop-up]
[CSS variables mapped to --dxn- tokens]
[Variant modifiers like &--reversed]

**AEM structure mapping**: The Figma root frame is the component's visual root. In AEM, the block class is on the wrapper; the HTL root is `__base`. Put the Figma root's styles under `&__base`, not directly under the block:

```scss
.dxn-{component} {
  &__base {
    /* styles from Figma root frame */
    position: relative;
    width: 100%;
    ...
  }
  &__content { ... }
  ...
}
```

## Design Token Mapping
[Table: Element | CSS Property | --dxn- variable | Fallback value]

## Breakpoints & Per-Breakpoint CSS Overrides
[Mobile base → Tablet (768px) → Desktop (1024px) → Wide (1280px)]
[Specific property overrides per breakpoint]

## Dynamic Content Elements
[Elements with content-dependent sizing, marked ≈ approximate]
[These must NOT get fixed dimension expectations in design-expectations.json]

## Interactive States
[Hover, focus, active, disabled appearance per element]

## Visual Acceptance Checklist
[Specific visual checks: spacing, typography, colour at mobile and desktop]

## Embedded Components
[Child components and required styles, e.g., "dxn-teaser (teaser-stage style)"]

## AEM HTL Integration
[AEM provides block class wrapper — HTL root is __base]
[data-nc, data-nc-params, ARIA attributes go on __base]
```

## Step 4: Write design.md

Write to `FEATURE_DIR/design.md`.

## Report

Output: design.md path and summary of what was captured, and readiness for next phase: `/speckit-plan` (default when design is ready), or optionally `/speckit-clarify` (if ambiguities remain).

## Key Rules

- design.md is the **source of truth for all HTML/CSS/design-specific content**
- spec.md remains the source of truth for functional requirements
- Do NOT create or modify spec.md — that was already done by `/speckit-specify`
- SCSS skeleton must use project mixins (`@include tablet-up`) not raw media queries
