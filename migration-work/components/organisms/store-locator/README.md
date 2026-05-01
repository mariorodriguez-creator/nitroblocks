# Store Locator

**Organism**  ·  Mapbox-powered store locator: map + list + filters + search.

## Observed on the live site

- **Total instances:** 1
- **Page spread:** 1 pages (of 1 declared)
- **DOM fingerprint:** `bat-mapboxstorelocator-zonnic`, `.bat-mapboxstorelocator-zonnic`

| Page | Count |
|------|-------|
| `store-locator` | 1 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-mapboxstorelocator-zonnic` | `store-locator` | ![default](./evidence/default.png) | extracted |

## EDS mapping

- **Strategy:** `new-block:store-locator`
- **Notes:** XL complexity. Mapbox GL JS in delayed.js; data source = retailer JSON feed.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.