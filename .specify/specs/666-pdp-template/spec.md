# Feature Specification: PDP Template

**Feature Branch**: `f/666-pdp-template`  
**Created**: 2026-04-15  
**Status**: Clarified  
**Input**: User description: "prompt-for-specify.md"
**Reference**: prompt-for-specify.md — Block structure for the Product Detail Page template

Implement the Product Detail Page (PDP) template for the Zonnic site migration. The PDP is a product-focused page template that combines a new `product-detail` block with several existing and Block Collection blocks to present product information, purchasing options, related products, testimonials, instructional content, and FAQs. The template serves all product variant pages (e.g., Spearmint, Peppermint, Wintergreen).

## Project Context

**Scope**: New block (`product-detail`), new block variants (`carousel (product)`, `accordion (faq)`), new block from Block Collection (`video`), template assembly with existing blocks (`columns`, `fragment`, `header`, `footer`), and default content sections.

**Affected Pages/Sections**: All Product Detail pages (e.g., `/ca/en/pouches/zonnic-spearmint-24-nicotine-pouches`). Currently one template in the source site, but the structure applies to all product variant pages.

**Content Approach**:
- Authors create each PDP as a document in the CMS (Google Docs, SharePoint, or DA)
- Each PDP MUST include `template | pdp` in the page metadata block to identify the page as a Product Detail Page — this enables template-specific decoration or auto-blocking in `scripts.js`
- The product-detail block is authored as a table with product images, name, flavour, format, description bullets, and buy panel content
- Remaining sections use default content (headings, text, buttons), the product carousel, columns, video, accordion, and a newsletter signup fragment
- Draft content location: `/drafts/dev/pdp-spearmint` (reference PDP using Spearmint product data)

**Existing Blocks/Patterns**:
- **header** (local) — site header, no changes needed
- **footer** (local) — site footer, no changes needed
- **columns** (local) — used for Image+Text and Text+Video sections
- **fragment** (local) — used for the newsletter signup bar
- **hero** (local) — CSS only, not used on PDP (product-detail replaces the hero role)
- **carousel** (Block Collection) — base for the `product` variant
- **accordion** (Block Collection) — base for the `faq` variant
- **video** (Block Collection) — self-hosted MP4 for the instructional video in the Text+Video columns section (autoplay, loop, muted)

## User Story & Testing

### User Story — Product Detail Page

As a content author,
I want to create Product Detail Pages using a consistent template with authored blocks and default content,
so that each product variant has a complete, branded page without requiring developer involvement for content changes.

As a site visitor,
I want to view product details including images, description, purchasing options, related products, and FAQs,
so that I can make an informed decision about the product and know how to purchase it.

**Context**:

The Zonnic site is being migrated from a legacy platform to AEM Edge Delivery Services. The Product Detail Page is one of the most important templates — it is the primary conversion page where visitors learn about a specific product variant and are directed to an external pharmacy partner (Felix) to complete their purchase. Each PDP follows the same structure but with different product content (images, flavour, description, FAQs).

**User journey (visitor)**:

1. Visitor arrives on a PDP from the product listing page, a product carousel on another page, or a direct link
2. Visitor sees the product hero section: image gallery, product name/flavour/format, and an expandable description
3. Visitor reviews the buy panel explaining the purchase process via the pharmacy partner, and clicks the primary CTA to buy online — or clicks "Find Nearest Store" to locate a physical retailer
4. Visitor scrolls past a PDF download link for the product label
5. Visitor sees a product range introduction heading followed by a carousel of other flavour variants, and may click through to another PDP
6. Visitor encounters testimonial and editorial content (lifestyle imagery, brand messaging, instructional video on how to use the product)
7. Visitor reads product FAQs in an expandable accordion
8. Visitor sees the newsletter signup bar and the site footer

**User journey (author)**:

1. Author creates a new document in the CMS for a product variant
2. Author adds the product-detail block table with images, product name, flavour, format, description bullets, and buy panel content
3. Author adds default content sections (PDF download link, range intro heading)
4. Author adds the product carousel block referencing available flavour variants
5. Author adds columns sections for testimonial teaser, editorial content, and instructional video
6. Author adds the FAQ accordion with product-specific questions and answers
7. Author adds a fragment reference to the shared newsletter signup bar
8. Author previews via Sidekick and publishes

**Acceptance Criteria**:

AC1. **Product-detail block MUST display product imagery and information**
1. Block MUST render an image gallery with multiple product images and thumbnail navigation
2. Block MUST display product name as the primary heading, flavour as secondary heading, and package format as tertiary heading
3. Block MUST include an expandable product description that shows only the first bullet by default, with a "Read more" toggle to reveal all bullets
4. Block MUST render a buy panel with partner name/logo, numbered purchase steps, and a primary CTA linking to the external partner
5. Block MUST render a "Find Nearest Store" secondary CTA linking to the store locator page

AC2. **Product carousel MUST showcase available flavour variants**
1. Carousel MUST display product cards, each with a product image, flavour tagline heading, and "Learn more" CTA linking to that variant's PDP
2. Carousel MUST support horizontal scrolling or arrow navigation when cards exceed the viewport width
3. Cards MUST use a consistent layout: text on the left, product image on the right, with a bordered card treatment

AC3. **FAQ accordion MUST present expandable product Q&As**
1. Accordion MUST display a section heading (e.g., "FAQ") above the question rows
2. Each question row MUST be individually expandable/collapsible with a toggle indicator icon
3. Questions and answers MUST be fully author-managed (no hard-coded content)

AC4. **Columns sections MUST support Image+Text and Text+Video layouts**
1. Columns MUST support a two-column layout with an image in one column and heading + text + optional CTA in the other
2. Columns MUST support a two-column layout with text/steps in one column and an autoplaying, looping, muted video in the other
3. Column order MUST be reversible (image left/text right or text left/image right) for visual variety

AC5. **Default content sections MUST render without requiring a block**
1. Product Label Download section MUST render as a text paragraph with a button linking to a PDF
2. Product Range Introduction MUST render as a centred heading and statement paragraph

AC6. **Newsletter signup bar MUST be reusable across pages**
1. Newsletter signup MUST be included via a fragment reference so authors maintain it once
2. Fragment MUST contain heading, description text, and a signup CTA button

AC7. **Template MUST be responsive and accessible**
1. All sections MUST adapt from multi-column desktop layout to single-column stacked mobile layout
2. Image gallery MUST support swipe navigation on touch devices
3. All interactive elements (accordion, gallery navigation, expand/collapse) MUST be keyboard accessible
4. All images MUST have appropriate alt text authored by the content author
5. Heading hierarchy MUST be logical and sequential across the full page

### Edge Cases

- **Single image**: Gallery MUST still render thumbnail strip and prev/next arrows even with one image. Controls may appear dimmed/disabled but the gallery chrome remains consistent across all products.
- **Single description bullet**: "Read more" toggle MUST still appear even with one bullet. The toggle is part of the component's consistent UI — authors should not need to account for bullet count.
- **Buy panel partner change**: Buy panel is authored inline per PDP. If the partner changes, authors update the logo, heading, steps, and CTA link directly in the document. No code change required.
- **Single carousel card**: Carousel MUST still render navigation controls (arrows/dots) even with one card. Controls may appear dimmed/disabled.
- **Long FAQ answer**: Accordion MUST support rich text in the answer column including paragraphs, links, bold/italic formatting, and lists. No content length restriction.
- **Video load failure**: If the MP4 fails to load or the browser does not support the format, the columns section MUST still render the text column at full width. The video area MUST show a fallback (poster image if provided, or collapse gracefully without leaving a blank space).
- **Missing fragment reference**: If the newsletter signup fragment path is invalid or the fragment page has not been published, the fragment block MUST render nothing (no broken UI). The section containing the fragment collapses.

## Content Model

This template uses multiple blocks. Content models are defined for each.

### Content Model: Product Detail

**Canonical Model Type**: Standalone

The product-detail block uses a standalone model because it is a unique, complex element that appears once per page. It combines several sub-components (image gallery, product info, buy panel) into a single authored structure.

**Block Table Structure**:

| Product Detail |  |
|---|---|
| Product images (multiple images in one cell — each image becomes a gallery slide; first image is the initial view) | **Product Name** (H2), **Flavour** (H3), **Format** (H4), description bullet list, buy panel content (see below) |

The right column contains all product information as a natural content flow:
- Heading hierarchy conveys product name → flavour → format
- A bullet list provides the expandable product description
- A horizontal rule (`---`) separates the product description from the buy panel
- The buy panel is authored as: partner logo image, a heading with partner name (e.g., "Buy **ZONNIC** online via **felix**"), a numbered list for purchase steps, and a link for the primary CTA
- A final link after the buy panel serves as the "Find Nearest Store" CTA

**Semantic Formatting**:
- H2 → product name
- H3 → flavour
- H4 → package format
- Unordered list → expandable product description bullets
- Horizontal rule → separator between description and buy panel
- Image (after `---`) → partner logo
- Heading (after `---`) → buy panel header
- Ordered list → purchase steps
- Links → CTAs (primary buy CTA and secondary store locator CTA)

**Block Options (Variants)**: None initially. Future variants could include `Product Detail (compact)` for simplified layouts.

### Content Model: Carousel (Product)

**Canonical Model Type**: Collection

| Carousel (Product) |  |
|---|---|
| **Flavour tagline heading**, [Learn more](link-to-pdp) | Product image |
| **Flavour tagline heading**, [Learn more](link-to-pdp) | Product image |
| **Flavour tagline heading**, [Learn more](link-to-pdp) | Product image |

Each row is one product card. Column 1 has the heading and CTA link; column 2 has the product image. Authors manually maintain the card rows on each PDP — with only 3 flavour variants currently, the maintenance overhead is minimal. If the product lineup grows significantly, auto-population from a product index can be introduced as a separate feature without breaking existing authored content.

### Content Model: Accordion (FAQ)

**Canonical Model Type**: Collection

| Accordion (FAQ) |  |
|---|---|
| **Question text** | Answer paragraph(s) |
| **Question text** | Answer paragraph(s) |
| **Question text** | Answer paragraph(s) |

Each row is one Q&A pair: question in column 1 (bold text, becomes the clickable header), answer in column 2 (becomes the expandable content panel). This aligns with the Block Collection accordion's expected two-column structure, so the `faq` variant only needs to add the section heading wrapper and visual styling — no custom decoration overrides.

### Content Model: Columns (Image + Text)

Uses the existing **columns** block with no structural changes.

| Columns |  |
|---|---|
| **Headline** (H2), body text paragraph(s), optional [CTA link](url) | Image |

Column order may be reversed by the author to alternate image/text placement.

### Content Model: Columns (Text + Video)

Uses the existing **columns** block. The video column contains a link to a self-hosted MP4 file. The **video** block (from Block Collection) renders it as an autoplaying, looping, muted `<video>` element with no visible controls, functioning as an animated product demonstration.

| Columns |  |
|---|---|
| **Headline** (H2), step subheadings (H3) with body text, optional [CTA link](url) | Link to MP4 file (rendered by video block as autoplay/loop/muted) |

### Content Model: Testimonial Teaser

Uses the existing **columns** block with visual styling applied via section metadata.

| Columns |  |
|---|---|
| Lifestyle image | **Title** (H2), subtitle (H3), body text with emphasis, [Arrow CTA link →](url) |

**Section Metadata**:

| Section Metadata |  |
|---|---|
| Style | testimonial-teaser |

The `testimonial-teaser` section style applies the grey background, specific typography treatment, and two-tone heading effect.

### Content Model: Newsletter Signup (Fragment)

Authored once as a standalone page, referenced via the fragment block on each PDP.

Default content on the fragment page:
- H2 heading (e.g., "SIGN UP FOR OUR ZONNIC NEWSLETTER")
- Body paragraph with optional inline links
- CTA button link

**Section Metadata** on the fragment:

| Section Metadata |  |
|---|---|
| Style | newsletter |

Referenced on each PDP with:

| Fragment |
|---|
| /path/to/newsletter-signup |

## Clarifications

### Session 2026-04-15

1. **Product carousel data source** → Manually authored Collection. Each flavour card is a row in the block table, maintained per PDP. With only 3 variants currently, duplication is minimal. Auto-population from a product index can be introduced later without breaking existing content.
2. **Video hosting source** → Self-hosted MP4 via the `video` block from Block Collection. Gives full control over autoplay/loop/muted attributes. No YouTube/Vimeo dependency.
3. **Accordion content model** → Two-column model aligned with Block Collection standard. Each row is one Q&A pair (question col 1, answer col 2). The `faq` variant only adds section heading and visual styling.
4. **Single image / single bullet behavior** → Always show controls. Gallery renders thumbnails and arrows even with one image (dimmed/disabled). "Read more" toggle appears even with one bullet. Consistent component UI regardless of content count.
5. **Toggle label sourcing** → "Read more" / "Read less" labels sourced from the Placeholders spreadsheet (`readMore`, `readLess` keys) to support EN/FR translation.
6. **Buy panel approach** → Inline per PDP. Content authored directly in the product-detail block table. Self-contained, no fragment dependency. Authors copy/paste when creating new variants.
7. **Template metadata** → `template | pdp` in page metadata. Enables template-specific auto-blocking or decoration in `scripts.js`. Standard EDS practice.

## Requirements

### Functional Requirements

- **FR-001**: System MUST render the product-detail block with an image gallery supporting multiple images, thumbnail navigation, and previous/next arrows
- **FR-002**: System MUST display the product description in a collapsed state by default (first bullet visible) with a "Read more" / "Read less" toggle that expands/collapses the full bullet list. Toggle labels MUST be sourced from the Placeholders spreadsheet (`readMore`, `readLess` keys) to support EN/FR translation
- **FR-003**: System MUST render the buy panel as a visually distinct boxed component within the product-detail block, containing partner branding, numbered steps, and a primary CTA
- **FR-004**: System MUST render the carousel (product) variant with horizontal card scrolling and navigation controls
- **FR-005**: System MUST render the accordion (faq) variant with individually expandable/collapsible question-answer pairs and a toggle icon on each row
- **FR-006**: System MUST support autoplaying, looping, muted video within a columns block when a video link is present
- **FR-007**: System MUST support the newsletter signup fragment being embedded on every PDP without authors re-creating the content
- **FR-008**: System MUST support the testimonial-teaser section style via section metadata, applying the appropriate layout and visual treatment to a columns block
- **FR-009**: Authors MUST be able to reverse column order (image left/text right or text left/image right) without code changes
- **FR-010**: All author-visible text (headings, descriptions, CTAs, FAQ content) MUST be sourced from authored content — no hard-coded strings in code

### Non-Functional Requirements

- **NFR-001**: Product-detail block MUST load its images with appropriate `loading` attributes to maintain Lighthouse performance score of 100 — the first/hero image eager, remaining gallery images lazy (Principle II: Performance)
- **NFR-002**: All interactive elements (gallery navigation, expand/collapse, accordion toggles) MUST be operable via keyboard and have appropriate ARIA attributes (Principle IV: Accessibility)
- **NFR-003**: All block CSS selectors MUST be scoped to the block class to prevent style leakage (Principle I: Code Quality)
- **NFR-004**: Carousel and accordion blocks MUST be sourced from the Block Collection and extended via variant CSS/JS — not built from scratch (Principle V: Maintainability)
- **NFR-005**: Video content MUST load in the lazy phase, not the eager phase, to avoid impacting LCP (Principle II: Performance)
