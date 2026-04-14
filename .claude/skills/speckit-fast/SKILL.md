---
name: speckit-fast
description: End-to-end speckit pipeline in a single invocation — design, plan, tasks, implement, test cases, test content. Demo mode: skips unit tests and research deep-dives. Records phase wall times via `.specify/scripts/phase-timer.py` (per-phase start/end, subagent logs + merge when parallel). Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-fast". Optional flags: --no-parallel (run all phases sequentially in main agent, no subagents), --no-test-cases (skip Phase 4 test case generation).
disable-model-invocation: true
---
# Speckit Fast — Unified Pipeline

Runs the full speckit pipeline from a single `spec.md` input, printing a progress report after each phase. Skips non-essential quality gates to maximize visible output speed.

## What This Skill Does

Executes six phases. By default, Phases 2–4 use parallel subagents to minimize wall-clock time. Pass flags to change this (see **Flags** below).

**Default (parallel) execution:**

```
[Input: spec.md validation + org/repo] ← all parallel at start
    ↓
Phase 0 — Design (conditional, Figma) + pre-load Phase 1 context
    ↓
Phase 1 — Plan (includes Tasks for Simple/Standard blocks + SC001 scaffolding)
    ↓
    ├── Subagent A: Phase 3 (Implement) — or Phase 2 → 3 if Complex
    └── Subagent B: Phase 4 (Test Cases) ← runs while A is working
    ↓ (both done)
Phase 5 — Test Content (local draft HTML only; DA upload via /speckit-da-upload)
```


| Phase                     | Output                                                                          | Runs                                          |
| --------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| 0 — Design (conditional) | `design.md`                                                                     | Sequential                                    |
| 1 — Plan                 | `plan.md` (with Authored HTML Structure + Parsing Logic + Tasks for Simple/Standard), draft HTML | Sequential                                    |
| 2 — Tasks (Complex only) | `plan.md` (Tasks section filled)                                                | Subagent A (or main agent if `--no-parallel`); skipped for Simple/Standard |
| 3 — Implement            | Block JS, CSS                                                                   | Subagent A (or main agent if `--no-parallel`) |
| 4 — Test Cases           | `testcases.csv`                                                                 | Subagent B (or main agent / skipped)          |
| 5 — Test Content         | Local HTML (`drafts/{name}.plain.html`)                                         | Sequential (waits for active phases)          |

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

Once A, B, and C are complete, proceed to Phase 0.

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

The executing agent **runs shell commands** at phase boundaries using `.specify/scripts/phase-timer.py`. **Do not** record `start`/`end` for a phase that is **skipped** (e.g. Phase 0 when design is skipped, Phase 4 when `--no-test-cases`).

### Phase keys (must match the script)

| Speckit phase | Timer phase argument |
| --- | --- |
| 0 — Design | `0-design` |
| 1 — Plan | `1-plan` |
| 2 — Tasks | `2-tasks` |
| 3 — Implement | `3-implement` |
| 4 — Test Cases | `4-testcases` |
| 5 — Test Content | `5-testcontent` |

### Commands (repo root)

```bash
python3 .specify/scripts/phase-timer.py init "$RUN_ID"
python3 .specify/scripts/phase-timer.py start <phase> "$RUN_ID"
python3 .specify/scripts/phase-timer.py end <phase> "$RUN_ID"
python3 .specify/scripts/phase-timer.py finalize "$RUN_ID"
python3 .specify/scripts/phase-timer.py report "$RUN_ID"
python3 .specify/scripts/phase-timer.py merge "$RUN_ID" timings-agent-a.log [timings-agent-b.log]
```

### Minimizing inter-phase dead time (MANDATORY)

Phase transitions are a major source of wasted wall-clock time (typically 10-15 seconds per gap, ~60 seconds total). To eliminate this overhead:

1. **Chain timer end/start in a single shell call** at every phase boundary:

   ```bash
   python3 .specify/scripts/phase-timer.py end 1-plan "$RUN_ID" && python3 .specify/scripts/phase-timer.py start 2-tasks "$RUN_ID"
   ```

   Do NOT run `end` and `start` as separate shell invocations — the agent's thinking time between calls adds 10+ seconds of dead time per transition.

2. **Print the phase report AFTER starting the next timer**, not before. The report is a text summary for the user — composing it should not block the next phase's clock from running. Sequence: `end N + start N+1` (one shell call) → print Phase N report → begin Phase N+1 work.

3. For the **first** phase (Phase 0 or Phase 1 if Phase 0 is skipped), use a standalone `start` call. For the **last** phase, use a standalone `end` call followed by `finalize`.

Paths passed to `merge` are relative to `.specify/logs/` when not absolute.

### Main agent log (default)

Use the default log for Phases 0, 1, and 5 **unless** `--no-parallel` runs Phases 2–4 in the main agent — then use the default log for **all** executed phases (no `SPECIFY_TIMER_LOG`, no `merge`).

### Parallel mode (`NO_PARALLEL=false`)

1. **Main agent**: `start`/`end` for each Phase 0 segment that actually runs; `start`/`end` for `1-plan`; after Subagent A and B return, **`merge`** subagent logs into the default log **before** Phase 5; then `start`/`end` for `5-testcontent`.
2. **Subagent A** (Phases 2 → 3): Before the first timer call, set `SPECIFY_TIMER_LOG` to a path whose basename contains **`agent-a`** (required for merge attribution), e.g.:

   ```bash
   export SPECIFY_TIMER_LOG=".specify/logs/timings-agent-a.log"
   ```

   Then `start`/`end` `2-tasks`, then `start`/`end` `3-implement`.
3. **Subagent B** (Phase 4, if `NO_TEST_CASES=false`): Same pattern with **`agent-b`**:

   ```bash
   export SPECIFY_TIMER_LOG=".specify/logs/timings-agent-b.log"
   ```

   Then `start`/`end` `4-testcases`.
4. **Merge** (main agent, after both subagents finish and **before** Phase 5 timer `start`):

   - Both A and B ran:  
     `python3 .specify/scripts/phase-timer.py merge "$RUN_ID" timings-agent-a.log timings-agent-b.log`
   - `--no-test-cases` (only A ran Phase 2–3):  
     `python3 .specify/scripts/phase-timer.py merge "$RUN_ID" timings-agent-a.log`

### Finalize and report

- After **successful** completion of the last executed phase, run `finalize`, then `report`.
- On **abort or failure** after `init` has run: still run `finalize` for `"$RUN_ID"`, then `report` (captures partial phases).
- If the pipeline **never** reached **C — Initialize execution timer**, do **not** call `finalize`/`report` for timing.
- In **parallel** mode, if the run **ends before Phase 5**, the main agent should still run **`merge`** for any subagent log files that exist (`timings-agent-a.log` and/or `timings-agent-b.log`) **before** `finalize`, so `report` includes subagent segments.

The **Summary** section **must** include the **full text output** of:

```bash
python3 .specify/scripts/phase-timer.py report "$RUN_ID"
```

---

## Phase 0 — Design (Conditional)

**Goal**: Produce `design.md` from Figma if available.

### Decision logic (run in order, stop at first match):

1. `FEATURE_DIR/design.md` already exists → **skip**, note "design.md already present" in report.
2. `spec.md` contains a `figma.com` URL → extract `fileKey` and `nodeId`, call `get_design_context` via the Figma MCP server, generate `design.md` following the full 'speckit-figma-specify' skill workflow (HTML scaffold, CSS skeleton in mobile-first order, Layout matrix, Design Token Mapping, Dynamic Content Elements, Interactive States, Visual Acceptance Checklist).
3. No Figma URL found and no `design.md` → **skip silently**, note "no Figma source — proceeding without design.md" in report. Do NOT block or ask.

### Pre-load Phase 1 context during Phase 0 (MANDATORY when Phase 0 runs)

Phase 1 requires `constitution.md`, `styles.css`, and the `setup-plan.sh --json` template — none of which depend on `design.md`. When Phase 0 is executing Figma MCP calls, **launch these reads in parallel** with the Figma calls so the data is already in memory when Phase 1 starts:

- Read `.specify/memory/constitution.md`
- Read `styles/styles.css`
- Run `.specify/scripts/bash/setup-plan.sh --json`

This eliminates the context-loading portion of Phase 1's startup time.

### Figma extraction rules (when running):

- Mobile-first CSS file order: base (no `@media`) → `@media (width >= 600px)` → `@media (width >= 900px)` → optional `1200px`.
- Layout matrix is mandatory — one row per flex/grid container per breakpoint.
- Dynamic content elements: no fixed `width`/`height` on elements; no `max-width`/`max-height` on their containers unless Figma explicitly has it.
- `design.md` is source of truth for all HTML/CSS/design content. `spec.md` remains source of truth for functional requirements.
- **Do NOT call `get_screenshot` separately** when `get_design_context` was already called for the same node — `get_design_context` already includes a screenshot by default (its `excludeScreenshot` parameter defaults to `false`). Calling `get_screenshot` on the same nodes is a redundant MCP round-trip that wastes 5-15 seconds per call. Only use `get_screenshot` for **fallback** asset extraction when the primary `curl` + `sips` path fails, or for targeted capture of specific child layers that `get_design_context` does not expose with a usable download URL.
- **Curl-first asset export (primary)** — When the user opts in to Figma asset downloads, prefer URLs from the `get_design_context` response: download raw assets with `curl`, then resize/crop per breakpoint with `sips` (see `speckit-figma-specify` Step 3b). This avoids serial `get_screenshot` MCP calls for routine backgrounds and keeps work in shell-friendly operations.
- **Background asset job** — After classifying assets and building a manifest (source URLs, target paths under `drafts/media/`, `sips` dimensions per the Figma node data), launch a **background** subagent (`Task` with `run_in_background: true`): use a **`shell`** subagent for `curl` + `sips` only (no MCP required), or **`generalPurpose`** if the manifest also includes rare `get_screenshot` fallback steps. Start this job **in parallel with** writing `design.md` (same wall-clock window). The `design.md` text only references paths (e.g., `drafts/media/background-image-desktop.png`), not binaries — writing proceeds while the job runs.
- **Parallel `curl` (still valid)** — For simple standalone assets (SVGs, icons), you may also launch parallel `curl` shell calls (`block_until_ms: 0`) without a subagent; combine with the background job as needed so nothing blocks unnecessarily.
- **Deferred await (mandatory)** — Do **not** block Phase 0 completion or Phase 1 on asset files being on disk. **Await** the background asset job (poll the job output / verify files exist) **only immediately before Phase 3 — Implement** begins, when JS/CSS may reference those paths. Phase 1–2 do not require the binaries. If the job fails, warn in the Phase 3 report and retry `curl` / fallback `get_screenshot` on the **main agent** if subagent MCP is unavailable (see `.specify/docs/phase-0-background-agent-mcp-notes.md`).

### Timer

Only if this phase **runs** (Figma path that produces `design.md`): `start` `0-design` on the **main** log. When Phase 0 completes, **chain** the transition: `end 0-design && start 1-plan` in a single shell call (see **Minimizing inter-phase dead time**). If Phase 0 is skipped (existing `design.md`, no Figma, or silent skip), **omit** `0-design` timer calls and start `1-plan` directly.

Print Phase 0 report on completion or skip.

---

## Phase 1 — Plan

**Goal**: Produce `plan.md` (with Authored HTML Structure, Parsing Logic, and Tasks section for Simple/Standard blocks).

### Collapsed Research (Fast Mode)

Skip `block-collection-and-party` and `docs-search` **unless** the block type is completely unrecognised (no existing block in `blocks/` directory matches the feature). If skipping, note "research skipped in fast mode" in report.

### Load Context

- **Required**: `spec.md`, `.specify/memory/constitution.md`
- **If exists**: `design.md` (source of truth for HTML/CSS — overrides prose in spec)
- Load `IMPL_PLAN` template from `.specify/scripts/bash/setup-plan.sh --json`

### Produce Artifacts

1. **`plan.md`**: Architecture decisions, tech stack, file list, block name, variants, implementation approach. Reference `design.md` Code Scaffold and Layout matrix where applicable. Include these additional sections at the bottom of the file (in this order):

   **`## Authored HTML Structure`** — The actual `<div>` nesting EDS produces from the authored block table, before `decorate()` runs. Cover the full-field example (all rows populated). This replaces the former `data-model.md`'s unique content and gives the implementer a concrete DOM starting point.

   **`## Parsing Logic`** — Pseudocode for the `decorate()` iteration pattern: how to extract the key from `children[0]`, access value cells from remaining children, and match keys case-insensitively.

   **`## Tasks`** — For **Simple** and **Standard** complexity blocks (see Complexity Classification in Phase 2), generate the full Tasks section inline during Phase 1 using the Required Tasks list and Phase Structure from Phase 2. This eliminates Phase 2 as a separate step, saving ~50 seconds of phase overhead + inter-phase gap. For **Complex** blocks (9+ tasks, multiple blocks, cross-block dependencies), leave the Tasks section as a stub heading and let Phase 2 fill it separately.

   To determine complexity: count the number of user stories, check if the feature spans multiple blocks, and check for third-party integrations. A single new block with variants is Standard; only escalate to Complex when justified.

Do **not** generate `data-model.md` or `quickstart.md` — the data model is already covered by `spec.md`'s Content Model section, and quickstart content is fully derivable from `spec.md` + `design.md`.

### Draft Test Content (CDD Phase 1.3)

Generate draft HTML test content in `drafts/{blockname}.plain.html` based on `spec.md`'s Content Model section and the `## Authored HTML Structure` section in `plan.md`. File must:

- Use `.plain.html` extension
- Contain only section content (`<div>` wrappers with block tables and default content)
- **MUST NOT** include `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`, `<header>`, `<main>`, or `<footer>` tags — the AEM dev server wraps `.plain.html` content with the full page shell automatically (scripts.js, styles.css, header/footer blocks). Including these tags breaks the decoration pipeline and **prevents block JS and CSS from loading**. The file must start directly with `<div>` or `<hr>` section elements.
- Cover all block variants from the spec
- **Cover edge cases from spec.md** — every item listed in the Edge Cases section MUST have a corresponding section in the draft HTML. At minimum include variants for: invalid/unparseable inputs, boundary conditions (e.g. past dates, empty optional fields), and any graceful-degradation scenario the spec describes. These are critical for verifying that `decorate()` handles bad data without breaking the page.

**Edge case sourcing** (checked in order):

1. **`testcases.csv`** — if `FEATURE_DIR/testcases.csv` exists (from a prior run or manual creation), scan it for test cases whose Title contains "edge", "invalid", "error", "missing", "empty", "boundary", "fallback", or "graceful". Extract the scenario described in each matching test case and ensure the draft HTML includes a variant that exercises it.
2. **`spec.md` Edge Cases section** — always read this section and generate a draft variant for every bullet point. This is the primary source even when `testcases.csv` exists, because the CSV may not cover all spec-level edge cases.
3. **Implicit edge cases** — if the Content Model has required fields, include at least one variant where a required field contains an obviously invalid value (to verify graceful degradation), and one variant where all optional fields are omitted (minimal configuration).

### Block Scaffolding in Phase 1 (SC001)

Create the block directory during Phase 1 alongside draft test content creation: `mkdir -p blocks/{blockname}`. This is a filesystem setup step with no dependency on the Tasks section — it only needs the block name, which is known from `spec.md`. Moving SC001 here allows Phase 3 to begin writing JS/CSS immediately without a scaffold-then-verify step.

### Timer

`start` `1-plan` on the **main** log (after Phase 0 decision and any Phase 0 work) — or chained from Phase 0 `end` (see **Minimizing inter-phase dead time**). When Phase 1 completes, **chain** the transition to the next phase in a single shell call (e.g. `end 1-plan && start 3-implement` when Phase 2 is inlined, or `end 1-plan && start 2-tasks` when Phase 2 runs separately).

**Background Figma asset job**: If Phase 0 launched a background asset download job (`curl` / `sips` / optional subagent), it **may still be running** during Phase 1 — that is intentional. Phase 1 must **not** wait for those files; only Phase 3 awaits completion (see **Phase 0 — Figma extraction rules**, Deferred await).

Print Phase 1 report after starting the next timer.

---

## Phase 2 — Tasks (Complex blocks only)

**Goal**: Fill the `## Tasks` section in `plan.md`.

**Guard**: If Phase 1 already generated the Tasks section inline (Simple/Standard complexity), skip Phase 2 entirely. Print:
```
## ✓ Phase 2 — Tasks inlined in Phase 1
- **Outputs**: Tasks section already in plan.md (generated during Phase 1)
- **Key decisions**: Simple/Standard complexity — Phase 2 merged into Phase 1
- **Next**: Phase 3 — Implement
```
Do **not** record `2-tasks` timer events when inlined. Proceed directly to Phase 3.

Phase 2 only runs as a separate step for **Complex** blocks (9+ tasks, multiple blocks, cross-block dependencies) where the task decomposition requires dedicated reasoning.

### Load Context

- **Required**: `plan.md` (contains Tasks stub, Authored HTML Structure, Parsing Logic), `spec.md`, draft test content
- **If exists**: `design.md`
- Load `.specify/templates/tasks-template.md` for structure

Tasks are written into the `## Tasks` section of `plan.md`, not a new file.

### Complexity Classification


| Class    | Task count | Criteria                                  |
| ---------- | ------------ | ------------------------------------------- |
| Simple   | 2–4       | CSS-only, minor JS fix, single-file       |
| Standard | 5–8       | New block (JS + CSS), variants            |
| Complex  | 9–15      | Multiple blocks, third-party, cross-block |

### Task Format

```
- [ ] [Category-ID] [P] Description with file path
```

Categories: `BJ` (Block JS), `BC` (Block CSS), `CS` (Core Scripts), `GS` (Global Styles), `CT` (Content), `IN` (Integration), `TS` (Testing), `DC` (Documentation), `T` (Setup), `SC` (Scaffolding).

### Required Tasks (Always Generate)

- `SC001` — Block scaffolding (create `blocks/{name}/{name}.js` and `{name}.css`)
- `BJ001` — Block JS decoration
- `BC001` — Block CSS (mobile-first file order; Layout matrix compliance when design.md exists)
- `T001` — Test content verification (`.plain.html` format, health check on `localhost:3000`, browser render confirmed, all variants covered)
- `TS001` — ESLint (`npm run lint`)
- `TS002` — Stylelint (`npm run lint`)
- `CT001` — Content validation (browser render check post-implementation)

### Omit in Demo Mode

- `TS006` (unit tests) — always omit
- `TS004` (PSI check) — omit
- `DC*` (documentation tasks) — omit

### Phase Structure

- **Phase 1: Setup** — T001 (test content gate), SC001
- **Phase 2: Foundation** — core script changes if needed
- **Phase 3.X: User Stories** — one sub-phase per user story
- **Final Phase: QA** — TS001, TS002, CT001

When `design.md` exists: BJ001 produces HTML matching `design.md` Code Scaffold; BC001 implements `design.md` CSS Skeleton in mobile-first file order.

### Timer

`start`/`end` `2-tasks` on the log for the agent that runs this phase (**Execution time tracking**): subagent A log in parallel mode, or main log if `--no-parallel`. When Phase 2 completes, **chain** `end 2-tasks && start 3-implement` in a single shell call.

Print Phase 2 report after starting the Phase 3 timer. Output is `plan.md` (Tasks section updated), not a separate `tasks.md`.

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

Each subagent must receive full input context: `FEATURE_DIR`, **`RUN_ID`**, `spec.md` contents, `plan.md`, and `design.md` (if present). Subagents do not share the parent's memory. **Subagent A** must follow **Phase 3 — Prerequisites** first (await any Phase 0 background Figma asset job before implementing).

**Timer (mandatory)**: Instruct Subagent A to set `SPECIFY_TIMER_LOG=".specify/logs/timings-agent-a.log"` before any `phase-timer.py start` call, and to run `start`/`end` for `2-tasks` then `3-implement`. If Subagent B runs, instruct it to set `SPECIFY_TIMER_LOG=".specify/logs/timings-agent-b.log"` and run `start`/`end` for `4-testcases` only. The **main** agent, after both subagents finish, runs **`merge`** (see **Execution time tracking**) **before** starting Phase 5 timer.

**File conflict**: Subagent A updates `plan.md` (Tasks section) then writes block files; Subagent B writes `testcases.csv`. No conflict.

**Subagent B failure**: If Phase 4 fails (e.g. spec contains `[NEEDS CLARIFICATION]`), warn but do not block Phase 3 → 5 from completing.

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

**Timer (sequential)**: On the **main** log, `start`/`end` `2-tasks` **only if** Phase 2 runs (Complex), then `start`/`end` `3-implement`, then `start`/`end` `4-testcases` **only if** `NO_TEST_CASES=false`.

---

## Phase 3 — Implement (Subagent A)

**Goal**: Execute tasks from `plan.md`'s `## Tasks` section and produce working block code.

### Load Context

- **Required**: `plan.md` (contains Tasks section, Authored HTML Structure, Parsing Logic), draft test content
- **If exists**: `design.md` (source of truth for BJ001/BC001/layout/variants/breakpoints)

### Prerequisites (before any implementation work)

1. **Await background Figma asset job** — If Phase 0 started a background asset download (see **Phase 0 — Figma extraction rules**), **wait until it finishes** (poll job output or verify expected files exist under `drafts/media/`). Do not write block CSS `url()` references to missing files. If the job failed, attempt recovery (`curl` retry or `get_screenshot` via Figma MCP on the **implementing agent**, or hand off to the main agent if subagents lack MCP — see `.specify/docs/phase-0-background-agent-mcp-notes.md`) and warn in the report.
2. Proceed with **Execution Rules** below.

### Execution Rules

1. Execute phase by phase — complete each phase before starting the next
2. Respect dependencies: sequential tasks in order; parallel tasks `[P]` together
3. Mark completed tasks `[X]` in `plan.md`'s `## Tasks` section
4. Halt on non-parallel task failure; report failures before proceeding
5. SC001 (block directory creation) was already completed in Phase 1 — mark it `[X]` and proceed directly to writing JS/CSS files

### CSS Rules (when design.md exists)

- Block CSS MUST follow mobile-first file order: base (no `@media`) → `@media (width >= 600px)` → `@media (width >= 900px)` → optional `1200px`
- Match `## Layout matrix (flex / grid)` for `flex-direction`/`gap` per breakpoint
- If desktop differs from tablet, repeat properties in the `900px` block (do not rely on cascade inheritance)

### Lint-Aware CSS Generation (MANDATORY)

Generate lint-clean CSS on the first attempt to avoid costly fix-retry cycles (each `npm run lint` takes ~2s, and the agent reasoning between attempts adds 10+ seconds). Follow these Stylelint rules when writing CSS:

- **Modern color syntax**: Use `rgb(255 255 255 / 40%)` not `rgba(255, 255, 255, 0.4)`. Stylelint enforces `color-function-alias-notation: "without-alpha"` — all `rgba()` calls must be written as `rgb()` with the `/` alpha syntax.
- **No deprecated properties**: Use `clip-path: inset(50%)` not `clip: rect(0 0 0 0)` for visually-hidden / sr-only patterns. The `clip` property is deprecated.
- **No vendor prefixes**: Stylelint standard config rejects `-webkit-`, `-moz-`, etc. Use unprefixed properties only.
- **No `!important`**: Prohibited by the constitution (Principle I).
- **Modern gradient syntax**: Use space-separated values in gradients: `rgb(2 2 2 / 50%)` not `rgba(2, 2, 2, 0.5)`.

This checklist also applies to the CSS Skeleton in `design.md` — if Phase 0 generates `rgba()` in the skeleton, Phase 3 will inherit lint errors.

### Build Validation (Demo Mode)

**Skip**: `npm test`, unit test creation, `.test.js` files.

**Pre-condition**: The dev server is already running on `http://localhost:3000` (verified at pipeline start). Do **NOT** start, stop, or restart the server. Do **NOT** bind to any other port.

**Keep** — health check first, then lint and design compliance **in parallel**:

1. **Health check** (server must already be running on port 3000):

   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/{draft-path}` must return 200
   - If the draft path returns 404, try alternate paths (e.g. `/drafts/{blockname}` vs `/{blockname}`) — the URL depends on how the server was started
   - Instruct user to open the test URL in a browser to verify rendered output

2. Launch these **in parallel**:

   **a. Lint** (required — halt on failure):

   ```
   npm run lint
   ```

   If lint fails, print specific errors and halt. Do NOT proceed to Phase 4 (Subagent B result) until lint passes. Run `npm run lint:fix` and retry once. If lint still fails after retry, run `python3 .specify/scripts/phase-timer.py finalize "$RUN_ID"` and `python3 .specify/scripts/phase-timer.py report "$RUN_ID"`, and include the report in the failure output (**Execution time tracking**).

   **b. Design compliance** (when `design.md` exists — non-blocking):

   - Generate `design-expectations.json` from `design.md` (per-breakpoint CSS expectations: typography, spacing, layout, colors)
   - Run: `node .specify/scripts/bash/assert-design-compliance.js`
   - Report PASS/FAIL; auto-fix CSS failures where possible
   - Does not halt pipeline on failure

### Timer

`start`/`end` `3-implement` on the same log as Phase 2 (**Execution time tracking**). When Phase 3 completes, **chain** the transition to the next phase: `end 3-implement && start 4-testcases` (if Phase 4 runs) or `end 3-implement && start 5-testcontent` (if Phase 4 is skipped) in a single shell call.

Print Phase 3 report after starting the next timer.

---

## Phase 4 — Test Cases

**Goal**: Produce `testcases.csv`.

**Guard**: If `NO_TEST_CASES=true`, skip test case **generation** but still check for an existing `testcases.csv`:

1. Check if `FEATURE_DIR/testcases.csv` exists.
2. If it **exists**: note it in the report so downstream phases (and the developer) know edge cases were already captured. The edge cases from this file were already factored into draft test content during Phase 1 (see **Draft Test Content — Edge case sourcing**).
3. If it **does not exist**: note that no test cases are available.

Print:
```
## ✓ Phase 4 — Test Cases skipped (generation)
- **Outputs**: none (generation skipped via --no-test-cases flag)
- **Key decisions**: skipped generation; existing testcases.csv: [found / not found]
- **Edge case coverage**: edge cases from spec.md were applied to draft test content in Phase 1
- **Next**: Phase 5 — Test Content
```
Then proceed to Phase 5. **Do not** record `4-testcases` timer events when skipped.

When running: if `NO_PARALLEL=false`, this phase runs as Subagent B in parallel with Phase 2 → 3. If `NO_PARALLEL=true`, it runs sequentially in the main agent after Phase 3. Starts immediately after Phase 1 (parallel) or Phase 3 (sequential).

### Timer

When Phase 4 **runs**: `start`/`end` `4-testcases` on Subagent B log (parallel) or main log (sequential).

### Load Context

- **Required**: `spec.md` (must not contain `[NEEDS CLARIFICATION]` markers — if found, warn but continue)
- Load `.specify/templates/test-cases.csv` for column structure

### Coverage Requirements


| Source                      | Minimum                  |
| ----------------------------- | -------------------------- |
| User journeys (happy path)  | One per distinct journey |
| Acceptance Criteria         | One or more per AC       |
| Edge cases                  | One per edge case        |
| Published page verification | At least one end-to-end  |

### Test Case Rules

1. **Author perspective**: All steps executable in AEM Editor or published site — no dev tools, no code inspection
2. **Atomic steps**: One action per step
3. **Unambiguous expected results**: Clear, observable result per step
4. **Title pattern**: `[Component / Feature Area] | [What is verified]`
5. **No implementation details**: No Java, Sling Models, HTL, APIs

### CSV Format

```
ID,Work Item Type,Title,Test Step,Step Action,Step Expected,Area Path,Assigned To,State
"","Test Case","[Title]",,,,"Consumer Platforms\Adobe Experience Manager (AEM)","","Design"
,,,"1","[Action]","[Expected]",,,
```

### Organization Order

1. Author experience
2. Functional / AC verification
3. Variations and combinations
4. Responsive / cross-device (if relevant)
5. Publication verification
6. Edge cases and negative tests
7. Regression guard

Print Phase 4 report on completion.

---

## Phase 5 — Test Content

**Goal**: Verify local draft HTML exists and print the pipeline summary.

DA Library upload is handled separately — run `/speckit-da-upload` after this pipeline completes.

### Prerequisites

Phase 5 starts when **all applicable** phases are complete:

- **Phase 3 (Implement)** — always required; block files must exist and lint must pass. Ran as Subagent A or main agent depending on `NO_PARALLEL`.
- **Phase 4 (Test Cases)** — required only if `NO_TEST_CASES=false`; `testcases.csv` written (or failed with warning).

Summary of when Phase 5 may start:

| Flags | Phase 5 waits for |
| --- | --- |
| _(none)_ | Subagent A (Phase 3) + Subagent B (Phase 4) |
| `--no-parallel` | Phase 3 complete in main agent, then Phase 4 complete in main agent |
| `--no-test-cases` | Subagent A (Phase 3) only |
| `--no-parallel --no-test-cases` | Phase 3 complete in main agent only |

### Timer

`start`/`end` `5-testcontent` on the **main** log after all prerequisite phases are done (and after **`merge`** when in parallel mode).

### Step 1 — Local Draft HTML

Verify `drafts/{blockname}.plain.html` exists (created in Phase 1). If missing, regenerate from the `## Authored HTML Structure` section in `plan.md`.

**`.plain.html` structure validation (MANDATORY)**: After verifying the file exists, check that it does **not** contain `<body>`, `<header>`, `<main>`, or `<footer>` tags. The AEM dev server wraps `.plain.html` content with the full page shell automatically (including `scripts.js` which loads block JS/CSS). Including these tags breaks the decoration pipeline and prevents block JS and CSS from loading. If any are found, strip them — the file must contain **only** section-level `<div>` elements, `<hr>` section breaks, and block content. Run: `grep -ciE '<(body|header|main|footer)[> /]' drafts/{blockname}.plain.html` — if the count is > 0, rewrite the file with the tags removed.

### Step 2 — Final Summary Report

Print Phase 5 report plus full pipeline summary.

**MANDATORY — execute these two commands and capture their stdout:**

```bash
python3 .specify/scripts/phase-timer.py finalize "$RUN_ID"
python3 .specify/scripts/phase-timer.py report "$RUN_ID"
```

The full stdout of the `report` command **MUST appear verbatim in your text response** under `### Execution time` — do NOT leave the placeholder text, do NOT omit it, do NOT summarize it. Copy the exact lines.

Then print the summary. The `### Execution time` section must contain the literal report output, like this example:

    ## Summary

    ### Execution time

    Speckit Execution Time Report — {RUN_ID}
    ────────────────────────────────────────────────────────────
    Phase              Start        End            Duration    Agent
    ────────────────────────────────────────────────────────────
    0 — Design         HH:MM:SS     HH:MM:SS           Xm Xs    main
    ...
    ────────────────────────────────────────────────────────────
    TOTAL (wall)       HH:MM:SS     HH:MM:SS           Xm Xs

    ### Pipeline Complete

### Pipeline Complete

| Phase | Ran | Status | Outputs |
|-------|-----|--------|---------|
| 0 — Design | sequential | ✓ / skipped | design.md or "no Figma source" |
| 1 — Plan | sequential | ✓ | plan.md (with Authored HTML Structure + Tasks for Simple/Standard), drafts/{name}.plain.html, blocks/{name}/ |
| 2 — Tasks | Subagent A / main / inlined | ✓ / inlined in Phase 1 | plan.md (Tasks section filled) |
| 3 — Implement | Subagent A or main agent | ✓ | blocks/{name}/{name}.js, blocks/{name}/{name}.css |
| 4 — Test Cases | Subagent B / sequential / skipped | ✓ / warned / skipped | {FEATURE_DIR}/testcases.csv or "skipped (--no-test-cases)" |
| 5 — Test Content | sequential | ✓ | drafts/{name}.plain.html |

### Warnings
[List any non-blocking issues accumulated across all phases]

### Recommended Next Steps
- Open test URL in browser: http://localhost:3000/{draft-path}
- Run /speckit-da-upload to upload the block to the DA Library
- Run /speckit-validate for full production validation before PR
- Run /speckit-document to generate the authoring guide
```

---

## Key Rules

- **Execution time**: Follow **Execution time tracking** for every run that reaches `init`; `finalize` + `report` on success or failure after `init`.
- `design.md` is source of truth for HTML/CSS when present; `spec.md` is source of truth for functional requirements
- CSS: vanilla only, no SCSS/preprocessors, block-scoped selectors, mobile-first file order
- Use `@media (width >= Npx)` with EDS breakpoints: 600px, 900px, 1200px
- All block JS exports `default function decorate(block) { ... }`
- Lint must pass before Phase 4 — this is the only hard gate in demo mode
- Never modify `scripts/aem.js`
- Never add `!important` in CSS
