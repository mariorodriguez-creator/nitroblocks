# Canvas layout

The .pen file produced by this skill is a **set of page-based posters**, not a single scrolling document. Each page is a self-contained, fixed-size frame absolutely positioned on the document canvas, with a consistent header strip and a two-column inner grid. This file is the spec for that structure: which pages exist, where they sit, what their internal layout looks like. It is consumed by steps 5–9 of the [SKILL.md](../SKILL.md) workflow.

The structure is deterministic — same input, same output, every time — so the user always knows where to find things.

## Mental model

Each page is a printable poster (1440 px standard, 3736 px when a state matrix needs the room). Pages are arranged in two rows on the canvas:

- **Row 1** — the **Cover** alone, full hero treatment.
- **Row 2** — every other page, side by side, equally spaced.

This is intentional: row 1 sets the brand tone; row 2 is a horizontal strip of reference material the user can scan or export piece by piece. Pages do **not** flow vertically, do **not** use flexbox at the document level, and do **not** depend on each other for sizing.

## Top-level placement

Pages sit at the document root (no wrapper canvas frame). Each page has explicit `x` and `y`:

```
y = -64                          → Cover (height 960)
y = 1000  + gap (80)             → row 2 starts here, all pages share this y

x sequence on row 2 (gap 80 between pages):
  x[i] = x[0] + sum(width[0..i-1]) + 80 * i
```

Set `x[0]` to a round number like `0` or `-10095` (matches Figma-imported templates) — the absolute origin doesn't matter, only the relative spacing.

Page frame defaults:

- `type: "frame"`, `layout: "none"` (absolute positioning of children — no flexbox at the page root).
- `clip: true` (page edges crop content; the canvas stays clean).
- `fill: "$color-neutral"` (white surface — the design system reads on white regardless of brand background).
- `stroke: { thickness: 1, fill: "$color-outline" }` (1 px outline so the page is visible against the canvas).

## Page-header strip

Every page begins with the same header strip at `y: 0`. Recipe is in [component-recipes.md](component-recipes.md#page-header-strip); the layout contract is:

- Width: equal to the page width (`fill_container` works because the strip is the first child of a `layout: "none"` page).
- Height: 96.
- Fill: `$color-surface` (a tinted band that contrasts with the page body).
- Padding: `[60, 32]` (60 horizontal, 32 vertical).
- Layout: `"horizontal"`, `justifyContent: "space_between"`, `alignItems: "center"`.

Header content:

| # | Node | Style |
|---|---|---|
| 1 | Page name text | `headline-sm` typography, `fill: $color-on-surface` |
| 2 | Page index text — two-digit page number, e.g., `"01"`, `"02"` | `headline-sm` typography, `fill: $color-on-surface-muted` |

The header is the **only** part of a page that uses absolute / flex layout in a special way; everything below it is positioned with explicit `x` / `y` against the page.

## Two-column inner grid

Below the header strip (i.e., at `y >= 128`) every page uses the same gutter scheme:

- **Sub-section labels** at `x: 60`, top-aligned with their content row.
- **Sub-section content** at `x: 508` (or further right when the matrix needs it).
- **Sub-section hairlines** — 1 px tall rectangles, `width = pageWidth - 120`, `fill: $color-outline`, `x: 60`. They visually separate sub-sections.

Vertical spacing between sub-sections is `40` (label-to-label baseline), tightened or loosened only when a sub-section's content is unusually short or tall.

A sub-section label uses the **`headline-md` typography level** with `fill: $color-primary`. Inline meta labels inside content (e.g., a column header "Default" inside a state matrix) use `body-md` with `fill: $color-on-surface-muted`.

## Page roster

The roster of pages is decided in step 5 of [SKILL.md](../SKILL.md). Below is the spec for each page's **internal content**. Every page also gets the standard header strip (skipped here for brevity).

### Cover (always rendered)

The hero. Width 1920, height 960, full-bleed, no header strip (the cover **is** the header).

| Node | Position | Content | Style |
|---|---|---|---|
| Background fill | full | gradient if the prose specifies one, else solid `$color-primary` | — |
| Brand name | x: 64, y: 64 (or centered) | DESIGN.md `name:` | `headline-display` typography, `fill: $color-neutral` |
| Description | below brand name, `width: 720` | DESIGN.md `description:` | `body-lg`, `fill: $color-neutral` |
| Meta row | bottom of cover | `VERSION <version> · <token-count> TOKENS · <component-count> COMPONENTS` | `label-md`, uppercase, `fill: $color-neutral` (or `$color-on-surface-muted` if the cover background is light) |

Decorative imagery from the DESIGN.md is **not** included — this skill produces the foundation, not marketing visuals.

### Colors

Width 1440. Sub-sections are **hue families**: each family is a row, columns are tints/shades within that family.

If the YAML lists colors flat (no family grouping), infer families by name prefix (`primary`, `primary-dark`, `primary-light` → primary family). If no prefixes exist either, treat the whole palette as one "Palette" family.

Per family:

- Sub-section label = family name (e.g., "Primary", "Neutral", "Warning").
- Sub-section content = horizontal row of swatch tiles, one per color in that family, in YAML order.

Each swatch tile:

| # | Node | Style |
|---|---|---|
| 1 | square — `width: 96`, `height: 96`, `fill: $color-<name>`, `cornerRadius: $rounded-xs` (or `0`). 1 px outline at `$color-outline` if the swatch is near-white. |
| 2 | name text | `label-sm`, `fill: $color-on-surface` |
| 3 | hex text | `body-sm`, `fill: $color-on-surface-muted`, monospaced if the system has a monospace family, else default |

Tiles are spaced 16 px apart. A 12-color palette laid out in 6 families × 2 tints fits comfortably in 1440 width.

### Typography

Width 1440. One sub-section per typography role group: **Headlines**, **Body**, **Label**, **Display** (only render groups that have entries).

A "specimen frame" is rendered **once per typography token**:

```
specimenFrame (frame, vertical, gap 4)
├── meta text       — "<level> · <fontSize>px / <fontWeight> / <lineHeight>"   label-sm, fill: $color-on-surface-muted
└── sample text     — "The quick brown fox jumps over the lazy dog"           level's typography variables, fill: $color-on-surface
```

Specimens flow vertically inside their sub-section, 16 px gap between specimens.

If a level is uppercase by convention (the prose says so), uppercase the sample. Otherwise sentence case.

### Spacing & Layout

Width 1440. Sub-sections:

1. **Spacing system** — labeled rectangles, one per `spacing.*` token, in numeric ascending order. Layout is `horizontal`, `alignItems: "flex-end"`, `gap: 24`. Each rectangle is `width: <literal-number>`, `height: 96`, `fill: $color-primary`. Below the rectangle, `label-sm` text reads `<level> · <px>`.

   > **Pencil caveat.** As of writing, Pencil does NOT resolve `$variable-name` references for the `width` or `height` properties of nodes — they are treated as size hints, not styled values. Use literal numeric widths/heights for spacing tiles. Color, cornerRadius, fontSize, padding, etc. resolve variables normally. The spacing variables remain useful — they're cited in component recipes via `padding: "$spacing-md"` — they just can't be the `width` or `height` directly.
2. **Container** (only if the prose specifies a container max-width) — single `body-md` text node naming the value, e.g., `"Container max-width: 1500 px, centered, 20 px gutter."`
3. **Indention** (only if the prose mentions indention / inset rules) — visual diagram per indent value, mirroring the template's pattern (a labeled bar of the indent height).

### Effects

Width 1440. Sub-section: **Shadows** (or **Tonal hierarchy** if the system is shadow-free).

Render one **effect tile** per distinct elevation pattern in the prose: flat card, hairline divider, modal shadow, focus ring, tonal-section break. Tiles flow horizontally, 24 px gap.

Each tile:

```
tile (frame, vertical, gap 12, padding 24, fill: $color-neutral, width: 264)
├── name      — "FLAT CARD" / "MODAL SHADOW" / etc.   label-md
├── demo      — frame height 80, the effect rendered as the prose describes
└── spec      — 1–2 sentence excerpt from the prose, body-sm
```

For `boxShadow`, use the literal CSS value from the prose (e.g., `"0 6px 12px 0 rgba(0,0,0,0.2)"`). This is a rare allowed literal — DESIGN.md spec has no shadow token to substitute.

### Shapes

Width 1440. One sub-section: **Rounded corners**.

Horizontal row of shape tiles, `gap: 24`, `alignItems: "flex-end"`. One tile per `rounded.*` token in YAML order. Each tile:

| # | Node | Style |
|---|---|---|
| 1 | square — `width: 96`, `height: 96`, `fill: $color-primary`, `cornerRadius: $rounded-<level>` |
| 2 | label text — `<level> · <px>` (e.g., `full · 9999`) | `label-sm`, `fill: $color-on-surface` |

If `rounded.full` is present, the tile reads as a circle — that's correct.

### Atoms

Width 1440. Sub-sections, one per atom kind that exists:

- **Typography atoms** — every `text-<level>` reusable laid out vertically in two columns (left = Display + Headlines, right = Body + Labels). Each atom shown next to its name (`label-sm`, gray).
- **Icon container** — single tile showing the `icon-container` reusable with a placeholder fill, plus a `body-sm` caption explaining its purpose.
- **Divider** — single 200 px wide divider, captioned.
- **Link / Link hover** — both side by side, captioned.
- **List item** — single 200 px wide list-item, captioned.

Each atom on this page is an instance (`ref`) of the reusable; the reusable definition itself is created in the same batch but lives in a hidden 1×1 `library` frame placed just above the cover (`x: 0, y: -200`). Recipes in [component-recipes.md](component-recipes.md) use that pattern.

> **Do not push the library off-canvas at `x: -100000`** (or any other absurd offset). Pencil's fit-to-canvas zoom computes the union bounding box of every top-level child; a far-flung library inflates the bbox and forces the initial viewport to zoom out so far that real pages render as invisible specks. The user opens the file and sees what looks like a blank canvas. Keep the library inside the natural canvas region.

### Buttons

Width depends on matrix. Compute `pageWidth = max(1440, 280 + 60 + variantsCount × (cellWidth + cellGap))` where `cellWidth = 220`, `cellGap = 32`.

Sub-sections, one per **button category** the YAML defines:

- **Standard buttons** — for each base name (`button-primary`, `button-secondary`, ...), render a state matrix.

Matrix layout:

```
matrix (frame, vertical, gap 24, x: 60, y: <sub-section-y>)
├── header row (frame, horizontal, gap 32)
│   ├── corner cell (empty placeholder of width 168)
│   ├── state name "Default"     body-md, fill: $color-on-surface-muted
│   ├── state name "Hover"        ...
│   └── state name "Disabled"     ...   (one cell per state present in YAML)
├── variant row 1 (frame, horizontal, gap 32, alignItems: center)
│   ├── variant name "Primary"   body-md, fill: $color-on-surface-muted, width: 168
│   ├── instance of button-primary           ref
│   ├── instance of button-primary-hover      ref
│   └── instance of button-primary-disabled   ref   (one cell per state)
├── variant row 2  → secondary
└── variant row 3  → tertiary    (only if YAML defines tertiary)
```

Variants and states are **discovered from the YAML** — never invented. Render only what's defined.

### Fields

Width depends on matrix (same formula as Buttons). Sub-sections:

- **Input** — state matrix with rows = input variants (`text`, `search`, `password`, `dropdown`, `textarea` — only if defined), columns = states (`default`, `hover`, `focus`, `error`, `disabled` — only if defined).
- **Form-field-group** — render `form-field-group` and `form-field-group-error` (and any other states defined) side by side, captioned.

### Cards

Width 1440. One sub-section per card variant, each rendered as a labeled instance side by side. Default layout is `horizontal`, `gap: 32`, `padding: 24`, `alignItems: "flex-start"`. If the cards don't fit horizontally at 1440 width (e.g., 4 cards × 320 = 1280 + gaps), wrap manually by stacking vertically inside the sub-section.

### Banners

Width 1440. Each banner variant rendered full-width on its own row, captioned with its variant name (`label-sm`, gray) above. Banners stack vertically, 24 px gap.

### Footer

Width 1440. The footer-shell renders full-width inside its sub-section. If the YAML defines variant footers (e.g., light vs. dark), each is rendered on its own row, 24 px gap between them.

## Frame placement strategy

When inserting children into a page (sub-section labels, hairlines, content frames), always use the **page's ID** as the parent — never the document root. Sub-section content frames are themselves children of the page, not nested inside a sub-section wrapper.

The page is `layout: "none"`, so every direct child needs explicit `x` and `y`. Compute coordinates by walking sub-sections top-to-bottom, accumulating heights:

```
nextSubsectionY = currentY + currentHeight + 40   // 40 px gap between sub-sections
```

For sub-section content that uses flexbox internally (e.g., a horizontal swatch row), wrap that content in a frame at the sub-section's coordinates and let the frame use `layout: "horizontal"`. This is the **only** place flexbox enters: scoped to one sub-section's content, not the page.

## Splitting `batch_design` calls across pages

`batch_design` is capped at 25 ops per call. The recommended grouping:

- **One batch** for all page frames + their header strips (12 ops × headers + 12 ops × frames = ~24 ops; barely fits).
- **One batch per page** for that page's sub-section labels, hairlines, and static decorations.
- **One batch per matrix** for component pages (Buttons, Fields).
- **One or two batches** for atom recipes (≤25 ops each).
- **One batch per organism** (Cards, Banners, Footer).

After every batch, capture the binding → ID map. Subsequent batches reference those IDs as parents for `ref`, `U`, `M`, and `R` operations.
