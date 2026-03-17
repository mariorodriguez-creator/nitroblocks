---
name: speckit-validate
description: Validate implementation by running CDD Phase 3 steps 3.1 and 3.3, plus EDS skills compliance check. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-validate".
disable-model-invocation: true
---

# Speckit Validate Workflow

Executes **Phase 3, steps 3.1 and 3.3** from the `content-driven-development` skill. Run after `/speckit-implement`.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks` from repo root. Parse `FEATURE_DIR`. Identify test content URL(s) from tasks.md, plan.md, or spec.

## Steps

1. **Test with Real Content** — Read and follow the content-driven-development skill, Phase 3, Step 3.1.
2. **Comprehensive Testing** — Read and follow the content-driven-development skill, Phase 3, Step 3.3.
3. **Skills Compliance** — Second-round check: review the implementation against each applicable skill. Read each skill and verify the implementation satisfies its rules. Flag and fix any gaps. Skills to check:
   * eds-wcag
   * eds-styles
   * eds-naming
   * eds-documentation
   * eds-analytics
   * code-review
   * eds-analytics: applies only to interactive blocks
   * eds-documentation: applies when block/docs exist.

## Report

Output: validation result (PASS/FAIL), readiness for next phase, and **recommended next step:** `/speckit-design-compliance` (when design.md exists), or `/speckit-testcontent`, `/speckit-document`.

**If any step fails:** Output failures as a table with columns `Failure` and `Recommended Action`:

| Failure | Recommended Action |
|---------|-------------------|
| *[description of what failed]* | *[concrete action to fix]* |
