---
name: speckit-tasks
description: Generate a tasks.md for a speckit feature. Trigger when user invokes the speckit tasks workflow, asks to generate tasks from a plan, or needs task breakdown for implementation.
disable-model-invocation: true
---

# Speckit Tasks Workflow

Generates an actionable, dependency-ordered `tasks.md` from the feature's plan and spec artifacts.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json` from repo root. Parse `FEATURE_DIR` and `AVAILABLE_DOCS`.

## Load Documents

- **Required**: `plan.md` (tech stack, architecture), `spec.md` (user stories, requirements)
- **Optional**: `data-model.md`, `research.md`, `quickstart.md`
- Use `.specify/templates/tasks-template.md` as structure template

## Complexity Classification

**Simple (4-6 tasks)**: Changes to 1-2 files, no new Java classes, no external integrations, minimal JS/CSS.

**Standard (8-12 tasks)**: 3-6 files, new/modified Sling Models, client library changes, complex dialogs.

**Complex (15-20 tasks)**: Multiple modules, new OSGi service, external API, state management, new data contracts.

State complexity in tasks.md header.

## Task Format (REQUIRED)

```
- [ ] [Category-ID] [P] Description with file path
```

| Category | Prefix |
|----------|--------|
| Backend: Models | `BM` |
| Backend: Dialog | `BD` |
| Backend: HTL | `BH` |
| Frontend: JS | `FJ` |
| Frontend: CSS | `FC` |
| Integration | `IN` |
| Testing | `TS` |
| Documentation | `DC` |
| Content | `CT` |
| Setup | `T` |
| Scaffolding | `SC` |

Include `[P]` only when task operates on different files than all incomplete tasks.

## Task Collapsing Rules

| Collapse | To | Exception |
|----------|-----|-----------|
| BD001+BD003+FC002+FC003 | SC001 (invoke `create-component` skill) | Always for new components |
| BM001+BM002 | "Create Sling Model interface and implementation" | — |
| FC001+FC002+FC003 | "Create clientlib with styles" | **fe-build**: Keep FC002 separate |

**Never skip**: SC001 (new component), BM001+BM002 (unless pure static), BH001 (always), TS005+TS006 (always).

**DigitalXn fe-build rule**: When plan.md mentions `@netcentric/fe-build`, keep FC002 as separate task (runs before TS006).

## SC001: create-component Invocation

When the component has **embedded child components** (from spec, _cq_template, or plan — e.g. button, accordion items, tabs, carousel slides):

- Add `--is-container` to the create-component invocation.
- Example: `dxn-countdown --title "Countdown" --with-js --is-container` when the component embeds a button child.

## Phase Structure

- **Phase 1: Setup** — project structure, shared config
- **Phase 2: Foundation** — shared models/services (blocking prereqs)
  - SC001 is always the first Foundation task when creating a new component
- **Phase 3.X: User Stories** — one sub-phase per user story
- **Final Phase: QA & Polish** — TS005 (Spotbugs), TS006 (lint), accessibility, documentation

## Design.md Source of Truth

When `design.md` exists:
- BH001 (HTL): HTML structure from design.md HTML scaffold
- FC001 (SCSS): Implement exactly per design.md SCSS skeleton — all breakpoints, all variants
- `_cq_template`: Include `cq:styleIds` per design.md Embedded Components

## Test Tasks

- TS001-TS004 (unit tests): Generate ONLY when explicitly requested in spec or arguments
- TS007 (Jest): Generate when component has isolated, testable JS logic AND tests requested
- TS005 + TS006: **Always** generate (code quality gates)

## Report

Output: tasks.md path, task count, parallel opportunities, format validation confirmation, and readiness for next phase: `/speckit-implement` (default when tasks are complete), or optionally `/speckit-analyze` (to inspect task structure before implementation).
