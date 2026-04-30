# Component Audit — zonnic.ca

> **Evidence base:**
> - `./migration-work/design-extract/zonnic-ca-anatomy.tsx` — designlang's anatomy (thin, 2 components)
> - `./migration-work/design-extract/zonnic-ca-design-language.md` — "Component Clusters" section lists 70+ cluster variants and instance counts
> - `./migration-work/proposal/03-atomic-inventory.md` — DOM-derived organism catalogue (28 `bat-*` shells)
> - `./migration-work/proposal/04-block-mapping.md` — planner's block mapping
> - `./migration-work/verification/anatomy-diff.md` — cross-reference

## Why this audit exists

designlang's `anatomy.tsx` only surfaced `Card` and `Button` despite 28 organisms observed in the DOM. The design-language.md "Component Clusters" section lists **20+ cluster groups** — many duplicates of Cards and Buttons that differ only by CSS class / size variant. This audit reconciles the two sources and produces a definitive list of components to build.

Instance counts referenced here come from `design-language.md` component-patterns table.

## Full Matrix (raw)

| Source signal | Name | Variants | Instances | Cross-ref |
|---|---|---|---:|---|
| anatomy.tsx | Card | `default / md` | (unspecified) | design-language §Cards (685 instances) |
| anatomy.tsx | Button | `secondary / md` | (unspecified) | design-language §Buttons (499 instances) |
| design-language §Buttons | Button pattern | (counted, not clustered) | 499 | — |
| design-language §Cards | Card pattern | (counted, not clustered) | 685 | — |
| design-language §Inputs | Input pattern | (counted) | 265 | — |
| design-language §Links | Link | (counted) | 544 | — |
| design-language §Navigation | Nav | (counted) | 459 | — |
| design-language §Footer | Footer | (counted) | 270 | — |
| design-language §Modals | Modal | (counted) | 163 | — |
| design-language §Dropdowns | Dropdown | (counted) | 216 | — |
| design-language §Badges | Badge | (counted) | 19 | — |
| design-language §Tabs | Tab | (counted) | 18 | — |
| design-language §Accordions | Accordion | (counted) | 28 | — |
| design-language §Switches | Switch/Toggle | (counted) | 89 | — |
| DOM (atomic-inventory) | 28 `bat-*` shells | various | 10 pages | see proposal/03 |

## Reconciliation + Decision per component

### Decision key

- **Keep** — clearly distinct, >= 10 instances, systemic role.
- **Consolidate** — near-duplicate of another component; merge via variants.
- **Drop** — third-party, single-use, non-systemic, or artifact.
- **Gap** — needed but not present in extraction; propose anyway.

### Atoms

| # | Component | Decision | Variants | API (key tokens) | Rationale |
|---|---|---|---|---|---|
| A1 | Button | Keep | `primary`, `secondary`, `accent`, `ghost`, `link` | brand-primary, brand-accent, radius-full, motion-fast | 499 instances; 4 observable styles across pages. Anatomy.tsx only surfaced one — expand to 5 from design-language clusters (see §Component Clusters Button groups, 9 + 2 + 1 instances). |
| A2 | Input (text/email/tel) | Keep | `default`, `error`, `disabled` | surface-sunken, border-default, radius-sm | 265 instances; three states evident from CSS form states file. |
| A3 | Textarea | Keep | same as Input | — | Inherits Input tokens; 1 component, 1 variant. |
| A4 | Select | Keep | `default`, `error`, `disabled` | Input + chevron icon | Dropdowns §216 — most are select controls. |
| A5 | Checkbox | Keep | `default`, `checked`, `disabled`, `error` | border-default, brand-primary | Form pattern; needed for consent. |
| A6 | Radio | Keep | `default`, `checked`, `disabled` | same as checkbox | Form pattern. |
| A7 | Switch / Toggle | Keep | `off`, `on`, `disabled` | brand-primary | 89 instances; used on settings + consent. |
| A8 | Label | Keep | `default`, `required`, `optional` | text-primary, font-sm | Form field label primitive. |
| A9 | Helper text | Keep | `default`, `error` | text-secondary / state-error, font-xs | Form field helper. |
| A10 | Link | Keep | `default`, `hover`, `visited`, `inline`, `standalone` | text-link, text-link-hover | 544 instances. |
| A11 | Icon | Keep | single (generic SVG) | currentColor | Replace Font Awesome + `bat-icon` with inline `icons/*.svg` via `decorateIcons()`. |
| A12 | Badge / Pill | Keep | `default`, `success`, `warning`, `error`, `info` | state-*, radius-full | 19 instances; promote to real badge component with states. |
| A13 | Divider | Gap | `default`, `muted` | border-default | Used visually but no dedicated component; promote for consistency. |
| A14 | Avatar | Drop | — | — | Not observed. |
| A15 | Image | Keep | `default`, `rounded`, `full-bleed` | radius-md, radius-none | default content primitive (picture/img). |
| A16 | Video | Keep | `default` | — | HTML5 video wrapper; ratios preserved via aspect-ratio CSS. |
| A17 | Spinner / Loader | Keep | `sm`, `md` | brand-primary | Used by async blocks (store-locator, forms). |
| A18 | Tooltip | Gap | `default` | shadow-md, radius-sm | Not observed cleanly but needed for form help; propose as gap. |
| A19 | Heading (H1–H6) | Keep | per typography roles | font-size-* + text-heading | Default content — decorated by default CSS. |
| A20 | Paragraph | Keep | `body`, `body-lg`, `caption`, `legal` | font-size-* | Default content. |
| A21 | List (ul / ol) | Keep | `default`, `inline`, `check-list` | text-primary | Default content; "check-list" variant for feature bullets with `:icon-check:`. |

**Atom count: 19 keep + 2 gap = 21 primitives.**

### Molecules

| # | Component | Decision | Composition | Rationale |
|---|---|---|---|---|
| M1 | Form field | Keep | Label (A8) + Input/Textarea/Select (A2–A4) + Helper (A9) | Wrapper for every form row; consistent error/required presentation. |
| M2 | CTA group | Keep | Button primary (A1) + Button secondary (A1) | Horizontal button pair; common on hero / blurb card. |
| M3 | Media-text pair | Keep | Image (A15) + Heading (A19) + Paragraph (A20) | Used inside hero, blurb-card, masthead-card. |
| M4 | Blurb (icon+heading+body+CTA) | Keep | Icon (A11) + Heading (A19) + Paragraph (A20) + Link/Button (A10/A1) | Atomic-inventory "blurb molecule"; appears in 3 organisms. |
| M5 | Blog stub | Keep | Image (A15) + Heading (A19) + Paragraph (A20) + Date (meta) + Link (A10) | "Blog stub" from atomic-inventory; feeds `cards (blog)`. |
| M6 | Tab pair (trigger+panel) | Keep | Link/button trigger + Panel container | Inside tabs/tabbed-carousel. |
| M7 | FAQ row | Keep | Button trigger + collapsible answer | 28 accordion instances; used in `faq` block. |
| M8 | Carousel slide | Keep | Image (A15) + Caption + Optional CTA | Inside `product-carousel`, `tabbed-carousel`. |
| M9 | Nav item | Keep | Link (A10) + optional caret | For header + footer nav. |
| M10 | Footer column | Keep | Heading (A19, small) + List of Links (A21 + A10) | Footer anatomy. |
| M11 | Modal chrome | Keep | Close button (A1 ghost) + Heading (A19) + Body slot | Used by 7 modal-opening organisms. |
| M12 | Breadcrumb | Gap | List (A21) + Links (A10) + separator icon | Accessibility nicety; not in extraction but expected on deep pages. |
| M13 | Pagination | Gap | Button (A1) + current-page indicator | For blog index at scale. |

**Molecule count: 11 keep + 2 gap = 13.**

### Organisms (EDS blocks)

Organisms come from the atomic-inventory's 28-element catalogue. Each is a 1:1 EDS block.

#### Global / chrome organisms

| # | Organism | EDS block | Decision | Base | Variants |
|---|---|---|---|---|---|
| O1 | Header | `header` | Adapt | blocks/header (171 LOC) | default; extend with account menu slot, location trigger, minicart trigger |
| O2 | Footer | `footer` | Adapt | blocks/footer (20 LOC) | multi-column, legal row, secondary logo row |
| O3 | Announcement bar | `announcement-bar` | New | — | `(warning)`, `(info)` |
| O4 | Age gate | `age-gate` | New | — | `(default)`, `(reduced)` |
| O5 | Location selector | `location-selector` | New | — | single |
| O6 | Modal (shared container) | `modal` | New | — | single; composed with other blocks as content |
| O7 | Login form | `login-form` | New | — | single (Salesforce drop-in) |
| O8 | Signup form | `signup-form` | New | — | `(default)`, `(newsletter)`, `(autofill-login)` |
| O9 | Password reset form | `password-reset-form` | New | — | single |
| O10 | Mini-cart (commerce) | `minicart` | **DEFER** | — | single; flagged XL + pending commerce decision |

#### Content organisms

| # | Organism | EDS block | Decision | Base | Variants |
|---|---|---|---|---|---|
| O11 | Hero | `hero` | Adapt | blocks/hero (empty scaffold) | `(dark)`, `(split)`, `(centered)`, `(image-right)` |
| O12 | Masthead card | `masthead-card` | New | — | `(dark)`, `(centered)`, `(split-image-right)` |
| O13 | Blurb card | `blurb-card` | New | — | single |
| O14 | Blog card list | `cards (blog)` | Adapt | blocks/cards (existing) | `(blog)` variant |
| O15 | Contact card | `contact-card` | New | — | single |
| O16 | CTA band | `cta` | New | — | `(default)`, `(logged-in)`, `(account)` |
| O17 | FAQ accordion | `faq` | New | — | single |
| O18 | Product carousel | `product-carousel` | New | — | single |
| O19 | Tabbed carousel | `tabbed-carousel` | New | — | single (XL complexity) |
| O20 | Product hero | `product-hero` | New | — | single (commerce) |
| O21 | Product card | `product-card` | New | — | single (commerce) |
| O22 | Store locator | `store-locator` | New | — | single (XL complexity, Mapbox) |
| O23 | Text (enhanced) | `text` | Reuse native / decorate | — | `(default)`, `(box)` |

**Organism count: 22 active + 1 deferred (minicart).**

Matches the planner's "~23 EDS blocks" estimate.

## Public CSS API by component family

### Button (A1)

```
Classes exposed:
  .button                  — base atom
  .button.primary          — brand-primary bg, text-inverse, radius-full
  .button.secondary        — transparent bg, brand-primary border + text, radius-full
  .button.accent           — brand-accent bg, text-heading, radius-full
  .button.ghost            — transparent, text-heading, underline on hover
  .button.link             — button semantics, link appearance

Tokens referenced:
  --color-brand-primary, --color-brand-accent, --color-text-inverse,
  --radius-full, --space-3, --space-6, --font-size-sm, --font-weight-semibold,
  --motion-fast, --ease-out, --color-focus-ring, --shadow-focus
```

### Card (M-level composition, used by O12–O15)

Cards are compositions of atoms (Image + Heading + Paragraph + CTA). They are not their own atom — they are block-internal rows. The design system provides:

- `--radius-md` (default corner)
- `--shadow-md` (elevation)
- `--space-6` (internal padding)
- `--space-4` (internal gap)

Each organism (`masthead-card`, `blurb-card`, `blog-card`, `contact-card`) scopes its own `.{blockname}` class and compose the same atom tokens.

### Input (A2)

```
Classes exposed:
  .input               — base
  .input.error         — state-error border + helper
  .input.disabled      — muted bg + cursor

Tokens:
  --color-surface-sunken, --color-border-default, --color-state-error,
  --radius-sm, --space-3, --font-size-base, --color-text-primary
```

### Badge (A12)

```
Classes:
  .badge, .badge.success, .badge.warning, .badge.error, .badge.info

Tokens:
  --color-state-*, --radius-full, --font-size-xs, --space-1, --space-3
```

## Reference implementation outline

For each organism, the detailed content model + JS decoration lives in the planner's `04-block-mapping.md`. The design system's responsibility is to define the **tokens** each organism will consume, not the HTML. The Pencil canvas (Step 8) and the EDS block specs (consumed by the `migration-site-build` skill) define the rendered structure.

## Atomic placement summary

| Tier | Count | Source |
|---|---:|---|
| Atoms | 21 (19 keep + 2 gap) | expanded from anatomy.tsx via design-language clusters |
| Molecules | 13 (11 keep + 2 gap) | from atomic-inventory + design-language patterns |
| Organisms | 23 (22 active + 1 deferred) | from atomic-inventory |

See `docs/atomic-map.md` for the full placement-with-reasoning map.
