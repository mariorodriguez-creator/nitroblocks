---
name: athenai-design
description: Phase 0 of athenai-implement pipeline — conditionally produce design.md from Figma. Includes decision logic, extraction-only rules, manual asset handoff, and Phase 1 context pre-loading optimization.
---
# Athenai Design — Phase 0

**Goal**: Produce `design.md` from Figma if available.

## Decision logic (run in order, stop at first match):

1. `FEATURE_DIR/design.md` already exists → **skip**, note "design.md already present" in report.
2. `spec.md` contains a `figma.com` URL → extract `fileKey` and `nodeId`, call `get_design_context` via the Figma MCP server, generate `design.md` following the full 'speckit-figma-specify' skill workflow (HTML scaffold, CSS skeleton in mobile-first order, Layout matrix, Design Token Mapping, Dynamic Content Elements, Interactive States, Visual Acceptance Checklist).
3. No Figma URL found and no `design.md` → **skip silently**, note "no Figma source — proceeding without design.md" in report. Do NOT block or ask.

## Pre-load Phase 1 context during Phase 0 (MANDATORY when Phase 0 runs)

Phase 1 requires `constitution.md`, `styles.css`, and the `setup-plan.sh --json` template — none of which depend on `design.md`. When Phase 0 is executing Figma MCP calls, **launch these reads in parallel** with the Figma calls so the data is already in memory when Phase 1 starts:

- Read `.specify/memory/constitution.md`
- Read `styles/styles.css`
- Run `.specify/scripts/bash/setup-plan.sh --json`

This eliminates the context-loading portion of Phase 1's startup time.

## Figma extraction rules (when running):

- Mobile-first CSS file order: base (no `@media`) → `@media (width >= 600px)` → `@media (width >= 900px)` → optional `1200px`.
- Layout matrix is mandatory — one row per flex/grid container per breakpoint.
- Dynamic content elements: no fixed `width`/`height` on elements; no `max-width`/`max-height` on their containers unless Figma explicitly has it.
- `design.md` is source of truth for all HTML/CSS/design content. `spec.md` remains source of truth for functional requirements.
- Preserve asset references even when binaries are not yet downloaded. If extraction identifies visual assets, write paths that point to `drafts/media/*` and keep those references stable.
- Before adding a new path, check for an existing matching file under `drafts/media/` and reuse the same path naming to avoid broken references across reruns.

## Asset handoff (manual, separate skill)

Asset downloading is not executed in this skill.

When asset binaries are needed, run `athenai-assets` manually with layer URLs from extraction output. `athenai-assets` performs `curl` + `sips` processing and optional `get_screenshot` fallback.

- This phase (`athenai-design`) only extracts and records references.
- Missing asset binaries are non-blocking for Phase 0 and Phase 1.
- Referenced `drafts/media/*` files must exist before Phase 3 implement starts.

**⚠ NEVER download or overwrite files that already exist under `drafts/media/`.** Before any download, list `drafts/media/` and check whether a matching file is already present. Existing files were placed there deliberately (often manually cropped or optimized) and are **not recoverable from git** because `drafts/media/` is untracked. Figma MCP asset URLs frequently return a single source image for all breakpoints — downloading them will destroy breakpoint-specific originals. If the user explicitly asks to re-download, warn them that existing files will be overwritten and wait for confirmation.

## Timer

Only if this phase **runs** (Figma path that produces `design.md`): record time on the **main** log.

**Option A — single bucket (default):** `start` `0-design` at the beginning of Phase 0; `end` `0-design` when `design.md` is written.

**Option B — internal breakdown (optional):** use **either** Option A **or** these three segments, **not both** (the timer report sums phase durations; using both would double-count Phase 0):

| Phase key | Brackets |
| --- | --- |
| `0-design-prefetch` | Constitution, `styles.css`, `setup-plan.sh --json`, skill reads, `drafts/media/` listing — work **before** the first Figma MCP call. |
| `0-design-figma` | From immediately before `get_design_context` through after the last Figma response (parallel batch counts as one segment). |
| `0-design-write` | Synthesizing and writing `FEATURE_DIR/design.md`. |

Chain `end`/`start` in **one shell line** between segments to avoid inter-phase dead time (see `athenai-implement/resources/execution-timing.md`).

**Rationale and Figma/split analysis:** `.specify/docs/phase-0-design-performance.md`.

If manual asset processing is executed, it must be timed separately as `0-assets` in the `athenai-assets` skill (add a `phase-timer.py` key if that skill defines one; otherwise note wall time in the Phase 0 report).

If Phase 0 is skipped (existing `design.md`, no Figma, or silent skip), omit `0-design` / `0-design-*` timer calls and continue to `1-plan`.

Print Phase 0 report on completion or skip.
