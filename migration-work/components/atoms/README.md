# Atoms

Single-purpose elements that cannot be broken down further. Each atom has a folder with real DOM evidence, computed CSS, and per-variant screenshots from the live site.

Total: 7 atoms.

| Component | Instances | Pages | Variants (extracted/total) | Regulatory |
|-----------|-----------|-------|----------------------------|------------|
| [`button`](./button/) | 377 | 8 | 3/3 | — |
| [`link`](./link/) | 0 | 0 | 1/1 | — |
| [`icon`](./icon/) | 206 | 8 | 1/1 | — |
| [`image`](./image/) | 429 | 8 | 1/1 | — |
| [`headline`](./headline/) | 710 | 8 | 3/3 | — |
| [`text`](./text/) | 352 | 8 | 2/2 | — |
| [`input`](./input/) | 284 | 8 | 3/3 | — |

Each component folder contains:
- `README.md` — API description, observed variants, EDS mapping.
- `anatomy.html` — outer HTML captured from the live DOM.
- `computed.css` — per-variant `getComputedStyle()` snapshot.
- `stats.json` — occurrence count and page spread.
- `evidence/` — per-variant screenshots.