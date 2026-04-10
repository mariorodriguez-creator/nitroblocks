# Migration Gap Analysis

**Source site:** https://www.astrazeneca.com/
**Date:** 2026-04-09
**Templates analyzed:** 19 (full site — all sections, no sampling)
**Unique patterns found:** 26
**Pages in scope:** 1,162 (1,083 HTML pages fingerprinted, 6.8% not in mirror)

---

## Summary

| Tier | Count | Description |
|------|-------|-------------|
| Tier 1 — Covered | 5 | Existing blocks handle these, no code changes |
| Tier 2 — Variant | 10 | Existing blocks, need CSS variant or minor JS tweak |
| Tier 3 — New Block | 11 | Must be built from scratch |

---

## Tier 3 — New Blocks

| # | Pattern | Proposed Block Name | Frequency | Templates | Effort | Notes |
|---|---------|-------------------|-----------|-----------|--------|-------|
| 1 | Mega navigation with search | `header` (complete rebuild) | All pages | All | **L** | Multi-tier dropdown, global search, country switcher, sticky. The boilerplate header must be fully replaced. Single highest-risk component in the migration. |
| 2 | Site footer with link groups | `footer` (complete rebuild) | All pages | All | **M** | Multi-column link groups, logo, social icons, legal text, Veeva ID. Boilerplate footer must be replaced. |
| 3 | Filterable content list | `filterable-list` | 4 | T3, T4, country-sites | **L** | Keyword search + multi-tag + year filters driving a paginated results list. Requires EDS query-index integration. High JS complexity; must be accessible (ARIA live regions for results updates). |
| 4 | Image panel feature (split band) | `image-panel` | 6 | T1, T2, T5, T6 | **M** | Full-width band: full-bleed background image one half, text + CTA the other. Left/right variants. `object-fit: cover` responsive image. Includes CEO quote variant with blockquote. |
| 5 | Featured story + trending editorial | `featured-stories` | 4 | T1, T2, T4 | **M** | One large featured article card (image + title + tag) + 2–3 smaller trending teasers in a vertical list. Reads from query-index. |
| 6 | Live stock price ticker | `stock-ticker` | 1 | T6 | **L** | Real-time prices for LSE, NASDAQ, NYSE, OMX. Requires third-party market-data API integration. Must handle rate limits and failure states gracefully. High regulatory sensitivity for accuracy. |
| 7 | Interactive geospatial map | `data-map` | 1 | T7 | **L** | Interactive map (replace OpenLayers with Leaflet.js or Google Maps), layer controls, data overlay, region search. Data source is a structured JSON dataset. |
| 8 | Interactive data visualization dashboard | `data-dashboard` | 1 | T7 | **L** | Risk-quotient chart + sortable/filterable data table. Replace Vue/Vuetify with vanilla JS + lightweight chart library. Dataset: ~40 substances × ~122 regions. |
| 9 | Media image/broadcast gallery | `media-gallery` | 1 | T8 | **M** | Responsive masonry image grid with search/tag filters. Lightbox on click (full image + download). Replaces Salvatorre layout + jQuery lightbox. |
| 10 | External link interstitial modal | `outbound-modal` (auto-block) | All | All | **S** | Auto-block that wraps external links site-wide. Shows "You are leaving AstraZeneca.com" modal with continue/cancel. Could be a `buildAutoBlocks()` addition in `scripts.js`. |
| 11 | Country / language selector | `language-selector` | 1 | T9 | **S** | Grid of flag buttons selecting a language, revealing a content section. AZ Suppliers only — low priority. |

---

## Tier 2 — Variant Blocks

| # | Pattern | Base Block | Proposed Variant | Frequency | Templates | Effort | Notes |
|---|---------|-----------|-----------------|-----------|-----------|--------|-------|
| 1 | Full-width hero banner | `hero` (local) | `hero (image-swap)` | 8 | T2–T9 | **S** | Add responsive dual-image swap (desktop/mobile). Hero block exists locally but needs this variant. |
| 2 | Cards / content collection grid | `cards` (local) | `cards (therapy)` | 7 | Multiple | **S** | 6-up therapy area cards; minor layout CSS only. |
| 3 | People profile grid | `cards` (local) | `cards (people)` | 2 | T2 | **S** | Headshot image + name + title. New CSS variant of cards. |
| 4 | Events calendar list | `cards` (local) | `cards (events)` | 1 | T6 | **S** | Date-prominent cards with "Add to Calendar" link. Decorates date field to ISO `<time>` element. |
| 5 | Carousel of content cards | `carousel` (block-collection) | `carousel (content)` | 2 | T2 | **S** | Pull carousel from Block Collection; apply AZ brand styling. No JS changes needed. |
| 6 | FAQ / accordion list | `accordion` (block-collection) | `accordion (faq)` | 2 | T9 | **S** | Pull accordion from Block Collection. CSS-only variant for numbered FAQ style. |
| 7 | Executive quote / feature quote | `quote` (block-collection) | `quote (feature)` | 2 | T1, T2 | **M** | Add optional full-width background image and CTA button to the existing quote block. JS decoration change to support these fields. |
| 8 | Document download list | `table` (block-collection) | `table (downloads)` | 2 | T6 | **S** | Pull table block; add CSS to style year-grouped rows with PDF badge and file size. |
| 9 | In-page jump navigation | `tabs` (local) | `tabs (jump-nav)` | 2 | T2 | **S** | Convert the tabs block to render anchor links that smooth-scroll on click, becoming sticky on scroll. CSS + minor JS. |
| 10 | Tabbed panel (regional content) | `tabs` (block-collection) | `tabs (tab-panel)` | 2 | Terms, Global | **S** | Pull tabs block from Block Collection; apply AZ styling. Mobile collapses to dropdown selector. Full ARIA keyboard navigation required. |

---

## Tier 1 — Covered (no code changes needed)

Verify visual output against source after applying global design tokens.

| # | Pattern | Block | Frequency | Notes |
|---|---------|-------|-----------|-------|
| 1 | Long-form rich text body | Default content | 6 templates | Paragraphs, headings, inline images, footnotes — all default content in EDS |
| 2 | Section / page header with text | Default content (h2 + p) | All | Standard h2 + paragraph, styled via global CSS tokens |
| 3 | Breadcrumb navigation | Auto-block (scripts.js) | 8 templates | Auto-generate from URL path in `buildAutoBlocks()` — no authored content needed |
| 4 | Email signup / alert subscription | `form` (block-collection) | 1 | Single-field email form — handled by Block Collection form block |
| 5 | Social sharing strip | Default content (links) | 3 templates | Simple link list decorated with icons; can be styled as default content with CSS |

---

## Global Style Observations

Observations from the source site's visual DNA that will inform design token extraction:

- **Colors:** Deep navy blue (`#003366` approx), AstraZeneca purple/mulberry (`#83003f` approx), bright gold/yellow (`#d4a017` approx) for accents, white and light grey for backgrounds, dark charcoal for body text
- **Typography:** Custom sans-serif (AZ brand font stack), large bold headings (60px+), generous line-height. Bold straplines at ~24px. Body text at 16–18px. All-caps labels for categories.
- **Spacing:** Generous section padding (~80–120px vertical), constrained content width (~1200px max), grid gaps ~24–32px
- **Imagery:** Full-bleed background images with overlay tints. Responsive images with `object-fit: cover`. Square and 16:9 aspect ratio cards.
- **Buttons:** Rounded pill buttons in primary (navy), inverse (white outline), and mulberry variants. Arrow icon inside button for primary CTAs.
- **Other:** CSS `object-fit` polyfill used heavily (can be removed for modern browsers). Modal overlay with dark scrim. Sticky navigation bar on scroll.

---

## Template Readiness Matrix

| Template | Tier 3 Blockers | Tier 2 Needed | Ready for Import? |
|----------|-----------------|--------------|-------------------|
| Homepage (T1) | `image-panel`, `featured-stories` | `hero (image-swap)`, `quote (feature)`, `cards (therapy)` | No — 2 Tier-3 blockers |
| Hub Page (T2) | `image-panel` | `hero (image-swap)`, `tabs (jump-nav)`, `carousel`, `cards (people)` | No — 1 Tier-3 blocker |
| Article Detail (T3) | — | `hero (image-swap)` | **Yes** (after hero variant) |
| Filtered Listing (T4) | `filterable-list` | `hero (image-swap)` | No — 1 Tier-3 blocker |
| Press Release Detail (T5) | — | `hero (image-swap)` | **Yes** (after hero variant) |
| Investor Relations (T6) | `stock-ticker` | `hero (image-swap)`, `cards (events)`, `table (downloads)` | No — 1 Tier-3 blocker |
| Sustainability Dashboard (T7) | `data-map`, `data-dashboard` | — | No — 2 Tier-3 blockers |
| Media Library (T8) | `media-gallery` | — | No — 1 Tier-3 blocker |
| Simple Text / Legal (T9) | — | `accordion (faq)` | **Yes** (after accordion) |
| Terms & Conditions | — | `tabs (tab-panel)` | **Yes** (after tabs variant) |
| Global | — | `tabs (tab-panel)` | **Yes** (after tabs variant) |
| Careers | — | `hero (image-swap)`, `carousel (content)` | **Yes** (after Phase 3) |
| AZ Suppliers | `language-selector` | `accordion (faq)` | No — 1 Tier-3 blocker |
| Global (all) | `header`, `footer`, `outbound-modal` | — | No — global blockers |

---

## Recommended Build Order

Priority: unblock the most templates, highest frequency first.

**Phase 1 — Foundation (unblocks global + article/text pages)**
1. `header` (mega-nav rebuild) — blocks all templates
2. `footer` (rebuild) — blocks all templates
3. `hero (image-swap)` variant — unblocks T2, T3, T5, T9 (8 templates)
4. `outbound-modal` (auto-block) — global behaviour, ~1 day

**Phase 2 — Core content templates**
5. `image-panel` — unblocks T1 (Homepage) and T2 (Hub pages)
6. `filterable-list` — unblocks T4 (most content-volume templates: WSCD, Media Centre)
7. `featured-stories` — unblocks T1 homepage editorial section
8. `cards` variants (therapy, people, events) — needed for multiple templates

**Phase 3 — Specialised templates**
9. `quote (feature)` variant — homepage CEO quote, Our Company
10. `tabs (jump-nav)` variant — Our Company, Therapy Areas
11. `carousel` (from block collection, brand-styled) — Our Company, R&D
12. `accordion (faq)` — AZ Suppliers, Investor Relations
13. `table (downloads)` — Investor Relations, Media Centre
14. `tabs (tab-panel)` — Terms & Conditions, Global (regional content)

**Phase 4 — High-complexity unique features**
14. `stock-ticker` — Investor Relations (live data integration, highest dev risk)
15. `media-gallery` — Media Centre image library
16. `data-map` — Sustainability dashboard
17. `data-dashboard` — Sustainability EcoPharmacoVigilance dashboard
18. `language-selector` — AZ Suppliers (lowest priority, 1 page type)

---

## Structural Decisions

### Decision 1: Mega-nav — extend boilerplate vs. full rebuild

- **Decision:** How to implement the AstraZeneca mega-navigation
- **Options:**
  - A) Extend boilerplate `header` block with AZ mega-menu authored in a nav fragment
  - B) Build a new `header` block from scratch with full multi-tier menu logic
- **Recommendation:** Option B — full rebuild. The boilerplate header is a 2-level nav; AZ has 4+ levels with spotlight content and a country switcher. Extending it would be more complex than rebuilding. Author the menu structure as a hierarchical list in a navigation Google Doc/Word Doc.
- **Impact:** Largest single block. Estimated 5–8 days. All templates blocked until done.

### Decision 2: `filterable-list` — server-side index vs. client-side JS filter

- **Decision:** How to implement search + filter on content listing pages
- **Options:**
  - A) Use EDS query-index JSON API; client-side JS fetches all results, filters in the browser
  - B) Integrate with a search service (Algolia, Adobe Search, FastAPI) for server-side filtering
- **Recommendation:** Option A for launch (query-index; sufficient for <5,000 items). Flag Option B for future if content volume grows significantly. EDS query-index supports pagination natively.
- **Impact:** Drives What Science Can Do listing, Media Centre, and Country Sites. Accessible filtering is critical — ARIA live regions required.

### Decision 3: `image-panel` — authored block vs. section metadata

- **Decision:** Should the image-panel split be a block or a styled section?
- **Options:**
  - A) A dedicated `image-panel` block (image + text as rows in a block table)
  - B) Default content section with `Style: image-left` or `image-right` section metadata
- **Recommendation:** Option A (dedicated block). Authors need explicit image positioning and multiple CTAs within the panel — section metadata alone would be too limiting. Content model is simple: Row 1 = image, Row 2 = heading + text + CTA.
- **Impact:** Used on 6 templates; consistency of authoring is important.

### Decision 4: `stock-ticker` — embed third-party widget vs. custom integration

- **Decision:** Live stock price implementation strategy
- **Options:**
  - A) Embed a third-party stock widget (e.g., TradingView, Bloomberg widget)
  - B) Custom API integration with a market data provider (Refinitiv, IEX Cloud, etc.)
  - C) Partner with AZ's existing market data vendor (likely already in use)
- **Recommendation:** Option C — confirm AZ's existing market data provider and integrate via their JS SDK or REST API. Load in `delayed.js` to avoid LCP impact. Third-party embeds (Option A) often perform poorly and may introduce CLS.
- **Impact:** Investor Relations template is completely blocked until resolved. High contractual/compliance sensitivity.

### Decision 5: Sustainability dashboards — rebuild vs. embed vs. iframe

- **Decision:** How to handle the Vuetify/OpenLayers interactive dashboards
- **Options:**
  - A) Rebuild in vanilla JS + Leaflet/Chart.js (full EDS compatibility, best performance)
  - B) Iframe the existing React/Vue app (quick, but breaks EDS performance model)
  - C) Host the Vue app as a separate micro-frontend, link from sustainability pages
- **Recommendation:** Option A for `data-map` (Leaflet is lightweight, ~42kb gzipped). For `data-dashboard`, vanilla JS + a minimal chart library (Chart.js via `loadScript()`) is feasible but involves L-tier effort. Option B/C is a reasonable interim if timeline is tight — declare as technical debt.
- **Impact:** These two blocks serve very few pages (1–3 URLs) but have high complexity. If going Option A, load all map/chart libraries in the block's JS, not `head.html`.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Mega-nav underestimated — multi-tier dropdowns + mobile + search + sticky + country switcher | **H** | **H** | Prototype the nav first. Block all other template work until nav is approved. Plan for 5–8 days. |
| `filterable-list` requires query-index to be set up and published content in correct metadata format | **M** | **H** | Define query-index columns (title, date, tags, path) in Week 1. Create test content in drafts immediately. |
| Stock ticker requires live API contract — may have legal/compliance approval cycle | **M** | **H** | Engage AZ's IR tech team immediately. Use static placeholder data during development and testing. |
| Unaudited pages (country-site-specific layouts, PDF viewer, interactive pipeline tool) | **L** | **M** | Full 1,083-page analysis complete. One new pattern discovered (tabs panel, Tier 2, 1 pt). Country-sites confirmed to share standard editorial patterns. Risk substantially reduced vs. stratified analysis. |
| Responsive image handling — AZ uses JS-based `image-replace` polyfill; EDS uses `srcset`. Dual hero images may cause CLS. | **H** | **M** | Use EDS `<picture>` element + `srcset`. Explicitly remove unused image from DOM in block decoration to avoid downloading both breakpoints. |
| Content migration friction — AZ authors use AEM Classic; Word/Google Docs authoring is unfamiliar | **M** | **M** | Run authoring workshop early. Create authored examples of every block type in a Google Drive draft folder. |
| Sustainability dashboards: Vue/Vuetify rebuild in vanilla JS may introduce bugs in complex data logic | **L** | **H** | Consider iframe interim for dashboards until vanilla rebuild is validated. Prioritize the archive dashboard (read-only, lower risk) first. |
| Performance regression from `filterable-list` fetching large query-index JSON | **M** | **M** | Paginate index fetches. Use `IntersectionObserver` to load results only when list scrolls into view. Cap index fetch at first 1,000 items; load more on demand. |
