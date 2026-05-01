# Block Mapping — Zonnic Canada

Each organism in `03-atomic-inventory.md` is mapped to its EDS implementation strategy below. References are to the [Adobe Block Collection](https://www.aem.live/developer/block-collection) and the [Block Party](https://www.aem.live/developer/block-party/) where applicable.

## Reuse As-Is (8 blocks)

| Organism | Block Collection block | Notes |
|---|---|---|
| Header / primary nav | `header` | Standard responsive nav; we just plug Zonnic's nav doc |
| Footer | `footer` | Standard 4-column; we plug the legal-mandated copy |
| Cards (general) | `cards` | 3-up grid; image + heading + body + link |
| Carousel | `carousel` | Used as the testimonial carousel base |
| Accordion | `accordion` | FAQ pattern, `<details>` semantics |
| Embed | `embed` | YouTube / video.js variant for "HOW TO OPEN" video |
| Columns | `columns` | 50/50 image+text and asymmetric splits |
| Hero | `hero` | Single hero block with size/style modifiers |

## Adapt (Add Variants) (4 work items)

| Organism | Base block | Variants needed | Effort |
|---|---|---|---|
| Header utility nav (BC|EN, login, healthcare-pro) | `header` | new utility-nav slot in the doc model + decorator hook | S |
| Footer newsletter slot | `footer` | embed `newsletter-strip` fragment in column 1 | S |
| Carousel — testimonial variant | `carousel` | `(testimonial)` modifier: portrait + quote + name/loc; CSS-only; uses Block Collection JS as-is | S |
| Cards — product/article/step/app-step variants | `cards` | 4 new modifier classes: `(products)`, `(articles)`, `(steps)`, `(app-steps)` — pure CSS variants | S |

## Develop New (7 blocks)

### `marketing-banner`

Full-bleed hero-like strip with heading + sub + CTA.

- **Block name:** `marketing-banner`
- **Variants:** `(navy)`, `(mint)` for the brand-color background
- **Content model:** single-cell row with `<h2>`, `<p>`, optional CTA link
- **JS complexity:** none (decorator only — promotes the link to a button class)
- **CSS complexity:** S — full-bleed via `width: 100vw; margin-left: calc(-50vw + 50%)`, vertical centering, responsive padding
- **Reference:** Block Collection [marquee](https://www.aem.live/developer/block-collection) — adapt
- **Effort:** S

### `text-image` (brand panel)

Image + heading + bulleted body, two layouts (image-left / image-right).

- **Block name:** `text-image`
- **Variants:** `(image-left)` (default), `(image-right)`, `(navy)` (background tint)
- **Content model:** 2-column row — image cell + content cell with heading, paragraph, list
- **JS complexity:** none (decorator-only)
- **CSS complexity:** M — needs flex-reverse for `image-right`, responsive stacking, list bullet styling per brand
- **Reference:** Block Party [side-by-side](https://www.aem.live/developer/block-party/) — adapt
- **Effort:** M

### `newsletter-strip`

Persistent newsletter signup CTA appearing on every page.

- **Block name:** `newsletter-strip`
- **Variants:** none
- **Content model:** heading text + body text + form-action URL (Salesforce endpoint) — published as a fragment to `/fragments/newsletter-strip` and pulled in by every section's metadata
- **JS complexity:** S — submits to Salesforce, handles success/error states, fires analytics
- **CSS complexity:** S
- **Reference:** Block Collection [form](https://www.aem.live/developer/block-collection)
- **Effort:** M

### `form` (multi-section)

The sign-up form is multi-section (Create Your Account / Billing Address / Sign-In Details / Consent / Demographic).

- **Block name:** `form`
- **Variants:** `(multi-section)`, `(contact)`, `(newsletter)` — share a common JSON-driven form runtime; each variant differs only in fields
- **Content model:** authoring sheet (`/forms/sign-up.json` or via Forms Block convention) — fields, labels, validators, server endpoint
- **JS complexity:** L — section progression, client-side validation, autocomplete fix, ARIA live region for errors, success/failure handling, integrates with Salesforce REST API
- **CSS complexity:** M — section banding, error states, focus management
- **Reference:** Block Collection [form](https://www.aem.live/developer/block-collection) — extend with multi-section logic
- **Effort:** L

### `store-locator`

Mapbox map + filtered list + use-current-location button.

- **Block name:** `store-locator`
- **Variants:** none initially (one Canadian deployment)
- **Content model:** authoring metadata pointing at `/data/stores.json` (publishing pipeline); block reads + filters
- **JS complexity:** XL — Mapbox GL JS init (lazy-loaded via IntersectionObserver), geolocation, list virtualisation, search/filter, marker rendering, accessibility (focus management, keyboard nav of list)
- **CSS complexity:** M — split layout, responsive (map collapses on mobile), marker styles
- **Reference:** Block Party `map` examples — heavy adapt
- **Effort:** XL

### `commerce` (PriceSpider widget)

"Buy now" panel that loads PriceSpider lazily and federates to Felix retailer.

- **Block name:** `commerce`
- **Variants:** `(buy-now)`, `(find-store)`
- **Content model:** product SKU in metadata; block injects PriceSpider container
- **JS complexity:** M — loads PriceSpider script via `loadScript` after IntersectionObserver triggers, wraps the iframe with EDS-styled chrome, fires analytics events
- **CSS complexity:** S
- **Reference:** none (vendor integration)
- **Effort:** M

### `product-header`

Product detail page header — auto-blocked from page metadata + first image.

- **Block name:** `product-header` (auto-blocked)
- **Variants:** none
- **Content model:** auto-blocking rule in `scripts.js` activates when `template: product` metadata is present; reads `<h1>`, hero image, "READ MORE" link, commerce CTA, retailer step list
- **JS complexity:** M — auto-blocking, image gallery (thumb strip), tabs, integration with `commerce` block below
- **CSS complexity:** M — split layout, image gallery, retailer step list
- **Effort:** M

## Auto-Blocked Templates

| Template | Auto-block rule | Activates on |
|---|---|---|
| article-header (blog) | combines `<h1>`, hero image, author/date metadata, breadcrumb | `template: article` metadata |
| product-header | combines `<h1>`, gallery, commerce CTA | `template: product` metadata |

These follow the same pattern documented in [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks#auto-blocking). The auto-blocking happens in `buildAutoBlocks()` of `scripts.js` early in decoration, before blocks are loaded.

## Header / Footer / Persistent Chrome

The header, footer, persistent QuitZone CTA strip, and newsletter strip all live as **fragments** at `/fragments/{name}`. Each section can pull them in via section metadata. This matches the Block Collection convention and avoids duplicating chrome across templates.

| Fragment | Origin | Loads via |
|---|---|---|
| `/fragments/header` | authored doc | section metadata in every template (or built-in `loadHeader`) |
| `/fragments/footer` | authored doc | section metadata, lazy phase |
| `/fragments/warning-banner` | authored doc | first section of every page (auto-injected if missing) |
| `/fragments/quitzone-strip` | authored doc | second section header companion |
| `/fragments/newsletter-strip` | authored doc | second-to-last section of every page |

## Content Model Sketches

Every new block ships with an authoring guide (per `eds-documentation` skill). Sketches:

### `marketing-banner` content sketch

```
+-------------------------+
| marketing-banner (navy) |
+-------------------------+
| ## Quit smoking on ice. |
| Adding yourself? You'll |
| love...                 |
| [Watch their stories]   |
+-------------------------+
```

Becomes after decoration:
```html
<div class="marketing-banner navy">
  <div>
    <div>
      <h2>Quit smoking on ice.</h2>
      <p>Adding yourself? You'll love...</p>
      <p class="button-container"><a class="button primary" href="...">Watch their stories</a></p>
    </div>
  </div>
</div>
```

### `text-image (image-right)` content sketch

```
+----------------------------+--------------------+
| text-image (image-right)   |                    |
+----------------------------+--------------------+
| ## Zonnic, here to support | ![Hand holding can] |
| your cessation journey.    |                    |
|                            |                    |
| - Contains no nicotine...  |                    |
| - Compared to a cigarette… |                    |
| - No smoke, smell or ash…  |                    |
+----------------------------+--------------------+
```

### `accordion` content sketch (Block Collection)

```
+--------------+
| accordion    |
+--------------+
| ## Q1?       |
| Answer 1...  |
+--------------+
| ## Q2?       |
| Answer 2...  |
+--------------+
```

### `cards (steps)` content sketch

```
+---------------+
| cards (steps) |
+---------------+
| ![Icon 1] |   |
| Outrun the    |
| cold.         |
| Hit your      |
| goals.        |
+---------------+
| ![Icon 2] |   |
| Goodbye       |
| smoking…      |
+---------------+
```

Each row is a step card; CSS variant `(steps)` adds the icon + heading + body layout and a 3-up grid.

### `form (multi-section)` content sketch

Authors maintain `/forms/sign-up.json` (or use the Forms Block sheet convention):

```json
{
  "sections": [
    { "title": "Create Your Account", "fields": [
      {"name": "firstName", "label": "First Name", "type": "text", "required": true},
      {"name": "lastName", "label": "Last Name", "type": "text", "required": true},
      {"name": "email", "label": "Email", "type": "email", "required": true},
      {"name": "dob", "label": "Date of Birth", "type": "date", "required": true, "minAge": 18}
    ]},
    { "title": "Billing Address", "fields": [...] },
    { "title": "Sign-in Details", "fields": [...] },
    { "title": "Consent", "fields": [...] },
    { "title": "Demographic", "fields": [...] }
  ],
  "submit": {
    "endpoint": "https://bat-sea.my.site.com/services/apexrest/zonnic/signup",
    "method": "POST"
  }
}
```

In the page, authors place a single `form` block with a row pointing at the JSON path:

```
+----------------+
| form           |
+----------------+
| /forms/sign-up |
+----------------+
```

### `store-locator` content sketch

```
+----------------------------+
| store-locator              |
+----------------------------+
| /data/stores               |
+----------------------------+
| { "country": "CA",         |
|   "default-zoom": 5,       |
|   "default-center":        |
|       [-95, 60] }          |
+----------------------------+
```

The block reads `/data/stores.json` (a published indexed sheet), initialises Mapbox lazily, and renders the filtered list.
