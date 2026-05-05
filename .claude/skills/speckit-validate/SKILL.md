---
name: speckit-validate
description: Validate implementation by running CDD Phase 3 (validate portion): test with real content, comprehensive testing, and PR preparation. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-validate".
disable-model-invocation: true
---

# Speckit Validate Workflow

Executes **CDD Phase 3 (validate portion)** from the `content-driven-development` skill. Run after `/speckit-implement`. Implement handles Phase 3 creation (unit tests, lint, block-scoped verification); validate handles Phase 3 verification (full project) and PR readiness.

## Principle

**Validate is verification-only.** Validate NEVER creates or modifies files. Validate ONLY runs scripts, inspects output, and reports PASS/FAIL with recommended actions and fix suggestions.

## What to read for “what to run” vs “how to review”

- **testing-blocks** → **Testing Checklist**: canonical list of execution steps before a PR (tests, lint, browser validation, variants, responsive viewports, branch, `gh checks`). **speckit-validate** defers to it for coverage; this file does not duplicate that checklist.
- **code-review**: rubric for diff-quality review, PR description/preview URLs, review comment format, and GitHub suggestions — use when validation output should match reviewer expectations, not as a second execution checklist.

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
3. **Step 3.3 — Comprehensive Testing** — Run `npm test` (full project). Read and follow the **testing-blocks** skill (Testing Checklist, keeper vs throwaway guidance, browser/manual verification). Treat steps 3.1–3.2 above as already covering parts of that checklist; confirm nothing listed there is skipped.
   **Unit tests (Constitution VI)**: If the block or feature has logic-heavy functions (parse, transform, validate, compute), **verify** unit tests exist at `blocks/{blockname}/{blockname}.test.js`. Fail validation if tests are missing or failing.
4. **Step 3.4 — PR Preparation** — Verify: test content exists (CMS or drafts), test content URL is accessible for PSI checks, author documentation is updated (if applicable).
5. **Skills Compliance** — Review the implementation against each applicable skill. Read each skill and verify the implementation satisfies its rules. Flag gaps in the report (do not edit files). Skills to check:
   - **building-blocks**
   - **eds-wcag**
   - **code-review** (review rubric and PR hygiene only; execution steps remain **testing-blocks**)

## Report

Output: validation result (PASS/FAIL), readiness for next phase, and **recommended next step:** `/speckit-design-compliance` (when design.md exists), or `/speckit-testcontent`, `/speckit-document`.

**If any step fails:** Output failures as a table with columns `Failure` and `Recommended Action`:

| Failure                        | Recommended Action         |
| ------------------------------ | -------------------------- |
| _[description of what failed]_ | _[concrete action to fix]_ |

**Unit test failure:** Tests missing (when required per Constitution VI) → FAIL. Recommended Action: Re-run `/speckit-implement`. Tests failing → FAIL. Include fix suggestions (proposed changes, reasoning) in the report. Do NOT apply fixes.
