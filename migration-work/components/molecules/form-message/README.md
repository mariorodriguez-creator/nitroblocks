# Form Message

**Molecule**  ·  Inline validation / status text block. 143 .bat-form-msg instances.

## Observed on the live site

- **Total instances:** 160
- **Page spread:** 8 pages (of 4 declared)
- **DOM fingerprint:** `.bat-form-msg`, `.bat-form-field-tip`

| Page | Count |
|------|-------|
| `sign-up` | 33 |
| `contact-us-testimonials` | 23 |
| `homepage` | 18 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 18 |
| `store-locator` | 18 |
| `what-is-zonnic` | 18 |
| `why-zonnic` | 18 |
| `testingblogarticletemplate` | 14 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `error` | `.bat-form-field .bat-form-msg` | `sign-up` | HTML only | HTML captured (hidden in modal) |
| `tip` | `.bat-form-field .bat-form-field-tip` | `sign-up` | ![tip](./evidence/tip.png) | extracted |

## EDS mapping

- **Strategy:** `default-content`
- **Notes:** Inside the `form` block rows.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.