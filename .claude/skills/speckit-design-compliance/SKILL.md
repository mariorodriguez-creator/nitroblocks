---
name: speckit-design-compliance
description: Generate design-expectations.json from design.md and run assert-design-compliance CSS checks. Trigger when user asks to run design compliance, generate design expectations, or verify CSS matches design.md specifications.
disable-model-invocation: true
---

# Speckit Design Compliance Workflow

Generates `design-expectations.json` from `design.md` and runs the CSS compliance check.

Run after `/speckit-implement` when the user wants to enforce design compliance.

## Prerequisites

- `FEATURE_DIR/design.md` must exist (created by `figma-screenshot` skill or figma-specify workflow)
- Apply `aem-naming` skill rules for expectations format

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks` from repo root. Parse `FEATURE_DIR`.

## Steps

### 1. Check design.md

If `FEATURE_DIR/design.md` doesn't exist: "design-expectations can only be generated when design.md exists. Run figma-specify first." → Stop.

### 2. Resolve Component Name

From plan.md, spec.md, or FEATURE_DIR (e.g. `001-teaser-component` → `dxn-teaser`).

### 3. Generate design-expectations.json

Write to `FEATURE_DIR/design-expectations.json`:

**Include**:
- Typography: `font-size`, `line-height`, `font-weight`, `letter-spacing`
- Dimensions: `padding`, `margin`, `gap`, `width`, `height` for **fixed** design elements
- Colors: `color`, `background-color`, `border-color`
- Borders: `border-width`, `border-style`, `border-radius`
- Shadows: `box-shadow`, `text-shadow`

**Skip**:
- Embedded/child components (dxn-button, dxn-image — they have their own tests)
- Dynamic Content Elements unless spec.md explicitly states a fixed size

**cssPath** (component-specific bundle, NOT page-level):
```
digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/target/jcr_root/apps/digitalxn/base/clientlibs/publish/components/<component-name>/<component-name>.bundle.css
```

Use selectors and values from design.md Per-Breakpoint CSS Overrides and Visual Acceptance Checklist. `media: null` for base/mobile; `media: "1024px"` for desktop breakpoint.

### 4. Run Compliance Check

```bash
node .specify/scripts/assert-design-compliance.js FEATURE_DIR/design-expectations.json
```

- **PASS**: Print "Design compliance: ✓ PASS". Done.
- **FAIL**: Print full failure output with selector, property, expected vs actual. Then ask user if they want auto-fix.

### 5. Optional Auto-Fix (FAIL only)

If user says yes:
1. Read Source SCSS from failure output
2. For each failure: locate selector+property in SCSS (including inside `@include tablet-up`, `@include desktop-up` blocks) and replace with expected value
3. Rebuild CSS: `npm run build:css` in clientlibs-apps/frontend
4. Re-run check and report new result

If user says no: Report that they can fix manually using the Source SCSS path and failure details.

If CSS bundle doesn't exist: tell user to build CSS first.

## Report

Output: compliance result (PASS/FAIL), design-expectations.json path, and readiness for next phase: `/speckit-testcontent` (recommended to generate reference content), or optionally `/speckit-document` (to document the component).
