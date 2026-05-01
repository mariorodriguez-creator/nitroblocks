# Design System Audit — Zonnic Canada

Source extracted via `designlang@12.1.0` against `https://www.zonnic.ca/ca/en` and 2 internal pages, after age-gate bypass via cookie injection.

## Source Site Health

**Internal grade:** C (qualitative — designlang's `grade` subcommand cannot pass cookies in v12 and so could not produce an authoritative report-card on this gated site; the figures below come from the main extraction's quality scores).

| Dimension | Score | Notes |
|---|---|---|
| Color discipline | Mixed | 27 unique colors; 5 primary roles | 
| Type discipline | Weak | 6 families × 8 weights × 15 sizes |
| Spacing discipline | Weak | 17-step scale, base 2px (effectively no scale) |
| Shadow discipline | Mixed | 6 shadows, 3 distinct strengths |
| Radius discipline | Weak | 7 distinct radii (1, 6, 14, 17, 20, 50, 100px) |
| Z-index | Mixed | 22 layers, 1 stacking-order anomaly |
| Accessibility | Weak | 4 contrast failures, 5 axe violations on sample |
| Performance | Unknown | gated site blocks public PSI; needs a CrUX-based audit during Discovery |

## Foundations Extracted

### Colors

**Primitives:** 27 unique values
**Semantic role assignments (designlang heuristic):**

| Role | Hex | Usage count | Notes |
|---|---|---|---|
| primary | `#182465` | 3,776 | brand navy — dominant text, headings, footer bg |
| primary-deep | `#141e53` | 803 | hover/active variant |
| primary-darker | `#252d65` | 433 | secondary surface |
| secondary | `#3860be` | 24 | mid-blue — used sparingly |
| accent / mint | `#e3ffe2` | 7 | gradient end, badges |
| accent-strong | `#a0ff9d` | 6 | callout strip |
| success | `#4cae04` | 7 | confirmation states |
| destructive | `#e00830` | 786 | error / warnings (incl. health-warning banner) |
| brand-magenta | `#ad1f8c` | 40 | one-off accent (campaign page) |
| neutral-90 | `#000000` | 1,275 | body text |
| neutral-80 | `#2f2f2f` | 1,018 | secondary text |
| neutral-60 | `#3a3a3f` | 134 | borders |
| neutral-50 | `#616069` | 7,844 | placeholder text, muted body |
| neutral-40 | `#555555` | 186 | --- |
| neutral-30 | `#808080` | 63 | --- |
| neutral-20 | `#9a9ca8` | 30 | dividers |
| neutral-15 | `#dedede` | 74 | --- |
| neutral-10 | `#ebecf1` | 77 | card surface |
| neutral-05 | `#f6f6f6` | 265 | section banding |
| neutral-00 | `#ffffff` | 1,995 | page background |

**Issues:**
- 4 contrast failures flagged on the source itself
- Multiple near-duplicate navies (`#182465`, `#141e53`, `#252d65`, `#252c68`) — three are within 5 ΔE of each other
- Multiple near-duplicate greys (`#555555`/`#616069`/`#666666`)
- Magenta (`#ad1f8c`) appears on a single archived campaign page

### Typography

**Font families** (in order of use):

| Family | Uses | Notes |
|---|---|---|
| **Santral** | 8,442 | Brand custom; needs license confirmation + self-host pipeline |
| Arial | 363 | Fallback inheritance |
| Times New Roman / Times | 260 | One-off (likely the regulator boilerplate at the page foot) |
| Font Awesome 5 Free | 12 | Icon font — replaceable with inline SVG |
| sans-serif | 6 | Fallback |

**Heading scale:**

| Level | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| h1 | 42px | 800 | 46px | normal |
| h1 (alt) | 34px | 800 | 40px | normal |
| h2 | 32px | 800 | 40px | normal |
| h2 (alt) | 22px | 800 | 26px | 0.5px |
| h4 | 20px | 700 | 28px | normal |

**Body:** 16px / 400 / normal line-height

**Issues:**
- 6 families in use → normalize to **1 (Santral)** + system fallback stack
- 8 distinct font weights in use → normalize to **3 (400 / 700 / 800)**
- 15 type sizes → normalize to a **6-step modular scale** (12, 14, 16, 20, 24, 32, 42)
- No fluid type — every size is a literal pixel value

### Spacing

**Base unit:** 2px (effectively no enforced scale)
**Scale found:** 0, 38, 48, 55, 60, 70, 80, 95, 102, 120, 123, 140, 203, 207, 236, 256, 320 px

**Issues:**
- 17 spacing values, several within 5px of each other (38/48, 55/60, 95/102)
- No 4-step or 8-step grid evident; spacing is ad hoc
- Normalize target: **8-step (4, 8, 16, 24, 32, 48, 64, 96)** + a 2-step macro scale (160, 240) for hero gutters

### Shadows

6 distinct shadows across 3 strength tiers. Examples:
- `sm` — `rgba(47,47,47,0.3) 0 2px 5px 0`
- `md` — `rgb(153,153,153) 0 2px 10px -3px`
- Several variants of `md` differ only by a few percentage points — consolidate to **2 shadows (sm, md)**.

### Radii

`1`, `6`, `14`, `17`, `20`, `50`, `100` px — 7 distinct values. Normalize to `xs/sm/md/lg/full = 2/6/14/24/9999`.

### Motion

Token JSON detected (`zonnic-ca-motion-tokens.json`) but motion patterns are sparse — fades + scroll-driven reveal carousel. Standard `ease-out 200/300/450ms` token set will cover migration needs.

## Accessibility

**Source axe-core violations (8 sample pages):**

| Rule | Impact | Pages |
|---|---|---|
| `link-name` | serious | why-zonnic |
| `definition-list` | serious | why-zonnic |
| `autocomplete-valid` | serious | sign-up |
| `button-name` | critical | sign-up |
| `label` | critical | contact-us-testimonials |

**Plus** 4 contrast failures and 18 axe "incomplete" findings (need manual review).

**WCAG pass rate (designlang DESIGN.md heuristic):** 78%

The migration normalisation removes the 4 contrast failures by tightening neutral text to ≥ AA against backgrounds, and the new EDS forms (sign-up, contact, newsletter) will be accessibility-tested in Phase 5.

## Tech Stack Fingerprint

| Layer | Detected | Migration target |
|---|---|---|
| CMS | AEM as a Cloud Service (BAT global platform) | AEM Edge Delivery (this project) |
| Component library | Custom `bat-*` web components (HBS templates rendered server-side) | EDS blocks (vanilla JS + scoped CSS) |
| CSS approach | Inline + linked stylesheets, 179 `!important` rules | Buildless, block-isolated CSS, no `!important` |
| JS framework | Custom BAT framework | Vanilla ES6+, no transpiling |
| Personalisation | Adobe Target + Audience Manager | EDS A/B + audiences (or maintain Adobe Target via `delayed.js`) |
| Analytics | Adobe Analytics + GA4 + Meta Pixel + ContentSquent | Same vendors via `delayed.js` |
| Consent | OneTrust | OneTrust (loaded ≥ 3s after LCP) |
| CDN | (incapsula edge) + Adobe CDN | hlx/aem.live CDN |

## Third-Party Integrations Detected (28 origins)

| Service | Category | Pages | Current loading | Migration strategy |
|---|---|---|---|---|
| Adobe DTM/Launch (`assets.adobedtm.com`) | analytics | 8/8 | render-blocking | move to `delayed.js`, web-worker if possible |
| Adobe Audience Manager (`dpm.demdex.net`, `batgsd.demdex.net`) | analytics | 8/8 | render-blocking | `delayed.js` |
| Adobe Analytics (`britishamericanshare.tt.omtrdc.net`) | analytics | 8/8 | render-blocking | `delayed.js` |
| Adobe Advertising Cloud (`cm.everesttech.net`) | analytics | 8/8 | render-blocking | `delayed.js` |
| Adobe Adcoud / Audience (`batgsdzoonicprodcanada.112.2o7.net`) | analytics | 8/8 | render-blocking | `delayed.js` |
| Google Tag Manager (`www.googletagmanager.com`) | analytics | 8/8 | render-blocking | `delayed.js` |
| Google DoubleClick (`cm.g.doubleclick.net`) | analytics | 8/8 | render-blocking | `delayed.js` |
| Meta Pixel (`connect.facebook.net`) | analytics | 8/8 | render-blocking | `delayed.js` |
| ContentSquare (`*.contentsquare.net`) | analytics / RUM | 8/8 | render-blocking | `delayed.js` |
| OneTrust (`cdn.cookielaw.org`, `geolocation.onetrust.com`) | consent | 8/8 | render-blocking | per-block lazy + `delayed.js` |
| Qualtrics SiteIntercept (`*.qualtrics.com`) | survey | 8/8 | render-blocking | `delayed.js`, behind feature flag |
| Salesforce Site (`bat-sea.my.site.com`) | account / forms | 7/8 | embedded | API integration via EDS form block |
| Salesforce Embedded Messaging (`bat-sea.my.salesforce-scrt.com`) | chat | 7/8 | render-blocking | `delayed.js` ≥ 3s after LCP |
| BAT internal (`ssapi.vuse.com`) | unknown / shared backend | 8/8 | XHR | confirm with platform team |
| Mapbox (`api.mapbox.com`) | maps | 1/8 (store-locator) | block-scoped | EDS map block, lazy-loaded via IntersectionObserver |
| PriceSpider (`cdn.pricespider.com`, `wtbevents.pricespider.com`) | commerce widget | 1/8 (product-detail) | block-scoped | EDS commerce block, lazy-loaded |
| AdSrvr / AppNexus / Avocet (`adsrvr.org`, `adnxs.com`, `avocet.io`) | ad tech / programmatic | 8/8 | render-blocking | review with marketing — likely retire |
| unpkg / npmcdn | cdn | 1/8 | render-blocking | inline or self-host |
| **Adobe EDS RUM** (`rum.hlx.page`) | RUM | 8/8 | edge-pixel | inherit on EDS migration ✓ |

The presence of `rum.hlx.page` is interesting — the BAT platform appears to already be experimenting with EDS instrumentation; the migration may have a friendlier hand-off than expected.

## Backend Dependencies (server-side features that need alternatives)

| Feature | Today | EDS approach |
|---|---|---|
| Age gate (province + DOB selection) | Server-side BAT component sets `age_verify`, `regionCode`, `setStore`, `webSite` cookies and gates content | **Edge worker / middleware**: a lightweight CDN function intercepts requests; if `age_verify` cookie is missing redirects to a static `/age-gate` page that, on accept, sets the cookies and redirects back. EDS routes themselves stay static. |
| Province / region routing | Cookie + URL prefix (`/ca/en`) drives store-list, retailer integrations | EDS `/ca/en` routes; province held in a single signed cookie; per-province content selected via section metadata or a `region` block-variant |
| Sign-up (account creation) | Posts to Salesforce Site API (`bat-sea.my.site.com`) | EDS form block + Salesforce REST API call from a serverless function (Cloudflare Worker / hlx function) |
| Newsletter signup | Salesforce Site form post | Same form-block pattern |
| Store locator | Custom widget calling Mapbox + a BAT store-list API | EDS `store-locator` block: Mapbox GL + JSON store data published to `/stores.json` |
| Online purchase ("Buy now") | PriceSpider widget bridging to Felix retailer | EDS `commerce` block: lazy-loaded PriceSpider iframe + analytics events |
| Embedded chat | Salesforce Embedded Messaging | `delayed.js` injection |
| Personalisation / experiments | Adobe Target | Either keep Adobe Target loaded via `delayed.js`, or move to EDS A/B testing — Discovery decision |
| Search (HELP / FAQ) | Native AEM search | EDS site search via published JSON index + client-side filtering |
| Privacy / cookie preferences | OneTrust SDK | OneTrust SDK loaded by `delayed.js` |
