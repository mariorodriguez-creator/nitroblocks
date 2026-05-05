# Specification-Driven Development (SDD) workflow

This directory implements a Specification-Driven Development lifecycle based on [GitHub’s Spec Kit](https://github.com/github/spec-kit), customized for **AEM Edge Delivery Services (EDS)** in this repo: **vanilla** block code under `blocks/`, GitHub-backed previews (`*.aem.page` / `*.aem.live`), and content-first delivery per `AGENTS.md`.

## Overview

SDD keeps features documented, planned, and validated before and during implementation, reducing rework. Commands are exposed as **speckit-** skills (see `.claude/skills/speckit-*/SKILL.md`). Invocation in your agent product may appear as `/speckit-*` or similar — use the exact form your environment documents.

## Customizations from upstream Spec Kit

1. Spec folders live under **`.specify/specs/`**, not at the repository root.
2. A feature typically maps to **one** main user story in `spec.md` (not a large optional backlog in one shot).

## `design.md` source of truth

When `design.md` exists (from **speckit-figma-specify** / Figma specify flow), it is the **source of truth for HTML structure, block-scoped CSS, variants, breakpoints, and visual acceptance** as captured there. `plan.md`, `quickstart.md`, and `tasks.md` must **not** override or water down `design.md`. Implementation uses **CSS** in `blocks/{name}/{no}.css` (no Sass/postprocessors unless the whole team agrees — see `AGENTS.md`).

## How to use

Open an agent chat on a feature branch and run the phases in order.

### Requirements & design

1. **speckit-specify** — Create `spec.md`, branch, and feature directory under `.specify/specs/<ticket>-<short-name>/`.
2. *(Optional)* **speckit-figma-specify** — If the feature has Figma, extract visual/HTML/CSS context into `design.md`. Run **after** specify. Prefer **before** clarify so clarify can read `design.md` as context.
3. **speckit-clarify** — Refine the spec; reads `design.md` when present (read-only).

### Development

4. **speckit-plan** — Implementation plan and artifacts (`plan.md`, `research.md`, `data-model.md`, `quickstart.md`, etc.).
5. **speckit-tasks** — Break down into `tasks.md`.
6. *(Optional)* **speckit-analyze** — Read-only cross-check of spec/plan/tasks.
7. **speckit-implement** — Code changes; follows CDD/implement portion (e.g. unit tests, lint, block verification per skill).
8. **speckit-validate** — Verification-only: content testing, lint/test gates, PR readiness (no file edits).
9. *(If `design.md` exists)* **speckit-design-compliance** — Design expectations + CSS compliance check.

### QA / authoring (optional)

10. **speckit-testcases** — Generate `FEATURE_DIR/testcases.csv` (author-facing, EDS preview/publish steps).
11. *(Optional)* **speckit-testcontent** — Upload block test HTML to the **Document Authoring (DA) Library** from `drafts/*.plain.html` (MCP); see `.claude/skills/speckit-testcontent/SKILL.md`. Local validation can also use **`drafts/`** and branch preview URLs without DA.
12. *(Optional)* **speckit-document** — Author-facing block guide (prefer `blocks/{name}/README.md`); see `.claude/skills/speckit-document/SKILL.md`.

### Other

- **speckit-checklist** — Optional **requirements-quality** checklists under `FEATURE_DIR/checklists/` (not implementation test steps).

## References

- **Project rules:** `AGENTS.md`
- **EDS constitution / principles:** `.specify/memory/constitution.md`
- **Command order & artifacts:** `.specify/docs/speckit-workflow-diagram.md`
