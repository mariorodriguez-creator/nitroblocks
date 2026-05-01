# Mini Cart

**Organism**  ·  Flyout mini-cart. 16 instances site-wide (singleton).

## Observed on the live site

- **Total instances:** 16
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `bat-minicart-zonnic`, `.bat-minicart-zonnic`

| Page | Count |
|------|-------|
| `contact-us-testimonials` | 2 |
| `homepage` | 2 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 2 |
| `sign-up` | 2 |
| `store-locator` | 2 |
| `testingblogarticletemplate` | 2 |
| `what-is-zonnic` | 2 |
| `why-zonnic` | 2 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-minicart-zonnic` | `homepage` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `new-block:mini-cart`
- **Notes:** Depends on PriceSpider / backend cart API; check whether EDS needs client cart state at all or deep-links to retailer.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.