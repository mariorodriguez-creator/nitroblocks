# Migration Proposal: Zonnic Canada

**Source:** https://www.zonnic.ca/ca/en
**Date:** 2026-04-30
**Prepared by:** migration-planner skill (AEM Edge Delivery Services)

## Site Overview

- **Tech stack:** AEM as a Cloud Service (BAT global platform), custom `bat-*` web components, OneTrust consent, Adobe Experience Cloud (DTM/Launch, Audience Manager, Target, Advertising Cloud), ContentSquare, Qualtrics, Salesforce embedded messaging, Mapbox (store locator), PriceSpider (commerce widget), Felix (online retail partner). Self-hosted Santral typeface.
- **Design quality grade:** designlang internal grade is **C** (grade subcommand failed against the gated site; treat as best-available signal). Source has known a11y debt: 4 WCAG contrast failures, 5 critical/serious axe violations across 8 sampled pages.
- **Total pages discovered:** 92 (after filtering test pages)
- **Unique templates:** 23 template groups (homepage, product detail, blog article, FAQ, sign-up, store locator, insurance reimbursement, brand campaign pages, archived pages, transactional pages)
- **Unique organisms (blocks needed):** 19 distinct EDS blocks (8 reuse-as-is from Block Collection, 4 adapt, 7 new)

## Scope Summary

| Category | Count | Effort |
|----------|-------|--------|
| Blocks to reuse as-is | 8 | -- |
| Blocks to adapt (new variants) | 4 | 4×S = 12h |
| Blocks to develop (new) | 7 | 4M + 2L + 1XL = 80h |
| Templates to define | 8 | 4S + 4M = 36h |
| Pages to migrate | 92 | 1 setup + 6 batches = 60h |
| Integrations to handle | 9 | 2XS + 4S + 2M + 1XL = 78h |

## Total Estimated Effort

Using midpoint t-shirt aggregation per `tshirt-estimation-guide.md`, with a 20% contingency buffer.

| Phase | Effort Range | Duration |
|-------|-------------|----------|
| 1. Discovery | 80–120h | 2 weeks |
| 2. Design System Build | 90–130h | 2–3 weeks |
| 3. Site Build | 240–340h | 6–8 weeks |
| 4. Content Migration | 80–120h | 3–4 weeks |
| 5. Testing & UAT | 90–130h | 3 weeks |
| **Total** | **580–840h** | **16–20 weeks** |

A two-EDS-developer team plus one designer plus one content author can deliver in **17–20 calendar weeks** (≈ 4–5 months) including a 2-week hypercare window. A larger team (3 dev + 1 design + 2 content) compresses to **12–14 weeks**.

## Key Risks

| # | Risk | Severity |
|---|------|----------|
| R1 | **Age-gate + region cookie mechanics** must be replicated as edge middleware (cookie-based redirect/session). EDS does not natively support gates; needs a custom Edge Worker on the AEM CDN layer. | High |
| R2 | **Adobe Experience Cloud stack** (DTM/Launch + Audience Manager + Target + Analytics + Advertising) is heavy; loading it without breaking the Lighthouse-100 budget requires rigorous deferral via `delayed.js` and worker isolation. | High |
| R3 | **Santral typeface licensing** — proprietary BAT corporate font; needs license confirmation, font-subset hosting, and `font-fallback` CDN strategy. | Medium |
| R4 | **PriceSpider commerce widget** + **Felix online-purchase iframe** are vendor-controlled; they may not behave well when loaded after LCP and can blow CWV scores. Needs lazy-load contracts in writing. | High |
| R5 | **Salesforce Embedded Messaging chat** introduces a second-origin TLS handshake that can compete with critical-path budget; must be moved to `delayed.js` ≥ 3s after LCP. | Medium |
| R6 | **Site-wide health-warning banner** is regulator-mandated and must always render above-the-fold on every page — locks the LCP candidate and reduces optimisation flexibility. | Medium |
| R7 | **Source content has 4 WCAG AA contrast failures and 1 critical missing-label violation on sign-up**. Migrating like-for-like would carry the debt; normalisation is required. | Medium |
| R8 | **2 Salesforce-backed origins** (`bat-sea.my.site.com`, `bat-sea.my.salesforce-scrt.com`) supply account flows the migration team does not own. SSO/auth contracts must be agreed with the BAT platform team early. | High |
| R9 | **Site uses 6 font families and 8 font weights**; the migration target normalises to 1 family (Santral) + 3 weights. Stakeholder sign-off needed for the visual delta. | Low |

## Methodology

- **Design system:** Pencil (`.pen` files committed alongside code) — token authoring, atom/molecule/organism frames, signed off before Phase 3 begins.
- **Development:** SDD (spec-driven) via `speckit` per block; orchestrates the building-blocks + content-driven-development skills internally.
- **Content migration:** agentic batch processing via `page-import` skill, grouped by template family with a human review checkpoint after each batch.
- **Validation:** `designlang visual-diff` for structural comparison, `designlang drift` for token consistency, Lighthouse 100 enforced via PSI bot, WCAG 2.2 AA via axe-core in CI.

## Confidence

Per the verification report:

| Dimension | Confidence | Note |
|---|---|---|
| Page inventory | HIGH | 92 URLs corroborated across sitemap + scrape |
| Design tokens | HIGH | designlang extraction succeeded |
| Visual reference | HIGH | 100% template coverage at 3 viewports (clean Playwright captures) |
| Component anatomy | MEDIUM | designlang anatomy.tsx undersupplied; rely on screenshots + DOM organisms |
| Bypass integrity | LOW | Imperva bot detection limits depth of automated probe — Discovery phase will confirm in-person |
| Template coverage (by depth) | LOW | crawl depth = 2; Discovery should expand |
| Third-party integrations | MEDIUM (now HIGH) | HAR analysis recovered 28 origins after fixing analyze-har bug |
| Accessibility | LOW | 5 violations on 8 sampled pages — full audit due in Discovery |

The proposal calibrates claims to these confidence levels — items that depend on LOW-confidence evidence are flagged as **discovery-validate** in the work plan.
