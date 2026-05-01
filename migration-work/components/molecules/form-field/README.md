# Form Field

**Molecule**  ·  Label + control + hint/error. 243 uses on 8 pages. Core composition unit of every form.

## Observed on the live site

- **Total instances:** 444
- **Page spread:** 8 pages (of 4 declared)
- **DOM fingerprint:** `.bat-form-field`, `.bat-form-field-tip`, `.bat-form-msg`

| Page | Count |
|------|-------|
| `sign-up` | 84 |
| `contact-us-testimonials` | 69 |
| `homepage` | 49 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 49 |
| `store-locator` | 49 |
| `what-is-zonnic` | 49 |
| `why-zonnic` | 49 |
| `testingblogarticletemplate` | 46 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `.bat-form-field:not(.bat-form-field--hidden)` | `sign-up` | ![default](./evidence/default.png) | extracted |
| `error` | `.bat-form-field .bat-form-msg:not(:empty)` | `sign-up` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `default-content`
- **Notes:** Inside the `form` block, rows map to fields — migration-work generates content-model per field.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.