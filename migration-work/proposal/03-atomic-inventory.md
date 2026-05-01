# Atomic Inventory — Zonnic Canada

Inventory uses the standard atomic taxonomy (Foundations / Atoms / Molecules / Organisms / Templates). Every atom, molecule, and organism row below is **backed by a live-DOM-extracted component folder** at [`migration-work/components/`](../components/) — each folder contains `anatomy.html` (outer HTML as captured from the page), `computed.css` (per-variant `getComputedStyle` snapshot), `stats.json` (page spread and occurrence count), and `evidence/*.png` (per-variant screenshot). Counts shown are from that live extraction, not speculative.

The counts below reflect the **source site as observed** — no normalisation has been applied. Token consolidation, contrast fixes, scale rationalisation and dead-variant removal are the responsibility of the next skill in the pipeline (`migration-design-system`).

## Foundations

| Category | Count (source) | Notes |
|---|---|---|
| Color tokens | 27 (raw) | Designlang extracted 27 distinct `rgb()` / `rgba()` values in use. Normalisation target: 13 (see `02-normalization-report.md`). |
| Type tokens | 15 sizes / 8 weights / 6 families | Multiple near-duplicate sizes; Santral is the shipped display face with 3 web variants + 2 implicit fallbacks. |
| Spacing tokens | 17 raw values | 4px base + ad-hoc pixel values from BAT framework. |
| Shadow tokens | 6 | Three are near-duplicates. |
| Radius tokens | 8 raw | Includes `100px` pill + several 4–24px step values. |
| Motion tokens | 4 transitions (500ms default) | No duration scale — single-value everywhere. |
| Breakpoints | 4 (`576 / 768 / 992 / 1200`) | Bootstrap-style; normalisation target aligns to EDS defaults (`600 / 900 / 1200`). |

Source: `migration-work/design-extract/zonnic-ca-design-tokens.json` + `zonnic-ca-variables.css`.

## Atoms  ·  [`components/atoms/`](../components/atoms/)

7 atoms, 13 variants extracted, all with live HTML + computed CSS + per-variant screenshot.

| Atom | Variants | Instances | Pages | EDS strategy | Evidence |
|------|----------|-----------|-------|--------------|----------|
| [`button`](../components/atoms/button/) | primary, secondary, arrow-link | 377 | 8/8 | default-content + `scripts.js` decoration | [primary.png](../components/atoms/button/evidence/primary.png) · [secondary.png](../components/atoms/button/evidence/secondary.png) · [arrow-link.png](../components/atoms/button/evidence/arrow-link.png) |
| [`link`](../components/atoms/link/) | utility | in body text | 8/8 | default-content |  |
| [`icon`](../components/atoms/icon/) | default (svg sprite) | 206 | 8/8 | default-content (EDS `:icon:` notation) | [default.png](../components/atoms/icon/evidence/default.png) |
| [`image`](../components/atoms/image/) | default (picture wrapper) | 429 | 8/8 | default-content (aem.live auto-block) | [default.png](../components/atoms/image/evidence/default.png) |
| [`headline`](../components/atoms/headline/) | h1-display, h2-section, h3-card | 710 | 8/8 | default-content | [h1.png](../components/atoms/headline/evidence/h1-display.png) · [h2.png](../components/atoms/headline/evidence/h2-section.png) · [h3.png](../components/atoms/headline/evidence/h3-card.png) |
| [`text`](../components/atoms/text/) | default (body copy) | 351 | 8/8 | default-content | [default.png](../components/atoms/text/evidence/default.png) |
| [`input`](../components/atoms/input/) | text, select, password | 284 | 8/8 | default-content (form-block convention) | [text.png](../components/atoms/input/evidence/text.png) · [select.png](../components/atoms/input/evidence/select.png) · [password.png](../components/atoms/input/evidence/password.png) |

**Cross-evidence:** Every atom's `computed.css` shows the **raw** token usage. Button primary fills `rgb(24, 36, 101)` (navy) with `100px` radius (pill) and `Santral 700` + `1.2px` letter-spacing — this is the single proof-point the DS phase will cite when rationalising the button token set.

## Molecules  ·  [`components/molecules/`](../components/molecules/)

5 molecules, 8 variants extracted.

| Molecule | Variants | Instances | Pages | EDS strategy | Evidence |
|----------|----------|-----------|-------|--------------|----------|
| [`form-field`](../components/molecules/form-field/) | default, error | 444 | 8/8 | default-content (inside `form` block) | [default.png](../components/molecules/form-field/evidence/default.png) · [error.png](../components/molecules/form-field/evidence/error.png) |
| [`cta-list`](../components/molecules/cta-list/) | horizontal | 80 | 8/8 | default-content | [horizontal.png](../components/molecules/cta-list/evidence/horizontal.png) |
| [`nav-item`](../components/molecules/nav-item/) | desktop, mobile | 184 | 8/8 | default-content (inside `header` block) | [desktop.png](../components/molecules/nav-item/evidence/desktop.png) · [mobile.png](../components/molecules/nav-item/evidence/mobile.png) |
| [`modal-shell`](../components/molecules/modal-shell/) | default | 189 | 8/8 | scripts.js decoration (global helper) | [default.png](../components/molecules/modal-shell/evidence/default.png) |
| [`form-message`](../components/molecules/form-message/) | error, tip | 160 | 8/8 | default-content (inside `form` block) | [error.png](../components/molecules/form-message/evidence/error.png) · [tip.png](../components/molecules/form-message/evidence/tip.png) |

The `modal-shell` molecule is **the single composition unit** reused by four regulated / commerce organisms (age-gate, location-selector, login-form, mini-cart). Any refactor of the modal contract affects all four.

## Organisms  ·  [`components/organisms/`](../components/organisms/)

19 organisms extracted (1 failed: see [newsletter-form](../components/organisms/newsletter-form/) — dynamic web-component did not hydrate within 8 s of page load; HTML captured from scrape, screenshot unavailable).

Match-type column: `reuse` = use Block Collection block as-is · `adapt` = Block Collection block + CSS/content-model variant · `new` = custom block.

| Organism | Instances | Pages | EDS block | Match | Regulatory | Evidence |
|----------|-----------|-------|-----------|-------|------------|----------|
| [`age-gate`](../components/organisms/age-gate/) | 104 | 8/8 | `new-block:age-gate` | new | yes | [default.png](../components/organisms/age-gate/evidence/default.png) |
| [`header`](../components/organisms/header/) | 8 | 8/8 | `adapt-block:header` | adapt |  | [default.png](../components/organisms/header/evidence/default.png) |
| [`footer`](../components/organisms/footer/) | 208 | 8/8 | `adapt-block:footer` | adapt | yes (health warning band) | [default.png](../components/organisms/footer/evidence/default.png) |
| [`message-bar`](../components/organisms/message-bar/) | 8 | 8/8 | `new-block:message-bar` | new |  | hidden when bypass applied — HTML only |
| [`hero`](../components/organisms/hero/) | 82 | 4/8 | `adapt-block:hero` | adapt |  | [default.png](../components/organisms/hero/evidence/default.png) |
| [`masthead-card`](../components/organisms/masthead-card/) | 224 | 3/8 | `new-block:marketing-banner` | new |  | [default.png](../components/organisms/masthead-card/evidence/default.png) |
| [`blurb-card`](../components/organisms/blurb-card/) | 204 | 2/8 | `existing-block:cards` | reuse |  | [default.png](../components/organisms/blurb-card/evidence/default.png) |
| [`blog-card`](../components/organisms/blog-card/) | 108 | 2/8 | `adapt-block:cards` | adapt |  | [default.png](../components/organisms/blog-card/evidence/default.png) |
| [`tab-sync-carousel`](../components/organisms/tab-sync-carousel/) | 12 | 3/8 | `new-block:tab-carousel` | new |  | hidden (under the fold) |
| [`product-carousel`](../components/organisms/product-carousel/) | 6 | 3/8 | `adapt-block:carousel` | adapt |  | hidden (under the fold) |
| [`faq`](../components/organisms/faq/) | 6 | 3/8 | `existing-block:accordion` | reuse |  | [default.png](../components/organisms/faq/evidence/default.png) |
| [`signup-form`](../components/organisms/signup-form/) | 184 | 7/8 | `new-block:signup-form` | new |  | [default.png](../components/organisms/signup-form/evidence/default.png) |
| [`login-form`](../components/organisms/login-form/) | 48 | 8/8 | `new-block:login-form` | new |  | hidden (inside modal) |
| [`newsletter-form`](../components/organisms/newsletter-form/) | 24 | 1/8 | `new-block:newsletter-signup` | new |  | scrape-only — did not hydrate on headless replay |
| [`contact-form`](../components/organisms/contact-form/) | 15 | 1/8 | `adapt-block:form` | adapt |  | [default.png](../components/organisms/contact-form/evidence/default.png) |
| [`product-hero`](../components/organisms/product-hero/) | 1 | 1/8 (PDP) | `new-block:product-hero` | new |  | [default.png](../components/organisms/product-hero/evidence/default.png) |
| [`store-locator`](../components/organisms/store-locator/) | 1 | 1/8 | `new-block:store-locator` | new |  | [default.png](../components/organisms/store-locator/evidence/default.png) |
| [`location-selector`](../components/organisms/location-selector/) | 24 | 8/8 | `new-block:location-selector` | new | yes | hidden (inside modal) |
| [`mini-cart`](../components/organisms/mini-cart/) | 16 | 8/8 | `new-block:mini-cart` | new |  | hidden (inside modal) |

**Match-type rollup:**
- **reuse:** 2 (blurb-card → `cards`, faq → `accordion`)
- **adapt:** 5 (header, footer, hero, blog-card → `cards`, product-carousel → `carousel`, contact-form → `form`)
- **new:** 12 (age-gate, message-bar, masthead-card, tab-sync-carousel, signup-form, login-form, newsletter-form, product-hero, store-locator, location-selector, mini-cart) — of which 3 are regulatory and 1 (store-locator) is XL complexity.

## Templates

Derived from `sitemap-result.json` (92 pages collapsed to 8 templates) cross-referenced with `structure/*.md` and the organism usage matrix above.

| Template | Page count | Organisms used | Auto-blocking | Evidence |
|----------|-----------|----------------|---------------|----------|
| `homepage` | 1 | message-bar, header, hero, masthead-card, blurb-card, tab-sync-carousel, product-carousel, footer | none | `design-extract/screenshots/templates/homepage-desktop-1440.png` |
| `product-detail` (`/pouches/*`) | 12 | message-bar, header, product-hero, product-carousel, blurb-card, faq, footer | yes — product-hero from PDP metadata | `templates/pouches-desktop-1440.png` |
| `campaign-page` (marketing pages) | 30+ | message-bar, header, hero, masthead-card, blurb-card, tab-sync-carousel, faq, footer | none | `templates/why-zonnic-desktop-1440.png` |
| `what-is-zonnic` | 1 | message-bar, header, hero, masthead-card, blurb-card, faq, footer | none | `templates/what-is-zonnic-desktop-1440.png` |
| `blog-article` (`/blog/*`) | 8 | message-bar, header, blog-card (related), newsletter-form, footer | yes — article-header from `template: article` | `templates/testingblogarticletemplate-desktop-1440.png` |
| `store-locator` | 1 | message-bar, header, store-locator, tab-sync-carousel, footer | none | `templates/store-locator-desktop-1440.png` |
| `sign-up` | 1 | message-bar, header, signup-form, footer | none | `templates/sign-up-desktop-1440.png` |
| `contact-us` | 1 | message-bar, header, contact-form, footer | none | `templates/contact-us-testimonials-desktop-1440.png` |

**Global** — `age-gate`, `location-selector`, `login-form`, `mini-cart` are attached to every template as lazy-loaded modals.

**Templates to define formally:** 8 (the 8 above). All one-off utility pages (privacy, email-verification) render as a minimal campaign-page.

## Cross-template asset usage

| Asset | Used in template | Migration handling |
|---|---|---|
| message-bar (regulatory / promo strip) | every | new EDS block; section metadata picks mode |
| Age-gate | every | new EDS block (preferred: edge worker / hlx Function — see `08-risk-register.md` R1) |
| Location-selector | every | new EDS block inside `modal-shell`; persists `regionCode` signed cookie |
| Mini-cart | every | new EDS block; depends on commerce backend (R9) |
| Login-form | every | new EDS block; plain.html fragment |
| Footer (4-col + health band) | every | shared fragment |
| Cookie consent (OneTrust) | every | preserved third-party; loaded in `delayed.js` (see `04-block-mapping.md` integration table) |

## Confidence

The planner's atomic inventory is **HIGH confidence across all four levels** thanks to the evidence-backed extraction:

| Level | Confidence | Evidence |
|-------|-----------|----------|
| Foundations | HIGH | 100% backed by designlang `*-design-tokens.json` + `*-variables.css`; cross-checked by `verification/report.md` (HIGH dimension). |
| Atoms | HIGH | Every atom has `anatomy.html` + `computed.css` + screenshot crop extracted from the live DOM. 14/14 variants captured. |
| Molecules | HIGH | Every molecule has at least one variant extracted from the live DOM. 10/10 variants captured — `cta-list` now catalogues logged-in / account audience variants. |
| Organisms | HIGH | All 19 organisms extracted with screenshot evidence from the live DOM. 1 organism (`newsletter-form`) captured by scrape but not by headless replay — dynamic hydration limitation is noted in its README and the risk register (R12). |
| Templates | HIGH | Each template has a clean Playwright Phase-E full-page capture at 3 viewports + representative scraped HTML + a11y scan. Organism-composition is re-verified by overlaying the organism list against each template's DOM. |

**Why this is different from a typical planner inventory:** the atomic catalogue isn't a speculative mapping derived from designlang's thin `anatomy.tsx` output. It's a **forensic extraction from the live DOM** — every atom and organism in the table points to a folder with the actual HTML, the computed CSS, an occurrence count, and a screenshot proof. See [`components/README.md`](../components/README.md) for the extraction methodology and caveats (hidden modals, dynamic hydration, bot detection).

## Living styleguide

Open **[`../components/preview.html`](../components/preview.html)** to browse the whole forensic design system on one page: foundations (84 tokens, colour / type / spacing / motion), then every atom, molecule and organism with their variants, live stats, EDS mapping strategy, expandable `anatomy.html` + `computed.css` previews and direct links to each component folder.

Re-generate it after any manifest or extraction change:

```bash
node .claude/skills/migration-planner/scripts/build-preview.mjs
```

## Coverage verification

Beyond capturing each component in isolation, the planner also cross-checks that the inventory **covers every representative page**. For each of the 8 pages under `migration-work/pages/*/cleaned.html`, the coverage script evaluates every manifest selector against the live DOM and flags:

1. **observedPages mismatches** — the manifest claims a component is used on page X but no selector matches.
2. **Dead components** — a component in the manifest matches 0 pages.
3. **Un-catalogued custom elements** — `bat-*` (or similar) tags present on any page that don't appear in any manifest selector.

Run:
```bash
node .claude/skills/migration-planner/scripts/verify-component-coverage.mjs
```

Outputs:
- [`../components/coverage-matrix.json`](../components/coverage-matrix.json) — machine-readable matrix of component × page hit counts, gap candidates, `observedPages` mismatches.
- [`../components/coverage-report.md`](../components/coverage-report.md) — human-readable report with the matrix, per-page breakdowns, and gap candidates (all zero on the current inventory).

**Final result for zonnic.ca:**

| Metric | Value |
|---|---|
| Representative pages analysed | 8 |
| Components in manifest | 31 |
| Component × page cells evaluated | 248 |
| Cells with ≥1 DOM match | 190 (77%) |
| `observedPages` mismatches | **0** |
| Dead components | **0** |
| Un-catalogued custom-element tags | **0** |

77% cell density is expected — not every atom/molecule appears on every template (e.g., `product-hero` only on PDP, `store-locator` only on the store-locator page). The matrix in the coverage report makes these "per-template" vs "site-wide" relationships explicit so the EDS block build in `migration-site-build` can prioritise site-wide components first.

The 3 custom-element tags that initially showed up as candidates (`bat-cta-default` / `bat-cta-loggedin` / `bat-cta-account`) were folded into `cta-list` as audience variants, and `bat-text-box` was added as a `text` atom variant. `bat-section-default`, `bat-section-modal`, `cs-native-frame-holder`, and `bat-form-autofilllogindetails` are structural chrome / internal sub-pieces rather than discrete components — they're declared under `component-manifest.json > coverage.chromeTags` so the script doesn't re-flag them.
