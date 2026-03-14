# Implementation Plan: Countdown Component

**Branch**: `feature/4512-countdown-component` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/4512-countdown-component/spec.md`

## Summary

New AEM component (`dxn-countdown`) that displays a live countdown timer to a scheduled event. The component includes configurable pretitle/title (RTE), event date-time with explicit IANA timezone selection, customizable countdown labels, up to 2 event milestones (with responsive Text2 visibility), an optional CTA button, responsive background images, and DXn spacing. The countdown updates every second client-side, starting from server-rendered 00 values. The target epoch is computed server-side from a stored local date-time + IANA timezone and passed as a `data-nc-params` attribute.

## Project Context *(mandatory)*

**Language/Version**: Java 11+ (target bytecode 1.8), HTL, JavaScript (ES6+), SCSS
**Primary Dependencies**: AEM 6.5.15.0, Core Components 2.22.0+, Sling Models, JCR API, `java.time` (ZonedDateTime, ZoneId), Node 20.16.0, npm 10.8.1, JUnit 5, Mockito
**Storage**: JCR (Jackrabbit Oak) — two string properties for event date-time + timezone, multifield child nodes for milestones, DAM references for images
**Testing**: JUnit 5, Mockito, AEM Mocks (backend); Jest optional only if isolatable pure logic emerges in JS
**Target Platform**: AEM Author/Publisher (Cloud/On-Prem)
**Project Type**: AEM multi-module (digitalxn-aem-base-apps, digitalxn-aem-base-core, digitalxn-aem-base-clientlibs-apps)
**Performance Goals**: Page load <3s, Component render <200ms, Lighthouse ≥85
**Constraints**: WCAG 2.2 AA, BEM/SCSS methodology, no hardcoded colors/typography (--dxn- variables), server-first minimal code
**Scale/Scope**: 1 new component, applicable to ALL projects

## Constitution Check

*GATE: Passed — all principles addressed.*

### Core Principles
- [x] **Code Quality (Principle I)**: Sling Model with clear interface/impl separation, BEM SCSS, ESLint-compliant JS
- [x] **Coding Standards (Principle II)**: Follows aem-java-backend, aem-htl-component, aem-styles, aem-dialog, aem-frontend-js, aem-wcag skills
- [x] **Testing Standards (Principle III)**: JUnit 5 + AEM Mocks for Sling Model (≥80% coverage); frontend JS unit tests optional per constitution
- [x] **Security (Principle IV)**: No user input accepted at runtime; authored content only; HTL context-aware encoding
- [x] **Accessibility (Principle V)**: `role="timer"`, `aria-live="polite"`, `aria-hidden` on decorative dividers, decorative images with `alt=""`
- [x] **Performance (Principle VI)**: Server-rendered initial state (no JS blocking for first paint); `setInterval` updates text content only (no layout shifts); responsive `<picture>` for optimized image loading
- [x] **Maintainability (Principle VII)**: All labels externalized; timezone list from JVM ZoneId (no hardcoded list); --dxn- CSS variables; config via dialog
- [x] **Observability (Principle VIII)**: SLF4J logging in Sling Model for timezone conversion edge cases
- [x] **Project Context (Principle IX)**: Applicable to ALL projects; labels and images are per-instance configurable; theming via CAC variables

## Project Structure

### Documentation (this feature)

```text
specs/4512-countdown-component/
├── spec.md              # Feature specification (with clarifications)
├── design.md            # Figma design reference (HTML/CSS source of truth)
├── plan.md              # This file
├── research.md          # Phase 0 research decisions
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 integration & test scenarios
└── checklists/
    └── requirements-readiness-check.md
```

### Source Code (repository root)

```text
# Component Definition & HTL
digitalxn-aem-base/digitalxn-aem-base-apps/src/main/jcr_root/apps/digitalxn/base/components/
└── dxn-countdown/v1/dxn-countdown/
    ├── .content.xml
    ├── dxn-countdown.html
    ├── _cq_dialog/.content.xml
    ├── _cq_template/.content.xml
    └── _cq_htmlTag/.content.xml

# Backend - Sling Model Interface
digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/models/
└── DxnCountdown.java

# Backend - Sling Model Implementation
digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/internal/models/v1/countdown/
├── DxnCountdownImpl.java
└── CountdownMilestone.java

# Backend - Timezone DataSource Servlet
digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/internal/servlets/
└── TimezoneDataSourceServlet.java

# Backend - Unit Tests
digitalxn-aem-base/digitalxn-aem-base-core/src/test/java/biz/netcentric/digitalxn/aem/internal/models/v1/countdown/
└── DxnCountdownImplTest.java

# Backend - Test Resources
digitalxn-aem-base/digitalxn-aem-base-core/src/test/resources/biz/netcentric/digitalxn/aem/internal/models/v1/countdown/
├── full-configuration.json
├── minimal-configuration.json
├── expired-event.json
└── no-milestones.json

# Frontend - Source Files
digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/digitalxn/base/clientlibs/publish/components/dxn-countdown/
├── dxn-countdown.clientlibs.js
├── dxn-countdown.clientlibs.scss
└── dxn-countdown.config.js

# Frontend - Compiled Bundles (generated by fe-build)
digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/src/main/jcr_root/apps/digitalxn/base/clientlibs/publish/components/dxn-countdown/
├── .content.xml
├── dxn-countdown.bundle.css
├── dxn-countdown.bundle.js
├── css.txt
└── js.txt

# Policy & Template Configuration
digitalxn-aem-templates/digitalxn-aem-templates-apps/src/main/jcr_root/apps/digitalxn/settings/wcm/policies/.content.xml
digitalxn-aem-templates/digitalxn-aem-templates-content/src/main/jcr_root/conf/digitalxn/settings/wcm/policies/.content.xml
digitalxn-aem-templates/digitalxn-aem-templates-content/src/main/META-INF/vault/filter.xml
digitalxn-aem-templates/digitalxn-aem-templates-content/src/main/jcr_root/conf/digitalxn/settings/wcm/templates/contentpage-template/policies/.content.xml
```

**Files to Create**:
- Component definition: `.content.xml`, HTL, dialog, template, htmlTag (5 files)
- Sling Model: interface + implementation + milestone POJO (3 files)
- Timezone datasource servlet (1 file)
- Unit tests + test resources (5 files)
- Frontend: JS, SCSS, config (3 files)

**Files to Modify**:
- Policy definition (templates-apps)
- Policy merge entry (templates-content)
- Filter rules (templates-content)
- Template policy mapping (templates-content)

## Complexity Tracking

> No constitution violations. No exceptions needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
