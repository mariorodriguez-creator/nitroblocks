# Cursor to Claude Code Skills Migration Plan

**Date**: 2026-03-07
**Branch**: `feature/convert-to-skills`
**Status**: Complete

---

## Rationale

The project previously used two Cursor IDE-specific constructs for AEM development guidelines and workflow automation:

- **21 Cursor rules** (`.mdc` files in `.cursor/rules/`) — "always apply" rules injected into every prompt
- **17 Cursor commands** (`.md` files in `.cursor/commands/`) — slash-command workflows invoked manually

These were migrated to **Claude Code skills** (`.claude/skills/<name>/SKILL.md`) because:

1. **No IDE dependency** — Claude Code skills work in the CLI, not tied to Cursor IDE
2. **Trigger descriptions replace "always apply"** — each skill's `description:` field acts as the activation condition, so rules are only loaded when relevant rather than always consuming context
3. **Better consolidation** — related rule domains are merged into single, coherent skills
4. **Unified workflow** — speckit commands become first-class skills with consistent invocation

---

## Skills Inventory

### Group A: From Rules (11 skills)

| Skill Name | Source `.mdc` Files Consolidated | Has REFERENCE.md |
|---|---|---|
| `aem-htl-component` | `frontend/aem-htl-rules.mdc` + `backend/aem-component-structure.mdc` | Yes |
| `aem-java-backend` | `backend/aem-java-backend-rules.mdc` + `backend/aem-sling-models.mdc` | Yes |
| `aem-frontend-js` | `frontend/aem-javascript-rules.mdc` + `frontend/aem-clientlibs.mdc` | Yes |
| `aem-styles` | `frontend/aem-styles-rules.mdc` + `frontend/dxn-theming-variables.mdc` | No |
| `aem-dialog` | `frontend/aem-dialog-rules.mdc` + `frontend/aem-policies.mdc` | Yes |
| `aem-wcag` | `frontend/aem_wcag_rules.mdc` | No |
| `aem-analytics` | `frontend/aem-analytics-data-layer.mdc` | No |
| `aem-testing` | `backend/aem-unit-testing-rules.mdc` | No |
| `aem-content-sync` | `devops/aem-ftp-master.mdc` + `devops/aem-content-manager.mdc` | No |
| `aem-documentation` | `docs/aem-documentation-rules.mdc` | No |
| `aem-naming` | `common/label-naming-conventions.mdc` + `frontend/design-compliance.mdc` | No |

### Group B: From Commands (15 new skills)

| Skill Name | Source Command File |
|---|---|
| `speckit-specify` | `speckit.specify.md` |
| `speckit-plan` | `speckit.plan.md` |
| `speckit-tasks` | `speckit.tasks.md` |
| `speckit-implement` | `speckit.implement.md` |
| `speckit-validate` | `speckit.validate-generated.md` |
| `speckit-fix` | `speckit.fix-generated.md` |
| `speckit-checklist` | `speckit.checklist.md` |
| `speckit-clarify` | `speckit.clarify.md` |
| `speckit-analyze` | `speckit.analyze.md` |
| `speckit-design-compliance` | `speckit.design-compliance.md` |
| `speckit-document` | `speckit.document.md` |
| `speckit-testcases` | `speckit.testcases.md` |
| `speckit-constitution` | `speckit.constitution.md` |
| `speckit-figma-specify` | `speckit.figma-specify.md` |
| `aem-deploy-content` | `aem-test-content-deploy.md` |

### Existing Skills (unchanged or updated)

| Skill Name | Action |
|---|---|
| `generate-test-content` | Existing — incorporates `speckit.generate-test-content.md` patterns |
| `figma-screenshot` | Existing — unchanged; `speckit-figma-specify` is a separate, complementary skill |
| `create-component` | Existing — unchanged |

---

## Consolidation Decisions

### `aem-htl-component` (merges 2 rules)
`aem-component-structure.mdc` defined folder structure, `.content.xml` templates, and `sling:resourceSuperType` patterns. `aem-htl-rules.mdc` defined `data-sly-*` directives, XSS contexts, and `data-nc` attribute patterns. Both are always needed together when writing an HTL template — merged into one skill with a REFERENCE.md for boilerplate.

### `aem-java-backend` (merges 2 rules)
`aem-java-backend-rules.mdc` covered OSGi services, `@Component`, Java conventions. `aem-sling-models.mdc` covered `@Model`, `@ValueMapValue`, `@PostConstruct`, `isEmpty()`. Inseparable during implementation — merged with interface/implementation boilerplate in REFERENCE.md.

### `aem-frontend-js` (merges 2 rules)
`aem-javascript-rules.mdc` covered `@netcentric/component-loader` patterns, ES6 class structure, `destroy()`. `aem-clientlibs.mdc` covered `.content.xml`, `js.txt/css.txt`, build commands. Always needed together — merged with REFERENCE.md containing full clientlib XML templates.

### `aem-styles` (merges 2 rules)
`aem-styles-rules.mdc` covered BEM, responsive mixins, `--dxn-` variables. `dxn-theming-variables.mdc` listed the available CSS custom properties. The theming variables are referenced directly in style rules — combined into a single style guide skill.

### `aem-dialog` (merges 2 rules)
`aem-dialog-rules.mdc` was the primary dialog authoring guide (field types, Coral 3, typed parameters). `aem-policies.mdc` covered the 4-step policy workflow. Policies are an extension of dialog configuration — merged into one skill. REFERENCE.md contains full XML skeletons.

### `aem-content-sync` (merges 2 rules)
`aem-ftp-master.mdc` covered VLT/repo checkout commands and environment URLs. `aem-content-manager.mdc` covered Maven FileVault plugin, filter.xml patterns, brand paths. Both are about content synchronization — merged into a single operational skill.

### `aem-naming` (merges 2 rules)
`label-naming-conventions.mdc` covered `{purpose}{Type}` suffix pattern for Java/XML/JS identifiers. `design-compliance.mdc` covered `design-expectations.json` format and `assert-design-compliance.js` usage. Combined as both relate to naming and design compliance checking.

---

## Trigger Descriptions

Each skill triggers automatically when Claude recognizes the context. Key descriptions:

| Skill | Trigger Context |
|---|---|
| `aem-htl-component` | Writing HTL templates, creating AEM component folder structure, using data-sly-*, referencing Sling Models |
| `aem-java-backend` | Writing Java Sling Models, OSGi services, @Model/@PostConstruct annotations |
| `aem-frontend-js` | Writing component JS with @netcentric/component-loader, configuring clientlibs |
| `aem-styles` | Writing SCSS/CSS for AEM components, using --dxn- CSS variables, BEM naming |
| `aem-dialog` | Creating/editing _cq_dialog/.content.xml, adding Coral UI fields, configuring policies |
| `aem-wcag` | Implementing ARIA, keyboard navigation, focus management, live regions |
| `aem-analytics` | Implementing analytics events, Google Analytics/Adobe Data Layer tracking |
| `aem-testing` | Writing JUnit tests for Sling Models, OSGi services, BFF components |
| `aem-content-sync` | Syncing content from remote AEM, creating Maven content packages, filter.xml |
| `aem-documentation` | Creating/updating component README files, authoring guides, API docs |
| `aem-naming` | Naming label/ARIA identifiers in Java/XML/JS, creating design-expectations.json |
| `speckit-*` | User explicitly invokes speckit workflow (create spec, generate tasks, implement feature) |
| `aem-deploy-content` | Deploying test content, importing JSON content to AEM |

---

## Template File Updates

### `.specify/templates/tasks-template.md`
All `(Ref: <path>/*.mdc)` references replaced with `(Skill: <name>)`:

| Old Reference | New Reference |
|---|---|
| `(Ref: frontend/aem-dialog-rules.mdc)` | `(Skill: aem-dialog)` |
| `(Ref: frontend/aem-policies.mdc)` | `(Skill: aem-dialog)` |
| `(Ref: backend/aem-sling-models.mdc)` | `(Skill: aem-java-backend)` |
| `(Ref: backend/aem-java-backend-rules.mdc)` | `(Skill: aem-java-backend)` |
| `(Ref: backend/aem-component-structure.mdc)` | `(Skill: aem-htl-component)` |
| `(Ref: frontend/aem-htl-rules.mdc)` | `(Skill: aem-htl-component)` |
| `(Ref: frontend/aem-htl-rules.mdc, frontend/aem_wcag_rules.mdc)` | `(Skill: aem-htl-component, aem-wcag)` |
| `(Ref: frontend/aem_wcag_rules.mdc)` | `(Skill: aem-wcag)` |
| `(Ref: frontend/aem-javascript-rules.mdc, frontend/aem-analytics-data-layer.mdc)` | `(Skill: aem-frontend-js, aem-analytics)` |
| `(Ref: frontend/aem-styles-rules.mdc, frontend/dxn-theming-variables.mdc)` | `(Skill: aem-styles)` |
| `(Ref: frontend/aem-clientlibs.mdc)` | `(Skill: aem-frontend-js)` |
| `(Ref: backend/aem-unit-testing-rules.mdc)` | `(Skill: aem-testing)` |
| `(Ref: fe/testing.instructions.md)` | `(Skill: aem-testing)` |
| `(Ref: docs/aem-documentation-rules.mdc)` | `(Skill: aem-documentation)` |
| `**Required Rule File**: ...` headers | `**Required Skill**: ...` |
| `**Required Rule Files**: ...` sections | `**Required Skills**: ...` |

### `.specify/templates/plan-template.md`
- Constitution Check Principle II: updated from "Cursor rule files in .cursor/rules/" to "Claude Code skills in .claude/skills/"
- Inline command references updated from `/speckit.plan command` to `speckit-plan skill`
- Clientlib comment: `per aem-clientlibs.mdc` → `per aem-frontend-js skill`
- Testing comment: `See fe.testing.instructions.md` → `See aem-testing skill`

---

## Deleted Files (37 total)

### Cursor Rules (20 files)
```
.cursor/rules/frontend/aem-htl-rules.mdc
.cursor/rules/frontend/aem-styles-rules.mdc
.cursor/rules/frontend/dxn-theming-variables.mdc
.cursor/rules/frontend/aem-javascript-rules.mdc
.cursor/rules/frontend/aem-clientlibs.mdc
.cursor/rules/frontend/aem_wcag_rules.mdc
.cursor/rules/frontend/aem-analytics-data-layer.mdc
.cursor/rules/frontend/aem-dialog-rules.mdc
.cursor/rules/frontend/aem-policies.mdc
.cursor/rules/frontend/design-compliance.mdc
.cursor/rules/backend/aem-component-structure.mdc
.cursor/rules/backend/aem-java-backend-rules.mdc
.cursor/rules/backend/aem-sling-models.mdc
.cursor/rules/backend/aem-unit-testing-rules.mdc
.cursor/rules/devops/aem-ftp-master.mdc
.cursor/rules/devops/aem-content-manager.mdc
.cursor/rules/devops/aem-activation-rules.mdc
.cursor/rules/docs/aem-documentation-rules.mdc
.cursor/rules/common/label-naming-conventions.mdc
.cursor/rules/qa/aem-playwright-code-gen.mdc
```

> Note: `aem-activation-rules.mdc` and `aem-playwright-code-gen.mdc` were present in the repo but not in the original migration plan. Both are Cursor-specific rule files; deleted as part of full cleanup.

### Cursor Commands (17 files)
```
.cursor/commands/speckit.specify.md
.cursor/commands/speckit.plan.md
.cursor/commands/speckit.tasks.md
.cursor/commands/speckit.implement.md
.cursor/commands/speckit.validate-generated.md
.cursor/commands/speckit.fix-generated.md
.cursor/commands/speckit.checklist.md
.cursor/commands/speckit.clarify.md
.cursor/commands/speckit.analyze.md
.cursor/commands/speckit.design-compliance.md
.cursor/commands/speckit.document.md
.cursor/commands/speckit.testcases.md
.cursor/commands/speckit.constitution.md
.cursor/commands/speckit.figma-specify.md
.cursor/commands/speckit.generate-test-content.md
.cursor/commands/aem-test-content-deploy.md
.cursor/commands/README.md
```

---

## Verification Checklist

- [x] All 26 skill directories exist under `.claude/skills/`
- [x] 4 REFERENCE.md companion files created (aem-htl-component, aem-java-backend, aem-frontend-js, aem-dialog)
- [x] No `(Ref: *.mdc)` references remain in `tasks-template.md`
- [x] No `.cursor/rules/` path references remain in `plan-template.md`
- [x] All 20 `.mdc` files deleted
- [x] All 17 cursor command `.md` files deleted
- [x] Every rule from every deleted `.mdc` file is captured in at least one skill

---

## Skills Directory Structure

```
.claude/skills/
├── aem-analytics/SKILL.md
├── aem-content-sync/SKILL.md
├── aem-deploy-content/SKILL.md
├── aem-dialog/
│   ├── SKILL.md
│   └── REFERENCE.md
├── aem-documentation/SKILL.md
├── aem-frontend-js/
│   ├── SKILL.md
│   └── REFERENCE.md
├── aem-htl-component/
│   ├── SKILL.md
│   └── REFERENCE.md
├── aem-java-backend/
│   ├── SKILL.md
│   └── REFERENCE.md
├── aem-naming/SKILL.md
├── aem-styles/SKILL.md
├── aem-testing/SKILL.md
├── aem-wcag/SKILL.md
├── create-component/SKILL.md          (pre-existing)
├── figma-screenshot/SKILL.md          (pre-existing)
├── frontend-design/SKILL.md           (pre-existing)
├── generate-test-content/SKILL.md     (pre-existing, updated)
├── speckit-analyze/SKILL.md
├── speckit-checklist/SKILL.md
├── speckit-clarify/SKILL.md
├── speckit-constitution/SKILL.md
├── speckit-design-compliance/SKILL.md
├── speckit-document/SKILL.md
├── speckit-figma-specify/SKILL.md
├── speckit-fix/SKILL.md
├── speckit-implement/SKILL.md
├── speckit-plan/SKILL.md
├── speckit-specify/SKILL.md
├── speckit-tasks/SKILL.md
├── speckit-testcases/SKILL.md
└── speckit-validate/SKILL.md
```
