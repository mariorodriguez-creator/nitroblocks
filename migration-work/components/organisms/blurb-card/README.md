# Blurb Card

**Organism**  ·  Icon-led feature/benefit card: image + heading + body + optional CTA. 34 uses on 2 pages.

## Observed on the live site

- **Total instances:** 204
- **Page spread:** 2 pages (of 2 declared)
- **DOM fingerprint:** `bat-card-blurb`, `.bat-card--blurb`

| Page | Count |
|------|-------|
| `homepage` | 114 |
| `why-zonnic` | 90 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-card-blurb` | `homepage` | ![default](./evidence/default.png) | extracted |

## EDS mapping

- **Strategy:** `existing-block:cards`
- **Notes:** Block Collection `cards` block with blurb variant (icon + heading + body).

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.