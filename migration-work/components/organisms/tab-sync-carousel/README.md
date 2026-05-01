# Tab Sync Carousel

**Organism**  ·  Testimonial/tabbed carousel: tabs drive a paired carousel slide. 12 uses on 3 pages.

## Observed on the live site

- **Total instances:** 12
- **Page spread:** 3 pages (of 3 declared)
- **DOM fingerprint:** `bat-carousel-zonnictabsync`, `.bat-carousel-zonnictabsync`

| Page | Count |
|------|-------|
| `homepage` | 4 |
| `store-locator` | 4 |
| `why-zonnic` | 4 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-carousel-zonnictabsync` | `homepage` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `new-block:tab-carousel`
- **Notes:** Composes Block Collection tabs + carousel into a paired widget. Could also be two separate blocks synced via section metadata.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.