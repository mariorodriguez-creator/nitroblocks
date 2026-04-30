---
name: migration-validate
description: Validate EDS migration fidelity at the system level. Checks design system token consistency, block rendering quality, Lighthouse performance, WCAG accessibility, and content completeness. Compares the implemented EDS system against the planner's normalized baseline and the original site. Use after migration-content to verify quality gates before go-live.
---

# Migration Validate

Execution Phase 5 of the EDS migration pipeline. Validates the implemented EDS
system against quality gates at the system, component, and content levels.

## When to Use

- After `migration-content` has imported content
- To validate the design system, blocks, or infrastructure independently
- Before go-live to verify all quality gates

## Scope

Validation operates at three levels:
1. **System level** -- token consistency, design system fidelity, integration health
2. **Component level** -- per-block rendering quality, performance, accessibility
3. **Content level** -- per-page content completeness, redirect coverage

System and component validation can run before content migration.
Content validation runs after.

## Input

- **Required:** source site URL
- **Required:** EDS implementation (local dev server or preview URL)
- **Required:** migration-planner output for baseline metrics
  - `01-design-system-audit.md` -- original accessibility score, grade
  - `02-normalization-report.md` -- expected delta from source
  - `03-atomic-inventory.md` -- expected components
  - `09-validation-strategy.md` -- phase gate criteria

## Output

- `./migration-work/validation/system-report.md` -- system-level findings
- `./migration-work/validation/component-reports/` -- per-block reports
- `./migration-work/validation/content-report.md` -- content completeness
- `./migration-work/validation/summary.md` -- overall go-live readiness

## Workflow

### Step 1: Design System Validation (System Level)

**1a. Token drift check**

Run designlang drift against the implemented site:
```bash
npx designlang drift <eds-url> \
  --tokens ./migration-work/design-extract/*-design-tokens.json
```

Expected: intentional drift only (from normalization). Flag any unintended drift.

Cross-reference against `02-normalization-report.md`:
- Every normalization decision should produce expected drift
- Drift not explained by normalization = implementation error

**1b. Token coverage**

Verify all normalized tokens from the design system are actually used:
- Check `styles/styles.css` declares all tokens from the mapping
- Check block CSS files reference tokens (not hardcoded values)
- Flag orphaned tokens (defined but unused) and rogue values (used but undefined)

**1c. Typography and spacing consistency**

Across all implemented blocks:
- Heading levels follow the normalized type scale
- Spacing values use the normalized grid
- No one-off values that bypass the token system

### Step 2: Component Validation (Block Level)

For each implemented block:

**2a. Rendering quality**

- Block renders correctly with test content in dev server
- All variant options render correctly
- Responsive behavior at 375px, 768px, 1280px

**2b. Performance**

Per block, check contribution to page performance:
- Block JS file size (should be minimal)
- Block CSS file size
- No blocking network requests before LCP
- No layout shifts (CLS contribution = 0)

**2c. Accessibility**

Per block, following `eds-wcag` patterns:
- WCAG 2.2 AA compliance
- Keyboard navigation works
- Screen reader announces content correctly
- ARIA attributes applied where needed
- Focus management for interactive blocks (tabs, accordions, modals)

**2d. Code quality**

Per block:
- `npm run lint` passes
- Block CSS is scoped (no side effects)
- JS follows EDS decoration patterns
- No `!important` usage

### Step 3: Integration Validation (System Level)

For each integration implemented:

**3a. Delayed.js integrations**

- Scripts load only after 3s delay (not in critical path)
- No TBT impact
- Functionality works (analytics fires, consent banner appears, chat loads)

**3b. Form integrations**

- Submission endpoints respond correctly
- Validation works
- Error states handled

**3c. Backend replacements**

- Client-side alternatives function correctly
- No broken functionality from server-side removal

### Step 4: Page-Level Performance (Template Level)

For each template type (not every page -- one representative per template):

**4a. Lighthouse**

```bash
npx lighthouse <eds-url>/path \
  --output json --output html \
  --output-path ./migration-work/validation/lighthouse/
```

**Target: 100 across all four categories.** Non-negotiable for EDS.

**4b. Core Web Vitals**

From Lighthouse report:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

**4c. Payload budget**

Pre-LCP aggregate under ~100kb:
- `styles/styles.css` + `scripts/scripts.js` + first-section block assets

### Step 5: Content Completeness (Page Level)

This step runs after `migration-content`. It IS page-oriented.

For each migrated page (or a sample per template):
- All text content present (no truncation)
- All images loading
- Links working (no 404s)
- Metadata preserved (title, description, OG tags)
- URL structure correct or redirects configured

### Step 6: Visual Regression (System + Page Level)

**6a. Component-level comparison**

For key blocks, compare the EDS rendering against the original site's equivalent
section. This validates that the normalized baseline looks intentional, not broken.

**6b. Full-page comparison**

If designlang visual-diff is available:
```bash
npx designlang visual-diff <original-url> <eds-url> \
  -o ./migration-work/validation/visual-diff/
```

Expected: differences should align with normalization decisions. Unexpected
visual differences indicate implementation issues.

### Step 7: Generate Reports

**System report** (`./migration-work/validation/system-report.md`):
```markdown
# System Validation Report

## Token Fidelity
- Drift: [intentional only / unexpected drift found]
- Coverage: [n]/[total] tokens in use
- Rogue values: [count]

## Integration Health
| Integration | Status | Notes |
[One row per integration]

## Template Performance
| Template | Lighthouse | LCP | CLS | Payload |
[One row per template type]
```

**Component reports** (`./migration-work/validation/component-reports/<block>.md`):
```markdown
# Block Validation: [block-name]

## Rendering: [pass/fail]
## Accessibility: [pass/fail]
## Performance: [pass/fail]
## Code Quality: [pass/fail]
## Issues: [list]
```

**Content report** (`./migration-work/validation/content-report.md`):
```markdown
# Content Validation

## Summary
- Pages checked: [n]
- Complete: [n]
- Issues: [n]

## Issues
[Table: page | issue type | details]
```

**Summary** (`./migration-work/validation/summary.md`):
```markdown
# Validation Summary

## Go-Live Readiness
- [ ] Design system tokens consistent
- [ ] All blocks pass rendering + a11y + performance
- [ ] Lighthouse 100 on all template types
- [ ] WCAG 2.2 AA compliance
- [ ] Content complete and reviewed
- [ ] Integrations functional
- [ ] Redirects configured
- [ ] Go-live checklist complete

## Verdict: [READY / CONDITIONAL / NOT READY]
[Remaining issues]
```

## How to Test This Skill

To validate a single block:
- Run Steps 2a-2d on that block only
- Output: one component report

To validate the system without content:
- Run Steps 1, 2, 3, 4 (skip Step 5)
- Output: system report + component reports + template performance

To validate everything:
- Run all steps
- Output: full summary with go-live readiness

## Related Skills

- **migration-planner** -- baseline metrics and expected delta
- **migration-content** -- produces content to validate
- **testing-blocks** -- EDS-specific testing patterns
- **eds-wcag** -- accessibility validation patterns
- **code-review** -- code quality checks
