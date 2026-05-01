# Work Items — Zonnic Canada Migration

T-shirt sizes per `tshirt-estimation-guide.md`. ID prefixes:
- `DISC-` Discovery
- `FOUND-` Foundations / Design System
- `ATOM-` Atom-level work
- `BLOCK-NEW-` New block development
- `BLOCK-ADAPT-` Adapt an existing block
- `TMPL-` Template (auto-blocking + authoring guide)
- `BUILD-INT-` Integration
- `MIGRATE-` Content migration
- `TEST-` Testing
- `OPS-` Go-live operations

Each row's "Methodology" cites the orchestrating skill where applicable.

---

## Execution Phase 1: Discovery (~80–120h, 2 weeks)

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|----|---|---|---|---|---|
| DISC-01 | Walk-through with Zonnic stakeholders + content authors; capture business goals and success metrics | — | M | — | scoping interviews |
| DISC-02 | Confirm Santral typeface license; obtain self-host package | foundations | S | — | brand team |
| DISC-03 | Audit Adobe Target experiment inventory; mark for migrate / retire | integrations | M | — | analytics team |
| DISC-04 | Audit OneTrust geo-config (Canadian groups); confirm consent rules | integrations | S | — | privacy/legal |
| DISC-05 | Confirm Salesforce Site API contract for sign-up + newsletter (auth, fields, error model) | integrations | M | DISC-01 | BAT platform team |
| DISC-06 | Confirm PriceSpider widget integration model + analytics event contract | integrations | S | — | commerce team |
| DISC-07 | Confirm Mapbox license (existing key transferable?) | integrations | XS | — | platform team |
| DISC-08 | Validate atomic inventory: run `identify-page-structure` per representative URL | organisms | M | DISC-01 | identify-page-structure skill |
| DISC-09 | Validate template inventory: confirm 8 templates suffice (vs. 23 path families) | templates | M | DISC-08 | scoping interviews |
| DISC-10 | Run full a11y audit (axe + manual) on representative pages | accessibility | M | — | eds-wcag skill |
| DISC-11 | Run public PSI audit on existing site (CrUX field data) for performance baseline | performance | S | — | testing-blocks skill |
| DISC-12 | Confirm SEO redirect map (slug changes? canonical updates?) | content | S | DISC-09 | scoping interviews |
| DISC-13 | Confirm content freeze and authoring training schedule | process | XS | — | scoping interviews |
| DISC-14 | Approve normalisation deltas (colors, type, spacing, etc.) | foundations | S | — | scoping interviews |
| DISC-15 | Approve work plan + commercial proposal (gate to Phase 2) | — | XS | all above | sign-off |

**Phase 1 effort: ~80–110h** (midpoint ≈ 95h) plus stakeholder calendar gating.

---

## Execution Phase 2: Design System Build (~90–130h, 2–3 weeks)

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|----|---|---|---|---|---|
| FOUND-01 | Define color tokens in `styles.css` (`:root`) | foundations | XS | DISC-14 | building-blocks skill |
| FOUND-02 | Define typography scale + font setup (font-fallback technique) | foundations | S | DISC-02 | building-blocks skill |
| FOUND-03 | Define spacing scale | foundations | XS | DISC-14 | building-blocks skill |
| FOUND-04 | Define shadow + radius + motion tokens | foundations | S | DISC-14 | building-blocks skill |
| FOUND-05 | Configure breakpoints + responsive utilities | foundations | XS | DISC-14 | building-blocks skill |
| FOUND-06 | Build full design system in **Pencil** (`.pen` files) — token entry, atom + molecule + organism frames | foundations | L | FOUND-01..05 | Pencil MCP |
| ATOM-01 | Default content styling (headings, body, emphasis, links, lists, blockquote) | atoms | S | FOUND-* | building-blocks skill |
| ATOM-02 | Button auto-decoration rules (primary / secondary / tertiary) | atoms | XS | FOUND-* | building-blocks skill |
| ATOM-03 | Icon system: SVG pipeline (`/icons/*.svg`) + replace Font Awesome | atoms | S | — | building-blocks skill |
| ATOM-04 | Image handling conventions (responsive, lazy, art direction) | atoms | XS | — | aem.live built-in |
| ATOM-05 | Form input + label + select + checkbox + radio styling | atoms | S | FOUND-* | building-blocks skill |
| ATOM-06 | Health-warning banner section style (regulator-mandated copy) | atoms | XS | FOUND-* | eds-styles skill |
| ATOM-07 | Section banding utilities (mint, navy, light-grey, neutral) | atoms | XS | FOUND-* | building-blocks skill |
| FOUND-07 | Stakeholder review + sign-off of Pencil design system | — | S | FOUND-06 | sign-off |

**Phase 2 effort: ~90–115h** (midpoint ≈ 100h)

---

## Execution Phase 3: Site Build (~240–340h, 6–8 weeks)

### Block development

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|----|---|---|---|---|---|
| BLOCK-ADAPT-01 | Header — utility nav slot + responsive mobile menu | organisms | M | ATOM-* | building-blocks skill (SDD) |
| BLOCK-ADAPT-02 | Footer — newsletter slot + 4-column legal | organisms | M | ATOM-* | building-blocks skill |
| BLOCK-ADAPT-03 | Hero — 3 modifier styles (split-image-left, split-image-right, product-image) | organisms | S | ATOM-* | building-blocks skill |
| BLOCK-ADAPT-04 | Cards — 4 new variants `(products) (articles) (steps) (app-steps)` | molecules | S | ATOM-* | building-blocks skill |
| BLOCK-ADAPT-05 | Carousel — testimonial variant (CSS-only modifier) | organisms | S | Block Collection | building-blocks skill |
| BLOCK-NEW-01 | `marketing-banner` — full-bleed CTA strip, 2 colour variants | organisms | S | ATOM-* | building-blocks skill |
| BLOCK-NEW-02 | `text-image` — brand panel with image+heading+bulleted body, 2 layouts | organisms | M | ATOM-* | building-blocks skill |
| BLOCK-NEW-03 | `newsletter-strip` — fragment + form block | organisms | M | BUILD-INT-04 | building-blocks skill |
| BLOCK-NEW-04 | `form (multi-section)` — sign-up flow, ARIA-compliant, JSON-driven | organisms | L | BUILD-INT-04 | building-blocks skill |
| BLOCK-NEW-05 | `form (contact)` — contact-us submission | organisms | M | BUILD-INT-04 | building-blocks skill |
| BLOCK-NEW-06 | `commerce` — PriceSpider lazy widget | organisms | M | BUILD-INT-05 | building-blocks skill |
| BLOCK-NEW-07 | `product-header` — auto-blocked product detail header | organisms | M | TMPL-02 | building-blocks skill |
| BLOCK-NEW-08 | `store-locator` — Mapbox + filtered list + geolocation | organisms | XL | BUILD-INT-06 | building-blocks skill |

### Templates

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|----|---|---|---|---|---|
| TMPL-01 | Homepage template + authoring guide | template | S | BLOCK-* | eds-documentation skill |
| TMPL-02 | Product-detail template + auto-blocking rule for `product-header` | template | M | BLOCK-NEW-06,07 | building-blocks skill |
| TMPL-03 | Blog-article template + auto-blocking rule for article-header | template | M | BLOCK-* | building-blocks skill |
| TMPL-04 | Campaign template (catch-all) + section-style guide | template | S | BLOCK-* | building-blocks skill |
| TMPL-05 | Quit-zone template (uses many blocks) + authoring guide | template | M | BLOCK-* | eds-documentation skill |
| TMPL-06 | Store-locator template + authoring guide | template | S | BLOCK-NEW-08 | eds-documentation skill |
| TMPL-07 | Form-page template (sign-up, contact) + authoring guide | template | M | BLOCK-NEW-04,05 | eds-documentation skill |
| TMPL-08 | FAQ template + authoring guide | template | S | Block Collection | eds-documentation skill |

### Integration Work

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|----|---|---|---|---|---|
| BUILD-INT-01 | Edge worker: age-gate redirect + cookie middleware | infra | XL | DISC-01 | EDS edge function |
| BUILD-INT-02 | Static `/age-gate` page (province + DOB selector, sets cookies, returns to original) | template | M | BUILD-INT-01, ATOM-05 | building-blocks skill |
| BUILD-INT-03 | Adobe Experience Cloud integration in `delayed.js` (DTM/Launch + Analytics + AAM + Target + Adcoud) | analytics | M | DISC-03 | eds-analytics skill |
| BUILD-INT-04 | Salesforce Site API client (sign-up + newsletter + contact) | forms | M | DISC-05 | building-blocks skill |
| BUILD-INT-05 | PriceSpider lazy load + analytics events | commerce | S | DISC-06 | building-blocks skill |
| BUILD-INT-06 | Mapbox key + tile config + style sheet | maps | XS | DISC-07 | building-blocks skill |
| BUILD-INT-07 | OneTrust SDK loaded by `delayed.js` + consent gating wiring | consent | S | DISC-04 | eds-analytics skill |
| BUILD-INT-08 | Salesforce Embedded Messaging chat in `delayed.js` (≥ 3s after LCP) | chat | S | DISC-05 | building-blocks skill |
| BUILD-INT-09 | ContentSquare + GA4 + Meta Pixel + Qualtrics in `delayed.js` (or web worker pattern) | analytics | M | DISC-03 | eds-analytics skill |

**Phase 3 effort: ~240–320h** (midpoint ≈ 280h)

---

## Execution Phase 4: Content Migration (~80–120h, 3–4 weeks)

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|----|---|---|---|---|---|
| MIGRATE-01 | Migration script setup (batch orchestrator over `page-import` skill) | infra | M | TMPL-* | migration-content skill |
| MIGRATE-02 | Batch 1: Homepage + transactional pages (~5 pages) | content | S | MIGRATE-01 | page-import skill |
| MIGRATE-03 | Review checkpoint — sign off Batch 1 quality | — | XS | MIGRATE-02 | sign-off |
| MIGRATE-04 | Batch 2: Campaign pages (Group 1: ~15 pages — why-zonnic, what-is-zonnic, truth-about, quit-on-your-terms, etc.) | content | M | MIGRATE-03 | page-import skill |
| MIGRATE-05 | Review checkpoint — sign off Batch 2 quality | — | XS | MIGRATE-04 | sign-off |
| MIGRATE-06 | Batch 3: Campaign pages (Group 2: ~15 pages — campaign / archived / accessibility / no-tobacco-day pages) | content | M | MIGRATE-05 | page-import skill |
| MIGRATE-07 | Review checkpoint — sign off Batch 3 quality | — | XS | MIGRATE-06 | sign-off |
| MIGRATE-08 | Batch 4: Blog articles (~8 pages) | content | S | MIGRATE-07 | page-import skill |
| MIGRATE-09 | Batch 5: Product detail pages (~12 pages) | content | M | MIGRATE-08 | page-import skill |
| MIGRATE-10 | Batch 6: Healthcare-pro / FAQ / testimonial sub-trees (~25 pages) | content | M | MIGRATE-09 | page-import skill |
| MIGRATE-11 | Final review + leftover pages | content | S | MIGRATE-10 | sign-off |
| MIGRATE-12 | Media asset migration (images, video) — bulk download + organisation | assets | S | — | migration-content skill |
| MIGRATE-13 | SEO redirect mapping spreadsheet + redirects.json | SEO | S | DISC-12 | redirects doc |
| MIGRATE-14 | Bulk metadata sheet (page-level metadata: title, description, template, hero image) | content | S | TMPL-* | bulk-metadata doc |

**Phase 4 effort: ~80–110h** (midpoint ≈ 95h)

---

## Execution Phase 5: Testing and UAT (~90–130h, 3 weeks)

| ID | Description | Atomic Level | Size | Dependencies | Methodology |
|----|---|---|---|---|---|
| TEST-01 | Visual regression setup with `designlang visual-diff` baselines | testing | M | MIGRATE-* | testing-blocks skill |
| TEST-02 | Lighthouse 100 verification on every template (PSI + bot) | testing | S | MIGRATE-* | testing-blocks skill |
| TEST-03 | WCAG 2.2 AA full audit (axe + manual + screen-reader on every template) | testing | M | MIGRATE-* | eds-wcag skill |
| TEST-04 | Token drift report (designlang drift) | testing | S | MIGRATE-* | testing-blocks skill |
| TEST-05 | Cross-browser smoke test (latest Chrome / Safari / Firefox / Edge) | testing | S | MIGRATE-* | testing-blocks skill |
| TEST-06 | Cookie / age-gate / region-routing manual flow tests | testing | M | BUILD-INT-01 | manual QA |
| TEST-07 | Form submission tests (sign-up / newsletter / contact) — happy + error paths | testing | M | BLOCK-NEW-04,05 | manual QA |
| TEST-08 | Content author UAT (training + scenario walkthroughs + feedback) | UAT | M | MIGRATE-* | content team |
| TEST-09 | Stakeholder sign-off | UAT | S | TEST-* | sign-off |
| OPS-01 | Go-live checklist execution (DNS, CDN, redirects, monitoring, sitemap, robots) | ops | S | TEST-09 | go-live-checklist doc |
| OPS-02 | Hypercare period — 2 weeks of monitoring + iterative fixes | ops | M | OPS-01 | RUM dashboards |

**Phase 5 effort: ~90–125h** (midpoint ≈ 105h)

---

## Summary

| Phase | Items | XS | S | M | L | XL |
|-------|------|----|----|---|---|-----|
| 1. Discovery | 15 | 3 | 4 | 8 | 0 | 0 |
| 2. Design System | 14 | 5 | 5 | 0 | 1 | 0 |
| 3. Site Build (blocks) | 13 | 0 | 5 | 5 | 1 | 1 |
| 3. Site Build (templates) | 8 | 0 | 4 | 4 | 0 | 0 |
| 3. Site Build (integrations) | 9 | 1 | 4 | 3 | 0 | 1 |
| 4. Content Migration | 14 | 3 | 5 | 6 | 0 | 0 |
| 5. Testing & UAT + Ops | 11 | 0 | 4 | 6 | 0 | 0 |
| **Total** | **84** | **12** | **31** | **32** | **2** | **2** |

Midpoint hours per size: XS=1.5, S=3, M=6, L=12, XL=28

**Aggregated midpoint:** 12×1.5 + 31×3 + 32×6 + 2×12 + 2×28 = 18 + 93 + 192 + 24 + 56 = **383h** of work-item effort

With:
- 20% contingency buffer: **460h**
- Adding stakeholder gate time, design review, and project mgmt overhead: **580–680h** realistic, **840h** worst-case
