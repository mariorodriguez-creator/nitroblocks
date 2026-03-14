# Tasks: Countdown Component

**Input**: Design documents from `./specify/specs/4512-countdown-component/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, design.md

**Complexity**: Standard (12 tasks)

## Format: `[Category-ID] [P?] Description (Skill: skill-name)`

- **Category Prefixes**: BM (Backend Model), BD (Backend Dialog), BH (Backend HTL), FJ (Frontend JS), FC (Frontend CSS), IN (Integration), TS (Testing), DC (Documentation)
- **[P]**: Can run in parallel (different files, no dependencies)
- **Skill**: Required skill(s) to consult before implementation

---

## Phase 1: Setup

**Purpose**: Prepare component scaffolding and shared infrastructure

- [ ] SC001 Invoke `create-component` skill: `countdown --title "Countdown" --with-js --is-container` (Skill: create-component)
  - Covers: component `.content.xml`, dialog skeleton, `_cq_editConfig.xml`, `_cq_template/.content.xml`, HTL placeholder, clientlib `.content.xml`, `css.txt`/`js.txt`
  - Run from repo root: `python3 .claude/skills/create-component/scripts/create_component.py countdown --title "Countdown" --with-js --is-container`
  - Output: `digitalxn-aem-base-apps/.../dxn-countdown/v1/dxn-countdown/`, `digitalxn-aem-base-clientlibs-apps/.../clientlibs/publish/components/dxn-countdown/`
  - Note: If script creates output folder only, add frontend source in `frontend/.../dxn-countdown/` per fe-build structure (FJ001, FC001)

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: AEM component infrastructure — MUST be complete before user story verification

### Backend: Dialog & DataSource

- [ ] BD002 Populate dialog fields in scaffold (Skill: aem-dialog)
  - Path: `digitalxn-aem-base/digitalxn-aem-base-apps/src/main/jcr_root/apps/digitalxn/base/components/dxn-countdown/v1/dxn-countdown/_cq_dialog/.content.xml`
  - Settings tab: Pretitle (RTE), Title (RTE), Event fieldset (Date Time picker required, Time Zone dropdown required with datasource), Countdown Labels (Days/Hours/Minutes/Seconds, required, defaults), Button fieldset (Page path picker, Label)
  - Milestones tab: Multifield with `granite:data` maxitems="2", each item: Title, Text1, Text2
  - Background tab: Desktop/Tablet/Mobile DAM path pickers (optional)
  - Styles tab: Spacing Bottom dropdown (None, Small, Medium, Large)
  - Depends on: SC001

- [ ] IN001 [P] Create TimezoneDataSourceServlet (Skill: aem-java-backend)
  - Path: `digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/internal/servlets/TimezoneDataSourceServlet.java`
  - Returns Sling DataSource from `ZoneId.getAvailableZoneIds()` for dialog dropdown
  - Register with `@Component(service = DataSource.class)` and appropriate selectors
  - Depends on: SC001

### Backend: Sling Model

- [ ] BM001 Create Sling Model interface and implementation (Skill: aem-java-backend)
  - Interface: `digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/models/DxnCountdown.java`
  - Implementation: `digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/internal/models/v1/countdown/DxnCountdownImpl.java`
  - POJO: `digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/internal/models/v1/countdown/CountdownMilestone.java`
  - Methods per data-model.md: getPretitle, getTitle, getTargetEpoch, getLabelDays/Hours/Minutes/Seconds, getButtonPage, getButtonLabel, getMilestones, getDesktopImage/TabletImage/MobileImage, hasButton, hasMilestones, hasBackgroundImages, hasHeader
  - Compute targetEpoch from eventDateTime + eventTimeZone using `java.time.ZonedDateTime`
  - Depends on: BD002

### Backend: HTL Template

- [ ] BH001 Populate HTL template from design.md HTML scaffold (Skill: aem-htl-component, aem-wcag)
  - Path: `digitalxn-aem-base/digitalxn-aem-base-apps/src/main/jcr_root/apps/digitalxn/base/components/dxn-countdown/v1/dxn-countdown/dxn-countdown.html`
  - Structure: `dxn-countdown__base` with `data-nc="dxn-countdown"` and `data-nc-params` containing targetEpoch
  - Sections: background (picture), header (pretitle/title), timer (4 units + dividers), milestones (0–2 badges), optional button
  - ARIA: `role="timer"`, `aria-live="polite"`, `aria-hidden` on decorative dividers
  - Conditional rendering: header, milestones, button per hasHeader/hasMilestones/hasButton
  - Depends on: BM001

### Frontend: JavaScript & Styles

- [ ] FJ001 Create JavaScript module: `dxn-countdown.clientlibs.js` (Skill: aem-frontend-js, aem-wcag)
  - Path: `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/digitalxn/base/clientlibs/publish/components/dxn-countdown/dxn-countdown.clientlibs.js`
  - Register with @netcentric/component-loader, read `data-nc-params` for targetEpoch
  - `setInterval(fn, 1000)` to compute remaining time, update `[data-unit]` spans
  - Stop interval when expired; clear on 00 for all units
  - Depends on: BH001

- [ ] FC001 [P] Create SCSS styles from design.md SCSS skeleton (Skill: aem-styles)
  - Path: `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/digitalxn/base/clientlibs/publish/components/dxn-countdown/dxn-countdown.clientlibs.scss`
  - Implement all breakpoints per design.md (mobile base, tablet-up, desktop-up)
  - Milestone Text2/separator hidden on tablet/desktop via CSS
  - Use `--dxn-*` variables; no hardcoded colors/typography
  - Depends on: BH001

- [ ] FC002 Verify clientlib `.content.xml` category is `digitalxn.components.dxn-countdown` (Skill: aem-frontend-js)
  - Path: `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/src/main/jcr_root/apps/digitalxn/base/clientlibs/publish/components/dxn-countdown/.content.xml`
  - fe-build generates this; ensure category matches per aem-frontend-js skill
  - Depends on: FJ001, FC001

### Policy & Template Configuration

- [ ] IN002 [P] Add policy definition, merge entry, filter rules, template mapping (Skill: aem-dialog)
  - Policy: `digitalxn-aem-templates/digitalxn-aem-templates-apps/.../policies/.content.xml`
  - Merge: `digitalxn-aem-templates/digitalxn-aem-templates-content/.../policies/.content.xml`
  - Filter: `digitalxn-aem-templates/digitalxn-aem-templates-content/.../filter.xml`
  - Template: `digitalxn-aem-templates/digitalxn-aem-templates-content/.../contentpage-template/policies/.content.xml`
  - Depends on: SC001

**Checkpoint**: Component foundation ready — deploy to AEM and verify author/publish rendering

---

## Phase 3: User Story — Event Countdown Display

**Goal**: Full countdown configuration, live timer, milestones, responsive behavior

**Independent Test**: Author configures event, milestones, backgrounds; visitor sees countdown updating every second

- [ ] TS001 Create unit test: `DxnCountdownImplTest.java` (Skill: aem-testing)
  - Path: `digitalxn-aem-base/digitalxn-aem-base-core/src/test/java/biz/netcentric/digitalxn/aem/internal/models/v1/countdown/DxnCountdownImplTest.java`
  - Test resources: `full-configuration.json`, `minimal-configuration.json`, `expired-event.json`, `no-milestones.json`
  - Test: getTargetEpoch, label defaults, hasButton, hasMilestones, hasHeader, getMilestones
  - Depends on: BM001

---

## Phase 4: QA & Polish

**Purpose**: Code quality gates and automated checks

- [ ] TS005 Run Spotbugs and fix violations: `mvn spotbugs:check -pl digitalxn-aem-base/digitalxn-aem-base-core -q` (Skill: aem-testing)

- [ ] TS006 Run frontend lint: `npm run lint:js` and `npm run lint:css` in `digitalxn-aem-base-clientlibs-apps/frontend/` (Skill: aem-frontend-js, aem-styles)
  - Depends on: FC002 (fe-build rule: clientlib must exist before lint)

---

## Dependencies & Execution Order

### AEM Component Development Sequence

1. **Setup** → SC001
2. **Dialog & DataSource** → BD002, IN001 (parallel)
3. **Model** → BM001 (requires BD002)
4. **Rendering** → BH001 (requires BM001)
5. **Frontend** → FJ001, FC001 (parallel, requires BH001) → FC002 (requires both)
6. **Policy** → IN002 (parallel with 2–5)
7. **Tests** → TS001 (requires BM001)
8. **QA** → TS005, TS006

### Parallel Opportunities

- BD002 and IN001 can run in parallel after SC001
- FJ001 and FC001 can run in parallel after BH001
- IN002 can run in parallel with backend/frontend work

### Task ID Reference

| Category | Prefix | Description |
|----------|--------|-------------|
| Backend: Models | BM | Sling Model interface and implementation |
| Backend: Dialog | BD | Dialog fields |
| Backend: HTL | BH | HTL template |
| Frontend: JS | FJ | JavaScript |
| Frontend: CSS | FC | SCSS and clientlib |
| Integration | IN | DataSource servlet, policy config |
| Testing | TS | Unit tests, Spotbugs, lint |
| Scaffolding | SC | create-component |
