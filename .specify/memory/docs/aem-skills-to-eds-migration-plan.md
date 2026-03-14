# AEM Skills to Edge Delivery Services Migration Plan

**Date**: 2026-03-13  
**Status**: Implemented (2026-03-13)  
**Scope**: All skills under `.claude/skills/` matching `aem-*` (12 skills). **Out of scope**: aem-content-sync (do not include).

---

## 1. Purpose and context

This project (**nitroblocks**) is an **AEM Edge Delivery Services (EDS)** site: content is delivered as semantic HTML from the EDS backend; blocks live in `blocks/{blockName}/` with vanilla JS and CSS; there is no Sling, HTL, Java, or JCR in the repo.

The **aem-\*** skills in `.claude/skills/` were written for **classic AEM** (AEM as a Cloud Service with Sling, HTL, Java Sling Models, Coral dialogs, clientlibs, and Maven builds). This plan maps each of those skills to EDS: what to **retire**, **adapt**, **merge**, or **replace**, with references to Adobe EDS documentation where relevant.

### 1.1 Reference documentation (Adobe)

- [Getting Started – Developer Tutorial](https://www.aem.live/developer/tutorial) — EDS setup, boilerplate, blocks
- [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project) — Git-based, buildless, blocks
- [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks) — Content model, sections, block tables, decoration
- [Configuring Google Analytics & Tag Manager Integration](https://aem.live/developer/gtm-martech-integration) — GA4/GTM, data layer, phased loading
- [Adobe Experience Cloud Integration](https://www.aem.live/developer/martech-integration) — Adobe Data Layer, Adobe Analytics/Target
- [Document Authoring (DA) Library setup](https://docs.da.live/administrators/guides/setup-library) — author docs when using Document Authoring

---

## 2. Skill-by-skill migration

| Skill | Current focus (classic AEM) | EDS action | New / target |
|-------|-----------------------------|------------|--------------|
| aem-analytics | Data layer, gtag, Adobe Data Layer, component-loader | **Adapt** | eds-analytics |
| aem-deploy-content | JCR JSON → AEM author via Sling POST | **Retire** | — |
| aem-dialog | _cq_dialog, Coral UI, policies, /apps, /conf | **Retire** | — |
| aem-documentation | Component README, resource types, clientlibs, Sling Model | **Adapt** | eds-documentation |
| aem-frontend-js | clientlibs, @netcentric/component-loader, data-nc, HTL | **Retire / Merge** | building-blocks + resources |
| aem-frontend-testing | Jest for .clientlibs.js, loadFixture, digitalxn paths | **Adapt** | testing-blocks or eds-block-testing |
| aem-htl-component | HTL, Sling Models, apps/digitalxn component structure | **Retire** | — |
| aem-java-backend | Sling Models, OSGi, Java | **Retire** | — |
| aem-naming | Label convention, design-expectations.json, assert-design-compliance | **Adapt** | eds-naming |
| aem-styles | SCSS, --dxn- variables, BEM, ThemeVariablesCAConfig, clientlibs | **Adapt** | eds-styles |
| aem-testing | JUnit, AemContext, Sling Model tests | **Retire** | — |
| aem-wcag | WCAG 2.2 AA, HTL/JS/SCSS | **Adapt** | eds-wcag |

---

## 3. Detailed decisions and actions

### 3.1 aem-analytics → eds-analytics

- **Keep**: Event structure (event, eventAction, eventLabel, etc.), gtag/dataLayer push pattern, optional Adobe Data Layer, performance rules (debounce, no breaking errors).
- **Remove**: References to `@netcentric/component-loader`, clientlibs, `data-nc-params`, Java/HTL.
- **Align with EDS**: Link to **both** integrations:
  - [Configuring Google Analytics & Tag Manager Integration](https://aem.live/developer/gtm-martech-integration) — Google Data Layer, GA4, GTM, phased loading (eager/lazy/delayed).
  - [Adobe Experience Cloud Integration](https://www.aem.live/developer/martech-integration) — Adobe Data Layer, Adobe Analytics/Target.
- **Action**: When implemented, create **eds-analytics** with block-level event pushes, data layer shape, and phased loading; link to both aem.live guides above.

### 3.2 aem-deploy-content → Retire

- **Reason**: EDS has no JCR or Sling POST. Content comes from the repo (markdown, docs, sheets) and/or authoring UI; no “deploy JSON to author” workflow.
- **Action**: Archive to **.claude/skills/archive/** (document only; no move in this plan).

### 3.3 aem-dialog → Retire

- **Reason**: EDS has no _cq_dialog or Coral UI. Authoring is block tables in markdown, section metadata, and (if used) Universal Editor / Document Authoring.
- **Action**: Archive to **.claude/skills/archive/** (document only).

### 3.4 aem-documentation → Adapt

- **Keep**: Structure (overview, authoring, frontend, accessibility, testing), diagram standards (no HTML in Mermaid), concise README.
- **Remove**: Resource type, component group, clientlib categories, Sling Model/Java, dialog fields.
- **Replace with**: Block name, content model (table structure), `blocks/{name}/{name}.js` and `{name}.css`, optional README in block folder, link to authoring guide.
- **Action**: When implemented, create **eds-documentation** with an EDS block README template. Include **Document Authoring (DA)** where author docs live: Sidekick Library, **Document Authoring (DA) Library** ([docs.da.live](https://docs.da.live/administrators/guides/setup-library)), Universal Editor, and /drafts as applicable.

### 3.5 aem-frontend-js → Retire as standalone; merge patterns into EDS

- **Reason**: EDS uses vanilla JS in `blocks/{blockName}/{blockName}.js` with a `decorate(block)` (or similar) contract; no clientlibs, no `@netcentric/component-loader`, no `data-nc`/`data-nc-params` from HTL.
- **Keep (elsewhere)**: Patterns for event delegation, config objects, security (no innerHTML for user data), ESLint-friendly style. These belong in **building-blocks** `resources/js-guidelines.md` (or equivalent).
- **Action**: Do not add eds-frontend-js. Merge useful patterns into building-blocks/resources. Archive aem-frontend-js to **.claude/skills/archive/** (document only).

### 3.6 aem-frontend-testing → Adapt

- **Keep**: Principles (test isolatable logic, not init/setRefs), assert all outcomes of a handler, scope DOM to component, Jest + jsdom, descriptive test names.
- **Remove**: clientlib paths, `loadFixture` from HTL fixtures, `@netcentric/component-loader` mock, digitalxn paths.
- **Replace with**: Block HTML fixtures (sample block DOM), testing block JS in isolation; paths under `blocks/`.
- **Action**: When implemented, extend **testing-blocks** or add **eds-block-testing**; use block HTML fixtures and paths under `blocks/`.

### 3.7 aem-htl-component → Retire

- **Reason**: EDS does not use HTL. Content is pre-rendered HTML from the backend; blocks decorate the DOM ([Markup, Sections, Blocks](https://www.aem.live/developer/markup-sections-blocks)).
- **Action**: Archive to **.claude/skills/archive/** (document only).

### 3.8 aem-java-backend → Retire

- **Reason**: EDS codebase has no Java, Sling, or OSGi. Backend is the EDS runtime (aem.live); no Sling Models in repo.
- **Action**: Archive to **.claude/skills/archive/** (document only).

### 3.9 aem-naming → Adapt

- **Keep**: `{purpose}{Type}` label convention (e.g. `daysLabel`, `timerAriaLabel`) for HTML/JS/ARIA.
- **Keep**: design-expectations.json format and assert-design-compliance.js (or equivalent) for CSS checks.
- **Change**: Paths and selectors point to `blocks/*.css` (or compiled block CSS), not clientlib bundle paths.
- **Action**: When implemented, create **eds-naming**: same naming rules; **retain** design-expectations.json and assert-design-compliance.js; paths/selectors reference `blocks/*.css` (or compiled block CSS) and EDS project layout.

### 3.10 aem-styles → Adapt

- **Keep**: BEM-like scoping (e.g. `.block-name__element`, `.block-name--modifier`), mobile-first, focus styles, reduced motion, no hardcoded colors/typography where possible.
- **Remove**: ThemeVariablesCAConfig, CAC, Java, clientlib SCSS bundle path; references to AEM Style System.
- **Change**: File location `blocks/{name}/{name}.css`; theming via a **shared token set** (e.g. `--dxn-*` or project vars) defined in `styles/` or a central variables file. EDS often uses plain CSS; SCSS only if the project uses a build step.
- **Action**: When implemented, create **eds-styles** for block-scoped CSS, shared tokens, responsive, a11y, and reduced motion; reference `resources/css-guidelines.md` if present.

### 3.11 aem-testing → Retire

- **Reason**: No JUnit, AemContext, or Sling Model tests in EDS. Testing is lint, browser (e.g. Playwright), and manual checks — covered by **testing-blocks**.
- **Action**: Archive to **.claude/skills/archive/** (document only). Rely on **testing-blocks** for EDS testing guidance.

### 3.12 aem-wcag → Adapt

- **Keep**: WCAG 2.2 AA rules: ARIA, keyboard nav, focus, live regions, semantic HTML, external link (rel, sr-only), form errors, reduced motion in CSS.
- **Remove**: HTL-specific bits (e.g. `@ context='attribute'`).
- **Action**: When implemented, create **eds-wcag**: same WCAG 2.2 AA rules (HTML/JS/CSS only); remove HTL/dialog references.

---

## 4. Implementation summary

**Implementation completed 2026-03-13.** All phases executed: eds-* skills created, aem-* skills archived, AGENTS.md/CLAUDE.md updated.

| Action | Skills | Target / archive |
|--------|--------|------------------|
| **Retire → archive** | aem-deploy-content, aem-dialog, aem-htl-component, aem-java-backend, aem-testing | Archive to **.claude/skills/archive/** when implemented. |
| **Retire + merge** | aem-frontend-js | Merge patterns into building-blocks/resources; then archive to **.claude/skills/archive/** |
| **Adapt → eds-*** | aem-analytics, aem-documentation, aem-naming, aem-styles, aem-wcag | New skills: **eds-analytics**, **eds-documentation**, **eds-naming**, **eds-styles**, **eds-wcag** |
| **Adapt (testing)** | aem-frontend-testing | Extend testing-blocks or add **eds-block-testing**; then archive aem-frontend-testing. |

Suggested implementation order (when executing):

1. **Phase 1**: eds-wcag, eds-naming.
2. **Phase 2**: eds-documentation (include Document Authoring), eds-styles (shared tokens); merge aem-frontend-js into building-blocks; archive aem-frontend-js.
3. **Phase 3**: eds-analytics (link both GTM and Adobe); extend testing-blocks or add eds-block-testing.
4. **Phase 4**: Archive aem-deploy-content, aem-dialog, aem-htl-component, aem-java-backend, aem-testing to .claude/skills/archive; update AGENTS.md/CLAUDE.md.

---

## 5. Resolved decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | **Skill naming** | Use **eds-*** names (eds-analytics, eds-wcag, eds-documentation, eds-naming, eds-styles; eds-block-testing if added). |
| 2 | **Analytics** | Link to **both** [Google Analytics & Tag Manager](https://aem.live/developer/gtm-martech-integration) and [Adobe Experience Cloud Integration](https://www.aem.live/developer/martech-integration) in eds-analytics. |
| 3 | **Design compliance** | **Keep** design-expectations.json and assert-design-compliance.js; paths reference block CSS (e.g. blocks/*.css). |
| 4 | **Theming** | **Shared token set** (e.g. --dxn-* or project vars) defined in styles/ or central variables file. |
| 5 | **Authoring** | Include **Document Authoring (DA)** in eds-documentation (DA Library, Sidekick Library, Universal Editor, /drafts as applicable). |
| 6 | **Retired skills** | Archive to **.claude/skills/archive/** (not delete). |
| 7 | **aem-content-sync** | **Out of scope** — do not include in this migration. |
| 8 | **Plan scope** | Implemented 2026-03-13 — eds-* skills created, aem-* archived. |

---

## 6. References

- [Developer Tutorial](https://www.aem.live/developer/tutorial)
- [Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
- [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)
- [Google Analytics & Tag Manager Integration](https://aem.live/developer/gtm-martech-integration)
- [Adobe Experience Cloud Integration](https://www.aem.live/developer/martech-integration)
- [Document Authoring (DA) Library](https://docs.da.live/administrators/guides/setup-library)
- Cursor→skills migration: `.specify/memory/docs/cursor-to-skills-migration-plan.md`
- Project rules: `CLAUDE.md`, `AGENTS.md`
