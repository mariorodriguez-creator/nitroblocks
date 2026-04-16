---
name: athenai-build
description: Phase 3 of athenai-implement pipeline — execute tasks from plan.md and produce working block code. Includes lint-aware CSS generation and mandatory design compliance check when design.md exists.
---
# Athenai Build — Phase 3

**Goal**: Execute tasks from `plan.md`'s `## Tasks` section and produce working block code.

## Load Context

- **Required**: `plan.md` (contains Tasks section, Authored HTML Structure, Parsing Logic), draft test content
- **If exists**: `design.md` (source of truth for BJ001/BC001/layout/variants/breakpoints)

### Orchestration / Cursor

- Phase 3 runs either in the **main agent** (e.g. `--no-parallel`) or via Cursor **`eds-frontend-implementer`** (`.cursor/agents/eds-frontend-implementer.md`) when `athenai-implement` delegates Subagent A — **behavior and outputs are the same**.
- **Before writing block JS/CSS**, read **`building-blocks`** in addition to this skill (`athenai-build` first, then `building-blocks`) for `decorate()` patterns, block-scoped CSS, and EDS conventions.
- The Cursor subagent may ask clarifying questions before coding (`model: fast`); the parent orchestrator should pass full `FEATURE_DIR`, `RUN_ID`, `spec.md`, `plan.md`, and `design.md` per `athenai-implement`.

## Prerequisites (before any implementation work)

1. **Await background Figma asset job** — If Phase 0 started a background asset download, **wait until it finishes** (poll job output or verify expected files exist under `drafts/media/`). Do not write block CSS `url()` references to missing files. If the job failed, attempt recovery (`curl` retry or `get_screenshot` via Figma MCP on the **implementing agent**, or hand off to the main agent if subagents lack MCP — see `.specify/docs/phase-0-background-agent-mcp-notes.md`) and warn in the report.
2. Proceed with **Execution Rules** below.

## Execution Rules

1. Execute phase by phase — complete each phase before starting the next
2. Respect dependencies: sequential tasks in order; parallel tasks `[P]` together
3. Mark completed tasks `[X]` in `plan.md`'s `## Tasks` section
4. Halt on non-parallel task failure; report failures before proceeding
5. SC001 (block directory creation) was already completed in Phase 1 — mark it `[X]` and proceed directly to writing JS/CSS files

## CSS Rules (when design.md exists)

- Block CSS MUST follow mobile-first file order: base (no `@media`) → `@media (width >= 600px)` → `@media (width >= 900px)` → optional `1200px`
- Match `## Layout matrix (flex / grid)` for `flex-direction`/`gap` per breakpoint
- If desktop differs from tablet, repeat properties in the `900px` block (do not rely on cascade inheritance)

## Lint-Aware CSS Generation (MANDATORY)

Generate lint-clean CSS on the first attempt to avoid costly fix-retry cycles (block-scoped lint is faster than the full repo; agent reasoning between attempts still adds time). Follow these Stylelint rules when writing CSS:

- **Modern color syntax**: Use `rgb(255 255 255 / 40%)` not `rgba(255, 255, 255, 0.4)`. Stylelint enforces `color-function-alias-notation: "without-alpha"` — all `rgba()` calls must be written as `rgb()` with the `/` alpha syntax.
- **No deprecated properties**: Use `clip-path: inset(50%)` not `clip: rect(0 0 0 0)` for visually-hidden / sr-only patterns. The `clip` property is deprecated.
- **No vendor prefixes**: Stylelint standard config rejects `-webkit-`, `-moz-`, etc. Use unprefixed properties only.
- **No `!important`**: Prohibited by the constitution (Principle I).
- **Modern gradient syntax**: Use space-separated values in gradients: `rgb(2 2 2 / 50%)` not `rgba(2, 2, 2, 0.5)`.

This checklist also applies to the CSS Skeleton in `design.md` — if Phase 0 generates `rgba()` in the skeleton, Phase 3 will inherit lint errors.

## Build Validation (Demo Mode)

**Skip**: `npm test`, unit test creation, `.test.js` files.

**Pre-condition**: The dev server is already running on `http://localhost:3000` (verified at pipeline start). Do **NOT** start, stop, or restart the server. Do **NOT** bind to any other port.

### Step 1: Health Check

Server must already be running on port 3000:

- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/{draft-path}` must return 200
- If the draft path returns 404, try alternate paths (e.g. `/drafts/{blockname}` vs `/{blockname}`) — the URL depends on how the server was started
- Instruct user to open the test URL in a browser to verify rendered output
- If the page loads but the block never decorates (no `block` class / no `data-block-name`, no block CSS): check the draft `.plain.html` — **`div.{blockName}` must not be a top-level direct child of `main`** (wrap the whole fragment in one outer `<div>`). See `decorateSections` in `scripts/aem.js`.

### Step 2: Parallel Validation

Launch these **in parallel**:

#### Block name for lint (`BLOCK_NAME`)

Resolve the block directory name before lint:

- From `plan.md`: use the segment in paths like `blocks/<name>/` or `blocks/<name>/<name>.js` (e.g. `blocks/countdown/countdown.js` → `BLOCK_NAME=countdown`).
- If ambiguous, prefer the **Project Structure** / **Files to Create** paths in `plan.md`.

All Phase 3 lint commands lint **only** `blocks/${BLOCK_NAME}/` (not `styles/`, `scripts/`, or other blocks).

#### a. Lint (required — halt on failure)

Run ESLint and Stylelint on the block folder (sequential in one shell so either failure exits non-zero):

```bash
npx eslint "blocks/${BLOCK_NAME}/" && npx stylelint "blocks/${BLOCK_NAME}/**/*.css"
```

If lint fails, print specific errors and halt. Do NOT proceed to Phase 4 (Subagent B result) until lint passes. Retry once with auto-fix on the same paths:

```bash
npx eslint "blocks/${BLOCK_NAME}/" --fix && npx stylelint "blocks/${BLOCK_NAME}/**/*.css" --fix
```

If lint still fails after retry, run `python3 .specify/scripts/phase-timer.py finalize "$RUN_ID"` and `python3 .specify/scripts/phase-timer.py report "$RUN_ID"`, and include the report in the failure output.

**Note**: Full-repo `npm run lint` is still the project gate before merge; use it when changing global files or before a PR. For Phase 3, block-scoped lint is sufficient when only `blocks/${BLOCK_NAME}/` changed.

<!-- #### b. Design Compliance Check (MANDATORY when design.md exists)

**When to run**: Only when `design.md` exists in `FEATURE_DIR`. This check is **non-blocking** — failures are reported but do not halt the pipeline.

**Goal**: Verify that block CSS matches design.md specifications for typography, spacing, layout, and colors.

**Step 1 — Generate design-expectations.json**

Write to `FEATURE_DIR/design-expectations.json`. Extract selectors and values from `design.md`:

- **Per-Breakpoint CSS Overrides** section
- **`## Layout matrix (flex / grid)`** section
- **Visual Acceptance Checklist** section

**Include**:
- Typography: `font-size`, `line-height`, `font-weight`, `letter-spacing`
- Dimensions: `padding`, `margin`, `gap`, `width`, `height` for **fixed** design elements
- Layout (when design.md documents them): `flex-direction`, `flex-wrap`, `justify-content`, `align-items` — especially values called out in the **Layout matrix** for mobile vs tablet vs desktop
- Colors: `color`, `background-color`, `border-color`
- Borders: `border-width`, `border-style`, `border-radius`
- Shadows: `box-shadow`, `text-shadow`

**Skip**:
- Embedded/child blocks (they have their own tests)
- Dynamic Content Elements unless spec.md explicitly states a fixed size

**Property format**:
```json
"font-size": { "value": "32px", "acceptVar": true }
"gap": { "value": "40px", "tolerancePx": 0, "acceptVar": true }
```
- `acceptVar: true` — allows `var(--token, 24px)` to satisfy `"24px"`
- `tolerancePx` — pixel tolerance for dimension comparisons (default 0)

**cssPath**: `blocks/{block-name}/{block-name}.css`

**Selectors**: Use exact selectors from design.md (e.g. `main .countdown .countdown-header`). EDS block CSS is scoped to `main .{blockName}`.

**media**: `null` for base/mobile; `"600px"`, `"900px"`, `"1200px"` per EDS breakpoints.

**Example**:
```json
{
  "component": "countdown",
  "cssPath": "blocks/countdown/countdown.css",
  "expectations": [
    {
      "id": "pretitle-font-mobile",
      "selector": "main .countdown .countdown-pretitle",
      "media": null,
      "properties": {
        "font-size": { "value": "16px", "acceptVar": true },
        "line-height": { "value": "20px", "acceptVar": true }
      }
    },
    {
      "id": "header-gap-desktop",
      "selector": "main .countdown .countdown-header",
      "media": "900px",
      "properties": {
        "gap": { "value": "40px", "acceptVar": true }
      }
    }
  ]
}
```

**Step 2 — Run compliance check**

```bash
node .specify/scripts/bash/assert-design-compliance.js
```

**Step 3 — Report results**

- **PASS**: All expectations met — note in report
- **FAIL**: List failures; auto-fix CSS if possible; does not halt pipeline -->

## Timer

`start`/`end` `3-implement` on the same log as Phase 2. When Phase 3 completes, **chain** the transition to the next phase: `end 3-implement && start 4-testcases` (if Phase 4 runs) or `end 3-implement && start 5-testcontent` (if Phase 4 is skipped) in a single shell call.

Print Phase 3 report after starting the next timer.
