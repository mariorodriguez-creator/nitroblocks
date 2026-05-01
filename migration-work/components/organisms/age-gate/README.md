# Age Gate

**Organism**  ·  ⚠️ Regulatory  ·  Health Canada regulatory first-visit gate. Logo + welcome + province select + 18+ confirm. 8/8 pages carry the instance (hidden after cookie).

## Observed on the live site

- **Total instances:** 104
- **Page spread:** 8 pages (of 8 declared)
- **DOM fingerprint:** `bat-agegate-zonnic`, `.bat-agegate--zonnic`

| Page | Count |
|------|-------|
| `contact-us-testimonials` | 13 |
| `homepage` | 13 |
| `pouches-zonnic-mint-24-nicotine-pouches` | 13 |
| `sign-up` | 13 |
| `store-locator` | 13 |
| `testingblogarticletemplate` | 13 |
| `what-is-zonnic` | 13 |
| `why-zonnic` | 13 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-agegate-zonnic` | `homepage` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `new-block:age-gate`
- **Notes:** REGULATORY — must preserve behaviour. Best delivered as Cloudflare Worker / hlx Function at edge, not client block (sets cookie before first render).

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.