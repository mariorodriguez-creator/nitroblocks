# Product Carousel

**Organism**  ·  Horizontal product carousel. 6 uses on 3 pages.

## Observed on the live site

- **Total instances:** 6
- **Page spread:** 3 pages (of 3 declared)
- **DOM fingerprint:** `bat-carousel-product`

| Page | Count |
|------|-------|
| `homepage` | 2 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 2 |
| `why-zonnic` | 2 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-carousel-product` | `homepage` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `adapt-block:carousel`
- **Notes:** Block Collection carousel with product-card content model.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.