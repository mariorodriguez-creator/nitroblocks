---
name: athenai-verify
description: Phase 5 of athenai-implement pipeline — verify local draft HTML exists, validate .plain.html structure, and print pipeline summary with execution time report.
---
# Athenai Verify — Phase 5

**Goal**: Verify local draft HTML exists and print the pipeline summary.

DA Library upload is handled separately — run `/speckit-da-upload` after this pipeline completes.

## Prerequisites

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

## Timer

`start`/`end` `5-testcontent` on the **main** log after all prerequisite phases are done (and after **`merge`** when in parallel mode).

## Step 1 — Local Draft HTML

Verify `drafts/{blockname}.plain.html` exists (created in Phase 1). If missing, regenerate from the `## Authored HTML Structure` section in `plan.md`.

**Do NOT curl the dev server** (`localhost:3000`) to check rendering. The structure validation below is sufficient — the dev server may return 404 for newly generated files and troubleshooting it wastes 15-30s. Visual verification is a manual step listed in Recommended Next Steps.

**`.plain.html` structure validation (MANDATORY)**: After verifying the file exists, check that it does **not** contain `<body>`, `<header>`, `<main>`, or `<footer>` tags. The AEM dev server wraps `.plain.html` content with the full page shell automatically (including `scripts.js` which loads block JS/CSS). Including these tags breaks the decoration pipeline and prevents block JS and CSS from loading. If any are found, strip them — the file must contain **only** section-level `<div>` elements, `<hr>` section breaks, and block content. Run: `grep -ciE '<(body|header|main|footer)[> /]' drafts/{blockname}.plain.html` — if the count is > 0, rewrite the file with the tags removed.

**Section / block nesting (MANDATORY):** Confirm the draft does **not** place `div.{blockName}` (the block root) as a **top-level sibling** next to other top-level `<div>`s — that pattern makes `decorateSections` treat the block as the section element and **breaks** `decorateBlocks` (see `decorateSections` / `decorateBlocks` in `scripts/aem.js`). **Preferred fix:** one **outer `<div>`** wrapping the entire fragment so `main` has a single section root and each block ends up `div.section > div > div.{blockName}`. If the draft intentionally uses multiple top-level `<div>`s, verify each `div.{blockName}` is **nested inside** a parent `<div>` (not a direct child of the document root next to parallel sections). When uncertain, require regeneration from `plan.md` with a single outer wrapper.

## Step 2 — Final Summary Report

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

## Pipeline Complete Table

| Phase | Ran | Status | Outputs |
|-------|-----|--------|---------|
| 0 — Design | sequential | ✓ / skipped | design.md or "no Figma source" |
| 1 — Plan | sequential | ✓ | plan.md (with Authored HTML Structure + Tasks for Simple/Standard), drafts/{name}.plain.html, blocks/{name}/ |
| 2 — Tasks | Subagent A / main / inlined | ✓ / inlined in Phase 1 | plan.md (Tasks section filled) |
| 3 — Implement | Subagent A or main agent | ✓ | blocks/{name}/{name}.js, blocks/{name}/{name}.css |
| 4 — Test Cases | Subagent B / sequential / skipped | ✓ / warned / skipped | {FEATURE_DIR}/testcases.csv or "skipped (--no-test-cases)" |
| 5 — Test Content | sequential | ✓ | drafts/{name}.plain.html |

## Warnings Section

List any non-blocking issues accumulated across all phases.

## Recommended Next Steps

- Open test URL in browser: http://localhost:3000/{draft-path}
- Run /speckit-da-upload to upload the block to the DA Library
- Run /speckit-validate for full production validation before PR
- Run /speckit-document to generate the authoring guide
