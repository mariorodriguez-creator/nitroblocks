---
name: pr-review
description: Strict pull request code review for aem-code (and related AEM repos). Trigger when reviewing a PR from GitHub workflows, when the user asks for a PR review, or when performing regression-safe code review.
---

# PR / Code Review (Strict, regression-safe)

Use this skill when reviewing pull requests—especially when invoked from **GitHub** (e.g. GitHub Actions or Claude PR review). Apply **strict** criteria to avoid regressions and enforce repo conventions.

## Context

- **Primary context**: [AGENTS.md](/AGENTS.md) at repo root — repository layout, build, components, checklists, key paths.
- **This repo**: `aem-code` (DigitalXn AEM Base). In **multi-repo** setups, apply this skill only when the PR targets this repo or when explicitly asked to use aem-code standards.
- **Claude**: Instructions are for Claude; no tool-specific (e.g. Cursor) assumptions.

## Strict Review Principles

1. **Block on regressions** — Any change that can break existing behavior, build, or deployment must be called out and must block approval until fixed.
2. **Checklist compliance** — For new components or policy changes, every step in AGENTS.md “Adding a New Component” (and policy/filter/template steps) must be present and correct.
3. **Conventions over preference** — Enforce project conventions (`.cursor/rules/`, AGENTS.md, and referenced skills); do not suggest stylistic changes that contradict them.
4. **Concrete feedback** — Cite file paths, line ranges, rule/skill IDs, and AGENTS.md sections. Prefer exact fix suggestions (snippets) over vague comments.

## What to Verify (by change type)

### New or modified AEM components

- [ ] Component folder under `digitalxn-aem-base-apps/.../components/dxn-{name}/v1/dxn-{name}/` with `.content.xml`, HTL, `_cq_dialog`, `_cq_template` if needed.
- [ ] Sling Model interface in `digitalxn-aem-base-core/.../models/` and implementation under `internal/models/v1/{name}/`.
- [ ] Clientlibs under `digitalxn-aem-base-clientlibs-apps/` (JS/SCSS/config) and clientlib category `digitalxn.components.dxn-{name}` in HTL.
- [ ] Policy defined in `digitalxn-aem-templates-apps/.../policies/.content.xml`, merge entry in `digitalxn-aem-templates-content/.../policies/.content.xml`, **and** three filter includes in `digitalxn-aem-templates-content/.../filter.xml`.
- [ ] Template policy mapping in `contentpage-template/policies/.content.xml` (or other templates as required).
- [ ] HTL/dialog: apply `aem-htl-component` and `aem-dialog` skills; no WCM mode in HTL; `data-nc` / `data-nc-params` correct; no `@ context=` inside JSON params.

### Java / backend

- [ ] Public APIs in `models/`, `services/`, `caconfigs/`; implementations in `internal/`.
- [ ] Resource type and adapter annotations match component path; `@PostConstruct` and injection used per AGENTS.md and `aem-java-backend` skill.
- [ ] New or touched code has or updates unit tests where applicable; no regressions in existing tests.

### Frontend (clientlibs, HTL, dialogs)

- [ ] BEM, clientlib categories, and no double-minify (processors: none). Style system: modifier on wrapper, descendant selectors in SCSS.
- [ ] ESLint/Stylelint and project JS/SCSS rules respected; no banned patterns (e.g. duplicate logic per aem-clientlibs rules).
- [ ] WCAG and analytics per `aem-wcag` and `aem-analytics` when the component is user-facing or tracking.

### Policies, filters, templates

- [ ] Any new or changed policy path is included in `filter.xml` with the correct three-level include pattern.
- [ ] Policy assignment in template policies matches the policy path and component.

## Regression checks

- [ ] No removal or weakening of tests without justification.
- [ ] No breaking changes to public Java APIs, Sling Model adapters, or resource types without a clear migration path.
- [ ] No removal of policy/filter/template wiring for existing components.
- [ ] Build: Maven module order and frontend build (clientlib output) remain valid per AGENTS.md.

## Output format for review comments

- **BLOCKING**: [Rule/section reference] — Short reason. Suggestion: &lt;concrete fix or snippet&gt;.
- **REQUIRED**: Same format for must-fix items that are not necessarily regressions.
- **SUGGESTION**: Optional improvements with rule/section reference.

End the review with a clear **Approve / Request changes** and a one-line summary of blocking/required items.
