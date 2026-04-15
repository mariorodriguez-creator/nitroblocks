---
name: speckit-page-specify
description: Extract visual design context from a live webpage URL and save it as design.md, organized by block and default content section. Reads spec.md to identify all blocks and default content sections, then inspects each on the live page at multiple breakpoints to capture layout, typography, colours, spacing, and interactive states. Use when the user provides a live page URL to generate a design reference, or when there is no Figma source.
---

# Speckit Page Specify Workflow

Extracts **visual and stylistic** design context from a **live webpage**, organized **per block and per default content section**, and saves it as `FEATURE_DIR/design.md`.

Runs **after** `/speckit-specify` (spec.md must already exist). This is the live-page counterpart to `speckit-figma-specify` — use this when the design source is an existing webpage rather than a Figma file.

**Scope — visual only, per block and per default content section:**
- HTML element structure and block-scoped CSS class names
- CSS styles: colours, typography, spacing, layout, breakpoints
- CSS custom properties and resolved values
- Interactive state appearance (hover colours, focus rings)
- Dynamic content element identification
- Default content section styling (headings, paragraphs, buttons, links, lists)
- Section-level styles (background, padding) when section metadata applies

**NOT captured here** (owned by spec.md): functional requirements, acceptance criteria, author-configurable content, business-language descriptions, behavioral logic, content model (block table structure).

**Content Model Alignment (CDD Phase 1.2)**

The spec.md already contains the content model (block table structure, variants, authoring approach) defined during `/speckit-specify`. The live page design must align with — not override — this content model. When extracting design context:

- **Map visual elements to authored content**: For each block, identify which visual elements correspond to author-provided content (text, images, links from the block table) vs. decoration-added structure (wrappers, icons, layout containers).
- **Validate variant coverage**: Check that visual variants on the live page (e.g., different visual states or layouts) correspond to the block options defined in the spec's content model. Flag any page variants that have no matching block option, or spec variants missing from the page.
- **Respect the authored structure**: Each block's root container maps to the block wrapper, but the inner content comes from authored rows/columns. design.md's HTML scaffold must reflect this per block.

## Step 1: Locate Spec and Build Block Inventory

### 1a. Find spec directory

Find the most recent spec directory in `.specify/specs/` (or one matching user's input). Verify `spec.md` exists. If `design.md` already exists, ask user to confirm overwrite.

### 1b. Parse spec.md for blocks AND default content sections

Read `spec.md` and extract **two inventories** from the Content Model section and the acceptance criteria / user journey:

**Block inventory** — every block and variant:

| Field | Example |
|---|---|
| Block name | `product-detail` |
| Block class | `.product-detail` |
| Variant (if any) | `carousel (product)` → `.carousel.product` |
| Section style (if any) | `testimonial-teaser` (from Section Metadata) |
| Content model type | Standalone / Collection |
| Key sub-components | image gallery, buy panel, card items, Q&A pairs |
| CSS selector on live page | Best-guess selector to locate block on the page |

**Default content section inventory** — every section that uses default content (headings, paragraphs, lists, buttons, links, images) without a block. These are just as important to specify — they carry authored content and need precise styling. For each, record:

| Field | Example |
|---|---|
| Section name | Product Label Download |
| Content elements | Text paragraph, button link to PDF |
| Section style (if any) | — (none) or `newsletter` |
| Visual description from spec | "text paragraph with a button linking to a PDF" |
| CSS selector on live page | Best-guess selector (e.g., `.section` containing the matching content) |

Sources for default content sections:
- Spec's Content Model section (e.g., "Content Model: Newsletter Signup (Fragment)" describes default content inside a fragment)
- Spec's acceptance criteria (e.g., AC5: "Product Label Download section MUST render as a text paragraph with a button")
- Spec's user journey (e.g., "Visitor scrolls past a PDF download link")
- Any section described in the spec that does NOT use a block table

**Every section on the page must be accounted for** — either as a block entry or a default content section entry. If a section appears on the live page but is not in the spec, flag it in the Report.

### 1c. Read project tokens

Read `styles/styles.css` to build a lookup table of available CSS custom properties (colours, fonts, sizes, spacing) for token mapping later.

## Step 2: Inspect Blocks on the Live Page

### 2a: Run extraction script first

Run the Playwright extraction script **before** opening the browser MCP. The script collects actual `getComputedStyle()` data and screenshots at all breakpoints in a single headless pass. See Step 2c for the command and troubleshooting.

### 2b: Navigate and identify regions with browser MCP

After the extraction script has run:

1. Get the URL from the user (or from spec.md references / test content paths).
2. **Navigate** using `browser_navigate`.
3. **Lock** the browser tab with `browser_lock`.
4. Take a `browser_snapshot` to get the DOM structure.

For each entry in **both** inventories from Step 1b (blocks and default content sections), locate its root element on the page. Confirm the match by checking:
- Element class names or structure matching the expected pattern
- Content matching what spec.md describes (e.g., product images, FAQ questions, PDF download link)

For **default content sections**: These are `.section > .default-content-wrapper` regions. Match them by their content (headings, paragraph text, button labels) rather than class names, since default content has no block-specific classes.

If an entry cannot be found on the page, note it as **"Not present on inspected page"** and skip.

### 2c: Extract computed styles (REQUIRED — Playwright script)

**This step is mandatory.** All CSS values in design.md MUST come from actual `getComputedStyle()` extraction, never from visual estimation of screenshots. Screenshots alone cannot determine font families, exact colours, precise pixel values, letter-spacing, font-weight, or line-height — guessing these from screenshots produces wrong values.

Run the extraction script:

```bash
node .claude/skills/speckit-page-specify/scripts/extract-page-styles.js "URL" \
  --output FEATURE_DIR/page-styles \
  --selector "main"
```

To target specific blocks instead of auto-detecting:

```bash
node .claude/skills/speckit-page-specify/scripts/extract-page-styles.js "URL" \
  --output FEATURE_DIR/page-styles \
  --blocks ".product-detail,.carousel,.accordion,.columns"
```

Optional flags:
- `--wait <ms>` — post-navigation wait for JS rendering (default: 5000ms). Increase for heavy SPA sites.
- `--timeout <ms>` — navigation timeout (default: 30000ms). Increase for slow servers.

The script:
1. Navigates to the URL using `domcontentloaded` (not `networkidle`)
2. Waits for client-side JS to render dynamic content
3. Takes full-page screenshots at 3 breakpoints (375px, 768px, 1200px)
4. Extracts `getComputedStyle()` for every visible element under each block
5. Computes breakpoint diffs (what changes between mobile → tablet → desktop)
6. Outputs `page-styles/styles-report.json` (full data) and `page-styles/styles-summary.md` (human-readable)

**If the script does not capture enough detail** for specific elements (e.g., CTA buttons inside a block, FAQ items, product bullets), write a follow-up extraction script targeting those selectors specifically. Do NOT fall back to visual estimation.

#### Troubleshooting

| Failure | Cause | Fix |
|---|---|---|
| Navigation timeout | Site is slow or `--timeout` too low | Add `--timeout 60000` (or higher) |
| Page renders blank / incomplete | JS hasn't executed, content is behind age gate or consent | Increase `--wait 8000` or higher; or add script logic to dismiss modals |
| Wrong elements extracted | Auto-detection picked up third-party widget DOM (OneTrust, Qualtrics, chat) | Use `--blocks` to target only the selectors you need |
| Playwright not installed | Missing dependency | Run `npm install playwright && npx playwright install chromium` |

### 2d: Visual validation with browser MCP

**After** the extraction script has run, use the browser MCP to **validate** the extracted data visually. This step confirms the extracted values are correct — it does NOT replace the extraction script.

For **each breakpoint** — desktop (1200×900), tablet (768×1024), mobile (375×812):

1. **Resize** the viewport using `browser_resize`.
2. **Wait** 1–2 seconds for layout reflow.
3. **Take full-page screenshots** to visually confirm layout at each breakpoint.
4. **Scroll through the page** to capture each block and default content section region.
5. **Spot-check** extracted values against what's visible (e.g., does the navy colour look like `#141e53`? Does the font look like Santral?).

For **each block AND each default content section**, the extraction script output should contain:
- **Root element**: display, width, max-width, padding, margin, background-color, border, border-radius
- **Layout containers**: flex-direction, flex-wrap, gap, justify-content, align-items, grid-template-*
- **Typography**: font-family, font-size, font-weight, line-height, letter-spacing, text-transform, color — for headings (H1–H6), body text, CTAs, labels
- **Interactive elements**: button/link colours, border, border-radius, padding
- **Images/media**: object-fit, aspect-ratio, border-radius
- **Spacing**: gaps between sub-components, internal padding
- **Section-level styles**: background-color, padding, max-width, text-align from the parent `.section` element

**For default content sections specifically**, verify the extraction captured:
- Heading styles (H1–H6): font-size, font-weight, line-height, colour, text-transform, margin, text-align per heading level present
- Paragraph styles: font-size, line-height, colour, max-width, margin
- Button/CTA link styles: display, padding, background-color, colour, border, border-radius, font-size, font-weight, text-transform
- List styles: list-style-type, padding, margin, gap between items
- Link styles: colour, text-decoration, font-weight
- Image styles: width, max-width, border-radius, object-fit

**Note changes per breakpoint**: For each block, verify the extraction diffs captured:
- `flex-direction` changes (column → row)
- `gap` changes
- Width/max-width changes
- Typography size changes
- Visibility changes (elements hidden/shown at breakpoints)

### 2e: Inspect interactive states per block

For each block that has interactive elements (per spec.md), use the browser MCP:

1. **Hover** — hover over buttons, links, cards. Note colour/background/shadow changes.
2. **Focus** — tab to interactive elements. Note focus ring style.
3. **Expanded/collapsed** — click accordion toggles, expand/collapse controls. Capture both states.
4. **Active/selected** — click tabs, gallery thumbnails. Note selected state styling.

Record the CSS property deltas for each state transition.

### 2f: Unlock browser

**Unlock** the browser tab with `browser_unlock`.

## Step 3: Generate design.md (per block and per default content section)

Structure the design.md with a **top-level heading per block** and a **top-level heading per default content section**. Each gets its own complete set of design sections. Order them as they appear on the page (top to bottom).

Before writing each CSS rule: If the selector targets a Dynamic Content Element or its container, verify you are not adding width/height (element) or max-width/max-height (container) unless that exact property is present on the live page for that element.

### Mobile-first CSS file order (mandatory, per block)

Each block's **`### CSS Skeleton`** MUST emit rules in this physical order:

1. **Base (mobile)** — all rules **without** `@media`, block-scoped under `.blockname`.
2. **`@media (width >= 600px)`** — tablet overrides **only**.
3. **`@media (width >= 900px)`** — desktop overrides **only**.
4. **`@media (width >= 1200px)`** — only if the live page has a distinct wide layout.

### Map live page values to EDS tokens

When extracting CSS values, **always** check `styles/styles.css` for matching project tokens:
- Computed `font-family` → `--body-font-family` or `--heading-font-family`
- Computed `font-size` → `--body-font-size-*` or `--heading-font-size-*`
- Computed `color` → `--text-color`, `--link-color`, `--background-color`, etc.
- For values that don't match existing tokens, record the raw value and note it as a candidate for a new project variable.

### design.md structure

```markdown
# Design Reference: [Feature Name]

**Source**: Live page — [URL]
**Spec**: [spec.md path]
**Blocks specified**: [count] blocks + [count] default content sections

---

## Block: [Block Name] (`.blockname`)

**Spec reference**: Content Model: [Name] in spec.md
**Variant**: [if applicable, e.g., "product" variant of carousel]
**Section style**: [if applicable, e.g., "testimonial-teaser"]

### Code Scaffold

#### HTML Structure
[Semantic HTML element hierarchy that the block's JS will create]
[Block-scoped class names added during decoration]
[Initial authored structure: nested <div> rows/columns from the block table]

#### CSS Skeleton
[Mobile-first vanilla CSS with block-scoped selectors]
[CSS custom properties mapped to project tokens]

```css
/* 1. Base (mobile) — no @media */
.blockname { ... }
.blockname .blockname-child { ... }

/* 2. Tablet */
@media (width >= 600px) { .blockname { ... } }

/* 3. Desktop */
@media (width >= 900px) { .blockname { ... } }
```

#### Absolute Overlay Layout (when applicable)
[Document if block uses absolute positioning for overlays]

### Layout matrix (flex / grid)

| Container (class) | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.blockname-inner` | `flex-direction: column; gap: 16px` | `flex-direction: row; gap: 24px` | *unchanged from tablet* |

### Design Token Mapping

| Element | CSS Property | Project variable | Fallback value |
|---|---|---|---|
| Block root | background-color | `--background-color` | `#ffffff` |
| Heading | font-family | `--heading-font-family` | `roboto-condensed, sans-serif` |

### Dynamic Content Elements
[Elements with content-dependent sizing for THIS block]

### Interactive States
[Hover, focus, active, expanded/collapsed for THIS block's elements]

### Visual Acceptance Checklist
- [ ] Mobile: [block-specific checks]
- [ ] Desktop: [block-specific checks]
- [ ] Layout matrix: flex directions match at each breakpoint

### EDS Block Integration
[Mapping of live page elements → authored content vs decoration-added structure]
[ARIA attributes observed on the live page]
[Block options (variants) → CSS classes]

---

## Block: [Next Block Name] (`.nextblockname`)
[Repeat full structure for each block...]

---

## Default Content: [Section Name]

**Spec reference**: [e.g., AC5 — "Product Label Download section"]
**Section style**: [if applicable, e.g., "newsletter", or "none"]
**Content elements**: [e.g., "Centred heading (H2), body paragraph, CTA button"]

### Section Wrapper
[Section-level CSS: background, padding, max-width, text-align]
[Section metadata class if any, e.g., `.section.newsletter`]

### Content Styles

#### Typography
| Element | font-family | font-size | font-weight | line-height | color | text-align |
|---|---|---|---|---|---|---|
| H2 | `var(--heading-font-family)` | `34px` | `700` | `1.2` | `#131313` | `center` |
| p | `var(--body-font-family)` | `18px` | `400` | `1.5` | `#505050` | `center` |

#### Buttons / CTAs
[Button styles: display, padding, bg, colour, border, border-radius, font, hover state]

#### Links
[Link styles: colour, text-decoration, hover colour]

#### Lists (if present)
[List styles: list-style, spacing, indentation]

#### Images (if present)
[Image styles: width, max-width, border-radius, margin]

### Layout matrix

| Container | Mobile (base) | Tablet (≥600px) | Desktop (≥900px) |
|---|---|---|---|
| `.default-content-wrapper` | `text-align: center; padding: 24px 16px` | `padding: 40px 32px` | *unchanged from tablet* |

### Design Token Mapping

| Element | CSS Property | Project variable | Fallback value |
|---|---|---|---|
| H2 | font-size | `--heading-font-size-l` | `34px` |
| p | color | `--dark-color` | `#505050` |
| CTA button | background-color | `--link-color` | `#3b63fb` |

### Visual Acceptance Checklist
- [ ] Mobile: [section-specific checks]
- [ ] Desktop: [section-specific checks]
- [ ] Typography matches token mapping

---

## Default Content: [Next Section Name]
[Repeat structure for each default content section...]

---

## Global Observations

### Colour Palette
[All unique colours found across blocks, mapped to project tokens where possible]

### Typography Scale
[Font sizes and weights used across blocks, mapped to project tokens]

### Spacing Patterns
[Common gap, padding, margin values used across blocks]
```

## Step 4: Write design.md

Write to `FEATURE_DIR/design.md`.

## Report

Output: design.md path and summary of what was captured per block and per default content section:

| Entry | Type | Breakpoints | Interactive states | Token mappings | Warnings |
|---|---|---|---|---|---|
| product-detail | Block | mobile, tablet, desktop | hover, expanded/collapsed | 12 mapped, 3 new | — |
| carousel (product) | Block | mobile, tablet, desktop | hover | 5 mapped | Card width differs from spec |
| Product Label Download | Default content | mobile, tablet, desktop | — | 3 mapped | — |
| Product Range Intro | Default content | mobile, tablet, desktop | — | 2 mapped | — |
| ... | ... | ... | ... | ... | ... |

**Confirm**: Mobile-first CSS order + Layout matrix present for each block AND each default content section.

**Flag**: Any spec-vs-live-page layout conflicts.

**Readiness**: `/speckit-plan` (default when design is ready), or `/speckit-clarify` (if ambiguities remain).

## Dynamic Content Elements — Dimension Rules (MANDATORY)

**Context**: speckit-page-specify might be run once, detached from the rest of the workflow. design.md is the only artifact. It MUST be self-sufficient and correct on first run.

**Definition**: Dynamic content elements = elements whose size or count varies with authored content (e.g. gallery images 1–N, repeatable card items, expandable text). Identify them from spec.md content model AND live page structure, per block.

**For dynamic content elements** — do NOT store:
- `width`, `height`
- `min-width` / `min-height` (omit unless the live page explicitly has that property)
- Any fixed dimension

**For containers of dynamic content elements** — do NOT store:
- `max-width` / `max-height` — UNLESS the live page explicitly has that property
- If the live page has `width` on the container, store `width` — NEVER convert it to `max-width`

**NEVER alter live page properties**: If computed style says `width: 422px`, write `width: 422px`. Do NOT "interpret" or "fix" it as `max-width`.

**When in doubt**: Omit the dimension. Prefer natural sizing for dynamic elements.

## Key Rules

- **EXTRACTION FIRST**: All CSS values MUST come from Playwright `getComputedStyle()` extraction. NEVER guess or estimate CSS from screenshots — visual inspection cannot determine font-family, exact rgb() colours, font-weight, line-height, letter-spacing, or border-radius. When the extraction script produces incomplete data for specific elements, write a targeted follow-up script — do NOT fall back to "visual analysis"
- **Browser MCP is for validation, not extraction**: Use browser screenshots and DOM snapshots to confirm extracted data looks correct, not to generate CSS values. The browser MCP cannot run `getComputedStyle()` — it only provides bounding boxes, accessibility tree, and screenshots
- design.md is the **source of truth for all HTML/CSS/design-specific content**
- spec.md remains the source of truth for functional requirements and the **content model**
- Do NOT create or modify spec.md
- **Block-level AND section-level granularity**: Each block AND each default content section gets its own complete design entry. Do not merge unrelated entries. Do not skip blocks or default content sections listed in spec.md. Default content sections are not second-class — they carry authored content and need the same precision as blocks.
- If the live page implies content model changes, flag them in the Report
- CSS must be vanilla (no SCSS, no preprocessors) with block-scoped selectors
- Use `@media (width >= Npx)` with standard EDS breakpoints: 600px, 900px, 1200px
- Map live page values to project CSS custom properties from `styles/styles.css`
- **Dynamic content**: Apply dimension rules strictly per block
- **LIVE PAGE ONLY**: Store only what the live page actually has. Do not convert, infer, or "improve"
- **Variant colour overrides**: Use EDS-style names (e.g. `.blockname.dark`) unless the spec documents strict BEM modifiers. Include actual CSS rules in the CSS Skeleton.
- **Mobile-first file order**: Per block. base → 600px → 900px → optional 1200px
- **Layout matrix**: MUST exist per block AND per default content section, and match live page computed layout per breakpoint
- **Spec vs live page**: If spec.md prose conflicts with live page layout, **flag in Report**
- **Section styles**: When a block or default content section uses section metadata for styling (e.g., `testimonial-teaser`, `newsletter`), document the section-level CSS in that entry's Section Wrapper subsection
- **Default content completeness**: For default content sections, capture every content element type present (headings, paragraphs, lists, buttons, links, images). These styles inform `styles.css` and `lazy-styles.css` — not block CSS — so precision matters for global consistency
- **Page coverage**: Every visible section on the live page must appear in design.md as either a block entry or a default content section entry. Unaccounted sections indicate a gap between spec.md and the live page — flag in Report
