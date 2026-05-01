# Header

**Organism**  ·  Two-row global header: utility strip + primary navigation + hamburger on mobile. 8/8 pages.

## Observed on the live site

- **Total instances:** 8
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `bat-header-zonnicheadless`, `.bat-header-zonnic`

| Page | Count |
|------|-------|
| `contact-us-testimonials` | 1 |
| `homepage` | 1 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 1 |
| `sign-up` | 1 |
| `store-locator` | 1 |
| `testingblogarticletemplate` | 1 |
| `what-is-zonnic` | 1 |
| `why-zonnic` | 1 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-header-zonnicheadless` | `homepage` | ![default](./evidence/default.png) | extracted |

## EDS mapping

- **Strategy:** `adapt-block:header`
- **Notes:** Reuse Block Collection header; add utility strip slot + location selector trigger + mini-cart.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.