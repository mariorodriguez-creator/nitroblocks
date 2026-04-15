# Design Reference: PDP Template

**Source**: Live page — https://www.zonnic.ca/ca/en/pouches/zonnic-spearmint-24-nicotine-pouches
**Spec**: .specify/specs/666-pdp-template/spec.md
**Blocks specified**: 7 blocks + 2 default content sections

### Data Collection Method

All CSS values in this document are **actual computed styles** extracted from the live page using Playwright `getComputedStyle()` at three breakpoints (375px mobile, 768px tablet, 1200px desktop). Visual validation was performed via browser screenshots at each breakpoint.

**Raw data**:
- `page-styles/styles-report.json` — full JSON extraction for all elements
- `page-styles/styles-summary.md` — human-readable summary
- `page-styles/screenshot-mobile.png`, `screenshot-tablet.png`, `screenshot-desktop.png` — full-page headless screenshots

---

## Block: Product Detail (`.product-detail`)

**Spec reference**: Content Model: Product Detail in spec.md
**Variant**: None
**Section style**: None

### Code Scaffold

#### HTML Structure

```html
<div class="product-detail">
  <div>
    <!-- Row 1: two columns from authored table -->
    <div>
      <!-- Col 1: Image gallery -->
      <div>
        <picture><img src="product-front.jpg" alt="..."></picture>
        <picture><img src="product-back.jpg" alt="..."></picture>
        <picture><img src="product-pouch.jpg" alt="..."></picture>
      </div>
    </div>
    <div>
      <!-- Col 2: Product info (all authored content) -->
      <div>
        <h2>ZONNIC Nicotine Pouches</h2>
        <h3>MINT</h3>
        <h4>Regular - 24 pouches</h4>
        <ul><!-- description bullets --></ul>
        <hr>
        <picture><img src="felix-logo.png" alt="felix"></picture>
        <p>Buy <strong>ZONNIC</strong> online via <strong>felix</strong></p>
        <ol><!-- purchase steps --></ol>
        <p class="button-wrapper"><a href="..." class="button primary">Buy Now</a></p>
        <p class="button-wrapper"><a href="..." class="button secondary">Find Nearest Store</a></p>
      </div>
    </div>
  </div>
</div>
```

Decoration adds:
- `.product-detail-gallery` wrapper around image column
- `.product-detail-gallery-main` for active image display area with gradient background
- `.product-detail-gallery-thumbnails` row below main image
- `.product-detail-gallery-prev` / `.product-detail-gallery-next` arrow buttons
- `.product-detail-info` wrapper around text column
- `.product-detail-description` around the `<ul>` with expand/collapse behavior
- `.product-detail-description-toggle` for the "Read more" / "Read less" link
- `.product-detail-buy-panel` wrapper around everything after `<hr>`
- `.product-detail-buy-panel-steps` around the `<ol>`
- `.product-detail-ctas` wrapper around both CTA buttons

#### CSS Skeleton

```css
/* 1. Base (mobile) */
.product-detail {
  padding: 0;
}

.product-detail > div {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
}

.product-detail-gallery {
  position: relative;
  background: linear-gradient(rgb(0, 126, 71) 70%, rgb(183, 218, 155));
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.product-detail-gallery-main img {
  object-fit: contain;
}

.product-detail-gallery-prev,
.product-detail-gallery-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  border-radius: 30px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: block;
  margin-top: -15px;
}

.product-detail-gallery-prev { left: 8px; }
.product-detail-gallery-next { right: 8px; }

.product-detail-gallery-thumbnails {
  display: flex;
  gap: 5px;
  justify-content: center;
  padding: 16px 0;
}

.product-detail-gallery-thumbnails button {
  width: 95px;
  height: 95px;
  display: block;
  position: relative;
  border: 1px solid rgb(255, 255, 255);
  margin: 2.5px;
  cursor: pointer;
}

.product-detail-gallery-thumbnails button[aria-selected="true"] {
  border-color: rgb(24, 36, 101);
}

.product-detail-info {
  padding: 24px 16px;
}

.product-detail-info h2 {
  font-family: var(--heading-font-family);
  font-size: 22px;
  font-weight: 800;
  line-height: 26px;
  color: rgb(20, 30, 83);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
}

.product-detail-info h3 {
  font-family: var(--heading-font-family);
  font-size: 18px;
  font-weight: 700;
  line-height: 25px;
  color: rgb(20, 30, 83);
  text-transform: uppercase;
  margin: 0 0 4px;
}

.product-detail-info h4 {
  font-family: var(--heading-font-family);
  font-size: 18px;
  font-weight: 700;
  line-height: 25px;
  color: rgb(20, 30, 83);
  text-transform: uppercase;
  margin: 0 0 16px;
}

.product-detail-description {
  overflow: hidden;
}

.product-detail-description[aria-expanded="false"] ul {
  max-height: 1.6em;
  overflow: hidden;
}

.product-detail-description-toggle {
  font-family: var(--body-font-family);
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  color: rgb(24, 36, 101);
  text-transform: uppercase;
  text-decoration: underline 2px;
  cursor: pointer;
  margin-top: 8px;
  display: inline-flex;
}

.product-detail-buy-panel {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
}

.product-detail-buy-panel p:first-child {
  font-size: 16px;
  color: #1a1a4e;
  text-align: center;
}

.product-detail-buy-panel img {
  max-height: 28px;
  display: block;
  margin: 0 auto 8px;
}

.product-detail-buy-panel-steps {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.product-detail-buy-panel-steps li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
  color: #1a1a4e;
  border-bottom: 1px solid #f0f0f0;
}

.product-detail-buy-panel-steps li::before {
  content: counter(step);
  counter-increment: step;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f0f0;
  font-weight: 700;
  color: #1a1a4e;
  flex-shrink: 0;
}

.product-detail-ctas {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.product-detail-ctas .button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(24, 36, 101);
  border: 2px solid rgb(24, 36, 101);
  color: rgb(255, 255, 255);
  border-radius: 100px;
  padding: 15px 30px;
  max-width: clamp(0px, 100%, 390px);
  font-weight: 700;
  font-size: 12px;
  line-height: 14px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  text-align: center;
  overflow: hidden;
}

/* 2. Tablet (≥600px) */
@media (width >= 600px) {
  .product-detail-ctas {
    flex-direction: row;
  }
}

/* 3. Desktop (≥900px) */
@media (width >= 900px) {
  .product-detail > div {
    flex-direction: row;
  }

  .product-detail-gallery {
    width: 52%;
    flex-shrink: 0;
  }

  .product-detail-info {
    width: 48%;
    padding: 40px 48px;
  }

  .product-detail-info h2 {
    font-size: 32px;
    line-height: 40px;
  }

  .product-detail-info h3 {
    font-size: 20px;
    line-height: 28px;
  }

  .product-detail-ctas .button {
    padding: 11px 30px;
  }
}
```

### Layout Matrix (from actual computed values)

| Container | Mobile (375px) | Tablet (768px) | Desktop (1200px) |
|---|---|---|---|
| `.bat-producthero` | `flex-direction: column` 375×1083 | `flex-direction: column` 768×1207 | `flex-direction: row` 1200×817 |
| `.producthero-gallery` | `flex-direction: column` 375×392 | 768×542 | 624×817 |
| Gallery slider padding | `46px` top/bottom | `46px` top/bottom | `~119px` top, `~131px` bottom |
| `.producthero-info` (content) | `padding: 24px 16px` | *unchanged* | `padding: 40px 48px; width: 48%` |
| CTA buttons | 335×48 each, stacked | *same* | 117×54 + 183×54, side-by-side |
| Gallery thumbnails | dot indicators (mobile) | hidden | 95×95px button thumbnails |

### Design Token Mapping (from actual computed values)

| Element | CSS Property | Actual value | Project variable | Notes |
|---|---|---|---|---|
| Product name (H1) | font-family | `Santral, sans-serif` | `--heading-font-family` | Source uses custom BAT font |
| Product name (H1) | color | `rgb(20, 30, 83)` / `#141e53` | — (new: `--color-navy`) | |
| Product name (H1) | font-size | 22px (mobile) → 32px (desktop) | — | weight 800, uppercase |
| Format (H3) | font-size | 18px (mobile) → 20px (desktop) | — | weight 700, uppercase |
| Body text | font-family | `Santral, sans-serif` | `--body-font-family` | weight **300** (light) |
| Body text | color | `rgb(97, 96, 105)` / `#616069` | `--dark-color` | Override from `#505050` |
| Product bullets | color | `rgb(37, 45, 101)` / `#252d65` | — | Different from body text |
| Product bullets | font-size | 14px / 22px line-height | — | weight 300 |
| CTA buttons bg | background-color | `rgb(24, 36, 101)` / `#182465` | — (new: `--color-navy-dark`) | |
| CTA buttons | border-radius | `100px` | — | Full pill shape |
| CTA buttons | padding | `15px 30px` (mobile) → `11px 30px` (desktop) | — | |
| CTA buttons | letter-spacing | `1.2px` | — | |
| Read more link | color | `rgb(24, 36, 101)` | — | 14px, weight 700, `underline 2px` |
| Gallery gradient | background-image | `linear-gradient(rgb(0, 126, 71) 70%, rgb(183, 218, 155))` | — | `#007e47` → `#b7da9b` |
| Thumbnail border | border-color | `rgb(255, 255, 255)` (1px) | — | Active: `rgb(24, 36, 101)` |
| Buy panel border | border-color | — visual estimate `#e0e0e0` | — | Not extracted (inline) |

**New token candidates (from actual computed styles):**
- `--color-navy`: `#141e53` / `rgb(20, 30, 83)` — heading text colour throughout
- `--color-navy-dark`: `#182465` / `rgb(24, 36, 101)` — footer bg, CTA bg, interactive elements
- `--color-body`: `#616069` / `rgb(97, 96, 105)` — body text colour (replaces `--dark-color: #505050`)
- `--color-teal`: `#007e47` / `rgb(0, 126, 71)` — gallery gradient start (extracted from `background-image` computed style)
- `--color-green-light`: `#b7da9b` / `rgb(183, 218, 155)` — gallery gradient end
- `--color-border`: `#e0e0e0` — light border colour for panels and dividers (visual estimate)

**Font family note:** The source site uses `Santral, sans-serif` — a custom BAT brand font. The EDS project currently uses `roboto` / `roboto-condensed`. A decision is needed on whether to license and use Santral, or map to the project's existing Roboto fonts.

### Dynamic Content Elements

- **Gallery images**: 1–N images per product. Do NOT store fixed dimensions on `<img>` or gallery container height.
- **Description bullets**: 1–N list items. Do NOT store fixed height on `<ul>`.
- **Buy panel steps**: 1–N `<li>` items. Do NOT store fixed height on `<ol>`.

### Interactive States

| Element | State | CSS Changes |
|---|---|---|
| Primary CTA | `:hover` | `background-color: #131340; border-color: #131340` |
| Secondary CTA | `:hover` | `background-color: #f0f0f5; color: #1a1a4e` |
| Gallery thumbnail | `[aria-selected="true"]` | `border-color: #1a1a4e` |
| Gallery arrow | `:hover` | `background-color: #1a1a4e; color: #fff` |
| Read more toggle | `:hover` | `color: #131340` |
| Description | `[aria-expanded="true"]` | `max-height: none; overflow: visible` on `ul` |

### Visual Acceptance Checklist

- [ ] Mobile: Gallery fills full width with gradient background, product info stacks below
- [ ] Mobile: CTAs stack vertically
- [ ] Desktop: Gallery and info side-by-side, roughly 50/50 split
- [ ] Desktop: Thumbnails row visible below gallery image with active indicator
- [ ] Desktop: Buy panel has rounded border, centred partner logo and heading, numbered steps
- [ ] Gallery arrows visible on both sides of the main image
- [ ] "Read more" toggle visible below first description bullet

### EDS Block Integration

| Visual Element | Source | Notes |
|---|---|---|
| Product images | Authored (Col 1) | Multiple `<picture>` elements, decoration wraps in gallery |
| Product name | Authored (H2 in Col 2) | Decoration adds class for styling |
| Flavour | Authored (H3 in Col 2) | — |
| Format | Authored (H4 in Col 2) | — |
| Description bullets | Authored (`<ul>` in Col 2) | Decoration wraps for expand/collapse |
| Buy panel | Authored (after `<hr>` in Col 2) | Decoration wraps in `.product-detail-buy-panel` |
| CTA buttons | Authored (links in Col 2) | EDS auto-decorates as `.button` |
| Gallery nav arrows | Decoration-added | Created by JS during block decoration |
| Thumbnail strip | Decoration-added | Created by JS, populated from authored images |
| Read more toggle | Decoration-added | Created by JS, label from Placeholders |

---

## Block: Carousel — Product (`.carousel.product`)

**Spec reference**: Content Model: Carousel (Product) in spec.md
**Variant**: `product` variant of carousel base block

### Code Scaffold

#### HTML Structure

```html
<div class="carousel product">
  <div>
    <!-- Row per card (Collection model) -->
    <div>
      <div><h2>A BALANCED SPEARMINT BLEND.</h2><p><a href="/pouches/spearmint">Learn more</a></p></div>
      <div><picture><img src="spearmint-can.jpg" alt="..."></picture></div>
    </div>
    <div>
      <div><h2>A BOLD PEPPERMINT PROFILE.</h2><p><a href="/pouches/peppermint">Learn more</a></p></div>
      <div><picture><img src="peppermint-can.jpg" alt="..."></picture></div>
    </div>
    <div>
      <div><h2>A CLASSIC TASTE.</h2><p><a href="/pouches/wintergreen">Learn more</a></p></div>
      <div><picture><img src="wintergreen-can.jpg" alt="..."></picture></div>
    </div>
  </div>
</div>
```

Decoration adds:
- Carousel navigation (arrows, dots) from Block Collection base
- `.carousel-card` wrapper on each row for card styling

#### CSS Skeleton

```css
/* 1. Base (mobile) */
.carousel.product {
  padding: 0 16px;
}

.carousel.product .carousel-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 2px solid #1a1a4e;
  border-radius: 12px;
  padding: 24px;
  background-color: var(--background-color);
  gap: 16px;
  min-height: 140px;
}

.carousel.product .carousel-card > div:first-child {
  flex: 1;
}

.carousel.product .carousel-card > div:last-child {
  flex: 0 0 40%;
}

.carousel.product .carousel-card h2 {
  font-family: var(--heading-font-family);
  font-size: 18px;
  font-weight: 800;
  color: #1a1a4e;
  text-transform: uppercase;
  line-height: 1.2;
  margin: 0 0 12px;
}

.carousel.product .carousel-card .button {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 2px solid #1a1a4e;
  border-radius: 24px;
  padding: 8px 20px;
  color: #1a1a4e;
  background: transparent;
}

.carousel.product .carousel-card img {
  object-fit: contain;
}

/* 2. Tablet */
@media (width >= 600px) {
  .carousel.product > div {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }

  .carousel.product .carousel-card {
    flex: 0 0 calc(50% - 8px);
    scroll-snap-align: start;
  }
}

/* 3. Desktop */
@media (width >= 900px) {
  .carousel.product > div {
    display: flex;
    gap: 16px;
  }

  .carousel.product .carousel-card {
    flex: 1;
  }

  .carousel.product .carousel-card h2 {
    font-size: 22px;
  }
}
```

### Layout Matrix

| Container | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.carousel.product > div` | `display: block` (stacked or horizontal scroll) | `display: flex; gap: 16px; overflow-x: auto` | `display: flex; gap: 16px` (no overflow) |
| `.carousel-card` | `flex-direction: row; gap: 16px` | `flex: 0 0 calc(50% - 8px)` | `flex: 1` (equal width) |

### Design Token Mapping

| Element | CSS Property | Project variable | Fallback value |
|---|---|---|---|
| Card border | border-color | — | `#1a1a4e` |
| Card heading | font-family | `--heading-font-family` | `roboto-condensed, sans-serif` |
| Card heading | color | — | `#1a1a4e` |
| Card bg | background-color | `--background-color` | `#fff` |
| CTA button | border-color | — | `#1a1a4e` |

### Interactive States

| Element | State | CSS Changes |
|---|---|---|
| Card CTA | `:hover` | `background-color: #1a1a4e; color: #fff` |
| Card | `:hover` | `box-shadow: 0 4px 12px rgba(26, 26, 78, 0.1)` |

### Visual Acceptance Checklist

- [ ] Mobile: Cards stack or scroll horizontally
- [ ] Desktop: Three cards side-by-side at equal width, with navy border and rounded corners
- [ ] Each card: heading left, product image right
- [ ] "Learn more" CTA with pill-shaped border below heading

---

## Block: Accordion — FAQ (`.accordion.faq`)

**Spec reference**: Content Model: Accordion (FAQ) in spec.md
**Variant**: `faq` variant of accordion base block

### Code Scaffold

#### HTML Structure

```html
<div class="accordion faq">
  <div>
    <!-- Row per Q&A pair (Collection model, two columns) -->
    <div>
      <div><p><strong>Is ZONNIC a Natural Health Product (NHP)?</strong></p></div>
      <div><p>Answer text...</p></div>
    </div>
    <div>
      <div><p><strong>What are the benefits of using ZONNIC?</strong></p></div>
      <div><p>Answer text with <a href="...">links</a>...</p></div>
    </div>
    <div>
      <div><p><strong>Why should I use NRT?</strong></p></div>
      <div><p>Answer text...</p></div>
    </div>
  </div>
</div>
```

Decoration adds (from Block Collection accordion):
- `.accordion-item` wrapper per row
- `.accordion-item-header` for question (clickable)
- `.accordion-item-body` for answer (expandable)
- `aria-expanded` on header, toggle icon (`+` / `−`)

#### CSS Skeleton

```css
/* 1. Base (mobile) */
.accordion.faq {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 16px;
}

.accordion.faq .accordion-item {
  border-bottom: 1px solid #e0e0e0;
}

.accordion.faq .accordion-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-family: var(--heading-font-family);
  font-size: 14px;
  font-weight: 700;
  color: #1a1a4e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.accordion.faq .accordion-item-header::after {
  content: "+";
  font-size: 24px;
  font-weight: 300;
  color: #1a1a4e;
  flex-shrink: 0;
  margin-left: 16px;
  transition: transform 0.2s ease;
}

.accordion.faq .accordion-item-header[aria-expanded="true"]::after {
  content: "−";
}

.accordion.faq .accordion-item-body {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
}

.accordion.faq .accordion-item-body[aria-hidden="false"] {
  max-height: 500px;
}

.accordion.faq .accordion-item-body p {
  padding: 0 0 20px;
  font-family: var(--body-font-family);
  font-size: 15px;
  line-height: 1.6;
  color: var(--dark-color);
}

/* 2. Tablet */
@media (width >= 600px) {
  .accordion.faq {
    max-width: 700px;
  }

  .accordion.faq .accordion-item-header {
    font-size: 15px;
  }
}

/* 3. Desktop */
@media (width >= 900px) {
  .accordion.faq {
    max-width: 700px;
  }

  .accordion.faq .accordion-item-header {
    font-size: 16px;
    padding: 24px 0;
  }
}
```

### Layout Matrix

| Container | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.accordion.faq` | `max-width: 700px; margin: 0 auto` | *unchanged* | *unchanged* |
| `.accordion-item-header` | `display: flex; justify-content: space-between; padding: 20px 0` | *unchanged* | `padding: 24px 0` |

### Design Token Mapping

| Element | CSS Property | Project variable | Fallback value |
|---|---|---|---|
| Question text | font-family | `--heading-font-family` | `roboto-condensed, sans-serif` |
| Question text | color | — | `#1a1a4e` |
| Answer text | font-family | `--body-font-family` | `roboto, sans-serif` |
| Answer text | color | `--dark-color` | `#505050` |
| Divider | border-color | — | `#e0e0e0` |

### Interactive States

| Element | State | CSS Changes |
|---|---|---|
| Header | `:hover` | `color: #131340` |
| Header | `[aria-expanded="true"]` | `::after` content changes to `−` |
| Body | `[aria-hidden="false"]` | `max-height: 500px` (transition reveal) |

### Visual Acceptance Checklist

- [ ] FAQ heading centred above accordion items
- [ ] Each question is a full-width row with `+` icon right-aligned
- [ ] Divider lines between questions
- [ ] Expanded state reveals answer smoothly, `+` becomes `−`
- [ ] Questions uppercase, navy colour

---

## Block: Columns — Testimonial Teaser (`.columns` with `.section.testimonial-teaser`)

**Spec reference**: Content Model: Testimonial Teaser in spec.md
**Section style**: `testimonial-teaser`

### Section Wrapper

```css
.section.testimonial-teaser {
  background-color: #f5f5f5;
  padding: 48px 0;
  margin: 0;
}
```

### Code Scaffold

#### HTML Structure

Standard columns block structure. Section metadata adds `testimonial-teaser` class to `.section`.

```html
<div class="section testimonial-teaser">
  <div class="columns-wrapper">
    <div class="columns">
      <div>
        <div><picture><img src="testimonial-group.jpg" alt="..."></picture></div>
        <div>
          <h2>THEY CHOSE TO QUIT SMOKING.</h2>
          <h3>YOU CAN TOO.</h3>
          <p>Real stories. Real success. <strong>THIS IS ZONNIC</strong>.</p>
          <p><a href="/testimonials">GET TO KNOW THEIR STORIES →</a></p>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### CSS Skeleton

```css
/* 1. Base (mobile) */
.section.testimonial-teaser {
  background-color: #f5f5f5;
  padding: 48px 0;
  margin: 0;
}

.section.testimonial-teaser .columns > div {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section.testimonial-teaser .columns > div > div:first-child img {
  border-radius: 0;
  object-fit: cover;
}

.section.testimonial-teaser .columns h2 {
  font-family: var(--heading-font-family);
  font-size: 24px;
  font-weight: 800;
  color: #1a1a4e;
  text-transform: uppercase;
  line-height: 1.15;
  margin: 0;
}

.section.testimonial-teaser .columns h3 {
  font-family: var(--heading-font-family);
  font-size: 24px;
  font-weight: 400;
  color: #1a1a4e;
  text-transform: uppercase;
  line-height: 1.15;
  margin: 0 0 16px;
}

.section.testimonial-teaser .columns p {
  font-size: 15px;
  color: var(--dark-color);
  line-height: 1.5;
}

.section.testimonial-teaser .columns a:not(.button) {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a4e;
  text-transform: uppercase;
  text-decoration: underline;
  letter-spacing: 0.5px;
}

/* 2. Tablet */
@media (width >= 600px) {
  .section.testimonial-teaser .columns > div {
    flex-direction: row;
    align-items: center;
  }

  .section.testimonial-teaser .columns > div > div:first-child {
    flex: 0 0 40%;
  }

  .section.testimonial-teaser .columns > div > div:last-child {
    flex: 1;
  }
}

/* 3. Desktop */
@media (width >= 900px) {
  .section.testimonial-teaser .columns h2 {
    font-size: 32px;
  }

  .section.testimonial-teaser .columns h3 {
    font-size: 32px;
  }
}
```

### Layout Matrix

| Container | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.columns > div` | `flex-direction: column; gap: 24px` | `flex-direction: row; align-items: center` | *unchanged from tablet* |
| Image column | `width: 100%` | `flex: 0 0 40%` | *unchanged* |
| Text column | `width: 100%` | `flex: 1` | *unchanged* |

### Design Token Mapping

| Element | CSS Property | Project variable | Fallback value |
|---|---|---|---|
| Section bg | background-color | `--light-color` | `#f5f5f5` |
| Title (H2) | color | — | `#1a1a4e` |
| Subtitle (H3) | color | — | `#1a1a4e` |
| Body text | color | `--dark-color` | `#505050` |
| Arrow CTA | color | — | `#1a1a4e` |

### Interactive States

| Element | State | CSS Changes |
|---|---|---|
| Arrow CTA link | `:hover` | `color: #131340` |

### Visual Acceptance Checklist

- [ ] Mobile: Image on top, text below, light grey background
- [ ] Desktop: Image left (~40%), text right (~60%), vertically centred
- [ ] H2 bold uppercase, H3 lighter weight (two-tone heading effect)
- [ ] Arrow CTA link underlined, uppercase

---

## Block: Columns — Image + Text (`.columns`)

**Spec reference**: Content Model: Columns (Image + Text) in spec.md

### Code Scaffold

Uses existing columns block with no structural changes. Same HTML pattern as standard columns.

#### CSS Skeleton

No block-specific CSS needed beyond what exists in `columns.css`. The section where this appears on the live page uses white background, standard content padding.

### Layout Matrix

| Container | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.columns > div` | `flex-direction: column` | `flex-direction: row; gap: 32px` | *unchanged from tablet* |

### Design Token Mapping

Uses existing project tokens. Heading is `#1a1a4e` navy, body text uses `--dark-color`.

### Visual Acceptance Checklist

- [ ] Mobile: Single column, text stacked above/below image
- [ ] Desktop: Two columns side-by-side, roughly 40/60 split
- [ ] Heading bold uppercase navy, body text standard weight

---

## Block: Columns — Text + Video (`.columns`)

**Spec reference**: Content Model: Columns (Text + Video) in spec.md

### Code Scaffold

Uses existing columns block. One column contains text with step subheadings; the other contains a video (rendered by the video block as autoplay/loop/muted).

On the live page, the "How to Open the Can?" section shows instructional text left, video/image right. The "How to Use Nicotine Pouches?" section shows video/image left, text right.

#### CSS Skeleton

No block-specific CSS needed beyond columns.css. The video block handles the `<video>` element styling.

Step subheadings observed on the live page:

```css
.columns h3 {
  font-family: var(--heading-font-family);
  font-size: 16px;
  font-weight: 700;
  color: #1a1a4e;
  text-transform: uppercase;
  margin: 16px 0 4px;
}
```

Arrow CTA link below steps:

```css
.columns a:not(.button) {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a4e;
  text-transform: uppercase;
  text-decoration: none;
  letter-spacing: 0.5px;
}

.columns a:not(.button)::after {
  content: " →";
}
```

### Layout Matrix

| Container | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.columns > div` | `flex-direction: column` | `flex-direction: row; gap: 32px` | *unchanged* |
| Text column | `width: 100%` | `flex: 0 0 40%` | *unchanged* |
| Video column | `width: 100%` | `flex: 1` | *unchanged* |

### Visual Acceptance Checklist

- [ ] Mobile: Text stacks above video
- [ ] Desktop: Two columns, text and video side-by-side
- [ ] Step subheadings bold uppercase, body text regular
- [ ] Video plays inline, muted, looped, no visible controls
- [ ] Arrow CTA link visible below steps

---

## Block: Newsletter Signup — Fragment (`.fragment` with `.section.newsletter`)

**Spec reference**: Content Model: Newsletter Signup (Fragment) in spec.md
**Section style**: `newsletter`

### Section Wrapper

```css
.section.newsletter {
  background-color: #1a1a4e;
  padding: 40px 0;
  margin: 0;
}
```

### Code Scaffold

#### HTML Structure

The fragment loads a separate page containing default content:

```html
<div class="section newsletter">
  <div class="default-content-wrapper">
    <h2>SIGN UP FOR OUR ZONNIC NEWSLETTER</h2>
    <p>Sign up to receive updates on new products, exclusive offers, and tips via our <a href="...">newsletter</a> directly in your inbox. Terms and conditions apply.</p>
    <p class="button-wrapper"><a href="..." class="button primary">SIGN UP NOW</a></p>
  </div>
</div>
```

#### CSS Skeleton

```css
/* 1. Base (mobile) */
.section.newsletter {
  background-color: #1a1a4e;
  padding: 40px 0;
  margin: 0;
}

.section.newsletter .default-content-wrapper {
  padding: 0 24px;
}

.section.newsletter h2 {
  font-family: var(--heading-font-family);
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  margin: 0 0 12px;
}

.section.newsletter p {
  font-size: 14px;
  color: #fff;
  line-height: 1.5;
  opacity: 0.85;
}

.section.newsletter a:not(.button) {
  color: #fff;
  text-decoration: underline;
}

.section.newsletter .button.primary {
  background-color: #fff;
  border-color: #fff;
  color: #1a1a4e;
  border-radius: 24px;
  padding: 12px 32px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
}

/* 2. Tablet */
@media (width >= 600px) {
  .section.newsletter .default-content-wrapper {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .section.newsletter h2 {
    font-size: 22px;
    margin: 0;
    flex-shrink: 0;
  }

  .section.newsletter p {
    flex: 1;
    margin: 0;
  }

  .section.newsletter .button-wrapper {
    flex-shrink: 0;
    margin: 0;
  }
}

/* 3. Desktop */
@media (width >= 900px) {
  .section.newsletter h2 {
    font-size: 24px;
  }
}
```

### Layout Matrix

| Container | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.default-content-wrapper` | `display: block` (stacked) | `display: flex; align-items: center; gap: 32px` | *unchanged from tablet* |

### Design Token Mapping

| Element | CSS Property | Project variable | Fallback value |
|---|---|---|---|
| Section bg | background-color | — | `#1a1a4e` |
| Heading | color | — | `#fff` |
| Body text | color | — | `#fff` (opacity 0.85) |
| CTA button bg | background-color | `--background-color` | `#fff` |
| CTA button text | color | — | `#1a1a4e` |

### Interactive States

| Element | State | CSS Changes |
|---|---|---|
| CTA button | `:hover` | `background-color: #e8e8e8` |
| Inline link | `:hover` | `opacity: 1` |

### Visual Acceptance Checklist

- [ ] Mobile: Dark navy background, heading/text/button stacked
- [ ] Desktop: Heading left, description centre, CTA button right, horizontally aligned
- [ ] White text on dark navy background
- [ ] CTA is inverse (white bg, navy text)

---

## Default Content: Product Label Download

**Spec reference**: AC5.1 — "Product Label Download section MUST render as a text paragraph with a button"
**Section style**: None
**Content elements**: Text paragraph, secondary button link to PDF

### Section Wrapper

Standard section, no special styling. White background, standard margin.

### Content Styles

#### Typography

| Element | font-family | font-size | font-weight | line-height | color | text-align |
|---|---|---|---|---|---|---|
| p | `var(--body-font-family)` | `16px` | `700` | `1.5` | `#1a1a4e` | `left` |

#### Buttons / CTAs

The "DOWNLOAD PDF" button is a secondary button with pill-shaped border:

```css
.button.secondary {
  border: 2px solid #1a1a4e;
  border-radius: 24px;
  padding: 10px 24px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #1a1a4e;
  background: transparent;
}
```

Hover: `background-color: #f0f0f5`.

### Layout Matrix

| Container | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.default-content-wrapper` | `text-align: left; padding: 24px 16px` | *unchanged* | `padding: 0 32px` |

### Design Token Mapping

| Element | CSS Property | Project variable | Fallback value |
|---|---|---|---|
| Text | color | — | `#1a1a4e` |
| Button border | border-color | — | `#1a1a4e` |

### Visual Acceptance Checklist

- [ ] Left-aligned text with bold weight
- [ ] Secondary button below text with navy border, uppercase label
- [ ] No special section background

---

## Default Content: Product Range Introduction

**Spec reference**: AC5.2 — "Product Range Introduction MUST render as a centred heading and statement paragraph"
**Section style**: None
**Content elements**: Centred H2 heading, centred body paragraph

### Section Wrapper

Standard section, white background. Generous vertical padding.

### Content Styles

#### Typography

| Element | font-family | font-size | font-weight | line-height | color | text-align |
|---|---|---|---|---|---|---|
| H2 | `var(--heading-font-family)` | `28px` | `800` | `1.15` | `#1a1a4e` | `center` |
| p | `var(--body-font-family)` | `16px` | `400` | `1.5` | `var(--dark-color)` | `center` |

At desktop, H2 font-size increases to `36px`.

### Layout Matrix

| Container | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.default-content-wrapper` | `text-align: center; padding: 32px 16px` | `padding: 48px 32px` | *unchanged from tablet* |

### Design Token Mapping

| Element | CSS Property | Project variable | Fallback value |
|---|---|---|---|
| H2 | font-family | `--heading-font-family` | `roboto-condensed, sans-serif` |
| H2 | color | — | `#1a1a4e` |
| p | color | `--dark-color` | `#505050` |

### Visual Acceptance Checklist

- [ ] Both lines centred horizontally
- [ ] Generous vertical padding above and below
- [ ] Heading bold uppercase, body text regular weight

---

## Global Observations

**Source**: All values below are **extracted computed styles** from the live page via Playwright `getComputedStyle()` at three breakpoints (375px, 768px, 1200px). See `page-styles/styles-report.json` and `page-styles/styles-summary.md` for full data.

### Colour Palette

| Colour | Actual value | Usage | Candidate Token |
|---|---|---|---|
| Navy (heading/text) | `rgb(20, 30, 83)` / `#141e53` | Headings (H1–H4), text, FAQ headings | `--color-navy` |
| Navy (footer/CTA) | `rgb(24, 36, 101)` / `#182465` | Footer bg, CTA bg, language selector | `--color-navy-dark` |
| Body text grey | `rgb(97, 96, 105)` / `#616069` | Body text, default font colour throughout | `--dark-color` (override from `#505050`) |
| White | `rgb(255, 255, 255)` / `#ffffff` | Backgrounds, text on dark | `--background-color` |
| Footer disclaimer bg | `rgb(20, 30, 83)` / `#141e53` | Top footer bar | — (same as navy heading) |
| Newsletter modal bg | `rgb(238, 245, 255)` / `#eef5ff` | Newsletter modal section | — |
| CTA white text | `rgb(255, 255, 255)` | CTA button text on dark bg | — |

### Typography Scale (Actual Computed Values)

**Font family**: `Santral, sans-serif` — custom BAT brand font used throughout, not Roboto.

| Usage | Size (mobile) | Line-height | Size (tablet) | Size (desktop) | Line-height (desktop) | Weight | Transform | Letter-spacing |
|---|---|---|---|---|---|---|---|---|
| Product name (H1) | 22px | 26px | 22px | 32px | 40px | 800 | uppercase | 0.5px (mobile only) |
| Section heading (H2) | 22px | 26px | 32px | 32px | 40px | 800 | uppercase | 0.5px |
| Sub-heading (H3 format) | 18px | 25px | 18px | 20px | 28px | 700 | uppercase | — |
| FAQ heading (H3) | 18px | 20px | 18px | 22px | 26px | 800 | uppercase | 0.5px |
| FAQ question (H3) | 12px | 20px | 12px | 14px | 26px | 600 | uppercase | 0.5px (desktop) |
| Newsletter heading (H4) | 18px | 25px | 18px | 20px | 28px | 700 | uppercase | — |
| Body text | 16px | 25px | 16px | 16px | 25px | 300 | none | — |
| CTA label (button) | 12px | 14px | 12px | 12px | 14px | 700 | — | 1.2px |

### Spacing Patterns (Actual Computed Values)

| Pattern | Value | Source element |
|---|---|---|
| Gallery slider padding (mobile) | `46px` top/bottom | `.slick-slider` |
| Gallery slider padding (desktop) | `~119px` top, `~131px` bottom | `.slick-slider` |
| Footer main padding (desktop) | `42px` top/bottom, `20px` left/right | `.bat-footer-zonnic-main` |
| Footer top padding | `20px` left/right | `.bat-footer-zonnic-top` |
| Product hero padding-bottom | `20px` | `.bat-producthero` |
| CTA button padding (mobile) | `5px` top/bottom, `10px` left/right | `.bat-cta-style.button-dark` |
| CTA button padding (desktop) | `10px` top/bottom, `30px` left/right | `.bat-cta-style.button-dark` |
| CTA border-radius | `100px` | `.bat-cta-style` (full pill) |
| FAQ container max-width | `600px` (desktop), `384px` (tablet), `375px` (mobile) | `dl.bat-faq-default` |

### Product Hero Layout (Actual)

| Breakpoint | `.bat-producthero` display | flex-direction | Gallery width | Gallery height |
|---|---|---|---|---|
| Mobile (375px) | `flex` | `column` | 375px | 392px |
| Tablet (768px) | `flex` | `column` | 768px | 542px |
| Desktop (1200px) | `flex` | `row` | 624px | 817px |

### Source Site DOM Classes (for reference during implementation)

| Component | Source site class | Notes |
|---|---|---|
| Product hero wrapper | `.bat-producthero.bat-producthero--zonnic` | Flex container, column→row |
| Gallery | `.producthero-gallery` | Flex column |
| Gallery slider | `.producthero-gallery-images.slick-slider` | Uses Slick.js |
| FAQ section | `.faq` | AEM Grid column |
| FAQ list | `dl.bat-card-info.bat-faq-default` | Definition list |
| FAQ toggle | `button.bat-faq__button-container` | 28×28 circle |
| Newsletter modal | `bat-section-modal.zonnic-newsletter-modal` | bg: `#eef5ff` |
| Footer top | `footer.bat-footer-zonnic-top` | bg: `#141e53` |
| Footer main | `footer.bat-footer-zonnic-main` | bg: `#182465` |
| Product carousel | `.bat-carousel-slides.slick-slider` | Slick.js |
| CTA buttons | `.bat-cta-style.button-dark` | Pill shape, 100px radius |
