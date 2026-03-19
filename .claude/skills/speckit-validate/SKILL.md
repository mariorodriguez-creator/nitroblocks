---
name: speckit-validate
description: Validate implementation by running CDD Phase 3 (validate portion): test with real content, comprehensive testing, and PR preparation. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-validate".
disable-model-invocation: true
---

# Speckit Validate Workflow

Executes **CDD Phase 3 (validate portion)** from the `content-driven-development` skill. Run after `/speckit-implement`. Implement handles Phase 3 creation (unit tests, lint, block-scoped verification); validate handles Phase 3 verification (full project) and PR readiness.

## Principle

**Validate is verification-only.** Validate NEVER creates or modifies files. Validate ONLY runs scripts, inspects output, and reports PASS/FAIL with recommended actions and fix suggestions.

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
3. **Step 3.3 — Comprehensive Testing** — Run `npm test` (full project). If tests exist, they must pass. For browser and accessibility, follow the **testing-blocks** skill.
   **Unit tests (Constitution VI)**: Constitution Article VI: "Unit tests SHOULD be added for logic-heavy utilities." Inspect the block for logic-heavy functions (parse, transform, validate, compute). If present and unit tests are MISSING → FAIL validation. If present and unit tests are FAILING → FAIL validation. Do NOT create or fix tests. Recommended Action for missing: Re-run `/speckit-implement`.
4. **Step 3.4 — PR Preparation** — Verify: test content exists (CMS or drafts), test content URL is accessible for PSI checks, author documentation is updated (if applicable).
5. **Skills Compliance** — Review the implementation against each applicable skill. Flag gaps only. Do NOT create or modify files. Output failures in the report table. Skills to check:
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

**Unit test failure:** Tests missing (when required per Constitution VI) → FAIL. Recommended Action: Re-run `/speckit-implement`. Tests failing → FAIL. Include fix suggestions (proposed changes, reasoning) in the report. Do NOT apply fixes.
