# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `speckit-plan` skill.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Project Context *(mandatory)*

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the spec. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Java 11+ (target bytecode 1.8), HTL, JavaScript/TypeScript, LESS/SASS [or NEEDS CLARIFICATION]  
**Primary Dependencies**: AEM 6.5.15.0, Core Components 2.22.0+, Sling Models, JCR API, Node 20.16.0, npm 10.8.1, JUnit 5, Mockito [or NEEDS CLARIFICATION]  
**Storage**: JCR (Jackrabbit Oak), AEM Assets [or N/A or NEEDS CLARIFICATION]  
**Testing**: JUnit 5, Mockito, AEM Mocks (backend); Jest, jsdom (frontend clientlibs) [or NEEDS CLARIFICATION]
**Target Platform**: AEM Author/Publisher (Linux/Windows), Cloud/On-Prem [or NEEDS CLARIFICATION]  
**Project Type**: AEM multi-module web application (ui.apps, ui.content, core, etc.) [or NEEDS CLARIFICATION]  
**Performance Goals**: Page load <3s, Component render <200ms, Lighthouse ≥85 [or NEEDS CLARIFICATION]  
**Constraints**: Follows AEM project structure, code quality gates, WCAG 2.2 AA, Java memory/cpu budget, <200ms p95 [or NEEDS CLARIFICATION]  
**Scale/Scope**: [e.g., number of components, expected users, environments, or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with AEM Platform Core Constitution (v1.2.0):

### Core Principles
- [ ] **Code Quality (Principle I)**: Will code follow Java conventions, HTL best practices, and SonarQube gates?
- [ ] **Coding Standards (Principle II)**: Will code adhere to Claude Code skills in .claude/skills/? (NON-NEGOTIABLE)
- [ ] **Testing Standards (Principle III)**: Are tests planned first with ≥80% coverage targets? (NON-NEGOTIABLE)
- [ ] **Security (Principle IV)**: Does design include input validation, output encoding, and CSRF protection?
- [ ] **Accessibility (Principle V)**: Will UI meet WCAG 2.2 AA (semantic HTML, keyboard nav, ARIA, contrast)?
- [ ] **Performance (Principle VI)**: Can targets be met (page load <3s, component render <200ms, Lighthouse ≥85)?
- [ ] **Maintainability (Principle VII)**: Is technical debt tracked? Are dependencies managed? Is config externalized?
- [ ] **Observability (Principle VIII)**: Is structured logging, monitoring, and error tracking included?
- [ ] **Project Context (Principle IX)**: Are applicable projects identified? Is configuration-based approach used? Are cross-project impacts analyzed?

**If any principle cannot be met**, document justification in Complexity Tracking section below.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (speckit-plan skill)
├── data-model.md        # Phase 1 output (speckit-plan skill)
├── quickstart.md        # Phase 1 output (speckit-plan skill)
└── tasks.md             # Phase 2 output (speckit-tasks skill - NOT created by speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths.
-->

```text
# Component Definition & HTL
digitalxn-aem-base/digitalxn-aem-base-apps/src/main/jcr_root/apps/digitalxn/base/components/
└── [component-name]/v1/[component-name]/
    ├── .content.xml                    # Component definition (resourceSuperType, componentGroup)
    ├── _cq_dialog/.content.xml         # Authoring dialog (Granite UI)
    ├── _cq_design_dialog/.content.xml  # Design dialog (optional)
    └── [component-name].html           # HTL template

# Backend - Sling Model Interface (public API)
digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/models/
└── Dxn[ComponentName].java          # Interface extending Core Component model

# Backend - Sling Model Implementation (internal)
digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/internal/models/v1/[component-name]/
└── Dxn[ComponentName]Impl.java      # Implementation with @Model annotation

# Frontend - Source Files (compiled by fe-build)
digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/digitalxn/base/clientlibs/publish/components/[component-name]/
├── [component-name].clientlibs.js      # JavaScript class (interactive components)
├── [component-name].clientlibs.scss    # SCSS styles (BEM methodology)
└── [component-name].config.js          # JS config - selectors, classes (if JS needed)

# Frontend - Compiled Bundles (generated by fe-build)
digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/src/main/jcr_root/apps/digitalxn/base/clientlibs/publish/components/[component-name]/
├── .content.xml                        # ClientLibraryFolder — MUST use categories=[digitalxn.components.dxn-[component-name]] (fe-build may generate path-based category; verify/correct per aem-frontend-js skill)
├── [component-name].bundle.css         # Compiled CSS
├── [component-name].bundle.js          # Compiled JS (if applicable)
├── css.txt                             # CSS manifest
└── js.txt                              # JS manifest (if applicable)

# Unit Tests
digitalxn-aem-base/digitalxn-aem-base-core/src/test/java/biz/netcentric/digitalxn/aem/internal/models/v1/[component-name]/
└── Dxn[ComponentName]ImplTest.java  # JUnit 5 + Mockito + AEM Mocks

# Frontend unit tests (OPTIONAL — only when component has isolatable pure logic)
# Do NOT add for decorative components or wiring-only JS. See aem-testing skill.
digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/digitalxn/base/clientlibs/publish/components/[component-name]/
├── [component-name].test.js           # Jest (optional, when isolatable logic present)
└── __fixtures__/[component-name].html  # HTML fixture (if tests added)

# Integration Tests
digitalxn-aem-ui-tests/digitalxn-aem-ui-tests-automation/
└── [test files as needed]
```

**Files to Create/Modify**: [List specific files that will be created or modified for this feature]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
