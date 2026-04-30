# Atomic Inventory — zonnic.ca

Atomic model derived from the raw designlang extraction, annotated with DOM evidence from 10 representative page scrapes. **No values have been normalized.** Normalization belongs to `migration-design-system`.

## Foundations

| Category | Count | Notes |
|---|---:|---|
| Colors (all) | 27 | Primary `#182465` navy dominates (4,535 uses) |
| Colors (neutrals) | 14 | Over-scaled; expect consolidation to 6 |
| Typography families | 5 | Santral (brand) + Arial/Times (legacy fallback) + FontAwesome + sans-serif |
| Typography sizes | 15 | Several one-offs (13.008, 14.4, 12.992 px) |
| Typography weights | 8 | All 8 weights used; weight 100 only 5 times, weight 900 only 8 times |
| Spacing values | 18 | Base 2 px; includes 55, 95, 123, 203, 207, 213 as one-offs |
| Shadow styles | 10 | Labelled sm (1), md (5), lg (3), + outlines |
| Border radii | 7 | 1, 6, 14, 17, 20, 50, 100 px |
| CSS variables in source | 5 | `--text-color`, `--bg-color`, `--border-color`, 2 Mapbox |
| Motion durations | 6 | 0.1, 0.2, 0.25, 0.3, 0.5, 0.6 s |
| Keyframe animations | 13 | Mostly unused third-party (OneTrust intro, bounce-arrow) |

## Atoms

| Pattern | EDS artifact | Notes |
|---|---|---|
| H1/H2/H3/H4 scale | default content — `<h1>…<h4>` + `styles.css` | size grade 35/100; needs normalization |
| Body text | default content — `<p>` | 16 px / 400 / Santral |
| Text highlight | default content — `<strong>` / `<em>` | drives button decoration in `scripts.js` |
| Link | default content — `<a>` | navy `#182465`, size 12 px weight 300 |
| Primary button | `scripts.js` `decorateButtons` + `styles.css` | pill radius `100 px`, white-on-navy (passes AAA) |
| Secondary button | `scripts.js` + `styles.css` — `.button.secondary` | variant-3 grey; 18 uses |
| Accent button | `scripts.js` + `styles.css` — `.button.accent` | for high-impact CTA (strong+em) |
| Input / select | `styles.css` global form styling | 262 instances; `#f6f6f6` background |
| Icon | `icons/*.svg` + `decorateIcons()` | Santral + FontAwesome replacement needed |
| Image | default content — `<img>` + `<picture>` | responsive via AEM image optimizer |

## Molecules

Intermediate patterns that recur inside multiple organisms. These live inside block internal structure (block table rows/columns), not as standalone blocks.

| Pattern | Appears in organisms | EDS mapping |
|---|---|---|
| Icon + headline + body + CTA ("blurb") | `bat-card-blurb`, `bat-hero-zonnic`, `bat-card-mastheadzonnic` | block-internal row structure |
| Image + heading + excerpt + date ("blog stub") | `bat-card-blog` | block-internal row structure |
| Image + heading + bullets ("feature card") | `bat-card-mastheadzonnic` variant | block-internal row structure |
| Tab trigger + panel (tab pair) | `bat-carousel-zonnictabsync` | block-internal (inside tabs block) |
| Slide (image + caption + CTA) | `bat-carousel-product`, `bat-carousel-zonnictabsync` | block-internal (inside carousel) |
| Form field (label + input + tip + error) | all `bat-form-*` elements | block-internal (inside form blocks) |
| FAQ row (question + collapsible answer) | `bat-faq-default` | block-internal (inside faq block) |

## Organisms

Mapped 1:1 to EDS blocks. Catalogued from DOM evidence across 10 templates. **Confidence LOW for completeness** — 15 URL-template groups were not scraped.

Match types:
- **Exact** — Block Collection / existing Nitroblocks block covers it
- **Partial** — existing block needs new variants
- **New** — must be developed from scratch

### Global organisms (every template)

| Organism | Appearances (pages × max-instances) | Variants seen | EDS block | Match |
|---|---:|---|---|---|
| `bat-agegate-zonnic` | 10 × 1 | single | `age-gate` | **new** |
| `bat-header-zonnicheadless` | 10 × 1 | single (responsive menu) | `header` (existing boilerplate; adapt) | **partial** |
| `bat-footer-zonnic` | 10 × 1 | single (multi-column) | `footer` (existing boilerplate; adapt) | **partial** |
| `bat-messagebar-zonnic` | 10 × 1 | single | `announcement-bar` | **new** |
| `bat-locationselector-zonnic` | 10 × 3 | single (modal, preloaded) | `location-selector` | **new** |
| `bat-form-loginzonnic` | 10 × 2 | modal variant | `login-form` | **new** (+ Salesforce decision) |
| `bat-section-modal` | 10 × 2–4 | wrapper for all modals | `modal` (shared container) | **new** |
| `bat-minicart-zonnic` | 10 × 2 | commerce cart | `minicart` | **new** (commerce scope) |
| `bat-cta-loggedin` | 10 × 4 | logged-in variant | `cta` — `(logged-in)` variant | **new** |
| `bat-form-signup` | 10 × 2 | modal signup | `signup-form` | **new** |

### Content organisms (per-template)

| Organism | Templates | EDS block | Match |
|---|---|---|---|
| `bat-hero-zonnic` | homepage, pouches, why, what-is, contact | `hero` (existing boilerplate; adapt) | **partial** |
| `bat-card-mastheadzonnic` | homepage, pouches, store-locator | `masthead-card` | **new** |
| `bat-card-blurb` | why-zonnic (15 ×) | `blurb-card` | **new** |
| `bat-card-blog` | blog index + homepage (15 ×) | `blog-card` (+ list block) | **new** (use `cards` boilerplate as base) |
| `bat-headline-default` | every content page | default content (H2/H3) | — |
| `bat-image-default` | every content page | default content `<img>` | — |
| `bat-text-default` | every content page | default content `<p>` | — |
| `bat-cta-default` | every content page | button auto-decoration | — |
| `bat-section-default` | every content page | EDS section + section metadata | — |
| `bat-carousel-product` | homepage, pouches | `product-carousel` | **new** |
| `bat-carousel-zonnictabsync` | homepage, why, store-locator (4 ×) | `tabbed-carousel` (complex) | **new** |
| `bat-faq-default` | pouches, why, what-is, blog, ask-pharmacist | `faq` (accordion) | **new** (could adapt `tabs` block structure) |

### Template-unique organisms

| Organism | Template | EDS block | Match |
|---|---|---|---|
| `bat-mapboxstorelocator-zonnic` | store-locator | `store-locator` (map + filter) | **new** |
| `bat-producthero-zonnic` | pouches/zonnic-mint-24-nicotine-pouches | `product-hero` | **new** |
| `bat-productcard-zonnic` | commerce templates | `product-card` | **new** (commerce scope) |
| `bat-card-contact` | contact-us | `contact-card` | **new** |
| `bat-form-requestpasswordreset` | login modals | `password-reset-form` | **new** (Salesforce) |
| `bat-form-autofilllogindetails` | contact-us | `autofill-login` (variant of login) | **new** |
| `bat-form-newsletterzonnic` | contact-us | `newsletter-form` (variant of signup) | **new** |
| `bat-cta-account` | what-is-zonnic | `cta` — `(account)` variant | **new** |
| `bat-text-box` | contact-us | `text` — `(box)` variant | — |

### Cross-reference with verification

Per `./migration-work/verification/anatomy-diff.md`:
- designlang's anatomy.tsx only surfaced 2 organisms (`Card`, `Button`)
- DOM-driven structure analysis found 8 unique fingerprints from 10 templates (Jaccard overlap 0%)
- The DOM-only fingerprints flagged by the diff (`ot-sdk-row`, `ot-host-cnt`, `embedded-messaging`, `QSIFeedback`) are **third-party leaks, not zonnic organisms** → add to third-party-inventory instead

> **Open discovery items** — `migration-discovery` should re-scrape 3 more URL groups and resolve whether these templates introduce new organisms not listed above:
> - `/healthcare-professionals/*` (9 pages)
> - `/faq/*` (6 pages) and `/faq-old-donotindex/*` (6 pages)
> - `/real-people-real-success/*` (9 pages)

## Templates

Three distinct template metadata values observed. Most of the 106 pages use `generic-template`; authoring variety comes from which organisms are arranged inside its sections.

| Template | Page count | Organisms used | EDS auto-blocking needed |
|---|---:|---|---|
| `generic-template` | 89 (est.) | header + footer + messagebar + hero + mixed content cards + signup + footer | no auto-blocking (header/footer auto-load in scripts.js) |
| `blog-article-template` | 40 (blog + testing) | header + footer + messagebar + hero-article + body paragraphs + related-blog-cards | `article-header` auto-block (title + hero + date + author metadata) |
| `non-branded-generic-template` | 2 (newsletter) | header + footer + signup form | none |

> **Confidence on template count: MEDIUM.** Template metadata is on every scraped page and is reliable, but the total (3) is based on 10 samples. Additional template values could exist in the 15 unscraped URL groups.

## Organism total

**28 unique `bat-*` Handlebars component shells** observed → maps to **~23 EDS blocks** (after merging modals into a shared wrapper and accepting that `cta-loggedin` / `cta-account` / `cta-default` are variants of a single `cta` block, and `form-signup` / `form-newsletterzonnic` / `form-autofilllogindetails` are variants of form blocks).

- **3 blocks to reuse as-is**: `header`, `footer`, existing `hero` boilerplate (adaptable)
- **4 blocks to adapt**: `header`, `footer`, `hero`, `cards` (already partially built; add blog + blurb + masthead variants)
- **20 blocks to develop new**: see [04-block-mapping.md](04-block-mapping.md) for the full table
