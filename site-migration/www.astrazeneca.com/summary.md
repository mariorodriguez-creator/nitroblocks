# AstraZeneca → EDS Migration Sizing Summary

**Source site:** https://www.astrazeneca.com/
**Date:** 2026-04-09
**Analyst:** AI Migration Sizing Agent
**Method:** Path A — local scrape-site mirror (1,162 pages)

---

## Headlines

| Metric | Value |
|--------|-------|
| Total pages | 1,162 |
| HTML pages analyzed | 543 (93% of 579 sampled) |
| Templates identified | 9 |
| UI patterns (deduplicated) | 25 |
| New blocks (Tier 3) | 11 |
| Variant blocks (Tier 2) | 9 |
| Covered (Tier 1) | 5 |
| **Total effort (Scenario C)** | **106 points** |
| **Timeline (1 developer)** | **~10.6 weeks** |
| **Timeline (2 developers)** | **~7.6 weeks** |

---

## Site Structure

| Section | Pages | Sample Rate |
|---------|-------|------------|
| media-centre | 491 | 25% |
| content (DAM assets) | 173 | 50% |
| country-sites | 135 | 50% |
| what-science-can-do | 121 | 50% |
| our-company | 51 | 100% |
| investor-relations | 45 | 100% |
| r-d | 33 | 100% |
| our-therapy-areas | 30 | 100% |
| sustainability | 30 | 100% |
| root | 26 | 100% |
| partnering | 12 | 100% |
| other (careers, suppliers, global, legal) | 16 | 100% |

---

## Templates

1. **Homepage** — unique complex layout, highest-density component page
2. **Hub Page** — hero + image panels + cards + jump nav (Our Company, R&D, Therapy Areas, Sustainability, Partnering, Careers)
3. **Article Detail** — long-form rich text + breadcrumb + social sharing
4. **Filtered Listing** — search + tag/year filters + paginated results
5. **Press Release Detail** — press release hero + body (variant of Article Detail)
6. **Investor Relations** — stock ticker + events + document downloads
7. **Sustainability Dashboard** — interactive map + data visualization (Vue/OpenLayers)
8. **Media Library** — masonry image gallery + lightbox
9. **Simple Text / Legal** — rich text body + optional FAQ accordion

---

## Gap Analysis Summary

### Tier 3 — New Blocks (11 blocks · 41 pts)

| Block | Effort | Notes |
|-------|--------|-------|
| `header` (mega-nav rebuild) | L | Highest risk. Multi-tier dropdown, search, country-switcher. |
| `footer` (rebuild) | M | Multi-column links, social, legal text. |
| `filterable-list` | L | Search + filters + query-index pagination. |
| `image-panel` | M | Full-bleed split band: image + text/CTA. |
| `featured-stories` | M | Featured article + trending teasers. |
| `stock-ticker` | L | Live multi-exchange stock prices. API contract required. |
| `data-map` | L | Interactive Leaflet map (replace OpenLayers). |
| `data-dashboard` | L | Interactive data table/chart (replace Vue/Vuetify). |
| `media-gallery` | M | Masonry gallery + lightbox (replace Salvatorre). |
| `outbound-modal` | S | Auto-block for external link interstitial. |
| `language-selector` | S | AZ Suppliers language picker (low priority). |

### Tier 2 — Variant Blocks (9 blocks · 9 pts)

`hero(image-swap)` · `cards(therapy)` · `cards(people)` · `cards(events)` · `carousel(content)` · `accordion(faq)` · `quote(feature)` · `table(downloads)` · `tabs(jump-nav)`

### Tier 1 — Covered (5 · 0 pts)

Rich text body (default content) · Section headers (default content) · Breadcrumb (auto-block) · Email signup (form block) · Social sharing (default content)

---

## Effort Scenarios

| Scenario | Points | 1 Developer | 2 Developers |
|----------|--------|-------------|--------------|
| A — Code only | 76 pts | 7.6 weeks | 5.4 weeks |
| A+ — + Integrations | 86 pts | 8.6 weeks | 6.1 weeks |
| B — + Content migration | 98 pts | 9.8 weeks | 7.0 weeks |
| C — Full project (+ QA) | 106 pts | 10.6 weeks | 7.6 weeks |

*Velocity: 10 pts/week per developer. 2-developer figure assumes 70% parallel efficiency.*

---

## Critical Risks

1. **Mega-nav underestimated** (H/H) — Prototype first. 5–8 days minimum. Blocks all templates.
2. **Stock ticker API contract** (M/H) — Engage IR tech team Week 1. May block Investor Relations template.
3. **query-index schema undefined** (M/H) — Define columns Week 1. Block filterable-list build until done.
4. **Responsive image CLS** (H/M) — Remove unused hero image from DOM. Test Lighthouse CLS continuously.
5. **Sustainability dashboard rebuild complexity** (L/H) — Consider iframe interim until vanilla JS rebuild validated.

---

## Recommended Build Order

**Phase 1** (Wks 1–3): header, footer, hero variant, outbound-modal, core styles
**Phase 2** (Wks 3–6): image-panel, filterable-list, featured-stories, cards variants
**Phase 3** (Wks 6–8): quote, tabs, carousel, accordion, table, remaining templates
**Phase 4** (Wks 8–11): stock-ticker, media-gallery, data-map, data-dashboard, QA

---

## Deliverables

| File | Purpose |
|------|---------|
| `urls.txt` | Full URL list (1,162 URLs) |
| `sections/` | URLs grouped by top-level section |
| `samples/` | Stratified sample per section (579 total) |
| `results.tsv` | CSS class fingerprints per sampled page |
| `analysis.json` | Machine-readable template signatures |
| `block-inventory.md` | Available blocks catalog (what exists now) |
| `patterns.md` | Deduplicated neutral pattern inventory |
| `gap-analysis.md` | Tiered classification — sole source of truth for what to build |
| `dashboard.html` | Interactive stakeholder dashboard |
| `summary.md` | This file |
