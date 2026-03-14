---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `./specify/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user story), research.md, data-model.md

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

## Format: `[Category-ID] [P?] Description (Skill: skill-name)`

- **Category Prefixes**: BM (Backend Model), BD (Backend Dialog), BH (Backend HTL), FJ (Frontend JS), FC (Frontend CSS), IN (Integration), TS (Testing), DC (Documentation)
- **[P]**: Can run in parallel (different files, no dependencies)
- **Skill**: Required skill(s) to consult before implementation
- Include exact file paths in descriptions

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are EXAMPLE TASKS for illustration purposes only.
  
  Final tasks will depend on:
  - Specific feature requirements from spec.md
  - Technical approach defined in plan.md
  - Data model entities from data-model.md
  - Project-specific constraints and conventions
  
  The /speckit.tasks command MUST replace these examples with actual tasks
  tailored to the feature being implemented.
  
  DO NOT keep these example tasks in the generated tasks.md file.
  ============================================================================
-->

> **⚠️ NOTE**: All tasks below are **examples only**. Final tasks will be tailored to the specific feature requirements and implementation plan.

## Phase 1: Setup (Analysis & Planning)

**Purpose**: Analyze existing patterns and plan component implementation

*Example tasks (adjust based on plan.md):*

- [ ] T001 Review existing similar components for patterns and conventions
- [ ] T002 Identify required Core Component super types (teaser, image, form, etc.)
- [ ] T003 [P] Document component requirements (dialog fields, Sling Model properties, JS interactions)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: AEM component infrastructure that MUST be complete before user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

*Example tasks (adjust based on plan.md and feature requirements):*

### Component Scaffolding
- [ ] SC001 Invoke `create-component` skill: `<component-name> [--title "Title"] [--with-js]`
  - Covers: component `.content.xml` (BD001), dialog skeleton `_cq_dialog/.content.xml` (BD002 structure), `_cq_editConfig.xml` (BD003), `_cq_template/.content.xml`, HTL placeholder, clientlib `.content.xml` (FC002), `css.txt` / `js.txt` (FC003)

### Component Definition (post-scaffold)
- [ ] BD002 Populate dialog fields in scaffold: `apps/digitalxn/base/components/[component-name]/v1/[component-name]/_cq_dialog/.content.xml` (Skill: aem-dialog)

### Backend (Sling Model)
- [ ] T007 Create Sling Model interface in `digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/models/Dxn[ComponentName].java`
- [ ] T008 Create Sling Model implementation in `digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/internal/models/v1/[component-name]/Dxn[ComponentName]Impl.java`

### Frontend (HTL & Client Libraries)
- [ ] T009 Populate HTL template `[component-name].html` with data-sly-use and data-nc attributes (scaffold placeholder already created by SC001)
- [ ] T010 [P] Create JavaScript class `[component-name].clientlibs.js` with @netcentric/component-loader
- [ ] T011 [P] Create SCSS styles `[component-name].clientlibs.scss` following BEM methodology
- [ ] T012 [P] Create config file `[component-name].config.js` with selectors and classes

### Policy & Template Configuration (if required)
- [ ] T013 [P] Define component policy in `digitalxn-aem-templates-apps/.../policies/.content.xml`
- [ ] T014 [P] Enable policy in `digitalxn-aem-templates-content/.../policies/.content.xml`
- [ ] T015 Assign policy to template in `digitalxn-aem-templates-content/.../templates/[template-name]/policies/.content.xml`

**Checkpoint**: Component foundation ready - user story implementation can now begin

---

## Phase 3: User Story - [Title]

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own - author experience, publish rendering]

*Example tasks (adjust based on spec.md acceptance criteria):*

### Backend: Java Models and Services

**File Pattern**: `digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/models/{component-package}/`

**Required Skill**: `aem-java-backend`

- [ ] BM003 Create Sling Model interface: `{ComponentName}.java` (Skill: aem-java-backend)
  - Location: `digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/models/{component-package}/{ComponentName}.java`
  - Define all getter methods matching dialog fields
  - Include JavaDoc with @return descriptions
  - Use `Optional<T>` for nullable fields
  - Extend `ComponentExporter` if JSON export needed

- [ ] BM004 Create Sling Model implementation: `{ComponentName}Impl.java` (Skill: aem-java-backend)
  - Location: `digitalxn-aem-base/digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/models/{component-package}/{ComponentName}Impl.java`
  - Annotations: `@Model(adaptables = {Resource.class, SlingHttpServletRequest.class}, adapters = {ComponentName}.class, resourceType = ComponentNameImpl.RESOURCE_TYPE, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)`
  - Inject dialog values with `@ValueMapValue` (optional = true for nullable)
  - Use `@PostConstruct` for initialization logic
  - Delegate to interface (not expose implementation)
  - Implement `isEmpty()` method for conditional rendering
  - Depends on: BM003

- [ ] BM005 [P] Create child model interface (if multifield): `{ChildName}.java` (Skill: aem-java-backend)
  - For multifield child items (e.g., QuizQuestion for Quiz)
  - Define getter methods for child item properties

- [ ] BM006 [P] Create child model implementation: `{ChildName}Impl.java` (Skill: aem-java-backend)
  - Adapt from Resource only: `@Model(adaptables = Resource.class)`
  - Depends on: BM005

### Backend: Component Structure and Dialog

**Base Path**: `digitalxn-aem-base/digitalxn-aem-base-apps/src/main/jcr_root/apps/digitalxn/base/components/{category}/{component-name}/`

**Required Skills**: `aem-htl-component`, `aem-dialog`

- [ ] BD001 Create component metadata: `.content.xml` (Skill: aem-htl-component)
  - Location: `apps/digitalxn/base/components/{category}/{component-name}/.content.xml`
  - `sling:resourceSuperType` - extend Core Component if applicable (e.g., `core/wcm/components/text/v2/text`)
  - `componentGroup`: "DigitalXn General" or appropriate group
  - `jcr:title`, `jcr:description` for authoring UI
  - `cq:isContainer` if component can have child components

- [ ] BD002 Create dialog: `_cq_dialog/.content.xml` (Skill: aem-dialog)
  - Location: `apps/digitalxn/base/components/{category}/{component-name}/_cq_dialog/.content.xml`
  - Use Granite UI components (coral3)
  - Follow field naming: lowercase, camelCase for multiwords
  - Include `fieldLabel`, `fieldDescription`, `required` attributes
  - Group related fields in containers/tabs
  - Use appropriate field types (see Dialog Field Type Selection guide)
  - Depends on: BD001

- [ ] BD003 [P] Create edit config: `_cq_editConfig.xml` (Skill: aem-htl-component)
  - Location: `apps/digitalxn/base/components/{category}/{component-name}/_cq_editConfig.xml`
  - Only if custom authoring behavior needed (empty text placeholder, custom actions)
  - Configure `cq:emptyText` for placeholder in edit mode

- [ ] BD004 [P] Create design dialog: `_cq_design_dialog/.content.xml` (Skill: aem-dialog)
  - Location: `apps/digitalxn/base/components/{category}/{component-name}/_cq_design_dialog/.content.xml`
  - Only if policy-driven styling options needed
  - Define style system options if applicable

### Backend: HTL Templates

**Base Path**: `digitalxn-aem-base/digitalxn-aem-base-apps/src/main/jcr_root/apps/digitalxn/base/components/{category}/{component-name}/`

**Required Skills**: `aem-htl-component`, `aem-wcag`

- [ ] BH001 Create HTL template: `{component-name}.html` (Skill: aem-htl-component, aem-wcag)
  - Location: `apps/digitalxn/base/components/{category}/{component-name}/{component-name}.html`
  - `data-sly-use.model` for Sling Model binding with fully qualified class name
  - Wrap in `data-sly-test="${model.empty}"` for conditional rendering
  - Semantic HTML structure (use appropriate heading levels, lists, etc.)
  - ARIA attributes: `role`, `aria-label`, `aria-describedby` as needed
  - Include `data-cmp-is="{component-name}"` for JS initialization hook
  - Depends on: BM004, BD002

- [ ] BH002 [P] Create HTL template for child items: `{child-name}.html` (Skill: aem-htl-component)
  - Location: `apps/digitalxn/base/components/{category}/{component-name}/{child-name}.html`
  - Only if component has repeating child structures (multifield items)
  - Use `data-sly-resource` or `data-sly-list` for iteration

### Frontend: JavaScript & Styling

**Base Path**: `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/src/main/jcr_root/apps/digitalxn/base/clientlibs/`

**Required Skills**: `aem-frontend-js`, `aem-analytics`, `aem-styles`

- [ ] FJ001 Create JavaScript module: `clientlib-{component}/js/{component}.js` (Skill: aem-frontend-js, aem-analytics)
  - Location: `clientlibs/clientlib-{component}/js/{component}.js`
  - Use ES6+ syntax with IIFE or module pattern
  - Initialize on `DOMContentLoaded` or use MutationObserver for dynamic content
  - Query components via `[data-cmp-is="{component-name}"]` selector
  - Handle component initialization and event binding
  - Implement accessibility keyboard handlers (Enter, Space, Arrow keys)
  - Add data layer push for analytics events
  - Depends on: BH001

- [ ] FC001 [P] Create SCSS styles: `clientlib-{component}/css/{component}.scss` (Skill: aem-styles)
  - Location: `clientlibs/clientlib-{component}/css/{component}.scss`
  - Follow BEM naming convention: `.cmp-{component}`, `.cmp-{component}__element`, `.cmp-{component}--modifier`
  - Define component-scoped CSS custom properties (variables)
  - Implement responsive breakpoints using project mixins
  - Ensure WCAG 2.1 AA color contrast (≥4.5:1 normal, ≥3:1 large text)
  - Include focus states for keyboard navigation
  - Depends on: BH001

- [ ] FC002 Create clientlib definition: `clientlib-{component}/.content.xml` (Skill: aem-frontend-js)
  - Location: `clientlibs/clientlib-{component}/.content.xml`
  - Define `categories` array: `["digitalxn.components.{component}"]`
  - Set `dependencies` on base clientlibs: `["digitalxn.base.site"]`
  - Configure `embed` for bundling if needed
  - Depends on: FJ001, FC001

- [ ] FC003 [P] Create js.txt and css.txt: (Skill: aem-frontend-js)
  - Location: `clientlibs/clientlib-{component}/js.txt` and `clientlibs/clientlib-{component}/css.txt`
  - List files in load order
  - Use `#base=js` and `#base=css` directives

### Integration: External Services (if applicable)

**Required Skill**: `aem-frontend-js`

- [ ] IN001 Configure external API connection (Skill: aem-frontend-js)
  - Create OSGi configuration for API endpoints
  - Location: `digitalxn-aem-osgiconfig-container/src/main/jcr_root/apps/digitalxn/osgiconfig/config/`
  - Use Context-Aware Configuration for environment-specific values

- [ ] IN002 [P] Create service interface for API integration (Skill: aem-java-backend)
  - Location: `digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/services/{ServiceName}.java`
  - Define methods for API operations

- [ ] IN003 Create service implementation (Skill: aem-java-backend)
  - Location: `digitalxn-aem-base-core/src/main/java/biz/netcentric/digitalxn/aem/services/impl/{ServiceName}Impl.java`
  - Implement error handling and retry logic
  - Add logging for debugging
  - Use HttpClient for external calls
  - Depends on: IN002

### Content: Experience Fragments (if applicable)

**Base Path**: `digitalxn-aem-initial-content/src/main/jcr_root/content/experience-fragments/`

- [ ] CT003 [P] Create experience fragment template (Skill: aem-htl-component)
  - Define fragment structure and allowed components
  - Configure variations if needed

- [ ] CT004 [P] Create sample content fragment (Skill: aem-dialog)
  - Provide example content for testing and documentation

### Testing (OPTIONAL - only if tests requested)

**Frontend**: Unit tests (TS007) are **optional**. Add only when the component has **isolatable pure logic** (calculations, validation, state transitions, analytics payload building). **Skip** for decorative components, thin glue (event delegation, init), or wiring-only code. Do not test component load, param passing, or DOM wiring. See `aem-testing` skill.

**File Pattern**: `digitalxn-aem-base/digitalxn-aem-base-core/src/test/java/biz/netcentric/digitalxn/aem/models/{component-package}/`

**Required Skill**: `aem-testing`

- [ ] TS001 [P] Create unit test: `{ComponentName}ImplTest.java` (Skill: aem-testing)
  - Location: `digitalxn-aem-base/digitalxn-aem-base-core/src/test/java/biz/netcentric/digitalxn/aem/models/{component-package}/{ComponentName}ImplTest.java`
  - Use `AemContext` with `ResourceResolverType.JCR_MOCK`
  - Setup test content in `@BeforeEach` method
  - Test all getter methods with sample content
  - Test edge cases: null values, empty strings, missing properties
  - Test `isEmpty()` method with various states
  - Depends on: BM004

- [ ] TS002 [P] Create child model unit test: `{ChildName}ImplTest.java` (Skill: aem-testing)
  - Location: `digitalxn-aem-base/digitalxn-aem-base-core/src/test/java/biz/netcentric/digitalxn/aem/models/{component-package}/{ChildName}ImplTest.java`
  - Only if child models exist (multifield items)
  - Depends on: BM006

- [ ] TS003 [P] Create service unit test: `{ServiceName}ImplTest.java` (Skill: aem-testing)
  - Location: `digitalxn-aem-base/digitalxn-aem-base-core/src/test/java/biz/netcentric/digitalxn/aem/services/impl/{ServiceName}ImplTest.java`
  - Only if service classes exist
  - Mock external dependencies
  - Test success and error scenarios
  - Depends on: IN003

- [ ] TS004 [P] Create test content JSON: `{component-name}.json` (Skill: aem-testing)
  - Location: `digitalxn-aem-base/digitalxn-aem-base-core/src/test/resources/biz/netcentric/digitalxn/aem/models/{component-package}/{component-name}.json`
  - Define sample JCR content structure for tests
  - Include various test scenarios (full data, minimal data, edge cases)

- [ ] TS007 [P] Create Jest unit test: `{component-name}.test.js` (Skill: aem-testing) **— OPTIONAL, skip unless isolatable logic exists**
  - **Do NOT add** for decorative components, wiring-only code (event delegation, init, setRefs), or components with no pure logic.
  - **Only add** when component has isolatable logic: calculations, validation, state transitions, analytics payload building, extracted pure functions.
  - Do NOT test: component load, param passing, init/setRefs, thin wrappers.
  - Location: `digitalxn-aem-base-clientlibs-apps/frontend/digitalxn/base/clientlibs/publish/components/{component-name}/{component-name}.test.js`
  - Test extracted pure functions and business logic—not wiring.
  - Use `loadFixture()` or mocks as needed. Mock `@netcentric/component-loader`.
  - Depends on: FJ001

**Checkpoint**: User Story should be fully functional and testable independently

## Phase 4: Quality Assurance

**Purpose**: Verify implementation quality and run automated checks

### Testing: Unit, Integration, Accessibility

- [ ] TS002 Run Spotbugs analysis and fix violations: `mvn spotbugs:check`
- [ ] TS003 [P] Run ESLint on JavaScript files: `npm run lint:js`
- [ ] TS004 [P] Run Stylelint on SCSS files: `npm run lint:css`
- [ ] TS005 [P] Run Jest unit tests: `npm test` in `digitalxn-aem-base-clientlibs-apps/frontend/`
- [ ] TS006 Run accessibility scan with Axe DevTools

### Documentation

**Required Skill**: `aem-documentation`

- [ ] DC001 [P] Update component README with usage examples (Skill: aem-documentation)
- [ ] DC002 [P] Add JavaDoc for all public APIs (Skill: aem-documentation)

**Checkpoint**: All quality checks passed

---

## Dependencies & Execution Order

### AEM Component Development Sequence

For each component in the user story:

1. **Structure First** (blocks everything)
  - SC001: scaffold (component folder, .content.xml, dialog skeleton, editConfig, clientlib)
  - BD002: populate dialog fields

2. **Model Layer** (blocks rendering)
  - Sling Model interface
  - Sling Model implementation
  - Unit tests (parallel with implementation)

3. **Rendering Layer** (blocks frontend)
  - HTL template (populate SC001 placeholder)
  - Edit configuration (if needed — already created by SC001)

4. **Frontend Layer** (can partially parallel)
  - JavaScript (after HTL structure exists)
  - CSS/SCSS (after HTL structure exists)
  - Clientlib configuration (already created by SC001)

5. **Content Layer** (after component functional)
  - Content policies
  - Sample content
  - Experience fragments (if applicable)

### Parallel Opportunities Within Phases

**Can Run in Parallel (same phase, no file conflicts):**
- Dialog definition + Sling Model Interface (different files)
- JavaScript + CSS within same clientlib
- Multiple unit test classes
- Multiple model implementations (if interfaces defined)

**Must Run Sequentially:**
- Interface before Implementation
- Model before HTL (HTL uses model)
- Dialog before Model (model maps to dialog fields)
- Component structure before clientlib registration

### Cross-Component Dependencies

When component A depends on component B:
1. Complete B's model and HTL first
2. A can reference B via resource inclusion
3. A's clientlib may embed or depend on B's clientlib

---

## Phase 5: Polish & Cross-Cutting Concerns

...existing code...
- [ ] TXXX Confirm PR passes automated checks (build, test, lint, security scan)
- [ ] TXXX Validate code review completed by senior developer
- [ ] TXXX Verify builds are repeatable and environment-agnostic
- [ ] TXXX Confirm deployment automation follows promotion path (DEV→STAGE→PROD)
- [ ] TXXX Document rollback procedures

### Project Context & Configuration (Principle X)
- [ ] TXXX Verify applicable projects documented in spec.md and plan.md
- [ ] TXXX Confirm project-specific behavior uses OSGi configurations (no hardcoded logic)
- [ ] TXXX Validate project documentation exists in ./specify/memory/projects/{project-name}.md
- [ ] TXXX Test project-specific variations with appropriate runmode configurations
- [ ] TXXX Verify cross-project dependencies explicitly declared
- [ ] TXXX Confirm no conditional logic based on project names in code
- [ ] TXXX Validate component reusability across multiple projects
- [ ] TXXX Test project-specific acceptance criteria from project registry

### Security & Compliance
- [ ] TXXX Run vulnerability scanning; address critical CVEs
- [ ] TXXX Verify license compliance (no GPL without approval)
- [ ] TXXX Confirm production credentials managed via secure vault

### Final Validation
- [ ] TXXX Run quickstart.md validation
- [ ] TXXX Complete constitution compliance checklist
- [ ] TXXX Verify user-facing documentation updated
- [ ] TXXX Confirm breaking changes include migration guides

---

## Dependencies & Execution Order

### AEM Component Development Sequence

For each component in the user story:

1. **Structure First** (blocks everything)
   - SC001: scaffold (component folder, .content.xml, dialog skeleton, editConfig, clientlib, HTL placeholder)
   - BD002: populate dialog fields (depends on SC001)

2. **Model Layer** (blocks rendering)
   - Sling Model interface (BM003)
   - Sling Model implementation (BM004)
   - Unit tests can run in parallel with implementation (TS001)

3. **Rendering Layer** (blocks frontend)
   - HTL template (BH001) — populate SC001 placeholder
   - Edit configuration (BD003) — already created by SC001, only if custom behaviour needed

4. **Frontend Layer** (can partially parallel)
   - JavaScript (FJ001) - after HTL structure exists
   - CSS/SCSS (FC001) - after HTL structure exists, parallel with JS
   - Clientlib configuration (FC002) — already created by SC001

5. **Content Layer** (after component functional)
   - Content policies
   - Sample content
   - Experience fragments (if applicable)

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS user story
- **User Stories (Phase 3)**: Depends on Foundational phase completion
- **Quality Assurance (Phase 4)**: Depends on user stories being complete
- **Polish (Phase 5, Final Phase)**: Depends on QA phase completion

### Within User Story

- Models before services
- Interface before implementation (BM003 → BM004)
- Dialog before Model (model maps to dialog fields)
- Model before HTL (HTL uses model)
- HTL before Frontend (JS/CSS need HTML structure)
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Component definition and dialog can run in parallel with Sling Model interface
- Client library files (JS, SCSS, config) can run in parallel
- Policy definition and enablement can run in parallel
- Unit tests and integration tests can run in parallel
- Once component foundation completes, user story implementation can start

- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user story can start
- JS and CSS can run in parallel (different files)
- All tests marked [P] can run in parallel

---

## Task ID Reference

| Category | Prefix | Description |
|----------|--------|-------------|
| Backend: Models | `BM` | Sling Model interfaces and implementations |
| Backend: Dialog | `BD` | Component structure, dialog, edit config |
| Backend: HTL | `BH` | HTL templates |
| Frontend: JS | `FJ` | JavaScript functionality |
| Frontend: CSS | `FC` | SCSS/CSS styling and clientlibs |
| Integration | `IN` | External service integrations |
| Testing | `TS` | Unit tests (JUnit, Jest), integration, accessibility tests |
| Documentation | `DC` | Technical docs, user guides |
| Content | `CT` | Content structure, policies, fragments |

---

## Notes

- [P] tasks = different files/modules, no dependencies
- Each user story should be independently completable and testable on AEM author/publish
- Every task MUST include `(Skill: skill-name)` for applicable skills
- Commit after each task or logical group
- Stop at any checkpoint to validate component in AEM
- Deploy to local AEM instance frequently to verify author experience
- Test both author and publish modes
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
