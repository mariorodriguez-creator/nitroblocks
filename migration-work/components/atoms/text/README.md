# Text

**Atom**  ·  Body text container (paragraphs, lists, rich text). 175 bat-text-default + bat-text-box instances.

## Observed on the live site

- **Total instances:** 352
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `bat-text-default`, `bat-text-box`, `.bat-text`

| Page | Count |
|------|-------|
| `what-is-zonnic` | 104 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 64 |
| `why-zonnic` | 56 |
| `store-locator` | 40 |
| `testingblogarticletemplate` | 30 |
| `homepage` | 28 |
| `sign-up` | 16 |
| `contact-us-testimonials` | 14 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-text-default:not(:empty)` | `homepage` | ![default](./evidence/default.png) | extracted |
| `boxed` | `bat-text-box` | `contact-us` | ![boxed](./evidence/boxed.png) | extracted |

## EDS mapping

- **Strategy:** `default-content`
- **Notes:** Default content paragraphs.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.