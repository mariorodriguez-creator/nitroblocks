# Data Model: PDP Template

**Spec**: `.specify/specs/666-pdp-template/spec.md`  
**Design reference**: `.specify/specs/666-pdp-template/design.md`  
**Date**: 2026-04-16

This document expands the spec content models with **concrete authoring examples** and **HTML shapes** aligned to `design.md` Code Scaffolds (not a substitute for `design.md` CSS).

---

## Page-level

| Metadata (CMS / production) | Value |
|-----------------------------|--------|
| `template` | `pdp` |

Local `.plain.html` drafts may omit `<meta name="template" content="pdp">` if global `head.html` is unchanged; implementation uses `.product-detail` fallback where needed (see `research.md` R-002).

**Page section order** (reference PDP):

1. `product-detail`
2. Default: product label download (paragraph + secondary button)
3. Default: range introduction (centred H2 + paragraph)
4. `carousel` + `product`
5. `columns` + section style `testimonial-teaser`
6. `columns` — image + text (editorial)
7. `columns` — text + video (instructional; video via `video` block)
8. Optional second `columns` text + video (reversed column order)
9. Default H2 “FAQ” + `accordion` + `faq`
10. `fragment` → newsletter page

---

## Block: `product-detail` (Standalone)

**Canonical table** (one row, two cells):

| Cell 1 — Gallery source | Cell 2 — Product copy |
|-------------------------|------------------------|
| Multiple images (each becomes a slide; first = initial) | H2 name, H3 flavour, H4 format, `<ul>` bullets, `<hr>`, buy panel |

### Authored flow in cell 2

1. `h2` — product name (e.g. ZONNIC Nicotine Pouches)  
2. `h3` — flavour (e.g. SPEARMINT)  
3. `h4` — format (e.g. Regular - 24 pouches)  
4. `ul` / `li` — description bullets (expand/collapse)  
5. Horizontal rule `---` in Word → `<hr>` in HTML  
6. Partner logo — `picture` / `img`  
7. Heading line — e.g. “Buy **ZONNIC** online via **felix**” (semantic `p` or `h*` per authoring)  
8. `ol` / `li` — purchase steps  
9. Primary CTA — link with `<strong>` (button primary after `decorateButtons`)  
10. Secondary CTA — “Find Nearest Store” with `<em>` (button secondary)  

### Example (structural)

```html
<div class="product-detail">
  <div>
    <div>
      <div>
        <picture><img src="…" alt="ZONNIC Spearmint front" loading="eager"></picture>
        <picture><img src="…" alt="ZONNIC Spearmint back" loading="lazy"></picture>
        <picture><img src="…" alt="ZONNIC pouch" loading="lazy"></picture>
      </div>
      <div>
        <h2>ZONNIC Nicotine Pouches</h2>
        <h3>SPEARMINT</h3>
        <h4>Regular - 24 pouches</h4>
        <ul>
          <li>First bullet visible by default.</li>
          <li>Additional bullets hidden until “Read more”.</li>
        </ul>
        <hr>
        <picture><img src="…" alt="Felix partner logo" loading="lazy"></picture>
        <p>Buy <strong>ZONNIC</strong> online via <strong>felix</strong></p>
        <ol>
          <li>Step one …</li>
          <li>Step two …</li>
        </ol>
        <p><a href="https://felixforyou.ca/…"><strong>Buy Now</strong></a></p>
        <p><a href="/store-locator"><em>Find Nearest Store</em></a></p>
      </div>
    </div>
  </div>
</div>
```

Decoration (JS) adds gallery chrome, description wrapper, toggle (labels from Placeholders), buy-panel wrapper — per `design.md`.

---

## Block: `carousel` + variant `product` (Collection)

**Canonical table**: one row per product card; col1 = heading + CTA, col2 = image.

### Example

```html
<div class="carousel product">
  <div>
    <div>
      <div>
        <h2>A BALANCED SPEARMINT BLEND.</h2>
        <p><a href="/ca/en/pouches/zonnic-spearmint-24-nicotine-pouches">Learn more</a></p>
      </div>
      <div>
        <picture><img src="…" alt="Spearmint product" loading="lazy"></picture>
      </div>
    </div>
    <div>
      <div>
        <h2>A BOLD PEPPERMINT PROFILE.</h2>
        <p><a href="/ca/en/pouches/zonnic-peppermint-24-nicotine-pouches">Learn more</a></p>
      </div>
      <div>
        <picture><img src="…" alt="Peppermint product" loading="lazy"></picture>
      </div>
    </div>
    <div>
      <div>
        <h2>A CLASSIC TASTE.</h2>
        <p><a href="/ca/en/pouches/zonnic-wintergreen-24-nicotine-pouches">Learn more</a></p>
      </div>
      <div>
        <picture><img src="…" alt="Wintergreen product" loading="lazy"></picture>
      </div>
    </div>
  </div>
</div>
```

---

## Block: `accordion` + variant `faq` (Collection)

Two columns per row: question | answer.

### Example

```html
<div class="accordion faq">
  <div>
    <div>
      <div><p><strong>Is ZONNIC a Natural Health Product (NHP)?</strong></p></div>
      <div><p>Answer paragraph …</p></div>
    </div>
    <div>
      <div><p><strong>What are the benefits of using ZONNIC?</strong></p></div>
      <div><p>Answer with <a href="#">inline link</a>.</p></div>
    </div>
  </div>
</div>
```

---

## Block: `columns` — Image + Text

Standard two-cell row; image in one column, H2 + paragraphs + optional CTA in the other. Order may be reversed.

---

## Block: `columns` — Text + Video

One column: H2, H3 step headings + copy, optional arrow CTA.  
Other column: `video` block wrapping an MP4 **link** (Collection pattern).

### Example (video cell)

```html
<div class="video">
  <div>
    <div><a href="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4">Instructional video</a></div>
  </div>
</div>
```

(Replace with project-hosted `/media/...mp4` in production.)

---

## Section style: `testimonial-teaser`

Section metadata row: **Style** = `testimonial-teaser`.  
Content: `columns` row — lifestyle image | H2 + H3 + body + text CTA.

---

## Fragment: newsletter

**Fragment page** (standalone): section metadata **Style** = `newsletter`; H2, paragraph, primary button.

**PDP embed**:

```html
<div class="fragment">
  <div>
    <div><a href="/drafts/dev/fragments/newsletter-signup">Newsletter signup</a></div>
  </div>
</div>
```

Production path example: `/fragments/newsletter-signup`.

---

## Default content: label download

Bold intro paragraph + secondary button (`<em>` on link text).

## Default content: range introduction

Centred `h2` + centred `p` (styling per `design.md` / global CSS).
