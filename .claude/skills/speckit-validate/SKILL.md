---
name: speckit-validate
description: Validate implementation by running CDD Phase 3 (validate portion): test with real content, comprehensive testing, and PR preparation. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-validate".
disable-model-invocation: true
---

# Speckit Validate Workflow

Executes **CDD Phase 3 (validate portion)** from the `content-driven-development` skill. Run after `/speckit-implement`. Implement handles Phase 3 creation (unit tests, lint, block-scoped verification); validate handles Phase 3 verification (full project) and PR readiness.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks` from repo root. Parse `FEATURE_DIR`. Identify test content URL(s) from tasks.md, plan.md, or spec.

## CDD Phase 3 (Validate Portion)

Validate owns **verification** and **PR readiness**:

- **Step 3.1** — Test with real content
- **Step 3.2** — Run quality checks (lint) — verify again as gate
- **Step 3.3** — Comprehensive testing (full project)
- **Step 3.4** — PR preparation

## Steps

1. **Step 3.1 — Test with Real Content** — Read and follow the content-driven-development skill, Phase 3, Step 3.1. View test content, verify all variants, responsive behavior, edge cases, accessibility basics.
2. **Step 3.2 — Run Quality Checks** — Run `npm run lint`. Fail validation if lint fails.
3. **Step 3.3 — Comprehensive Testing** — Run `npm test` (full project). For browser and accessibility validation, follow the **testing-blocks** skill (manual verification, throwaway tests, or screenshots per the skill's guidance).
   **Unit tests (Constitution VI)**: If the block or feature has logic-heavy functions (parse, transform, validate, compute), **verify** unit tests exist at `blocks/{blockname}/{blockname}.test.js`. Fail validation if tests are missing or failing.
4. **Step 3.4 — PR Preparation** — Verify: test content exists (CMS or drafts), test content URL is accessible for PSI checks, author documentation is updated (if applicable).
5. **Skills Compliance** — Review the implementation against each applicable skill. Read each skill and verify the implementation satisfies its rules. Flag and fix any gaps. Skills to check:
   - eds-wcag
   - eds-styles
   - eds-naming
   - eds-documentation
   - eds-analytics
   - code-review
   - eds-analytics: applies only to interactive blocks
   - eds-documentation: applies when block/docs exist.
6. **Testing-Blocks (Full Project)** — Invoke the **testing-blocks** skill for the full project. Read `.claude/skills/testing-blocks/SKILL.md` and follow its Testing Checklist: run `npm test`, run `npm run lint`, and run browser validation for all blocks (per the skill's keeper/throwaway guidance). Fail validation if any step in the skill's checklist fails.

## Report

Output: validation result (PASS/FAIL), readiness for next phase, and **recommended next step:** `/speckit-design-compliance` (when design.md exists), or `/speckit-testcontent`, `/speckit-document`.

**If any step fails:** Output failures as a table with columns `Failure` and `Recommended Action`:

| Failure                        | Recommended Action         |
| ------------------------------ | -------------------------- |
| _[description of what failed]_ | _[concrete action to fix]_ |

**Unit test failure:** Tests missing → re-run `/speckit-implement` to create. Tests failing → run diagnosis and include fix proposal in the failure report:

1. Run `npm test` and capture failure output.
2. Identify failing file and assertion.
3. Determine likely cause (implementation bug vs. wrong assertion).
4. Propose concrete fix (code change) with reasoning. Do not auto-apply.
