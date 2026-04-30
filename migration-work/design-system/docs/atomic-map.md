# Atomic Map — zonnic.ca

Authoritative placement of every atom, molecule, and organism. Reasoning for each tier follows the Brad Frost rule: **if it stands alone with meaning, it's an organism. If it needs a parent to make sense, it's a molecule. If it's a single-purpose primitive, it's an atom.**

Derived from `docs/component-audit.md` §Decision per component.

## Atoms

Single-purpose primitives. No sub-components. Directly consume design tokens.

| ID | Component | Reasoning |
|---|---|---|
| A1 | **Button** | Standalone interactive primitive. Variants are CSS-only (`primary` / `secondary` / `accent` / `ghost` / `link`); no internal composition. |
| A2 | **Input (text)** | Single-purpose form primitive. Not composed. |
| A3 | **Textarea** | Input shape for multi-line; atomic like A2. |
| A4 | **Select** | Single form primitive; chevron is a decorative icon, not a composed child. |
| A5 | **Checkbox** | Form primitive; the inner tick is a pseudo-element. |
| A6 | **Radio** | Form primitive; sibling of checkbox. |
| A7 | **Switch / Toggle** | Form primitive; single interactive surface. |
| A8 | **Label** | Text primitive for form rows. |
| A9 | **Helper text** | Text primitive; inherits error styling via state class. |
| A10 | **Link** | Text-flow primitive (inline or standalone). |
| A11 | **Icon** | SVG symbol; `currentColor` inheritance makes it token-aware. |
| A12 | **Badge / Pill** | Visual state primitive; no internal composition. |
| A13 | **Divider** | Layout primitive; border + space only. |
| A15 | **Image** | Media primitive (wraps `<picture>`); shape variants via CSS class. |
| A16 | **Video** | Media primitive wrapping `<video>`. |
| A17 | **Spinner** | Loading primitive (single SVG/CSS animation). |
| A18 | **Tooltip** | Popover primitive; single layer. Gap component proposed. |
| A19 | **Heading** | Typography primitive (H1–H6). |
| A20 | **Paragraph** | Typography primitive. |
| A21 | **List** | Structural primitive (ul/ol). |

## Molecules

Reusable combinations of atoms. Do not have standalone meaning.

| ID | Component | Reasoning |
|---|---|---|
| M1 | **Form field** | Label (A8) + Input/Textarea/Select (A2–A4) + Helper (A9). Needs all three to be a usable form row. |
| M2 | **CTA group** | Two Buttons (A1) with consistent spacing. A single button is not a "group". |
| M3 | **Media-text pair** | Image (A15) + Heading (A19) + Paragraph (A20). The pair is meaningful; individual parts are not "the pattern". |
| M4 | **Blurb** | Icon (A11) + Heading (A19) + Paragraph (A20) + optional Link/Button. The signature icon-headline-body-CTA pattern of zonnic.ca. |
| M5 | **Blog stub** | Image + meta-row (date + category) + Heading + Excerpt + Link. Card-ish but not a standalone card — it's the *content* of a blog-card organism. |
| M6 | **Tab pair** | Trigger + panel; neither is useful alone inside a tabs block. |
| M7 | **FAQ row** | Question (button) + Answer (panel). Accordion primitive. |
| M8 | **Carousel slide** | Image + Caption + optional CTA. Part of a carousel parent. |
| M9 | **Nav item** | Link (A10) + optional caret + optional dropdown trigger. Parent is a nav list. |
| M10 | **Footer column** | Heading + List of nav items. Parent is the footer organism. |
| M11 | **Modal chrome** | Close button + Heading + Body slot. Wraps arbitrary child content; only meaningful inside a modal organism. |
| M12 | **Breadcrumb** | Gap. List + Links + separator. Parent is a page header / content area. |
| M13 | **Pagination** | Gap. Previous/Next/Page buttons. Parent is a blog listing. |

## Organisms

Standalone meaningful sections. Map 1:1 to EDS blocks.

| ID | Component | EDS block | Reasoning |
|---|---|---|---|
| O1 | **Header** | `header` | Global chrome; contains logo + nav + account-menu + location-trigger + minicart. |
| O2 | **Footer** | `footer` | Global chrome; contains logo + multi-column nav + legal + social. |
| O3 | **Announcement bar** | `announcement-bar` | Full-width top-of-page banner; self-contained. |
| O4 | **Age gate** | `age-gate` | Modal-like overlay; self-contained experience. |
| O5 | **Location selector** | `location-selector` | Standalone modal for locale selection. |
| O6 | **Modal** | `modal` | Generic wrapper organism; hosts forms/selectors. |
| O7 | **Login form** | `login-form` | Standalone form with authentication flow. |
| O8 | **Signup form** | `signup-form` | Standalone; variants for newsletter / autofill. |
| O9 | **Password reset form** | `password-reset-form` | Standalone form. |
| O10 | **Mini-cart** (deferred) | `minicart` | Commerce drawer; standalone. **DEFER** pending e-commerce decision. |
| O11 | **Hero** | `hero` | Full-width feature section with heading + body + CTA + background media. |
| O12 | **Masthead card** | `masthead-card` | Hero-like card section; distinct from hero by having card chrome + smaller scale. |
| O13 | **Blurb card** | `blurb-card` | Standalone icon-led value-prop section. |
| O14 | **Blog card list** | `cards (blog)` | Standalone grid of blog stubs. |
| O15 | **Contact card** | `contact-card` | Standalone profile block (name + title + contact methods). |
| O16 | **CTA band** | `cta` | Standalone call-to-action section (heading + body + buttons), often full-width. |
| O17 | **FAQ accordion** | `faq` | Standalone set of FAQ rows with shared accordion behaviour. |
| O18 | **Product carousel** | `product-carousel` | Standalone horizontal scroller of products. |
| O19 | **Tabbed carousel** | `tabbed-carousel` | Standalone tab-header + per-tab carousel. |
| O20 | **Product hero** | `product-hero` | PDP-style block with gallery + details + buy CTAs. |
| O21 | **Product card** | `product-card` | Individual product tile; standalone enough to grid. |
| O22 | **Store locator** | `store-locator` | Standalone map + filter + store-list organism. |
| O23 | **Text (enhanced)** | `text` | Standalone rich-text section with optional `(box)` chrome. |

## Templates

Page-level compositions of organisms. Per `03-atomic-inventory.md`:

| ID | Template | Organisms (typical order) |
|---|---|---|
| T1 | **Homepage** (`generic-template`) | Header → Announcement → Hero → Blurb-cards → Masthead-card → Product-carousel → Tabbed-carousel → CTA → Footer |
| T2 | **Content page** (`generic-template`) | Header → Announcement → Hero → Text → Blurb-cards → FAQ → CTA → Footer |
| T3 | **Blog article** (`blog-article-template`) | Header → Announcement → Article header (auto-block) → Body paragraphs → Related Blog-card list → Footer |
| T4 | **Newsletter** (`non-branded-generic-template`) | Header → Signup-form (newsletter variant) → Footer |
| T5 | **PDP** (`generic-template`) | Header → Announcement → Product-hero → FAQ → Related carousel → Footer |
| T6 | **Store locator** (`generic-template`) | Header → Announcement → Hero → Store-locator → Footer |
| T7 | **Contact us** (`generic-template`) | Header → Announcement → Hero → Contact-cards → Signup-form → Footer |

## Summary

| Tier | Count | Notes |
|---|---:|---|
| Atoms | 21 | 19 kept + 2 gap |
| Molecules | 13 | 11 kept + 2 gap |
| Organisms | 23 | 22 active + 1 deferred (minicart) |
| Templates | 7 | derived from scraped page samples + template metadata |

## Propagation contract

Every element in the Pencil canvas follows this composition chain:

```
$variables (tokens.css)
  ↓
Atoms (reusable; e.g., Button/Primary, Input/Default)
  ↓ via ref
Molecules (reusable; e.g., CTA Group, Form Field)
  ↓ via ref
Organisms (e.g., O11 Hero, O17 FAQ)
  ↓ via ref
Templates (e.g., T1 Homepage, T3 Blog Article)
```

Changing a variable at the root propagates to every template via the ref chain. Changing an atom updates every molecule/organism/template using it. No structure is duplicated — refs are the only composition mechanism.
