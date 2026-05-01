# Icon

**Atom**  ·  Inline SVG icon. 206 uses across 8 pages. Used for chevrons, bullets, and interactive affordances.

## Observed on the live site

- **Total instances:** 206
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `.bat-icon`

| Page | Count |
|------|-------|
| `why-zonnic` | 35 |
| `homepage` | 32 |
| `store-locator` | 29 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 27 |
| `what-is-zonnic` | 23 |
| `sign-up` | 21 |
| `contact-us-testimonials` | 20 |
| `testingblogarticletemplate` | 19 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `.bat-icon` | `homepage` | ![default](./evidence/default.png) | extracted |

## EDS mapping

- **Strategy:** `default-content`
- **Notes:** EDS inline-SVG sprite via :icon-name: authoring notation.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.