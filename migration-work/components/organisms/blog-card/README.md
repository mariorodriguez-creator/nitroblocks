# Blog Card

**Organism**  ·  Blog teaser card: thumbnail + heading + excerpt + read-more CTA. 18 uses on 2 pages.

## Observed on the live site

- **Total instances:** 108
- **Page spread:** 2 pages (of 2 declared)
- **DOM fingerprint:** `bat-card-blog`, `.bat-card--blog`

| Page | Count |
|------|-------|
| `homepage` | 90 |
| `testingblogarticletemplate` | 18 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-card-blog` | `homepage` | ![default](./evidence/default.png) | extracted |

## EDS mapping

- **Strategy:** `adapt-block:cards`
- **Notes:** Block Collection `cards` block with `article` variant.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.