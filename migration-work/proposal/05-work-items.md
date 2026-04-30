# Work Items

Work items organized by the 5 execution phases. Sizes per [tshirt-estimation-guide.md](../../.claude/skills/migration-planner/resources/tshirt-estimation-guide.md).

## Execution Phase 1: Discovery (DISC-*)

Refine pre-sales plan into final work plan. Stakeholder-led; validation of every LOW-confidence assumption in [02-design-system-assessment.md](02-design-system-assessment.md).

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|---|---|---|---|---|---|
| DISC-01 | Stakeholder kickoff: scope confirmation, roles, review cadence | — | S | — | Workshop |
| DISC-02 | Collect vendor snippet manifest (OneTrust, Salesforce login/chat, Qualtrics, Mapbox, DTM, GTM, ContentSquare, Target, ad pixels, PriceSpider, ssapi) — owner per snippet + expected placement | integration | M | DISC-01 | Client handoff + stakeholder confirm |
| DISC-03 | Backend architecture decision: e-commerce scope (minicart keep/defer/drop) | backend | S | DISC-01 | Architecture review |
| DISC-04 | Re-sample & scrape 3 unscraped URL groups (`healthcare-professionals`, `faq`, `real-people-real-success`) | organism | S | DISC-01 | page-import skill |
| DISC-05 | Validate organism catalog from 28 bat-* Handlebars components against full site traffic | organism | M | DISC-04 | Agent analysis + stakeholder review |
| DISC-06 | Template metadata audit (verify only 3 distinct templates in AEM) | template | S | DISC-01 | CMS query |
| DISC-07 | Confirm Santral font licensing + hosting plan | atom | XS | DISC-01 | Design + legal |
| DISC-08 | Accessibility acceptance criteria lock (WCAG 2.2 AA; specific screen-reader matrix) | a11y | S | DISC-01 | Stakeholder review |
| DISC-09 | Redirect map source + final URL conventions (locale prefix, trailing slash) | content | S | DISC-01 | SEO review |
| DISC-10 | Content freeze strategy + author training plan | content | M | DISC-01 | Workshop |
| DISC-11 | Performance budget approval (mobile LCP < 2.5s, CLS < 0.1, Lighthouse 100 gate) | perf | XS | DISC-01 | Sign-off |
| DISC-12 | Rollback plan + hypercare scope (1–2 weeks post-launch) | process | XS | DISC-01 | Sign-off |
| DISC-13 | Locked Phase 2+3+4 work plan with final t-shirts | — | M | DISC-02…12 | migration-discovery skill |

**Phase 1 total:** 13 items · 3 XS, 5 S, 5 M; midpoint ~36h, max ~48h.

## Execution Phase 2: Design System Build (DS-*)

Build the normalized design system in Pencil, iterating from raw designlang outputs.

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|---|---|---|---|---|---|
| DS-01 | Audit raw designlang `zonnic-ca-design-tokens.json` (forensic multi-level) | foundation | M | DISC-13 | migration-design-system |
| DS-02 | Cluster 27 colors → 12 primitive + 8 semantic tokens (document rationale) | foundation | M | DS-01 | Audit + Pencil variable entry |
| DS-03 | Fix 1 WCAG contrast pair + verify no new failures | foundation | XS | DS-02 | designlang + axe |
| DS-04 | Define 2-family type stack (Santral + fallback) + host licensing + `@font-face` | atom | M | DISC-09 | CSS + font fallback technique |
| DS-05 | Reduce 15 sizes → 7-step scale; 8 weights → 4; update all headings | atom | M | DS-04 | Audit + Pencil entry |
| DS-06 | Snap spacing to 8 px grid (14 steps); remove 13 one-off values | foundation | S | DS-01 | Audit |
| DS-07 | Consolidate 10 shadows → 3 (sm/md/lg) | foundation | S | DS-01 | Audit |
| DS-08 | Merge overlapping radii (7 → 4 canonical) | foundation | XS | DS-01 | Audit |
| DS-09 | Write full `:root` token set in `styles/styles.css` (eager phase, < 8 KB) | atom | M | DS-02…08 | EDS convention |
| DS-10 | Motion tokens: 3 durations + 2 easings (drop unused keyframes) | foundation | S | DS-01 | Audit |
| DS-11 | Create Pencil atom frames (button, link, input, headline, body) | atom | S | DS-09 | Pencil MCP |
| DS-12 | Create Pencil molecule frames (blurb, blog-stub, CTA group, form field, FAQ row) | molecule | M | DS-11 | Pencil MCP |
| DS-13 | Create Pencil organism frames for top 10 blocks | organism | L | DS-12 | Pencil MCP |
| DS-14 | Design review checkpoint + revision | — | M | DS-13 | Stakeholder review |
| DS-15 | Design system sign-off gate | — | XS | DS-14 | Sign-off |

**Phase 2 total:** 15 items · 3 XS, 4 S, 7 M, 1 L; midpoint ~84h, max ~116h.

## Execution Phase 3: Site Build (BUILD-*)

SDD/speckit methodology per block. Order below is build-order-sensitive (global chrome first, then content, then specialized).

### BUILD-CHROME-* (global chrome)

| ID | Description | Size | Dependencies |
|---|---|---|---|
| BUILD-CHROME-01 | Scaffolding: confirm `head.html`, `.hlxignore`, eager/lazy/delayed split | S | DS-15 |
| BUILD-CHROME-02 | `styles/styles.css` + `styles/lazy-styles.css` — integrate token set | S | DS-15 |
| BUILD-CHROME-03 | `fonts.css` + font fallback technique (no preload) | S | DS-04 |
| BUILD-CHROME-04 | `scripts/scripts.js` — button auto-decoration + icon system confirmation | S | BUILD-CHROME-02 |
| BUILD-CHROME-05 | `scripts/delayed.js` — hooks for tag managers + consent gating | S | — |
| BUILD-CHROME-06 | `header` block — adapt for multi-level nav + account menu + minicart trigger | M | BUILD-CHROME-02 |
| BUILD-CHROME-07 | `footer` block — adapt for multi-column + legal + social | S | BUILD-CHROME-02 |
| BUILD-CHROME-08 | `age-gate` block (new, interactive, cookie-driven) | L | BUILD-CHROME-02 |
| BUILD-CHROME-09 | `announcement-bar` block (new, simple) | S | BUILD-CHROME-02 |
| BUILD-CHROME-10 | `location-selector` block + shared `modal` container | M | BUILD-CHROME-02 |

**BUILD-CHROME subtotal:** 10 items · 7 S, 2 M, 1 L; midpoint ~45h.

### BUILD-CONTENT-* (content organisms)

| ID | Description | Size | Dependencies |
|---|---|---|---|
| BUILD-CONTENT-01 | `hero` block — flesh out scaffold (+ variants: dark, split, centered) | M | BUILD-CHROME-02 |
| BUILD-CONTENT-02 | `masthead-card` block (new) | M | BUILD-CHROME-02 |
| BUILD-CONTENT-03 | `blurb-card` block (new) | S | BUILD-CHROME-02 |
| BUILD-CONTENT-04 | `cards (blog)` variant — adapt existing `cards` block | S | BUILD-CHROME-02 |
| BUILD-CONTENT-05 | `contact-card` block (new) | S | BUILD-CHROME-02 |
| BUILD-CONTENT-06 | `faq` block (new, accordion, a11y) | M | BUILD-CHROME-02 |
| BUILD-CONTENT-07 | `cta` block (new, variants: default / logged-in / account) | M | BUILD-CHROME-02 |
| BUILD-CONTENT-08 | `text (box)` variant | XS | BUILD-CHROME-02 |
| BUILD-CONTENT-09 | `signup-form` block + variants (newsletter, autofill-login) | L | BUILD-CHROME-02 |
| BUILD-CONTENT-10 | `login-form` block + `modal` wrapper | L | BUILD-CHROME-10 |
| BUILD-CONTENT-11 | `password-reset-form` block | M | BUILD-CONTENT-10 |

**BUILD-CONTENT subtotal:** 11 items · 1 XS, 3 S, 5 M, 2 L; midpoint ~76h.

### BUILD-SPECIAL-* (specialized)

| ID | Description | Size | Dependencies |
|---|---|---|---|
| BUILD-SPECIAL-01 | `product-carousel` block (new, interactive, scroll-snap) | L | BUILD-CHROME-02 |
| BUILD-SPECIAL-02 | `tabbed-carousel` block (new, interactive, complex) | XL | BUILD-CONTENT-01 |
| BUILD-SPECIAL-03 | `product-hero` block (new, commerce — **conditional**) | L | DISC-03 |
| BUILD-SPECIAL-04 | `product-card` block (new, commerce — **conditional**) | S | DISC-03 |
| BUILD-SPECIAL-05 | `store-locator` block (new, Mapbox + filter) | XL | BUILD-INT-09 |
| BUILD-SPECIAL-06 | `minicart` block (commerce — **conditional**, defer unless DISC-03 says keep) | XL | DISC-03 |

**BUILD-SPECIAL subtotal (full scope):** 6 items · 1 S, 2 L, 3 XL; midpoint ~124h; **minus deferred** (if minicart/product-hero/product-card dropped): ~68h.

### BUILD-TMPL-* (templates + auto-blocking)

| ID | Description | Size | Dependencies |
|---|---|---|---|
| BUILD-TMPL-01 | `generic-template` — default template, relies on section metadata only | XS | — |
| BUILD-TMPL-02 | `blog-article-template` — auto-block `article-header` (title + hero + date + author) | S | BUILD-CONTENT-01 |
| BUILD-TMPL-03 | `non-branded-generic-template` — remove header + footer for standalone landing | S | BUILD-CHROME-06, 07 |
| BUILD-TMPL-04 | Authoring guides per template (doc + examples + screenshots) | M | BUILD-TMPL-01..03 |

**BUILD-TMPL subtotal:** 4 items · 1 XS, 2 S, 1 M; midpoint ~15h.

### BUILD-INT-* (integrations — client-provided snippets, drop-in only)

**Scope note:** third-party integrations are out of scope as full builds. The client supplies each vendor's HTML/JS snippet; the migration team places it in the correct load phase (`delayed.js`, a specific block template, or the eager path if a vendor strictly demands it). Per-snippet work is XS by default; Salesforce forms get a small S bump because the block needs the endpoint wired.

| ID | Description | Size | Dependencies |
|---|---|---|---|
| BUILD-INT-01 | Drop Adobe DTM snippet into `delayed.js` | XS | BUILD-CHROME-05, DISC-02 |
| BUILD-INT-02 | Drop Google Tag Manager snippet into `delayed.js` | XS | BUILD-CHROME-05, DISC-02 |
| BUILD-INT-03 | Drop OneTrust snippet (eager OR `delayed.js` per vendor) + verify consent cookie gates downstream | S | BUILD-CHROME-05, DISC-02 |
| BUILD-INT-04 | Drop ContentSquare snippet into `delayed.js` | XS | BUILD-CHROME-05, DISC-02 |
| BUILD-INT-05 | Drop Qualtrics snippet into `delayed.js` + CSS override to prevent visual leakage | XS | BUILD-CHROME-05, DISC-02 |
| BUILD-INT-06 | Drop Salesforce login + signup + password-reset snippets into form blocks; wire form POST endpoints | S | BUILD-CONTENT-09/10/11, DISC-02 |
| BUILD-INT-07 | Drop Salesforce chat snippet into `delayed.js` + CSS positioning | XS | DISC-02 |
| BUILD-INT-08 | Drop `ssapi.vuse.com` snippet into relevant block (if retained per DISC-02) | XS | DISC-02 |
| BUILD-INT-09 | Drop Mapbox snippet into `store-locator` block + lazy-load via `IntersectionObserver` | S | DISC-02, BUILD-SPECIAL-05 |
| BUILD-INT-10 | Drop PriceSpider snippet into product pages (if retained per DISC-02) | XS | DISC-02 |
| BUILD-INT-11 | Adobe RUM — confirm existing `aem.js` beacon is preserved | XS | — |
| BUILD-INT-12 | Drop Adobe Target snippet via `delayed.js` (accept flicker) OR eager if business accepts perf trade-off | XS | BUILD-CHROME-05, DISC-02 |
| BUILD-INT-13 | Self-host `unpkg.com` / `npmcdn.com` assets (kill second-origin DNS cost) | XS | — |
| BUILD-INT-14 | Performance budget verification per snippet (before/after Lighthouse on every template) | M | all BUILD-INT-* |

**BUILD-INT subtotal:** 14 items · 11 XS, 2 S, 1 M; midpoint ~30h, max ~40h.

### Phase 3 grand total

| Section | Midpoint | Max |
|---|---:|---:|
| BUILD-CHROME | 45h | 60h |
| BUILD-CONTENT | 76h | 104h |
| BUILD-SPECIAL (full scope) | 124h | 176h |
| BUILD-TMPL | 15h | 20h |
| BUILD-INT | 30h | 40h |
| **Total** | **~290h** | **~400h** |

If minicart + product-hero + product-card are deferred/dropped (DISC-03 decision), Phase 3 drops to **~234h midpoint** / **~320h max**.

## Execution Phase 4: Content Migration (MIGRATE-*)

Agentic batch via `page-import` skill with review checkpoints per template batch.

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|---|---|---|---|---|---|
| MIGRATE-01 | Migration orchestrator script (loops pages through page-import) | tool | M | BUILD-TMPL-04 | content-driven-development |
| MIGRATE-02 | Generic-template batch 1 (~30 pages: homepage, why, what-is, quit-zone, etc.) | content | M | MIGRATE-01 | page-import |
| MIGRATE-03 | Review checkpoint + fix-forward for batch 1 | — | M | MIGRATE-02 | Stakeholder review |
| MIGRATE-04 | Generic-template batch 2 (~30 pages: testimonials, healthcare-professionals, insurance, etc.) | content | M | MIGRATE-03 | page-import |
| MIGRATE-05 | Review checkpoint + fix-forward for batch 2 | — | M | MIGRATE-04 | Stakeholder review |
| MIGRATE-06 | Blog batch (~40 pages) | content | L | MIGRATE-01 | page-import |
| MIGRATE-07 | Review checkpoint + fix-forward for blog | — | M | MIGRATE-06 | Stakeholder review |
| MIGRATE-08 | FAQ batch (~12 pages; may split into two sub-batches) | content | M | MIGRATE-01 | page-import |
| MIGRATE-09 | Review checkpoint + fix-forward for FAQ | — | S | MIGRATE-08 | Stakeholder review |
| MIGRATE-10 | Specialized pages (store-locator, newsletter, sign-up, contact, email-verification) | content | M | MIGRATE-01 | page-import |
| MIGRATE-11 | Review checkpoint + fix-forward for specialized | — | S | MIGRATE-10 | Stakeholder review |
| MIGRATE-12 | SEO redirect mapping (source URLs → EDS URLs) + `redirects.xlsx` | SEO | S | — | EDS redirects |
| MIGRATE-13 | Media asset migration (images folder → AEM DAM or static CDN) | content | S | — | Bulk upload |
| MIGRATE-14 | Metadata import (bulk-metadata sheet: title, description, OG, template) | content | S | — | EDS bulk-metadata |

**Phase 4 total:** 14 items · 0 XS, 4 S, 8 M, 1 L; midpoint ~72h, max ~100h.

## Execution Phase 5: Testing and UAT (TEST-*)

| ID | Description | Size | Dependencies |
|---|---|---|---|
| TEST-01 | Visual regression setup — designlang `visual-diff` between source and EDS | M | MIGRATE-11 |
| TEST-02 | Visual regression run across 25 representative templates | M | TEST-01 |
| TEST-03 | Lighthouse 100 verification — every template on production preview | S | MIGRATE-11 |
| TEST-04 | WCAG 2.2 AA full audit (automated axe + manual screen-reader) | M | MIGRATE-11 |
| TEST-05 | Performance budget verification (mobile LCP + CLS per template) | S | TEST-03 |
| TEST-06 | Cross-browser + device matrix (Safari iOS, Chrome Android, desktop evergreen) | M | TEST-03 |
| TEST-07 | Content author UAT — training + feedback + iteration | M | MIGRATE-11 |
| TEST-08 | Integration end-to-end: login flow, newsletter signup, password reset, chat | M | BUILD-INT-12 |
| TEST-09 | SEO checklist: redirects, canonical, sitemap, structured data, hreflang | S | MIGRATE-12 |
| TEST-10 | Analytics verification: dataLayer events, Adobe Target experiences | S | BUILD-INT-14 |
| TEST-11 | Go-live checklist execution (DNS, CDN, monitoring, rollback drill) | S | all TEST-* |
| TEST-12 | Hypercare period (1–2 weeks post-launch) + fix-forward | M | TEST-11 |

**Phase 5 total:** 12 items · 0 XS, 5 S, 7 M; midpoint ~72h, max ~96h.

## Summary

| Phase | Items | XS | S | M | L | XL |
|-------|------:|---:|---:|---:|---:|---:|
| 1. Discovery | 13 | 3 | 5 | 5 | 0 | 0 |
| 2. Design System Build | 15 | 3 | 4 | 7 | 1 | 0 |
| 3. Site Build | 45 | 13 | 14 | 13 | 4 | 1 |
| 4. Content Migration | 14 | 0 | 4 | 8 | 1 | 0 |
| 5. Testing & UAT | 12 | 0 | 5 | 7 | 0 | 0 |
| **Total** | **99** | **19** | **32** | **40** | **6** | **1** |

Grand total midpoint: **~488h** (about 12 dev-weeks single-threaded).
Grand total max: **~676h** (about 17 dev-weeks single-threaded).
Add 15% contingency buffer → **~560h – ~780h** = **~14–19 weeks sequential** or **~8–11 weeks parallel with a team of 4**.
