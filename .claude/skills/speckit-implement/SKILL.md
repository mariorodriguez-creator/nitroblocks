---
name: speckit-implement
description: Execute the implementation plan for a speckit feature. Trigger when user invokes the speckit implement workflow, asks to implement tasks from tasks.md, or start the implementation phase.
disable-model-invocation: true
---

# Speckit Implement Workflow

Executes all tasks in `tasks.md` phase by phase, following the implementation plan.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root. Parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

## Checklist Status Check

Before implementing, scan `FEATURE_DIR/checklists/` for incomplete items. If any checklist is incomplete, ask user to confirm before proceeding.

## Load Context

- **REQUIRED**: `tasks.md`, `plan.md`
- **IF EXISTS**: `data-model.md`, `research.md`, `quickstart.md`
- **SC001 present**: Invoke `create-component` skill BEFORE any BD/BH/FC tasks in Phase 2. Extract from plan.md: component name (kebab-case, no `dxn-` prefix), title, description, group, super-type, is-container, version. Add `--with-js` if FJ tasks exist. After skill completes: BD001, BD003, FC002, FC003 already exist — **edit/populate only, never recreate**.
- **Dialog tasks (BD002)**: Apply `aem-dialog` skill — Coral 3 only, correct structure, DXn patterns.
- **FC002 (clientlib .content.xml)**: Create at `digitalxn-aem-base-clientlibs-apps/src/main/jcr_root/apps/digitalxn/base/clientlibs/publish/components/[name]/.content.xml` with `categories="[digitalxn.components.dxn-[name]]"` and `allowProxy="{Boolean}true"`. Run before TS006.
- **design.md source of truth**: For BH001/FC001/layout/variants/breakpoints, cross-check design.md. Do not rely on quickstart.md summaries.
- **HTL root = `__base`**: AEM provides block class wrapper. HTL root must be `__base`. Put `data-nc`, `data-nc-params`, ARIA on `__base`.
- **data-nc-params**: Plain expressions only — no HTL `@ context=...` in JSON params.
- **_cq_template with parsys**: Check design.md Embedded Components for required `cq:styleIds` on default children.

## Execution Rules

1. Execute phase by phase — complete each phase before next
2. Respect dependencies: sequential tasks in order, parallel tasks [P] together
3. For completed tasks: mark as `[X]` in tasks.md
4. Halt on non-parallel task failure; continue parallel tasks and report failures
5. SC → BD/FC guard: after SC001, verify file exists before editing

## Build Validation (Token-Efficient)

```bash
# Maven (from repo root)
mvn clean install -q 2>&1 | grep -E '(BUILD SUCCESS|BUILD FAILURE|\[ERROR\]|Tests run:)'

# Frontend (from digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/)
npm run build 2>&1 | grep -iE '(error|Error|failed|FAIL|completed|Compiled)'
npm run lint:js 2>&1 | grep -E '(error|Error|\d+ problem)'
npm run lint:css 2>&1 | grep -E '(error|Error|\d+ problem)'
```

## Completion

Mark all tasks `[X]`, verify features match spec, confirm tests pass and coverage meets requirements.

## Report

Output: tasks completed, build status, and readiness for next phase. **Recommended next step:** Run `/speckit-validate` to validate the implementation. Or optionally `/speckit-design-compliance` (run after validate when PASS).
