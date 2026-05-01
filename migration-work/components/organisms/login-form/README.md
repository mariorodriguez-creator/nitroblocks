# Login Form

**Organism**  ·  Login form (email + password). Rendered inside global modal shell on all 8 pages.

## Observed on the live site

- **Total instances:** 48
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `bat-form-loginzonnic`, `.bat-form--login-zonnic`

| Page | Count |
|------|-------|
| `contact-us-testimonials` | 6 |
| `homepage` | 6 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 6 |
| `sign-up` | 6 |
| `store-locator` | 6 |
| `testingblogarticletemplate` | 6 |
| `what-is-zonnic` | 6 |
| `why-zonnic` | 6 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-form-loginzonnic` | `homepage` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `new-block:login-form`
- **Notes:** Inside modal-shell molecule. Delivered via `/login.plain.html` fragment loaded on demand.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.