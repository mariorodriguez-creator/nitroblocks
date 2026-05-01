# Button

**Atom**  ·  Primary interaction atom. ALL CAPS pill button. 349 uses across 8 pages.

## Observed on the live site

- **Total instances:** 377
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `.bat-cta-style`, `.bat-button`

| Page | Count |
|------|-------|
| `homepage` | 88 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 61 |
| `what-is-zonnic` | 44 |
| `why-zonnic` | 42 |
| `store-locator` | 41 |
| `sign-up` | 35 |
| `testingblogarticletemplate` | 34 |
| `contact-us-testimonials` | 32 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `primary` | `.bat-cta-style.button-dark:not(.button-secondary-dark)` | `homepage` | ![primary](./evidence/primary.png) | extracted |
| `secondary` | `.bat-cta-style.button-secondary-dark` | `homepage` | ![secondary](./evidence/secondary.png) | extracted |
| `arrow-link` | `a.arrow-link-dark, .bat-cta-style.button-dark.arrow-link-dark` | `homepage` | ![arrow-link](./evidence/arrow-link.png) | extracted |

## EDS mapping

- **Strategy:** `default-content + scripts.js decoration`
- **Notes:** Authors write a link; scripts.js promotes to .button.primary / .button.secondary. Arrow-link variant = inline 'learn more' affordance. `on-dark` is the same pill swapped by parent theme class (no discrete variant in the live DOM today).

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.