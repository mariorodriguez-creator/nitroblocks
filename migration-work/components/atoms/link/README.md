# Link

**Atom**  ·  Inline anchor inside body text or utilities. Two observed patterns: inline body link (more/less toggles, privacy-notice) and branded utility link.

## Observed on the live site

- **Total instances:** 0
- **Page spread:** 0 pages (of 3 declared)
- **DOM fingerprint:** `a.more-link`, `a.less-link`, `a.privacy-notice-link`, `a.bat-storelocator--getloc`

## Variants

| Variant | Selector | Sample page | Evidence | Status |
|---------|----------|-------------|----------|--------|
| `utility` | `a.privacy-notice-link, a.more-link, a.less-link` | `homepage` | HTML only | HTML captured (hidden in modal) |

## EDS mapping

- **Strategy:** `default-content`
- **Notes:** Handled at global CSS level — no JS decoration.

## Files

- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).
- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.
- [`stats.json`](./stats.json) — page spread and occurrence counts.
- [`evidence/`](./evidence) — per-variant element screenshots.

## Source-of-truth note

This inventory is extracted **as observed** — not normalised. Colours,
spacing, weights, radii shown in `computed.css` reflect the live site.
Token consolidation happens in `migration-design-system`.