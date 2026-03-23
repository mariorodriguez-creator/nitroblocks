---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `./specify/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user story and content model), draft test content
**Optional**: data-model.md, research.md, quickstart.md, design.md

## Format: `[Category-ID] [P?] Description with file path`

- **Category Prefixes**: BJ (Block JS), BC (Block CSS), CS (Core Scripts), GS (Global Styles), CT (Content), IN (Integration), TS (Testing), DC (Documentation), T (Setup), SC (Scaffolding)
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are EXAMPLE TASKS for illustration purposes only.
  
  Final tasks will depend on:
  - Specific feature requirements from spec.md
  - Content model defined in spec.md
  - Technical approach defined in plan.md
  - Data model details from data-model.md
  - Visual design from design.md (when present)
  
  The /speckit-tasks command MUST replace these examples with actual tasks
  tailored to the feature being implemented.
  
  DO NOT keep these example tasks in the generated tasks.md file.
  ============================================================================
-->

> **NOTE**: All tasks below are **examples only**. Final tasks will be tailored to the specific feature requirements and implementation plan.

## Phase 1: Setup

**Purpose**: Verify test content and prepare block structure

- [ ] T001 Verify draft test content exists and is accessible (CDD Phase 2 gate)
- [ ] T002 Review existing similar blocks in `blocks/` and Block Collection for patterns

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Block scaffolding and core script changes that MUST be complete before user story work

**CRITICAL**: No user story work can begin until this phase is complete

### Block Scaffolding
- [ ] SC001 Create block directory and files: `blocks/{blockname}/{blockname}.js` and `blocks/{blockname}/{blockname}.css`

### Core Script Changes (if applicable)
- [ ] CS001 Add auto-blocking logic in `scripts/scripts.js` `buildAutoBlocks()` function
- [ ] CS002 [P] Add delayed functionality in `scripts/delayed.js` (third-party scripts, martech)

**Checkpoint**: Block structure ready — user story implementation can begin

---

## Phase 3: User Story - [Title]

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify — view on localhost:3000, check responsive, test variants]

### Block JavaScript

**File**: `blocks/{blockname}/{blockname}.js`

- [ ] BJ001 Implement `decorate(block)` function
  - Query authored content from block's nested `<div>` rows/columns
  - Reshape DOM into semantic HTML structure
  - Add CSS classes for styling hooks (prefixed with block name)
  - Add ARIA attributes for accessibility
  - When design.md exists: decoration must produce the HTML structure from Code Scaffold

### Block CSS

**File**: `blocks/{blockname}/{blockname}.css`

- [ ] BC001 [P] Implement block styles
  - Mobile-first with `@media (width >= 600px)`, `(width >= 900px)`, `(width >= 1200px)`
  - All selectors scoped to `.{blockname}`
  - Map to project CSS custom properties from `styles/styles.css` where available
  - When design.md exists: implement per CSS Skeleton — all breakpoints, all variants

### Block Variants (if applicable)

- [ ] BJ002 [P] Handle block option classes (e.g., `.{blockname}.dark`, `.{blockname}.wide`)
- [ ] BC002 [P] Add variant styles in `blocks/{blockname}/{blockname}.css`

### Global Style Changes (if applicable)

- [ ] GS001 [P] Update `styles/styles.css` (eager — affects LCP, keep minimal)
- [ ] GS002 [P] Update `styles/lazy-styles.css` (lazy — below the fold)

### Integration (if applicable)

- [ ] IN001 Load third-party script via `loadScript()` in block JS or `scripts/delayed.js`
- [ ] IN002 [P] Add indexing configuration for content queries

### Content

- [ ] CT001 Verify all block variants render correctly against test content on `localhost:3000`
- [ ] CT002 [P] Add SVG icons to `icons/` directory (if needed)

**Checkpoint**: User Story should be fully functional and testable on localhost:3000

---

## Final Phase: QA & Polish

**Purpose**: Verify quality, performance, accessibility before PR

### Linting (always required)

- [ ] TS001 Run ESLint and fix violations: `npm run lint` (or `npm run lint:fix`)
- [ ] TS002 [P] Run Stylelint and fix violations: `npm run lint` (or `npm run lint:fix`)

### Testing (as applicable)

- [ ] TS003 Browser test: verify block renders correctly across breakpoints (Playwright/Puppeteer or manual)
- [ ] TS004 Accessibility check: keyboard navigation, ARIA attributes, heading hierarchy, alt text
- [ ] TS005 Performance check: verify Lighthouse 100 on preview URL (`https://{branch}--{repo}--{owner}.aem.page/{path}`)

### Documentation

- [ ] DC001 [P] Create or update block authoring guide (Skill: eds-documentation)

**Checkpoint**: All quality checks passed — ready for PR

---

## Dependencies & Execution Order

### EDS Block Development Sequence

For each block in the user story:

1. **Scaffold** (blocks everything)
   - SC001: create block directory with `.js` and `.css` files

2. **Decoration** (JS and CSS can run in parallel)
   - BJ001: implement `decorate(block)` — reshape authored DOM into semantic structure
   - BC001: implement styles — mobile-first, block-scoped selectors

3. **Variants** (after base decoration works)
   - BJ002 + BC002: handle block options and variant styles

4. **Content Validation** (after block is functional)
   - CT001: verify against test content on localhost:3000

5. **Quality** (after all functionality complete)
   - TS001 + TS002: linting (always)
   - TS003-TS005: browser, accessibility, performance (as applicable)

### Parallel Opportunities

**Can run in parallel (different files):**
- Block JS + Block CSS (BJ001 + BC001)
- Multiple variant styles (BC002 variants)
- Global style changes (GS001 + GS002)
- Linting checks (TS001 + TS002)
- Documentation (DC001) alongside testing

**Must run sequentially:**
- Scaffold before decoration (SC001 → BJ001/BC001)
- Base decoration before variants (BJ001 → BJ002)
- All implementation before linting (Phase 3 → Final Phase)
- Test content verification before implementation (T001 → Phase 2)

---

## Task ID Reference

| Category | Prefix | Typical files |
|----------|--------|---------------|
| Block JS | `BJ` | `blocks/{name}/{name}.js` |
| Block CSS | `BC` | `blocks/{name}/{name}.css` |
| Core Scripts | `CS` | `scripts/scripts.js`, `scripts/delayed.js` |
| Global Styles | `GS` | `styles/styles.css`, `styles/lazy-styles.css` |
| Content | `CT` | `drafts/` test content, `icons/` |
| Integration | `IN` | Third-party scripts, auto-blocking, indexing |
| Testing | `TS` | Linting, browser tests, PSI validation |
| Documentation | `DC` | Block README, authoring guides |
| Setup | `T` | Project structure, configuration |
| Scaffolding | `SC` | New block directory creation |

---

## Notes

- [P] tasks = different files, no dependencies — can run in parallel
- Each user story should be independently verifiable on `localhost:3000`
- Test content must exist before implementation begins (CDD Phase 2 gate)
- Commit after each task or logical group
- Verify on localhost:3000 frequently — changes auto-reload
- Test responsive behavior across breakpoints (600px, 900px, 1200px)
- Keep eager-phase payload under 100kb (styles.css + scripts.js)
- Never modify `scripts/aem.js`
