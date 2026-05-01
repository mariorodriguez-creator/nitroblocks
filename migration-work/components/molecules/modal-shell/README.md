# Modal Shell

**Molecule**  ·  Modal container with close affordance. 41 uses (login, mini-cart, location selector, age gate all reuse the shell).

## Observed on the live site

- **Total instances:** 189
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `.bat-modal`, `.bat-modal-content`, `.bat-modal-close`

| Page | Count |
|------|-------|
| `sign-up` | 28 |
| `contact-us-testimonials` | 23 |
| `homepage` | 23 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 23 |
| `store-locator` | 23 |
| `testingblogarticletemplate` | 23 |
| `what-is-zonnic` | 23 |
| `why-zonnic` | 23 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `.bat-modal` | `homepage` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `scripts.js decoration`
- **Notes:** EDS global modal helper, reused by auth, cart, location selector, age gate.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.