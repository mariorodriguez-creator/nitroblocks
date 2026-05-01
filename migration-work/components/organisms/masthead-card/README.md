# Masthead Card

**Organism**  ·  Card with full-bleed background image + heading + body + CTA list. 32 instances on 3 pages. Primary marketing-banner pattern.

## Observed on the live site

- **Total instances:** 224
- **Page spread:** 3 pages (of 3 declared)
- **DOM fingerprint:** `bat-card-mastheadzonnic`, `.bat-card--masthead-zonnic`

| Page | Count |
|------|-------|
| `homepage` | 105 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 105 |
| `store-locator` | 14 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-card-mastheadzonnic` | `homepage` | ![default](./evidence/default.png) | extracted |

## EDS mapping

- **Strategy:** `new-block:marketing-banner`
- **Notes:** New block, content-model: heading + optional sub + 1–2 CTAs; section metadata picks bg image + theme.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.