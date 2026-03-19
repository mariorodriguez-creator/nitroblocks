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

- **REQUIRED**: `tasks.md`, `plan.md`, draft test content, `.specify/memory/constitution.md`
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

Implement owns the **creation** and **block-scoped verification** parts of CDD Phase 3. Complete these before marking implementation done:

- **Unit test creation (Constitution VI)**: If `tasks.md` contains a TS006 (or equivalent) unit test task, execute it before Completion. Create keeper unit tests at `blocks/{blockname}/{blockname}.test.js`. Export logic-heavy helpers (parse, transform, validate) for testing. Follow **testing-blocks** and **block-unit-testing** resources. Run `npm test` before proceeding.
- **Step 3.2 — Run Quality Checks**: Run `npm run lint` (and `npm run lint:fix` if needed) **after** unit test creation. Linting must pass before completion. Test files are subject to lint—running lint only before creating tests can miss errors introduced by new test files.
- **Testing-blocks**: Run `npm test` and follow the **testing-blocks** skill for browser validation. Report any failures before proceeding to Completion.

### Server Verification (Required — Do Not Skip)

1. **Start the dev server**: `npx -y @adobe/aem-cli up --no-open --html-folder drafts` (or `aem up --html-folder drafts`). Use `--html-folder drafts` when test content is in `drafts/`.
2. **If startup fails** (e.g. EMFILE, permission, sandbox):
   - Retry once with `required_permissions: ["all"]` to rule out sandbox limits.
   - If still failing, ask the user to **manually start the server** in a terminal and confirm when ready.
   - Do not proceed to final validation until the user confirms the server is running.
3. **Verify**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/{test-path}` returns 200 (replace `{test-path}` with the draft path, e.g. `drafts/countdown`).
4. **Instruct the user**: Open the test URL in a browser to verify rendered output (countdown, layout, etc.).

Verify rendering on `localhost:3000` against test content after each significant change.

## Completion

Mark all tasks `[X]`, verify features match spec, confirm tests pass per testing-blocks.

## Report

Output: tasks completed, build status, **testing-blocks status** (passed or failed with details), and readiness for next phase. **Recommended next step:** Run `/speckit-validate` to validate the implementation. Or optionally `/speckit-design-compliance` (when design.md exists).
