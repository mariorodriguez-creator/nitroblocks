# Migration Sizing Summary — www.zonnic.ca

**Date:** 2026-04-13
**Source site:** https://www.zonnic.ca
**Total pages crawled:** 425 (394 unique after dedup)
**Content pages (EN + FR):** 244
**Unique English pages:** ~122

---

## Site Overview

Zonnic.ca is a consumer health product website for ZONNIC nicotine replacement pouches, operated by British American Tobacco (BAT) Canada. The site is bilingual (English/French) with identical page structures across both languages. It runs on a Salesforce Commerce Cloud / BAT platform with extensive third-party integrations (Salesforce live chat, Mapbox, analytics).

Key site sections:
- **Homepage** — Product carousel hero, info cards, blog preview, social media
- **Blog** — 28 articles about nicotine pouches, quitting tips, product guides
- **Pouches (Products)** — 6 product cards (3 flavours × 2 sizes), with detail pages
- **Healthcare Professionals** — 8 clinical articles for pharmacists
- **Real People / Testimonials** — 8 user stories with video content
- **FAQ** — 5 categories with expandable Q&A
- **Store Locator** — Mapbox map with pharmacy search
- **Legal/Policy** — Privacy, Terms, Conditions of Sale, Cookie Policy

---

## Template Inventory

| # | Template | Pages (EN) | Pages (Total EN+FR) | Confidence |
|---|----------|-----------|---------------------|-----------|
| 1 | Homepage | 1 | 3 | med |
| 2 | Blog Listing | 1 | 2 | high |
| 3 | Blog Article | 38 | 78 | high |
| 4 | Product Listing | 1 | 2 | high |
| 5 | Product Detail | 7 | 16 | high |
| 6 | FAQ Landing | 1 | 2 | high |
| 7 | FAQ Category | 5 | 12 | high |
| 8 | Healthcare Landing | 1 | 2 | high |
| 9 | Healthcare Article | 9 | 20 | high |
| 10 | Testimonials Landing | 1 | 2 | high |
| 11 | Testimonial Detail | 8 | 18 | high |
| 12 | Contact Us | 1 | 2 | low |
| 13 | What Is Zonnic | 1 | 2 | low |
| 14 | Why Zonnic | 1 | 2 | low |
| 15 | Store Locator | 1 | 2 | low |
| 16 | Sign Up / Registration | 1 | 2 | low |
| 17 | Legal/Policy Pages | 4 | 8 | low |
| **TOTAL** | | **~82** | **~175** | |

Note: ~70 remaining URLs are test pages, archived pages, duplicate paths, and legacy content (en1/en2 versions) excluded from migration scope.

---

## Block Gap Analysis Summary

| Tier | Count | Blocks |
|------|-------|--------|
| Tier 1 — Covered | 5 | hero, cards (article grid), embed/video, header, footer |
| Tier 2 — Variant | 6 | accordion (faq), carousel (testimonials), cards (icon-grid), cards (blurb), carousel (product), embed (instagram) |
| Tier 3 — New | 4 | age-gate, product-cards, product-detail, store-locator |
| Default / Out of scope | 3 | health warning banner, newsletter signup, registration form |

---

## Effort Sizing

### Block Development

| Item | Type | Points |
|------|------|--------|
| age-gate | Tier 3, 3rd-party integration (cookie, province, regulatory) | 8 |
| product-cards | Tier 3, standard content block | 3 |
| product-detail | Tier 3, standard content block | 3 |
| store-locator | Tier 3, complex interactive (Mapbox API) | 5 |
| accordion (from Block Collection) + faq variant | Tier 2, Block Collection adaptation | 1 |
| carousel (from Block Collection) + product variant | Tier 2, Block Collection adaptation + CSS | 1 |
| carousel testimonials variant | Tier 2, same base as above, CSS only | 1 |
| cards icon-grid variant | Tier 2, CSS only | 1 |
| cards blurb variant | Tier 2, CSS only | 1 |
| embed instagram variant | Tier 2, CSS only | 1 |
| **Subtotal** | | **25** |

### Template Wire-up

| Template type | Count | Points each | Total |
|--------------|-------|-------------|-------|
| Simple (Legal, FAQ Category, Sign Up) | 4 | 2 | 8 |
| Medium (Blog Article, Product Detail, Healthcare Article, Testimonial Detail, FAQ Landing, Contact) | 7 | 3 | 21 |
| Complex (Homepage, Product Listing, Testimonials Landing, Store Locator, Healthcare Landing, Why/What Zonnic) | 6 | 5 | 30 |
| **Subtotal** | **17** | | **59** |

### Core Infrastructure

| Item | Points |
|------|--------|
| Global styles (typography, colour tokens, breakpoints) | 4 |
| Header + footer (already exist, need Zonnic branding) | 5 |
| scripts.js modifications (age-gate auto-block, health warning) | 4 |
| Font fallback implementation | 1 |
| **Subtotal** | **14** |

### Integrations

| Integration | Points | Notes |
|------------|--------|-------|
| Analytics (Adobe Analytics / GTM) | 5 | Data layer + delayed.js |
| Cookie consent | 5 | OneTrust or equivalent |
| Forms (newsletter, contact tickets) | 8 | Salesforce integration |
| Translation / localisation (EN + FR) | 6 | Placeholders, hreflang |
| **Subtotal** | **24** |

### Content Migration

| Item | Points | Notes |
|------|--------|-------|
| Content migration (~175 pages, tooling-assisted) | 20 | 2 × 10 pts per 100 pages |
| Redirect map creation | 3 | EN + FR URL mapping |
| Metadata / taxonomy migration | 4 | Blog categories, product data |
| **Subtotal** | **27** |

### QA and Validation

| Item | Points |
|------|--------|
| Functional testing (17 templates) | 17 |
| Accessibility audit (WCAG 2.2 AA) | 4 |
| Performance validation (Lighthouse 100) | 4 |
| Cross-browser / device testing | 3 |
| **Subtotal** | **28** |

---

## Scenario Totals

### Scenario A — Code-only delivery
> Client authors migrate their own content.

| Category | Points |
|----------|--------|
| Block development | 25 |
| Template wire-up | 59 |
| Core infrastructure | 14 |
| Integrations | 24 |
| **Total** | **122 pts** |

### Scenario B — Assisted migration
> Dev team provides import tooling and migrates content.

| Category | Points |
|----------|--------|
| Scenario A | 122 |
| Content migration | 27 |
| **Total** | **149 pts** |

### Scenario C — Full project delivery
> End-to-end including QA and performance validation.

| Category | Points |
|----------|--------|
| Scenario B | 149 |
| QA and validation | 28 |
| **Total** | **177 pts** |

---

## Timeline Estimates

| Scenario | 1 dev (10 pts/wk) | 2 devs (18 pts/wk) | 2 devs + QA (28 pts/wk) |
|----------|--------------------|---------------------|--------------------------|
| A — Code only | 15 weeks | 8 weeks | 5 weeks |
| B — Assisted migration | 18 weeks | 10 weeks | 7 weeks |
| C — Full delivery | 21 weeks | 12 weeks | 8 weeks |

*Includes 20% buffer for discovery, PR review, and stakeholder feedback.*

---

## Key Findings

1. **Small, well-structured site** — Only ~82 unique English pages across 17 templates. The bilingual structure doubles page count but not complexity.
2. **Age gate is the #1 blocker** — Every single page requires it. Build this first as an auto-block.
3. **Strong block reuse** — Only 4 net-new blocks needed. The existing project blocks (hero, cards, header, footer) plus Block Collection (accordion, carousel) cover most patterns.
4. **E-commerce is limited** — Products are sold through external pharmacy partners (Felix, LiveWell). No checkout flow in EDS reduces complexity significantly.
5. **Store locator is the second highest risk** — Mapbox integration with address search and store data. Consider whether this can be replaced with a simpler solution.
6. **Content is relatively static** — Blog articles, FAQ, and healthcare content are long-form text with minimal dynamic elements. Good fit for EDS.
