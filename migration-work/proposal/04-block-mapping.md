# Block Mapping — zonnic.ca organisms → EDS blocks

Block Collection (`https://github.com/adobe/aem-block-collection`) and the current Nitroblocks project (`blocks/`) were surveyed. Existing blocks: `cards`, `columns`, `countdown`, `footer`, `fragment`, `header`, `hero`, `tabs` — note that `countdown`, `hero`, `tabs` are currently **empty scaffolds** (`*.js` files are 0 bytes).

Classification below combines match type + development effort. Effort ranges are midpoint — see [05-work-items.md](05-work-items.md) for full breakdown.

## Reuse As-Is (3 items — 0h)

| Organism | Block | Notes |
|---|---|---|
| `bat-section-default` + EDS section metadata | EDS sections (native) | Use section `Style` property for dark / narrow / wide variants |
| `bat-cta-default` (base) | button auto-decoration (already in `scripts/scripts.js`) | Primary/secondary/accent variants already wired; keep |
| `bat-headline-default` / `bat-text-default` / `bat-image-default` | default content (H*, P, IMG) | Drive typography normalization through `styles/styles.css` |

## Adapt (4 items — ~18–30h)

Existing block needs new variants or JS/CSS extension.

| Organism | Base block | Variants / changes | Effort |
|---|---|---|---|
| `bat-header-zonnicheadless` | `blocks/header` (existing, 171 LOC JS, 272 LOC CSS) | add account menu slot, location selector trigger, minicart trigger, multi-level nav with mega-menu | M |
| `bat-footer-zonnic` | `blocks/footer` (existing, 20 LOC) | add multi-column layout, social-nav, legal links, secondary logo row | S |
| `bat-hero-zonnic` | `blocks/hero` (empty scaffold — **create from scratch**) | headline + body + CTA stack + full-bleed image; variants: `(dark)`, `(split)`, `(centered)` | M |
| blog listing + blog article | `blocks/cards` (existing, 17/27 LOC) | add `(blog)` variant: image + heading + excerpt + date + tag | S |

## Develop New (20 items — ~150–230h)

### Global / chrome organisms

| Block name | Content model sketch | JS complexity | CSS complexity | Reference | Size |
|---|---|---|---|---|---|
| `age-gate` | 1 row: date-of-birth fields + legal text + continue CTA | interactive (cookie set/check) | responsive modal | n/a | **L** |
| `announcement-bar` | 1 row: rich text + optional link | decoration-only | simple banner | — | **S** |
| `location-selector` | 1 row: list of locales + "keep current" CTA | modal open/close + cookie | responsive modal | — | **M** |
| `modal` (shared container) | generic wrapper; used by login/signup/location-selector/password-reset | focus trap + a11y escape | overlay + animation | — | **M** |
| `minicart` (commerce — **defer**) | product rows + total + checkout CTA | async data + state | responsive slide-in | — | **XL** (optional scope) |

### Content organisms

| Block name | Content model sketch | JS complexity | CSS complexity | Reference | Size |
|---|---|---|---|---|---|
| `masthead-card` | Row 1: image; Row 2: eyebrow; Row 3: heading; Row 4: body; Row 5: CTA(s) | decoration-only | full-bleed + responsive | block-collection `hero` | **M** |
| `blurb-card` | Row 1: icon + heading; Row 2: body; Row 3: CTA | decoration-only | responsive flex | — | **S** |
| `blog-card` | Row 1: image; Row 2: tag + date; Row 3: heading; Row 4: excerpt | decoration-only | card grid | block-collection `cards` | **S** |
| `contact-card` | Row 1: image; Row 2: name; Row 3: title; Row 4: contact links | decoration-only | simple | — | **S** |
| `faq` | Multi-row: Q/A pairs | accordion state + a11y `aria-expanded` | responsive, print-friendly | — | **M** |
| `product-carousel` | Rows: product cards | interactive (slick.js replacement — prefer native `scroll-snap`) | touch + arrows | block-collection `carousel` | **L** |
| `tabbed-carousel` | Row 0: tab labels; rows per tab: slides | interactive (tab + carousel combined, a11y-heavy) | two-layer UI | — | **XL** |
| `product-hero` | Row 1: product image; Row 2: name + price; Row 3: specs; Row 4: buy CTAs | async data (product info) | responsive product grid | — | **L** |
| `product-card` | Row 1: image; Row 2: name + price; Row 3: buy button | decoration-only | grid | — | **S** |
| `cta` (variants: `default`, `logged-in`, `account`) | Row 1: heading; Row 2: body; Row 3: CTAs | conditional render (logged-in check) | simple | — | **M** |
| `signup-form` (variants: `default`, `newsletter`, `autofill-login`) | Rows: form fields + submit + consent | validation + POST to Salesforce | responsive form | — | **L** |
| `login-form` | Rows: username + password + forgot-password link + signup link | Salesforce auth integration | modal + inline | — | **L** (+ architectural decision) |
| `password-reset-form` | Rows: email + submit | Salesforce POST | modal | — | **M** |
| `store-locator` | Rows: headline + filters + store list + map | async data + Mapbox + geocoding | full-bleed split layout | — | **XL** |
| `text` (variants: `(default)`, `(box)`) | 1 row: rich text | decoration-only | variant adds border + bg | — | **XS** |

## New block count by size

| Size | Count | Hours (midpoint) | Hours (max) |
|---|---:|---:|---:|
| XS | 1 | 1.5 | 2 |
| S | 6 | 18 | 24 |
| M | 6 | 36 | 48 |
| L | 5 | 60 | 80 |
| XL | 2 (+ 1 deferred) | 56 (+ 28) | 80 (+ 40) |
| **Total** | **20** | **~172h** | **~234h** |

Deferred: `minicart` is marked XL and dependent on whether ZONNIC ships e-commerce through the EDS site. Current DOM evidence shows `bat-minicart-zonnic` exists on every page but is hidden (`d-none` class). This should be a Phase 1 discovery decision.

## Content Model Sketches (per new block)

Authoring tables the authors will type in Word / Google Docs. The block CSS scoping is `.{blockname}` — see CLAUDE.md for conventions.

### `age-gate`

```
| age-gate |
|---|
| Birthday (DD/MM/YYYY) |
| Location (Canada) |
| You must be X or older... |
| Yes, I am [button] |
```
Variant: `age-gate (reduced)` — remove location dropdown when site is already locale-confirmed.

### `announcement-bar`

```
| announcement-bar (warning) |
|---|
| **Nicotine is an addictive chemical.** [Learn more](/...) |
```

### `masthead-card`

```
| masthead-card (dark) |
|---|
| ![hero image](image.jpg) |
| Eyebrow text |
| # Big heading |
| Body paragraph explaining value prop. |
| [Primary CTA](/link) [Secondary CTA](/link-2) |
```
Variants: `(dark)`, `(centered)`, `(split-image-right)`.

### `blurb-card`

```
| blurb-card |
|---|
| :icon-leaf: |
| ## Short heading |
| Brief body. |
| [Link text](/link) |
```

### `blog-card`

Used as rows of a parent `cards (blog)` block:
```
| cards (blog) |
|---|
| ![thumb](img.jpg) | 2026-03-01 | Category | ## Article title | Short excerpt. | [Read more](/path) |
| ![thumb](img2.jpg) | 2026-03-10 | Category | ## Article title 2 | Short excerpt. | [Read more](/path2) |
```

### `faq`

```
| faq |
|---|
| **Question 1?** |
| Answer 1 body. |
| **Question 2?** |
| Answer 2 body. |
```

### `store-locator`

```
| store-locator |
|---|
| ## Find ZONNIC near you |
| [stores.json](/content/zonnic-ca/stores.json) |
```
The block reads the index JSON from the linked URL + renders Mapbox. Authors never touch map config.

### `signup-form`

```
| signup-form (newsletter) |
|---|
| ## Sign up for exclusive offers |
| Email address | |
| First name | |
| Last name | |
| [By clicking submit, I agree to ...] | |
| [Submit] | |
```
Variants: `(default)`, `(newsletter)`, `(autofill-login)`.

Remaining block content models are documented within their Phase 3 spec files during implementation (via speckit).

## Gap Analysis Summary

| Stage | Count | Effort (midpoint) |
|---|---:|---:|
| Reuse as-is | 3 | 0h |
| Adapt | 4 | ~24h |
| Develop new | 20 | ~172h |
| Templates + auto-blocking | 3 template classes | ~20h |
| Vendor snippet integrations (client-provided) | 14 snippets | ~30h midpoint, ~40h max |
| **Total Phase 3 "Site Build"** | | **~290h midpoint, ~400h max** |

Hours above include both block code and the vendor snippet drop-ins; they roll up into Phase 3 in [07-timeline-and-resources.md](07-timeline-and-resources.md).

**Scope clarification:** third-party integrations are *not* engineered as part of this migration. The client provides the vendor HTML/JS snippet for each of the 14 integrations (OneTrust, Salesforce auth + chat, Qualtrics, Mapbox, DTM, GTM, ContentSquare, Target, AAM, ad pixels, ssapi, PriceSpider, unpkg self-host, RUM). The migration team's responsibility is to paste each snippet in the correct spot (default: `delayed.js`) and verify Lighthouse 100 stays green.
