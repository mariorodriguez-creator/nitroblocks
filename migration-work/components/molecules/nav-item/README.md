# Nav Item

**Molecule**  ·  Single navigation menu entry. Icon + label (+ optional badge). 72 uses site-wide.

## Observed on the live site

- **Total instances:** 184
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `.bat-navigation-group-list-item`, `.bat-navigation-group-list-item-link`

| Page | Count |
|------|-------|
| `contact-us-testimonials` | 23 |
| `homepage` | 23 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 23 |
| `sign-up` | 23 |
| `store-locator` | 23 |
| `testingblogarticletemplate` | 23 |
| `what-is-zonnic` | 23 |
| `why-zonnic` | 23 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `desktop` | `.bat-navigation-group-list-item:not(.bat-navigation-group-list-item--zonnic-mobile)` | `homepage` | ![desktop](./evidence/desktop.png) | extracted |
| `mobile` | `.bat-navigation-group-list-item--zonnic-mobile` | `homepage` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `default-content`
- **Notes:** Inside `header` block; built by nav.plain.html fragment.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.