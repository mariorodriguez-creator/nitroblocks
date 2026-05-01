# Organisms

Standalone sections of the interface. Each organism maps 1:1 to an EDS block.

Total: 19 organisms.

| Component | Instances | Pages | Variants (extracted/total) | Regulatory |
|-----------|-----------|-------|----------------------------|------------|
| [`age-gate`](./age-gate/) | 104 | 8 | 1/1 | yes |
| [`header`](./header/) | 8 | 8 | 1/1 | — |
| [`footer`](./footer/) | 208 | 8 | 1/1 | yes |
| [`message-bar`](./message-bar/) | 8 | 8 | 1/1 | — |
| [`hero`](./hero/) | 82 | 4 | 1/1 | — |
| [`masthead-card`](./masthead-card/) | 224 | 3 | 1/1 | — |
| [`blurb-card`](./blurb-card/) | 204 | 2 | 1/1 | — |
| [`blog-card`](./blog-card/) | 108 | 2 | 1/1 | — |
| [`tab-sync-carousel`](./tab-sync-carousel/) | 12 | 3 | 1/1 | — |
| [`product-carousel`](./product-carousel/) | 6 | 3 | 1/1 | — |
| [`faq`](./faq/) | 6 | 3 | 1/1 | — |
| [`signup-form`](./signup-form/) | 184 | 7 | 1/1 | — |
| [`login-form`](./login-form/) | 48 | 8 | 1/1 | — |
| [`newsletter-form`](./newsletter-form/) | 24 | 1 | 1/1 | — |
| [`contact-form`](./contact-form/) | 16 | 1 | 1/1 | — |
| [`product-hero`](./product-hero/) | 1 | 1 | 1/1 | — |
| [`store-locator`](./store-locator/) | 1 | 1 | 1/1 | — |
| [`location-selector`](./location-selector/) | 24 | 8 | 1/1 | yes |
| [`mini-cart`](./mini-cart/) | 16 | 8 | 1/1 | — |

Each component folder contains:
- `README.md` — API description, observed variants, EDS mapping.
- `anatomy.html` — outer HTML captured from the live DOM.
- `computed.css` — per-variant `getComputedStyle()` snapshot.
- `stats.json` — occurrence count and page spread.
- `evidence/` — per-variant screenshots.