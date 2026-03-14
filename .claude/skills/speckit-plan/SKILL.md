---
name: speckit-plan
description: Generate an implementation plan for a speckit feature. Trigger when user invokes the speckit plan workflow, asks to create an implementation plan from a spec, or needs research, data-model, and quickstart artifacts.
disable-model-invocation: true
---

# Speckit Plan Workflow

Generates implementation plan artifacts from an existing spec: research.md, data-model.md, quickstart.md.

## Setup

Run: `.specify/scripts/bash/setup-plan.sh --json` from repo root. Parse JSON for `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`, `BRANCH`.

## Load Context

1. Read `FEATURE_SPEC` (spec.md) and `.specify/memory/constitution.md`
2. Load `IMPL_PLAN` template (already copied)
3. **Silently check for `design.md`**: If `FEATURE_DIR/design.md` exists, read it — it is the **source of truth for all HTML/CSS/design content**. `spec.md` is source of truth for functional requirements.
   - From design.md: use **Code Scaffold** (HTML/SCSS skeleton), **Design Token Mapping**, **Breakpoints + Per-Breakpoint CSS Overrides**, **Dynamic Content Elements**, **Interactive States**, **Visual Acceptance Checklist**

## Phase 0: Research

1. Extract unknowns from Technical Context (mark as "NEEDS CLARIFICATION")
2. For each unknown: research task → consolidate findings in `research.md`
3. Format: Decision, Rationale, Alternatives considered
4. All `NEEDS CLARIFICATION` must be resolved before Phase 1

## Phase 1: Design Artifacts

**Prerequisites**: `research.md` complete

1. Generate `data-model.md` — entities, fields, relationships, validation rules, state transitions
2. Generate `quickstart.md` — integration scenarios, test scenarios
   - When design.md exists: HTML scaffold from design.md Code Scaffold; SCSS skeleton uses project mixins (`@include tablet-up`, `@include desktop-up`)
   - Do NOT oversimplify variant/breakpoint logic from design.md
   - If design.md has parsys with embedded components: include `cq:styleIds` on default child nodes per design.md Embedded Components section

## Report

Output: branch, IMPL_PLAN path, generated artifacts (research.md, data-model.md, quickstart.md), and readiness for next phase: `/speckit-tasks` (when plan is complete).

## Key Rules

- Use absolute paths
- ERROR on gate violations or unresolved clarifications
- `design.md` is source of truth for HTML/CSS — quickstart.md and plan.md must not override it
