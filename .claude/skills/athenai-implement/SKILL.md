---
name: athenai-implement
description: End-to-end implementation pipeline — design, plan, tasks, implement, test cases, test content. Demo mode: skips unit tests and research deep-dives. Records phase wall times via `.specify/scripts/phase-timer.py` (per-phase start/end, subagent logs + merge when parallel). Explicit invocation only — never load from context or topic. Optional flags: --no-parallel (run all phases sequentially in main agent, no subagents), --no-test-cases (skip Phase 4 test case generation).
disable-model-invocation: true
---
# Athenai Implement — Unified Pipeline

Runs the full implementation pipeline from a single `spec.md` input, printing a progress report after each phase. Skips non-essential quality gates to maximize visible output speed.

Each phase is defined in a separate skill. The main agent reads the appropriate phase skill for each step.

## What This Skill Does

Executes six core phases plus an optional manual asset step (`0-assets`). By default, Phases 2-4 use parallel subagents to minimize wall-clock time. Pass flags to change this (see **Flags** below).

Each phase is implemented in a dedicated skill that the agent must read before executing that phase:
- **Phase 0** — Read `athenai-design` skill
- **Phase 1-2** — Read `athenai-plan` skill
- **Phase 3** — Read `athenai-build` skill, then **`building-blocks`** (companion read for block JS/CSS conventions; primary phase skill remains `athenai-build`)
- **Phase 4** — Read `athenai-testcases` skill
- **Phase 5** — Read `athenai-verify` skill

Phase 3 implementation aligns with `building-blocks`; broader content-first workflow remains under **`content-driven-development`** per `AGENTS.md`.

**Default (parallel) execution:**

```
[Input: spec.md validation + org/repo] ← all parallel at start
    ↓
Phase 0 — Design (conditional, Figma) + pre-load Phase 1 context
    ↓
Optional manual step: 0-assets (run `athenai-assets` when binaries are needed)
    ↓
Phase 1 — Plan (includes Tasks for Simple/Standard blocks + SC001 scaffolding)
    ↓
    ├── Subagent A: Phase 3 (Implement) — or Phase 2 → 3 if Complex
    └── Subagent B: Phase 4 (Test Cases) ← runs while A is working
    ↓ (both done)
Phase 5 — Test Content (local draft HTML only; DA upload via /speckit-da-upload)
```

| Phase                     | Output                                                                          | Runs                                          | Skill |
| --------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- | ----- |
| 0 — Design (conditional) | `design.md`                                                                     | Sequential                                    | `athenai-design` |
| 0-assets (optional)      | files under `drafts/media/` + asset report                                      | Manual/separate                                | `athenai-assets` |
| 1 — Plan                 | `plan.md` (with Authored HTML Structure + Parsing Logic + Tasks for Simple/Standard), draft HTML | Sequential                                    | `athenai-plan` |
| 2 — Tasks (Complex only) | `plan.md` (Tasks section filled)                                                | Subagent A (or main agent if `--no-parallel`); skipped for Simple/Standard | `athenai-plan` |
| 3 — Implement            | Block JS, CSS                                                                   | Subagent A (or main agent if `--no-parallel`) | `athenai-build` |
| 4 — Test Cases           | `testcases.csv`                                                                 | Subagent B (or main agent / skipped)          | `athenai-testcases` |
| 5 — Test Content         | Local HTML (`drafts/{name}.plain.html`)                                         | Sequential (waits for active phases)          | `athenai-verify` |

**Phase 3 companion read**: In addition to `athenai-build`, the implementing agent (Subagent A, Cursor `eds-frontend-implementer`, or main agent when `--no-parallel`) must read **`building-blocks`** before editing `blocks/**`.

## Flags

These flags are parsed from the invocation command before any phase starts. Both are independent and composable.

| Flag | Effect |
| --- | --- |
| `--no-parallel` | Skip subagents entirely. Phases 2 → 3 → 4 run sequentially in the main agent. Eliminates subagent startup overhead at the cost of longer wall-clock time. |
| `--no-test-cases` | Skip Phase 4 entirely. No `testcases.csv` is generated. Useful when test cases already exist or are not needed for this run. |

**Behaviour matrix:**

| Invocation | Phase 2+3 | Phase 4 | Phase 5 waits for |
| --- | --- | --- | --- |
| `speckit-fast` | Subagent A | Subagent B (parallel) | A + B |
| `speckit-fast --no-parallel` | Main agent, sequential | Main agent, sequential | Phase 4 complete |
| `speckit-fast --no-test-cases` | Subagent A | skipped | A only |
| `speckit-fast --no-parallel --no-test-cases` | Main agent, sequential | skipped | Phase 3 complete |

## What Is Skipped (Demo Mode)

- **Unit tests**: No `npm test`, no `.test.js` file generation, no TS006 tasks
- **speckit-analyze**: Cross-artifact consistency check removed
- **speckit-validate**: Full project validation chain removed
- **speckit-checklist**: Requirements quality gate removed
- **speckit-clarify**: Spec is assumed clean; no Q&A loop
- **speckit-document**: Authoring guide generation removed
- **Phase 0 research**: No `block-collection-and-party` or `docs-search` runs unless block type is completely unrecognised

## Pre-conditions

The AEM dev server **MUST** already be running on `http://localhost:3000` before invoking this pipeline. The pipeline will **not** start, stop, or restart any dev server. If the server is not running, abort with:

```
ERROR: Dev server not reachable at http://localhost:3000.
Start it first: npx -y @adobe/aem-cli up --no-open --html-folder drafts
```

Verify with: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` — any 2xx or 3xx response is acceptable. Always use port 3000; never bind to an alternative port.

## Input

A single `spec.md` file.

**Flag Parsing (first, before anything else)**

Parse the invocation command for flags and store them as pipeline-wide variables:

- `--no-parallel` found → `NO_PARALLEL=true` (default: `false`)
- `--no-test-cases` found → `NO_TEST_CASES=true` (default: `false`)

Flags are case-sensitive and position-independent. Unknown flags are ignored with a warning.

Then run these steps **in parallel** before any phase starts:

**A — Locate spec and validate**

1. Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root — parse `FEATURE_DIR` and `AVAILABLE_DOCS`.
2. Verify `FEATURE_DIR/spec.md` exists. If missing, abort with:

```
ERROR: spec.md not found in FEATURE_DIR.
Run /speckit-specify first, or provide the path to an existing spec.md.
```

3. Validate spec.md has at least these sections (abort and report missing ones before any phase runs):
   - User Stories or User Journeys
   - Acceptance Criteria
   - Content Model or Block Structure

**B — Resolve org/repo**
Run `git remote -v`, parse origin to extract `{org}` and `{repo}`. Store for use in Phase 5 summary links. Do not ask the user unless parsing fails.

**C — Initialize execution timer**

After A and B succeed, from the **repository root**, the executing agent **must** shell out to `.specify/scripts/phase-timer.py` (Python 3). If A or B fails, **do not** initialize the timer.

1. **RUN_ID** — `{YYYYMMDD}-{HHMMSS}-{slug}`:
   - Date/time: UTC, `date -u +%Y%m%d-%H%M%S`
   - `{slug}`: basename of `FEATURE_DIR`, lowercased; replace any run of non-`[a-z0-9]` with a single `-`; trim leading/trailing `-`; if empty use `speckit`
2. **Persist** `RUN_ID` for the entire pipeline (include it in subagent prompts when using parallel mode).
3. **Init** (writes the run boundary to the default log — see **Execution time tracking**):

   ```bash
   python3 .specify/scripts/phase-timer.py init "$RUN_ID"
   ```

Default log path: `.specify/logs/timings.log` (override only for subagents via `SPECIFY_TIMER_LOG`, below).

Once A, B, and C are complete, proceed to **D** and then Phase 0.

**D — Launch draft-content-generator (background)**

Immediately after A, B, and C succeed, launch the `draft-content-generator` subagent in the background using the Task tool (`run_in_background: true`, `model: fast`). This runs **in parallel with Phase 0** and produces `drafts/{blockname}.plain.html` early, saving ~30-60s from Phase 1.

Provide the subagent with:
- `FEATURE_DIR` — the spec directory path
- `BLOCK_NAME` — extracted from `spec.md` (the block name from the Scope or Content Model section)

The subagent checks if the file already exists and skips if so. Phase 1 also checks: if `drafts/{blockname}.plain.html` exists when Phase 1 runs its "Draft Test Content" step, Phase 1 skips draft generation entirely and notes "draft content pre-generated by background agent" in the report.

Do **not** wait for this subagent before starting Phase 0. Phase 5 verifies the file exists regardless of which phase produced it.

For execution time tracking details, see `resources/execution-timing.md` in this skill directory.

---

## Progress Report Format

After each phase completes, print this markdown section inline:

```markdown
---
## ✓ Phase N — [Name] complete
- **Outputs**: list files created or updated
- **Key decisions**: notable choices made (e.g. "no design.md, proceeding without Figma context")
- **Warnings**: any non-blocking issues
- **Next**: Phase N+1 — [Name]
---
```

At the end print a final `## Summary` section with all outputs, file paths, **execution time report** (`phase-timer.py report`), and any accumulated warnings. If the pipeline **aborts after `init`** but before the normal Phase 5 Summary, still run `finalize` and `report`, and include the pasted report output in the abort/summary message.

---

## Execution time tracking

For complete execution time tracking instructions (phase keys, commands, minimizing dead time, parallel mode, finalize/report), see **`resources/execution-timing.md`** in this skill directory.

---

## Phase 0 — Design (Conditional)

Read the `athenai-design` skill and follow its instructions for Phase 0.

If design output references asset binaries that are not yet materialized, run `athenai-assets` manually as a separate optional `0-assets` timed step before Phase 3.

---

## Phase 1-2 — Plan and Tasks

**Read the `athenai-plan` skill** and follow its instructions for Phases 1 and 2.

Phase 2 is only executed for Complex blocks (9+ tasks); Simple/Standard blocks inline the Tasks section during Phase 1.

---

## Execution Split — After Phase 1

**Immediately after Phase 1 completes**, determine the execution mode based on the flags set during input parsing and the complexity classification.

**If Phase 1 inlined the Tasks section** (Simple/Standard), skip Phase 2 and proceed directly to Phase 3 (or to the Subagent A launch with Phase 3 only).

### If `NO_PARALLEL=false` (default)

Launch subagents in parallel:

```
Phase 1 done (Tasks inlined for Simple/Standard)
    ├── Subagent A: Phase 3 (Implement) — Tasks already in plan.md
    │   (or Phase 2 → Phase 3 if Complex)
    └── Subagent B: Phase 4 (Test Cases) ← runs while A is working
         (skip Subagent B entirely if NO_TEST_CASES=true)
```

Each subagent must receive full input context: `FEATURE_DIR`, **`RUN_ID`**, `spec.md` contents, `plan.md`, and `design.md` (if present). Subagents do not share the parent's memory. Subagent A must verify any referenced `drafts/media/*` assets exist before implementing styles that depend on them. **Subagent A** must read **`athenai-build`** then **`building-blocks`** before editing `blocks/**` (same read order as Cursor **`eds-frontend-implementer`**).

**Timer (mandatory)**: Instruct Subagent A to set `SPECIFY_TIMER_LOG=".specify/logs/timings-agent-a.log"` before any `phase-timer.py start` call, and to run `start`/`end` for `2-tasks` then `3-implement`. If Subagent B runs, instruct it to set `SPECIFY_TIMER_LOG=".specify/logs/timings-agent-b.log"` and run `start`/`end` for `4-testcases` only. The **main** agent, after both subagents finish, runs **`merge`** (see **Execution time tracking**) **before** starting Phase 5 timer.

**File conflict**: Subagent A updates `plan.md` (Tasks section) then writes block files; Subagent B writes `testcases.csv`. No conflict.

**Subagent B failure**: If Phase 4 fails (e.g. spec contains `[NEEDS CLARIFICATION]`), warn but do not block Phase 3 → 5 from completing.

### Cursor: Subagent A = `eds-frontend-implementer` (optional path)

When the orchestrator runs in **Cursor** and delegates Phase 3 via the Task tool or **`/eds-frontend-implementer`**, treat that custom subagent as **Subagent A** (same responsibilities and `timings-agent-a.log` as generic Subagent A).

- **Subagent file**: `.cursor/agents/eds-frontend-implementer.md` (`model: fast`).
- **Context bundle** (include in the delegation prompt): `FEATURE_DIR`, **`RUN_ID`**, full `spec.md`, `plan.md`, and `design.md` if present. Subagent A must verify referenced `drafts/media/*` assets exist before implementing styles that depend on them.
- **Mandatory instructions for the delegation prompt**:
  1. Read **`athenai-build`** fully and execute Phase 3 per that skill.
  2. Read **`building-blocks`** before writing block JS/CSS.
  3. Follow **Execution time tracking** (`resources/execution-timing.md`): set `SPECIFY_TIMER_LOG=".specify/logs/timings-agent-a.log"` before any `phase-timer.py` call; `start`/`end` for `2-tasks` then `3-implement` as already required for Subagent A.

Non-Cursor or environments without this subagent keep using generic “Subagent A” with the same three bullets (read order + timer rules).

### If `NO_PARALLEL=true`

Run all remaining phases sequentially in the **main agent** — no subagents are launched:

```
Phase 1 done (Tasks inlined for Simple/Standard)
    → Phase 3 (Implement) — main agent
    → Phase 4 (Test Cases) — main agent (skip if NO_TEST_CASES=true)
    → Phase 5 (Test Content)

Phase 1 done (Tasks stub for Complex)
    → Phase 2 (Tasks) — main agent
    → Phase 3 (Implement) — main agent
    → Phase 4 (Test Cases) — main agent (skip if NO_TEST_CASES=true)
    → Phase 5 (Test Content)
```

No subagent context-passing is needed; the main agent already holds all context.

**Phase 3 reads (sequential mode)**: Before implementing, the main agent must read **`athenai-build`** then **`building-blocks`** (same order as Cursor `eds-frontend-implementer`).

**Timer (sequential)**: On the **main** log, `start`/`end` `2-tasks` **only if** Phase 2 runs (Complex), then `start`/`end` `3-implement`, then `start`/`end` `4-testcases` **only if** `NO_TEST_CASES=false`.

---

## Phase 3 — Implement (Subagent A)

**Read the `athenai-build` skill**, then **`building-blocks`**, and follow their instructions for Phase 3.

In **Cursor**, delegate Phase 3 to **`eds-frontend-implementer`** when using parallel subagents (see **Cursor: Subagent A = `eds-frontend-implementer`** under **Execution Split — After Phase 1**). In **`--no-parallel`** mode, the main agent performs Phase 3 with the same read order.

---

## Phase 4 — Test Cases

**Read the `athenai-testcases` skill** and follow its instructions for Phase 4.

---

## Phase 5 — Test Content

**Read the `athenai-verify` skill** and follow its instructions for Phase 5.

---

## Key Rules

- **Execution time**: Follow **Execution time tracking** for every run that reaches `init`; `finalize` + `report` on success or failure after `init`.
- **Draft `.plain.html` DOM**: Block roots (`div.{blockName}`) must **not** be direct children of `main` next to other section `<div>`s — `decorateSections` / `decorateBlocks` in `scripts/aem.js` require `main > div.section > div > div.{blockName}`. Phase 1 must wrap the draft in **one outer `<div>`** (or equivalent per-section wrappers). See `athenai-plan` and `athenai-verify`.
- `design.md` is source of truth for HTML/CSS when present; `spec.md` is source of truth for functional requirements
- CSS: vanilla only, no SCSS/preprocessors, block-scoped selectors, mobile-first file order
- Use `@media (width >= Npx)` with EDS breakpoints: 600px, 900px, 1200px
- All block JS exports `default function decorate(block) { ... }`
- **Phase 3**: Read `athenai-build` then `building-blocks` before block edits (Subagent A, Cursor `eds-frontend-implementer`, or main agent with `--no-parallel`)
- Lint must pass before Phase 4 — this is the only hard gate in demo mode
- Never modify `scripts/aem.js`
- Never add `!important` in CSS
