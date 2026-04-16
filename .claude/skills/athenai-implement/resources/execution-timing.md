# Execution Time Tracking

The executing agent **runs shell commands** at phase boundaries using `.specify/scripts/phase-timer.py`. **Do not** record `start`/`end` for a phase that is **skipped** (e.g. Phase 0 when design is skipped, Phase 4 when `--no-test-cases`).

## Phase keys (must match the script)

| Speckit phase | Timer phase argument |
| --- | --- |
| 0 — Design | `0-design` |
| 0 — Design (optional breakdown) | `0-design-prefetch`, `0-design-figma`, `0-design-write` — use **either** the single `0-design` **or** these three, **not both** (report sums durations; double-counting inflates totals). See `.specify/docs/phase-0-design-performance.md`. |
| 1 — Plan | `1-plan` |
| 2 — Tasks | `2-tasks` |
| 3 — Implement | `3-implement` |
| 4 — Test Cases | `4-testcases` |
| 5 — Test Content | `5-testcontent` |

## Commands (repo root)

```bash
python3 .specify/scripts/phase-timer.py init "$RUN_ID"
python3 .specify/scripts/phase-timer.py start <phase> "$RUN_ID"
python3 .specify/scripts/phase-timer.py end <phase> "$RUN_ID"
python3 .specify/scripts/phase-timer.py finalize "$RUN_ID"
python3 .specify/scripts/phase-timer.py report "$RUN_ID"
python3 .specify/scripts/phase-timer.py merge "$RUN_ID" timings-agent-a.log [timings-agent-b.log]
```

## Minimizing inter-phase dead time (MANDATORY)

Phase transitions are a major source of wasted wall-clock time (typically 10-15 seconds per gap, ~60 seconds total). To eliminate this overhead:

1. **Chain timer end/start in a single shell call** at every phase boundary:

   ```bash
   python3 .specify/scripts/phase-timer.py end 1-plan "$RUN_ID" && python3 .specify/scripts/phase-timer.py start 2-tasks "$RUN_ID"
   ```

   Do NOT run `end` and `start` as separate shell invocations — the agent's thinking time between calls adds 10+ seconds of dead time per transition.

2. **Print the phase report AFTER starting the next timer**, not before. The report is a text summary for the user — composing it should not block the next phase's clock from running. Sequence: `end N + start N+1` (one shell call) → print Phase N report → begin Phase N+1 work.

3. For the **first** phase (Phase 0 or Phase 1 if Phase 0 is skipped), use a standalone `start` call. For the **last** phase, use a standalone `end` call followed by `finalize`.

Paths passed to `merge` are relative to `.specify/logs/` when not absolute.

## Main agent log (default)

Use the default log for Phases 0, 1, and 5 **unless** `--no-parallel` runs Phases 2–4 in the main agent — then use the default log for **all** executed phases (no `SPECIFY_TIMER_LOG`, no `merge`).

## Parallel mode (`NO_PARALLEL=false`)

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

## Finalize and report

- After **successful** completion of the last executed phase, run `finalize`, then `report`.
- On **abort or failure** after `init` has run: still run `finalize` for `"$RUN_ID"`, then `report` (captures partial phases).
- If the pipeline **never** reached **C — Initialize execution timer**, do **not** call `finalize`/`report` for timing.
- In **parallel** mode, if the run **ends before Phase 5**, the main agent should still run **`merge`** for any subagent log files that exist (`timings-agent-a.log` and/or `timings-agent-b.log`) **before** `finalize`, so `report` includes subagent segments.

The **Summary** section **must** include the **full text output** of:

```bash
python3 .specify/scripts/phase-timer.py report "$RUN_ID"
```
