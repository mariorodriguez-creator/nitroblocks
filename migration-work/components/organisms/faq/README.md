# Faq

**Organism**  ·  Accordion with schema.org JSON-LD. 3 uses on 3 pages.

## Observed on the live site

- **Total instances:** 6
- **Page spread:** 3 pages (of 3 declared)
- **DOM fingerprint:** `bat-faq-default`, `.bat-faq`

| Page | Count |
|------|-------|
| `pouches-zonnic-mint-24-nicotine-pouches` | 2 |
| `what-is-zonnic` | 2 |
| `why-zonnic` | 2 |

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `default` | `bat-faq-default` | `why-zonnic` | ![default](./evidence/default.png) | extracted |

## EDS mapping

- **Strategy:** `existing-block:accordion`
- **Notes:** Block Collection accordion with `faq` variant — emit JSON-LD from first accordion in a section with faq style.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.