---
name: speckit-plan
description: Generate an implementation plan for a speckit feature. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-plan".
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
   - From design.md: use **Code Scaffold** (HTML/CSS skeleton), **Design Token Mapping**, **Breakpoints + Per-Breakpoint CSS Overrides**, **Dynamic Content Elements**, **Interactive States**, **Visual Acceptance Checklist**

## Phase 0: Research

1. Extract unknowns from Technical Context (mark as "NEEDS CLARIFICATION")
2. Use the `block-collection-and-party` skill to find similar blocks and reference implementations — existing patterns often resolve unknowns faster than reasoning from scratch
3. Use the `docs-search` skill for platform-specific unknowns (loading phases, auto-blocking, indexing, etc.)
4. For each unknown: research task → consolidate findings in `research.md`
5. Format: Decision, Rationale, Alternatives considered
6. All `NEEDS CLARIFICATION` must be resolved before Phase 1

## Phase 1: Design Artifacts

**Prerequisites**: `research.md` complete

Reference the `building-blocks` skill for EDS decoration patterns, three-phase loading conventions (eager/lazy/delayed), and CSS best practices when producing these artifacts:

1. Generate `data-model.md` — refine the content model from spec.md into detailed authored content examples with block table structure, rows, columns, metadata, and block options (variants)
2. Generate `quickstart.md` — integration scenarios, test scenarios
   - When design.md exists: HTML scaffold from design.md Code Scaffold; CSS skeleton uses `@media (width >= Npx)` with standard breakpoints
   - Do NOT oversimplify variant/breakpoint logic from design.md
   - If design.md has embedded blocks: reference them in the block's decoration logic

## Phase 2: Draft Test Content (CDD Phase 1.3)

**Prerequisites**: `data-model.md` complete (content model is stable)

Generate draft HTML test content based on `data-model.md`. Follow the `content-driven-development` skill, Phase 1.3 for the full process, content creation options, and HTML structure guidance.

## Report

Output: branch, IMPL_PLAN path, generated artifacts (research.md, data-model.md, quickstart.md, draft test content path), and readiness for next phase: `/speckit-tasks` (when plan is complete).

## Key Rules

- Use absolute paths
- ERROR on gate violations or unresolved clarifications
- `design.md` is source of truth for HTML/CSS — quickstart.md and plan.md must not override it
