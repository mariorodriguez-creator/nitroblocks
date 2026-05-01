# Molecules

Small combinations of atoms with a single intent. Each molecule shows the composition captured from the live DOM.

Total: 5 molecules.

| Component | Instances | Pages | Variants (extracted/total) | Regulatory |
|-----------|-----------|-------|----------------------------|------------|
| [`form-field`](./form-field/) | 444 | 8 | 2/2 | — |
| [`cta-list`](./cta-list/) | 151 | 8 | 3/3 | — |
| [`nav-item`](./nav-item/) | 184 | 8 | 2/2 | — |
| [`modal-shell`](./modal-shell/) | 189 | 8 | 1/1 | — |
| [`form-message`](./form-message/) | 160 | 8 | 2/2 | — |

Each component folder contains:
- `README.md` — API description, observed variants, EDS mapping.
- `anatomy.html` — outer HTML captured from the live DOM.
- `computed.css` — per-variant `getComputedStyle()` snapshot.
- `stats.json` — occurrence count and page spread.
- `evidence/` — per-variant screenshots.