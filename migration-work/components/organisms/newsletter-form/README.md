# Newsletter Form

**Organism**  ·  Newsletter-only signup (email + consent). 2 uses (blog article).

## Observed on the live site

- **Total instances:** 24
- **Page spread:** 1 pages (of 1 declared)
- **DOM fingerprint:** `bat-form-newsletterzonnic`, `.bat-form--newsletter`

| Page | Count |
|------|-------|
| `testingblogarticletemplate` | 24 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-form-newsletterzonnic, .bat-form--newsletter` | `blog-article` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `new-block:newsletter-signup`
- **Notes:** Simple form block; reuses the Salesforce/MC integration of signup form.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.