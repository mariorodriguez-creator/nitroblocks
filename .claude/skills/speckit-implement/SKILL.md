---
name: speckit-implement
description: Execute the implementation plan for a speckit feature. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-implement".
disable-model-invocation: true
---

# Speckit Implement Workflow

Executes all tasks in `tasks.md` phase by phase, following the implementation plan.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root. Parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

## Checklist Status Check

Before implementing, scan `FEATURE_DIR/checklists/` for incomplete items. If any checklist is incomplete, ask user to confirm before proceeding.

## Load Context

- **REQUIRED**: `tasks.md`, `plan.md`, draft test content
- **IF EXISTS**: `data-model.md`, `research.md`, `quickstart.md`, `design.md`
- **design.md source of truth**: For BJ001/BC001/layout/variants/breakpoints, cross-check design.md. Do not rely on quickstart.md summaries.

## Implementation Approach (CDD Phase 2)

For block development, follow the `content-driven-development` skill, Phase 2 — this invokes the `building-blocks` skill with the content model and test content URL(s). For core functionality changes (scripts.js, delayed.js, global styles), test against the identified content throughout development.

## Execution Rules

1. Execute phase by phase — complete each phase before next
2. Respect dependencies: sequential tasks in order, parallel tasks [P] together
3. For completed tasks: mark as `[X]` in tasks.md
4. Halt on non-parallel task failure; continue parallel tasks and report failures
5. SC → BJ/BC guard: after SC001 (block scaffolding), verify files exist before editing

## Build Validation

```bash
npm run lint
```

No build step in EDS — linting is the primary code quality gate. Verify rendering on `localhost:3000` against test content after each significant change.

## Completion

Mark all tasks `[X]`, verify features match spec, confirm tests pass and coverage meets requirements.

## Report

Output: tasks completed, build status, and readiness for next phase. **Recommended next step:** Run `/speckit-validate` to validate the implementation. Or optionally `/speckit-design-compliance` (run after validate when PASS).
