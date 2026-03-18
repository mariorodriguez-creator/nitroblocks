---
name: speckit-design-compliance
description: Generate design-expectations.json from design.md and run assert-design-compliance CSS checks. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit design-compliance".
disable-model-invocation: true
---

# Speckit Design Compliance Workflow

Generates `design-expectations.json` from `design.md` and runs the CSS compliance check.

Run after `/speckit-implement` when the user wants to enforce design compliance.

## Prerequisites

- `FEATURE_DIR/design.md` must exist (created by `figma-screenshot` skill or figma-specify workflow)
- Block CSS implemented at `blocks/{block-name}/{block-name}.css`

## Setup

From repo root, run:

```bash
.specify/scripts/bash/check-prerequisites.sh --json --require-tasks
```

Parse `FEATURE_DIR` from the JSON output.

## Steps

### 1. Check design.md

If `FEATURE_DIR/design.md` doesn't exist: "design-expectations can only be generated when design.md exists. Run figma-specify first." → Stop.

### 2. Resolve Block Name

From plan.md, spec.md, or FEATURE_DIR basename (e.g. `countdown` from `.specify/specs/countdown`). EDS blocks use lowercase hyphenated names (e.g. `countdown`, `embed-instagram`).

### 3. Generate design-expectations.json

Write to `FEATURE_DIR/design-expectations.json`. Extract selectors and values from design.md **Per-Breakpoint CSS Overrides** and **Visual Acceptance Checklist**.

**Include**:
- Typography: `font-size`, `line-height`, `font-weight`, `letter-spacing`
- Dimensions: `padding`, `margin`, `gap`, `width`, `height` for **fixed** design elements
- Colors: `color`, `background-color`, `border-color`
- Borders: `border-width`, `border-style`, `border-radius`
- Shadows: `box-shadow`, `text-shadow`

**Skip**:
- Embedded/child blocks (they have their own tests)
- Dynamic Content Elements unless spec.md explicitly states a fixed size

**cssPath**:
```
blocks/{block-name}/{block-name}.css
```

**Selectors**: Use exact selectors from design.md (e.g. `main .countdown .countdown-header`). EDS block CSS is scoped to `main .{blockName}`.

**media**: `null` for base/mobile; `"768px"`, `"1440px"` etc. per design.md breakpoints.

**Property format**:
```json
"font-size": { "value": "32px", "acceptVar": true }
"gap": { "value": "40px", "tolerancePx": 0, "acceptVar": true }
```
- `acceptVar: true` — allows `var(--token, 24px)` to satisfy `"24px"`
- `tolerancePx` — pixel tolerance for dimension comparisons (default 0)

**Example**:
```json
{
  "component": "countdown",
  "cssPath": "blocks/countdown/countdown.css",
  "expectations": [
    {
      "id": "pretitle-font-mobile",
      "selector": "main .countdown .countdown-pretitle",
      "media": null,
      "properties": {
        "font-size": { "value": "16px", "acceptVar": true },
        "line-height": { "value": "20px", "acceptVar": true }
      }
    },
    {
      "id": "badge-width-tablet",
      "selector": "main .countdown .countdown-badge",
      "media": "768px",
      "properties": {
        "width": { "value": "220px", "acceptVar": true }
      }
    }
  ]
}
```

### 4. Run Compliance Check

From repo root:

```bash
node .specify/scripts/bash/assert-design-compliance.js FEATURE_DIR/design-expectations.json
```

- **PASS**: Print "Design compliance: ✓ PASS". Done.
- **FAIL**: Print full failure output (selector, property, expected vs actual). Then ask user if they want auto-fix.

### 5. Optional Auto-Fix (FAIL only)

If user says yes:
1. Read Source CSS path from failure output (`blocks/{block-name}/{block-name}.css`)
2. For each failure: locate selector+property in block CSS (including inside `@media (width >= Npx)` blocks) and replace with expected value
3. Re-run check and report result

If user says no: Report that they can fix manually using the Source CSS path and failure details.

Block CSS is the source; no build step. Edit the file directly.

### 6. Media Query Support

The assert script supports `(min-width: Npx)` and `(width >= Npx)`. EDS prefers `(width >= Npx)`.

## Report

Output: compliance result (PASS/FAIL), design-expectations.json path, and readiness for next phase: `/speckit-testcontent` (recommended) or `/speckit-document`.
