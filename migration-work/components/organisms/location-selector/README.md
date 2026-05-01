# Location Selector

**Organism**  ·  ⚠️ Regulatory  ·  Province/region selector modal. Controls pricing + retailer availability. 24 instances site-wide (modal singleton).

## Observed on the live site

- **Total instances:** 24
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `bat-locationselector-zonnic`, `.bat-locationselector-zonnic`

| Page | Count |
|------|-------|
| `contact-us-testimonials` | 3 |
| `homepage` | 3 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 3 |
| `sign-up` | 3 |
| `store-locator` | 3 |
| `testingblogarticletemplate` | 3 |
| `what-is-zonnic` | 3 |
| `why-zonnic` | 3 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-locationselector-zonnic` | `homepage` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `new-block:location-selector`
- **Notes:** REGULATORY — required to render province-appropriate content/pricing. Inside modal-shell molecule. Persist via signed cookie.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.