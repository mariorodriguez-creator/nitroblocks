---
description: "Task list for PDP template (666-pdp-template)"
---

# Tasks: PDP Template

**Input**: `.specify/specs/666-pdp-template/`  
**Prerequisites**: `plan.md`, `spec.md`, `design.md`, draft test content in `drafts/dev/`  
**Optional**: `data-model.md`, `research.md`, `quickstart.md`

**Complexity**: **Complex** (multiple new integrations: local block + Block Collection baselines + core script + global section styles; 18 implementation tasks excluding meta)

## Format: `[Category-ID] [P?] Description with file path`

- **Category Prefixes**: BJ (Block JS), BC (Block CSS), CS (Core Scripts), GS (Global Styles), CT (Content), IN (Integration), TS (Testing), DC (Documentation), T (Setup), SC (Scaffolding)
- **[P]**: Can run in parallel (different files, no unmet dependencies)
- **design.md**: `product-detail` BJ/BC must match Code Scaffold + CSS Skeleton + **Layout Matrix** (mobile-first: base → 600px → 900px → 1200px where specified)

---

## Phase 1: Setup

**Purpose**: CDD gate and pattern review before code lands

- [X] T001 Verify draft test content exists: `drafts/dev/pdp-spearmint.plain.html` and `drafts/dev/fragments/newsletter-signup.plain.html` (paths match `quickstart.md`)
- [X] T002 Review local patterns in `blocks/columns/columns.js`, `blocks/fragment/fragment.js`, and Block Collection baselines for `carousel`, `accordion`, `video` (per `research.md` / `plan.md`)

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Collection blocks on disk, `product-detail` scaffold, PDP hero guard — **no story work until checkpoint**

- [X] IN001 [P] Add baseline Block Collection **`carousel`** implementation: `blocks/carousel/carousel.js`, `blocks/carousel/carousel.css` (from [AEM Block Collection](https://www.aem.live/developer/block-collection))
- [X] IN002 [P] Add baseline Block Collection **`accordion`** implementation: `blocks/accordion/accordion.js`, `blocks/accordion/accordion.css`
- [X] IN003 [P] Add baseline Block Collection **`video`** implementation: `blocks/video/video.js`, `blocks/video/video.css`
- [X] SC001 Create **`product-detail`** scaffold: `blocks/product-detail/product-detail.js` (default export `decorate`), `blocks/product-detail/product-detail.css` (scoped to `.product-detail`)
- [X] CS001 Update `scripts/scripts.js` — **PDP / hero guard** per `research.md` R-002: do not run `buildHeroBlock` when `document.body.classList` contains `pdp` (from template meta) **or** when `main` already contains `.product-detail` (draft fallback)

**Checkpoint**: Foundation ready — user-story implementation can begin

---

## Phase 3: User Story — Product detail block (AC1, FR-001 — FR-003, NFR-001 — NFR-003)

**Goal**: Image gallery (eager first image, lazy rest; thumbs; prev/next; touch swipe where supported), expandable description with Placeholders `readMore` / `readLess`, buy panel structure per `design.md`

**Independent test**: Open `http://localhost:3000/drafts/dev/pdp-spearmint` — first section matches **Product Detail** Code Scaffold after decoration; keyboard operable gallery and toggle

**File**: `blocks/product-detail/product-detail.js`

- [X] BJ001 Implement `decorate(block)` for `product-detail`: map authored two-column table to gallery + info column; wrap gallery, main/thumbs, arrows; description wrapper + toggle; buy-panel wrapper; wire placeholder labels for read more/less; **ARIA** for gallery and expanded state; loading attributes per NFR-001

**File**: `blocks/product-detail/product-detail.css`

- [X] BC001 [P] Implement **`product-detail`** styles per `design.md` **CSS Skeleton** and **Layout Matrix** (including desktop row layout vs mobile column); block-scoped selectors only

---

## Phase 4: User Story — Carousel product variant (AC2, FR-004)

**Goal**: `.carousel.product` card layout, borders, CTA treatment, responsive flex behaviour per `design.md`

**Independent test**: PDP draft carousel section — cards match Layout Matrix at 375 / 768 / 1200

- [X] BC002 [P] Add **`carousel.product`** variant styles in `blocks/carousel/carousel.css` (and extend `carousel.js` **only if** Collection default does not emit `.carousel-card` / structure assumed in `design.md`)

---

## Phase 5: User Story — FAQ accordion variant (AC3, FR-005)

**Goal**: `.accordion.faq` visual and spacing per `design.md`; section heading authored as default **H2** above block (per `research.md` R-008)

**Independent test**: FAQ section — expand/collapse, `+` / `−` treatment, keyboard focus

- [X] BC003 [P] Add **`accordion.faq`** variant styles in `blocks/accordion/accordion.css`; adjust `accordion.js` **only if** FAQ-specific DOM is required beyond Collection defaults

---

## Phase 6: User Story — Video, columns context, section shells (AC4, AC6, FR-006 — FR-008)

**Goal**: Autoplay/loop/muted MP4 in columns; `testimonial-teaser` and `newsletter` section backgrounds/layout; instructional **H3** step styling where needed

**Independent test**: Text+video columns on draft; fragment newsletter loads; testimonial section grey background

- [X] BJ002 [P] Verify or adjust `blocks/video/video.js` / `video.css` so self-hosted MP4 in a columns cell is **autoplay + loop + muted** and lazy-friendly (NFR-005); no visible controls per spec
- [X] GS001 Update **`styles/lazy-styles.css`** (prefer lazy for below-fold): `.section.testimonial-teaser`, `.section.newsletter`, centred range-intro / label-download typography per `design.md` **Default Content** sections; add PDP **columns** instructional `h3` / arrow-link rules from **Columns — Text + Video** in `design.md` if not scoped in `blocks/columns/columns.css`
- [X] BC004 [P] Extend `blocks/columns/columns.css` **only if** PDP column tweaks cannot live in `lazy-styles.css` without leakage

---

## Phase 7: User Story — Template metadata & polish (AC5, AC7, FR-010)

**Goal**: Default content sections render; full page responsive and accessible; no hard-coded user-visible strings in JS (Placeholders + authored content)

**Independent test**: Full PDP draft scroll; tab order; heading order; all interactive elements keyboard-accessible

- [X] CT001 [P] Ensure Placeholders (or project equivalent) define **`readMore`** and **`readLess`** keys used by `product-detail` (FR-002)
- [X] GS002 [P] Add **`design.md` token candidates** to `styles/styles.css` **only** for shared PDP/navy/green variables that multiple blocks need (keep eager payload minimal — prefer lazy or block-scoped when possible)
- [X] CT002 Re-verify `drafts/dev/pdp-spearmint.plain.html` against implemented blocks (fragment path `/drafts/dev/fragments/newsletter-signup`)

---

## Final Phase: QA & Polish

### Linting (required)

- [X] TS001 Run ESLint and fix violations: `npm run lint` (or `npm run lint:fix`)
- [X] TS002 [P] Confirm Stylelint clean via same lint pipeline

### Testing (required / applicable)

- [X] TS003 Browser test: `localhost:3000/drafts/dev/pdp-spearmint` at ~375px, ~768px, ~1200px; fragment newsletter; carousel arrows/scroll; FAQ; video plays muted
- [X] TS004 Performance: first gallery image eager, other images lazy; video not in eager path — align with NFR-001 / NFR-005 before PR PSI
- [X] TS005 Accessibility: keyboard gallery + description toggle + accordion; logical headings; authored `alt` on draft images

### Documentation (optional but recommended)

- [X] DC001 [P] Short authoring notes for `product-detail` table + PDP section order (project docs or `AGENTS.md` pointer)

**Checkpoint**: Lint green, manual/browser validation complete — ready for **`/speckit-implement`** then PR preview PSI

---

## Dependencies & Execution Order

1. **Phase 1** → Phase 2  
2. **Phase 2**: IN001 — IN003 and SC001 can run in parallel **[P]**; CS001 after or alongside (different file) **[P]**  
3. **Phase 3**: SC001 must exist before BJ001/BC001; **BJ001 + BC001 [P]** after Phase 2 checkpoint  
4. **Phases 4–6**: BC002, BC003, BJ002, GS001, BC004 mostly **[P]** once Phase 3 does not block selectors (carousel/accordion/video can proceed in parallel with Phase 3 **after** IN tasks — for safety, run Phase 3 product-detail first if shared tokens in GS002 would affect QA order; optional parallelization: Phase 4–5 with Phase 3 **[P]** on separate files)  
5. **Phase 7** → Final phase  
6. **TS\*** after implementation tasks for the same files are done

### Parallel opportunities

- **IN001 + IN002 + IN003 + SC001 + CS001** — distinct paths (all **[P]** in Phase 2)  
- **BJ001 + BC001** — **[P]** (product-detail JS/CSS)  
- **BC002 + BC003 + BJ002** — **[P]** after collection files exist  
- **TS001 + TS002** — **[P]** in Final Phase  

### TS006 (unit tests)

**Not included**: `product-detail` decoration is primarily DOM reshaping and wiring; no label-based config parsing per **Logic-Heavy Block Detection**. Revisit TS006 if extractable helpers (e.g. gallery index state) are refactored for testability.

---

## Task ID Reference

| Category | Prefix | Typical files |
|----------|--------|---------------|
| Block JS | BJ | `blocks/{name}/{name}.js` |
| Block CSS | BC | `blocks/{name}/{name}.css` |
| Core Scripts | CS | `scripts/scripts.js` |
| Global Styles | GS | `styles/styles.css`, `styles/lazy-styles.css` |
| Content | CT | `drafts/`, Placeholders |
| Integration | IN | Block Collection copy-in |
| Testing | TS | `npm run lint`, browser, PSI, a11y |
| Documentation | DC | Authoring docs |
| Setup | T | Verification |
| Scaffolding | SC | New block dirs |

---

## Notes

- Never modify `scripts/aem.js`  
- Block Collection files should match upstream behaviour; project changes stay in variant CSS/JS and `product-detail`  
- **`/speckit-implement`** executes tasks phase-by-phase and marks `[X]` in this file  
