# Design System Audit — zonnic.ca/ca/en

Raw designlang extraction (v12.1.0) without normalization. Issues are flagged for the `migration-design-system` phase to fix.

## Source Site Health

**Grade:** C (71/100) — April 29, 2026

| Dimension | Score | Verdict |
|---|---:|---|
| Color Discipline | 80/100 | Strong |
| Typography Consistency | 35/100 | **Needs work** |
| Spacing System | 85/100 | Strong |
| Elevation (Shadows) | 78/100 | Adequate |
| Border Radii | 90/100 | **Exemplary** |
| Accessibility (token coverage) | 88/100 | Strong |
| Tokenization | 75/100 | Adequate |
| CSS Health | 35/100 | **Needs work** |

## Strengths (designlang verdict)

- Well-defined spacing scale (base unit 2 px detected)
- Consistent border radii (7 distinct values, top two are `100 px` and `50 px` for pill buttons)
- Good CSS variable tokenization (5 primitive vars in source)

## Issues Flagged (by designlang)

- 5 concurrent font families — recommend limiting to 2 (heading + body)
- 8 font weights in use — recommend standardizing to 3 (regular, medium, bold)
- 2 WCAG contrast failures (black text on `#182465` navy at ratio 1.48, 4 button instances)
- 179 `!important` rules — specificity debt, must be cleaned in EDS migration
- 92% of delivered CSS is unused (typical for legacy CSR component systems where each Handlebars component ships its own style bundle)
- 11,611 duplicate CSS declarations — most likely per-component Shadow DOM leakage

## Foundations Extracted

### Colors — 27 unique

| Role | Hex | Usage Count |
|---|---|---:|
| Primary | `#182465` navy | 4,535 |
| Secondary | `#3860be` mid-blue | 28 |
| Accent | `#a0ff9d` mint green | 8 |
| Error / promo red | `#e00830` | 880 |
| Dark backgrounds | `#141e53`, `#252c68`, `#27455c` | 962 + 505 + 56 |
| Grey text | `#616069` | 9,804 (most-used color on the page) |
| Neutrals (n100–n1400) | 12 greyscale values | — |

Full inventory in `migration-work/design-extract/zonnic-ca-design-language.md`.

### Typography — 15 sizes, 8 weights, 5 families

| Family | Usage | Role |
|---|---|---|
| `Santral` | 10,218 elements | primary brand font (custom) |
| `Arial` | 440 elements | legacy fallback, non-hosted |
| `Times` | 298 elements | legacy (likely default-browser leak in OneTrust panel) |
| `Font Awesome 5 Free` | 22 elements | icon font |
| `sans-serif` | 8 elements | raw system fallback |

Heading scale (heavy one-offs): 42 / 34 / 32 / 30 / 24 / 22 / 20 / 18 / 16 / 15 / 14.4 / 14 / 13.6 / 13.008 / 12.992 / 12 / 10.

Weights in use: 100, 300, 400, 500, 600, 700, 800, 900 (all eight).

### Spacing — 18 distinct values

`0, 38, 48, 55, 60, 70, 78, 95, 102, 120, 123, 140, 203, 207, 213, 236, 256, 320` (px). designlang infers a 2 px base unit. Multiples of 8 px would tidy this (48, 56, 72, 80, 96, 104, 120, 128, 208, 256, 320).

### Shadows — 10 distinct

Span from `sm` (2 px blur) to `lg` (18 px blur). Multiple `md` definitions differ only by color alpha; candidates for consolidation.

### Border Radii — 7 distinct

`1 px, 6 px, 14 px, 17 px, 20 px, 50 px, 100 px`. The two "full" values (`50/100 px`) and the two "xl" values (`17/20 px`) overlap; easy to consolidate.

### Motion

Durations: `0.1s / 0.2s / 0.25s / 0.3s / 0.5s / 0.6s`. Easings mostly `ease` + `ease-in` + `ease-in-out`. 13 keyframe animations defined; most are unused (`bounce-arrow`, `showHours`, `rotateGeoloc`, OneTrust floating button intros, etc.).

## Accessibility (designlang token contrast check)

- **Score:** 88/100 — 4 / 5 distinct token pairs pass WCAG AA at normal text.
- **Failing pair:** `#000000` on `#182465` (ratio 1.48, 4 button instances) — suggested remediation: swap foreground to `#ffffff` (ratio 14.2).

## Runtime Accessibility (axe-core, 10 templates scanned)

- **Pages scanned:** 10
- **Total violations:** 9
- **By severity:** 3 critical, 11 serious (some pages contribute multiple rule hits), 0 moderate, 0 minor
- **Incomplete checks (need manual review):** 20

**By rule (aggregated count):**

| Rule | Hits |
|---|---:|
| `link-name` | 7 |
| `autocomplete-valid` | 2 |
| `button-name` | 2 |
| `definition-list` | 1 |
| `aria-hidden-focus` | 1 |
| `label` | 1 |

See `./migration-work/a11y/summary.json` for per-page breakdown. None of these are blocking for EDS — all can be fixed during block development with standard semantic HTML + ARIA attributes.

## Tech Stack Fingerprint

- **CMS / delivery (source):** Adobe Experience Manager (AEM) author + publish, confirmed by the `content-path: /content/zonnic/ca/en/ca/en` meta tag and the `/content/zonnic/...` asset paths in the DOM.
- **Client-side layer (source):** A custom CSR (client-side-rendering) layer built on **Handlebars templates**, with components named `bat-*` (British American Tobacco design system). These are plain DOM elements produced by Handlebars in the browser, **not** Lit/Stencil custom Web Components. The client-side script fetches JSON from AEM and renders the `bat-*` templates into the DOM.
- **Target:** AEM Edge Delivery Services — replacing the CSR layer with server-rendered EDS blocks, with authoring continuing from AEM (or moved to Docs/Drive/SharePoint at client's discretion).
- **Analytics (client-handled):** Google Analytics (GTM), Adobe Analytics (Omniture + Target + Audience Manager via DTM), ContentSquare, Meta Pixel — vendor snippets handled outside this migration.
- **CDN:** Whatever AEM publish runs on today (typically Fastly/Akamai via Dispatcher).

## Third-Party Integrations — NOT IN MIGRATION SCOPE

> **Scope clarification (from client):** the integrations listed below are out of scope for this migration. The client will provide the vendor HTML/JS snippet for each one. The migration team's responsibility is a **drop-in** only: paste the snippet into the correct location and ensure it loads without breaking Lighthouse 100.

**14 primary vendor snippets** expected across 25 unique origins observed in HAR (chained calls count as one snippet). Full origin list in `migration-work/verification/third-party-inventory.md`.

| Vendor / snippet | Purpose | Expected placement | Notes |
|---|---|---|---|
| OneTrust | consent | `delayed.js` OR eager if vendor demands it | Downstream tags gate on the consent cookie it sets |
| Salesforce (login / chat) | auth + messaging | Dropped into `signup-form`, `login-form`, `password-reset-form` blocks + `delayed.js` for chat widget | Form POST endpoints preserved as-is |
| Qualtrics Site Intercept | survey | `delayed.js` (after consent) | — |
| AEM.live RUM | performance telemetry | eager — already in `aem.js` | No client snippet needed |
| ContentSquare | UX analytics | `delayed.js` | — |
| Adobe DTM | tag manager | `delayed.js` (chains Target, AAM, Analytics, ads) | — |
| Google Tag Manager | tag manager | `delayed.js` | — |
| Adobe Target | experimentation | `delayed.js` (accept flicker) | If eager placement is required, budget performance trade-off |
| Adobe Audience Manager | DMP | chains from DTM | No direct snippet |
| Meta Pixel / DoubleClick / other ad pixels | advertising | chain from GTM/DTM | No direct snippets |
| `ssapi.vuse.com` | subscription API | wired into forms where needed | Client confirms whether still required post-migration |
| Mapbox | maps | dropped into `store-locator` block | Client provides token; block lazy-loads via `IntersectionObserver` |
| PriceSpider | where-to-buy widget | dropped into product pages if retained | Client-decides retention |
| `unpkg.com` / `npmcdn.com` | JS CDN | self-hosted copy | Migration team removes second-origin dependency |

**Per-snippet effort:** XS (0.5–2h) to place and verify each one. No architectural work, no vendor negotiation. See [05-work-items.md](05-work-items.md) `BUILD-INT-*`.

## Backend Dependencies

Features that are currently client-side rendered (Handlebars) against AEM content — EDS alternatives below.

| Feature | Current approach | EDS alternative |
|---|---|---|
| Age gate | Handlebars component + cookie memory | Eager-loaded EDS block reading a cookie (same contract) |
| Login / signup / password reset | Salesforce-hosted flows triggered by forms | Client-provided Salesforce snippet dropped into EDS form blocks |
| Newsletter signup | Form POST to Salesforce endpoint | Same endpoint, called from EDS `signup-form` block |
| Store locator | Static JSON + Mapbox | EDS block reading JSON + client-provided Mapbox snippet |
| Live chat | Salesforce embedded messaging snippet | Same snippet via `delayed.js` |
| Personalization / A/B | Adobe Target | Client-provided Target snippet via `delayed.js` |

> Confidence on backend inferences: **MEDIUM** — confirmed that integrations are drop-in snippets, not custom-engineered systems. Per-vendor snippet contents should be collected during Discovery (DISC-08).

## Files referenced

- `migration-work/design-extract/zonnic-ca-design-language.md` (full narrative)
- `migration-work/design-extract/zonnic-ca-design-tokens.json` (W3C DTCG tokens)
- `migration-work/design-extract/zonnic-ca-anatomy.tsx` (thin — only Card + Button)
- `migration-work/design-extract/zonnic-ca-grade.html` (shareable grade card)
- `migration-work/verification/third-party-inventory.md` (full per-origin table)
- `migration-work/a11y/summary.json` (runtime axe-core results)
