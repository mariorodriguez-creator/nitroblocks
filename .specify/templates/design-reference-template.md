# Design Reference: [Feature Name]

**Source**: Figma …  
**Block class**: `.[block-name]`

---

## Code Scaffold

### HTML Structure

```html
<!-- Decorated output; map rows from spec content model -->
```

### CSS Skeleton

**Order (mandatory)**: (1) Base mobile, no `@media` → (2) tablet `@media` → (3) desktop `@media` → (4) optional wide `@media`.

Breakpoint values: use project EDS defaults (`600px` / `900px`) unless a different value was decided via the Breakpoint Conflict Resolution process (see `## Breakpoints & Per-Breakpoint CSS Overrides`).

```css
.[block-name] {
  /* base (mobile-first) */
}

@media (width >= 600px) { /* or resolved tablet breakpoint */
  .[block-name] {
    /* tablet */
  }
}

@media (width >= 900px) { /* or resolved desktop breakpoint */
  .[block-name] {
    /* desktop — repeat properties that must differ from tablet */
  }
}
```

### Absolute Overlay Layout (MANDATORY when applicable)

<!-- If background + overlay are position:absolute, document aspect-ratio / in-flow height (see speckit-figma-specify). -->

---

## Layout matrix (flex / grid)

**Mandatory** for layout-heavy blocks. Derive from Figma auto-layout per frame; do not rely on frame names alone (“stacked”, “rail”, etc.).

| Container (class) | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) | Wide (≥1200px) |
|---------------------|---------------|-------------------|-------------------|----------------|
| `.…-inner` | `flex-direction: column; gap: …` | … | … or *unchanged from tablet* | … |

---

## Design Token Mapping

| Element | CSS property | Token / variable | Fallback |
|---------|--------------|------------------|----------|

---

## Breakpoints & Per-Breakpoint CSS Overrides

Include **layout-affecting** properties (`flex-direction`, `gap`, widths) per breakpoint. Note when desktop **must** override tablet explicitly.

### Breakpoint Conflict Detection

**Mandatory when migrating from an existing page.** During source-page analysis, extract all `@media` breakpoint values from the source page's CSS and compare them against the project's EDS defaults.

| Breakpoint | EDS Default | Source Page | Match? |
|------------|------------|-------------|--------|
| Tablet | `600px` | e.g. `576px` | e.g. MISMATCH |
| Desktop | `900px` | e.g. `992px` | e.g. MISMATCH |
| Wide | `1200px` | e.g. `1200px` | e.g. OK |

<!-- DECISION REQUIRED: Breakpoints -->
<!-- When source page breakpoints differ from EDS defaults, this marker MUST remain -->
<!-- until resolved via speckit.clarify. If unresolved at implement time, -->
<!-- EDS project defaults MUST be kept. -->

**Resolution rules:**
1. `speckit.figma-specify` writes this table and the `<!-- DECISION REQUIRED: Breakpoints -->` marker when any mismatch is detected
2. `speckit.clarify` detects the marker and asks the developer which breakpoints to use
3. The developer's decision is recorded in `## Clarifications` and the CSS skeleton is updated accordingly
4. `speckit.analyze` warns if any `<!-- DECISION REQUIRED -->` markers remain unresolved
5. **Default behavior**: if the decision is not resolved before `speckit.implement`, **project EDS defaults are kept**

### Global Style Conflicts

**Mandatory when migrating from an existing page.** During source-page analysis, compare the source page's container, section, and typography behavior against the project's EDS global styles (`styles.css`). Any EDS global rule that would interfere with the source page's layout must be surfaced here.

Common conflicts to check:

| Category | EDS Global Rule | What to compare |
|----------|----------------|-----------------|
| Section padding | `main .section > div { padding }` | Source page section/container padding |
| Container max-width | `main .section > div { max-width }` | Source page content area width |
| Body font | `--body-font-family`, `--heading-font-family` | Source page font families |
| Base font size/weight | `body { font-size; font-weight }` | Source page body typography |
| Heading styles | `h1–h6 { font-weight; text-transform; color }` | Source page heading styles |
| Link styles | `a { color; font-weight; text-decoration }` | Source page link styles |
| Button styles | `.button { border-radius; padding; font }` | Source page CTA button styles |

#### Conflict Table

| EDS Global Rule | EDS Default Value | Source Page Value | Match? | Impact |
|-----------------|------------------|-------------------|--------|--------|
| e.g. `main .section > div { padding }` | `0 32px` | `0` | MISMATCH | Adds unwanted horizontal spacing |
| e.g. `main .section > div { max-width }` | `1200px` | `1500px` | MISMATCH | Content area narrower than source |

<!-- DECISION REQUIRED: Global Style Conflicts -->
<!-- When source page global styles differ from EDS defaults, this marker MUST remain -->
<!-- until resolved via speckit.clarify. If unresolved at implement time, -->
<!-- EDS project defaults MUST be kept. -->

**Resolution options** (presented by `speckit.clarify` for each conflict):
- **Option A**: Modify the global style in `styles.css` (affects all pages — appropriate when the entire site is being migrated)
- **Option B**: Override per-block/section wrapper (scoped fix — appropriate when only some pages differ)
- **Option C**: Keep EDS default (source page difference is acceptable)

**Resolution rules:**
1. `speckit.figma-specify` writes the conflict table and the `<!-- DECISION REQUIRED: Global Style Conflicts -->` marker
2. `speckit.clarify` detects the marker and presents each conflict with the resolution options above
3. The developer's decision per conflict is recorded in `## Clarifications`
4. `speckit.analyze` warns if any `<!-- DECISION REQUIRED -->` markers remain unresolved
5. **Default behavior**: if unresolved before `speckit.implement`, **EDS project defaults are kept**

---

## Dynamic Content Elements

---

## Interactive States

**Mandatory for all interactive elements.** Document every interactive element's visual appearance across all states, and critically, the **rendering technique** used to produce the visual (icon font glyph, SVG, CSS border trick, background-image, etc.). Static CSS property checks cannot catch rendering-method mismatches.

### Rendering Methods

| Element | Rendering Method | Key CSS | Details |
|---------|-----------------|---------|---------|
| e.g. Carousel prev arrow | Icon font glyph | `font-family: slick; content: '←'; font-size: 20px` | Slick icon font loaded via `slick.css` |
| e.g. Accordion toggle icon | CSS border rotation | `border-right: 2px solid; border-bottom: 2px solid; transform: rotate(45deg)` | Pure CSS, no font/image dependency |
| e.g. Search icon | Inline SVG `background-image` | `background-image: url("data:image/svg+xml,...")` | Data URI embedded in CSS |

### State Matrix

For each interactive element, extract computed styles at every state. Use Playwright to force states (`:hover`, `:focus-visible`, `:active`, `[aria-current]`, `:disabled`) and capture both **computed styles** and **screenshots**.

| Element | State | Key Properties | Screenshot |
|---------|-------|---------------|------------|
| e.g. Gallery arrow | Normal | `opacity: 0.75; color: rgb(...)` | `arrow-normal.png` |
| e.g. Gallery arrow | Hover | `opacity: 1; color: rgb(...)` | `arrow-hover.png` |
| e.g. Gallery arrow | Focus-visible | `outline: 2px solid rgb(...)` | `arrow-focus.png` |
| e.g. Thumbnail button | Active (`[aria-current]`) | `border: 2px solid rgb(...)` | `thumb-active.png` |

---

## Visual Regression Testing

**Mandatory after `speckit-implement`.** Static CSS property compliance alone is insufficient — it cannot detect rendering differences (e.g., border-trick arrows vs icon font glyphs, wrong object-fit, misaligned absolute positioning). A Playwright-based visual regression step must compare rendered output.

### Procedure

1. **During design extraction** (`speckit.figma-specify`): capture reference screenshots of each block at each breakpoint (mobile, tablet, desktop) from the source page. Save in `page-styles/`.
2. **After `speckit-implement`**: run the same Playwright script against `localhost:3000` to capture implementation screenshots.
3. **Compare**: overlay or side-by-side compare reference vs implementation screenshots for each block × breakpoint.
4. **Per-element spot checks**: for interactive elements (arrows, buttons, toggles), capture isolated element screenshots at each state and compare.

### What to screenshot

| Target | Source selector | Local selector | Breakpoints |
|--------|----------------|---------------|-------------|
| e.g. Product gallery | `.producthero-gallery` | `.product-detail-gallery` | 375, 768, 1200 |
| e.g. Gallery arrows | `.slick-prev, .slick-next` | `.slick-prev, .slick-next` | 1200 |
| e.g. Carousel cards | `.bat-carousel--zonnic-product-range` | `.carousel.product` | 375, 1200 |

### Integration with `speckit.design-compliance`

`design-compliance` should be extended to run visual regression in addition to static CSS checks. Report should include both:
- Static check: CSS property values match `design-expectations.json`
- Visual check: screenshot diff score below threshold (e.g., < 5% pixel difference)

---

## Design Expectations Completeness (`design-expectations.json`)

**Mandatory.** `design-expectations.json` drives the static compliance check (`assert-design-compliance.js`). It must be **exhaustive** — every CSS rule in the CSS Skeleton above must have corresponding expectations.

### Required property categories

For **every selector** in the CSS skeleton, the following property categories must be covered in `design-expectations.json`:

| Category | Properties | Applies to |
|----------|-----------|------------|
| **Layout** | `display`, `flex-direction`, `gap`, `align-items`, `justify-content`, `position` | All containers |
| **Sizing** | `width`, `max-width`, `min-height`, `padding`, `margin` | All elements |
| **Typography** | `font-family`, `font-size`, `font-weight`, `line-height`, `color`, `letter-spacing`, `text-transform`, `text-decoration` | All text elements (`h1`–`h6`, `p`, `a`, `li`, `span`, labels) |
| **Visual** | `background-color`, `border`, `border-radius`, `box-shadow`, `opacity` | All styled elements |
| **Responsive** | Same properties at each breakpoint where values differ | All elements with breakpoint overrides |

### Completeness rule

When `speckit.design-compliance` generates `design-expectations.json` from `design.md`:
1. Parse every CSS rule (selector + properties) from the CSS skeleton
2. For each rule, create an expectation entry with **all** declared properties — not just layout properties
3. If a property exists in the CSS skeleton but has no expectation, emit a warning: `"Uncovered property: {selector} > {property}"`
4. Typography properties are **never optional** — any text element missing font-size/font-weight/color/line-height expectations is a generation error

### Tolerance defaults

| Property type | Default tolerance |
|---------------|------------------|
| Pixel values (`px`) | `±1px` |
| Colors | Exact match (no tolerance) |
| Font sizes | Exact match |
| Font weights | Exact match |
| Line heights | `±1px` |

---

## Visual Acceptance Checklist

- [ ] Mobile: …
- [ ] Tablet: …
- [ ] Desktop: …
- [ ] Layout matrix: teaser group / inner flex directions match Figma at each breakpoint
- [ ] DOM nesting: no unnecessary wrapper divs; every container element has a styling or semantic purpose
- [ ] Typography: all text elements checked for font-family, font-size, font-weight, line-height, color
- [ ] Design expectations completeness: every CSS skeleton rule has a corresponding expectation

---

## Third-Party Dependencies

**Mandatory when migrating from an existing page.** During source-page analysis (the same Playwright session that extracts computed styles), detect all third-party libraries and map them to the blocks that use them.

### Detection Method

1. Scan all `<script>` and `<link>` tags on the source page
2. Inspect key DOM markers (e.g., `.slick-slider`, `.swiper-container`, `[data-aos]`)
3. For known libraries, extract initialization config from inline scripts or by inspecting the runtime state (e.g., `$('.selector').slick('getSlick')`)

### Dependency Table

| Library | Version | Used By Block | Purpose | Config / Options |
|---------|---------|---------------|---------|------------------|
| e.g. Slick.js | 1.8.1 | Product gallery | Image carousel with thumbnail sync | `{ slidesToShow: 1, arrows: true, asNavFor: '.thumbnails' }` |

### Loading Strategy

Per constitution §II (Performance), document how each library should be loaded in EDS:

| Library | Phase | Method | Notes |
|---------|-------|--------|-------|
| e.g. jQuery + Slick | Lazy | `loadScript()` inside block JS | Loaded only when block is in viewport |

### Implementation Mandate

When a source page uses a specific library for a component, `speckit-implement` **MUST** use the same library unless:
- The library is unmaintained or has known security vulnerabilities
- The exact behavior can be achieved natively with less code and identical UX
- The developer explicitly documents the alternative approach and its trade-offs

If the same library is used, the configuration **MUST** match the source page's extracted config.

---

## EDS Block Integration

---
