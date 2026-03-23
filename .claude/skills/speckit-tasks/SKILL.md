---
name: speckit-tasks
description: Generate a tasks.md for a speckit feature. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-tasks".
disable-model-invocation: true
---

# Speckit Tasks Workflow

Generates an actionable, dependency-ordered `tasks.md` from the feature's plan and spec artifacts.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json` from repo root. Parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

## Load Documents

- **Required**: `plan.md` (tech stack, architecture), `spec.md` (user stories, requirements, content model) and draft test content
- **Optional**: `data-model.md`, `research.md`, `quickstart.md`
- Use `.specify/templates/tasks-template.md` as structure template

## Complexity Classification

**Simple (2-4 tasks)**: CSS-only tweaks, minor JS fixes to an existing block, single-file changes.

**Standard (5-8 tasks)**: New block (JS + CSS), auto-blocking changes, block with multiple variants.

**Complex (9-15 tasks)**: Multiple new blocks, core script changes combined with new blocks, third-party integrations via delayed.js, cross-block interactions.

State complexity in tasks.md header.

## Task Format (REQUIRED)

```
- [ ] [Category-ID] [P] Description with file path
```

| Category | Prefix | Typical files |
|----------|--------|---------------|
| Block JS | `BJ` | `blocks/{name}/{name}.js` |
| Block CSS | `BC` | `blocks/{name}/{name}.css` |
| Core Scripts | `CS` | `scripts/scripts.js`, `scripts/delayed.js` |
| Global Styles | `GS` | `styles/styles.css`, `styles/lazy-styles.css` |
| Content | `CT` | `drafts/` test content, `head.html`, icons |
| Integration | `IN` | Third-party scripts, auto-blocking, indexing |
| Testing | `TS` | Linting, browser tests, PSI validation |
| Documentation | `DC` | Block README, authoring guides |
| Setup | `T` | Project structure, configuration |
| Scaffolding | `SC` | New block directory creation |

Include `[P]` only when task operates on different files than all incomplete tasks.

## Task Collapsing Rules

| Collapse | To | Exception |
|----------|-----|-----------|
| SC001+BJ001+BC001 | "Create block with JS and CSS" | Keep separate if block has complex decoration AND complex styling |
| BJ001+BC001 | "Implement block decoration and styles" | Keep separate when design.md exists (CSS from design, JS from content model) |

**Never skip**: SC001 (new block), BJ001 (block JS for any block with decoration logic), TS001+TS002 (always — linting gates). TS006 when logic-heavy code is present per Logic-Heavy Block Detection.

## SC001: Block Scaffolding

Create the block directory and files:
```
blocks/{blockname}/
  ├── {blockname}.js    # exports default function decorate(block)
  └── {blockname}.css   # scoped to .{blockname}
```

Use the `building-blocks` skill for the decorate function pattern and CSS conventions.

## Phase Structure

- **Phase 1: Setup** — block directory, test content verification (CDD Phase 2 gate)
- **Phase 2: Foundation** — core script changes, auto-blocking, shared utilities (blocking prereqs)
- **Phase 3.X: User Stories** — one sub-phase per user story from spec
- **Final Phase: QA & Polish** — TS001 (ESLint), TS002 (Stylelint), accessibility checks, documentation

## Design.md Source of Truth

When `design.md` exists:
- BJ001 (Block JS): HTML structure from design.md Code Scaffold — decoration must produce this structure
- BC001 (Block CSS): Implement per design.md CSS Skeleton — vanilla CSS, all breakpoints, all variants, block-scoped selectors; **physical order** must be mobile-first (base → `@media (width >= 600px)` → `900px` → optional `1200px`). Match **`## Layout matrix (flex / grid)`** for `flex-direction` / `gap` per breakpoint; repeat desktop overrides when they differ from tablet.
- Use design.md Design Token Mapping to reference project CSS custom properties from `styles/styles.css`

## Test Tasks

- TS001 (ESLint) + TS002 (Stylelint): **Always** generate — `npm run lint` must pass before PR
- TS003 (browser test): Generate when block has interactive behavior — use Playwright/Puppeteer for ad-hoc validation
- TS004 (PSI check): Generate for any change that could affect performance — verify Lighthouse 100 on preview URL
- TS005 (accessibility): Generate when block has interactive elements — keyboard navigation, ARIA, screen reader
- TS006 (unit tests): Generate when block JS includes **logic-heavy helpers** (parse, transform, validate, compute). Indicators: label-based row parsing, config extraction, variant parsing from block name, teaser grouping. Create keeper tests at `blocks/{blockname}/{blockname}.test.js` for isolatable functions. Follow **testing-blocks** and **block-unit-testing** resources. Skip for decorative/wiring-only blocks.

## Logic-Heavy Block Detection (for TS006)

Add TS006 when the block's BJ001 description or data-model/research indicate:

- Label-based row/table parsing (e.g. "parse block table rows by label")
- Config extraction from DOM (e.g. readBlockConfig-style logic)
- Variant/option parsing from block name (e.g. "(reversed, dark)" → modifier classes)
- Teaser/item grouping or aggregation from flat rows
- Any explicit parse, transform, validate, or compute logic

Do NOT add TS006 for: pure DOM reshaping (rows → list), simple class toggling, wiring-only decorate().

## Report

Output: tasks.md path, task count, parallel opportunities, format validation confirmation, and readiness for next phase: `/speckit-implement` (default when tasks are complete), or optionally `/speckit-analyze` (to inspect task structure before implementation).
