# Cta List

**Molecule**  ·  Authored CTA group (primary + secondary button pair). Wrapped by bat-cta-default / bat-cta-loggedin / bat-cta-account depending on auth context. 40 uses across 8 pages.

## Observed on the live site

- **Total instances:** 151
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `bat-cta-default`, `bat-cta-loggedin`, `bat-cta-account`, `.bat-cta-list`, `.bat-cta-list--horizontal`

| Page | Count |
|------|-------|
| `why-zonnic` | 32 |
| `store-locator` | 24 |
| `what-is-zonnic` | 22 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 20 |
| `homepage` | 16 |
| `testingblogarticletemplate` | 13 |
| `contact-us-testimonials` | 12 |
| `sign-up` | 12 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `horizontal` | `bat-cta-default .bat-cta-list--horizontal, .bat-cta-list--horizontal` | `homepage` | ![horizontal](./evidence/horizontal.png) | extracted |
| `logged-in` | `bat-cta-loggedin` | `homepage` | ![logged-in](./evidence/logged-in.png) | extracted |
| `account` | `bat-cta-account` | `what-is-zonnic` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `default-content + audience metadata`
- **Notes:** Consecutive links inside the same paragraph → auto-wrapped as button pair. Audience variants (logged-in / account) map to EDS section metadata `Audience` or experimentation fragments.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.