# Component recipes

`batch_design` snippets for every component this skill produces. Each recipe is named after the DESIGN.md component-token key it implements, so the skill can pick a recipe deterministically given the parsed `designSystem` object.

The recipes assume:

- All variables from [token-mapping.md](token-mapping.md) have already been registered via `set_variables`.
- The page frames from [canvas-layout.md](canvas-layout.md) exist on the document canvas and their IDs are known.
- Variable references use `$<variable-name>` syntax (e.g., `fill: "$color-primary"`, `cornerRadius: "$rounded-full"`).

Every component recipe ends with a reusable component. **Variant states are peers**, not theme overrides — `button-primary-hover` is its own reusable component named exactly that.

## Conventions used in every recipe

- **Bindings**: every `I` / `R` / `C` op assigns to a fresh binding name. Bindings are not reused across recipes.
- **Parents**: most component recipes take a **page ID** as their insertion parent (`<buttons-page-id>`, `<fields-page-id>`, `<atoms-page-id>`). Reusable component definitions are inserted into a tiny hidden `library` frame placed just above the cover (`x: 0, y: -200`, `width: 1, height: 1`) so the page only contains display instances. Substitute actual page IDs returned from step 5.
- **Page coordinates**: every direct child of a page (header strip, sub-section label, hairline, content wrapper) needs explicit `x` and `y`. Pages are `layout: "none"`. Use the gutters from [canvas-layout.md](canvas-layout.md): `x: 60` for labels, `x: 508` for content, hairline at `x: 60` width `pageWidth - 120`.
- **Reusable flag**: every component frame defined for re-use is `reusable: true`. Sub-frames inside a component are not reusable.
- **Slots**: text content the consumer is expected to override is marked with `placeholder: true` on its containing frame, with a default content string the recipe author can ship.
- **Sizing**: components default to `height: "fit_content"` and an explicit `width` only when the design system implies one (full-width inputs, fixed-min-width buttons). Avoid hard-coded heights unless the DESIGN.md component token specifies one (e.g., `input.height: 40px`).
- **Token resolution from DESIGN.md component tokens**: when the YAML says `padding: "{spacing.sm}"`, the recipe writes `padding: "$spacing-sm"`. When the YAML says `padding: 13px`, the recipe writes `padding: 13`. Literal property values inside the DESIGN.md component block are passed through as-is (with units stripped).

## Page header strip

The header strip is identical on every page (Cover excepted). Insert it as the first child of every page after the page frame is created.

```javascript
header=I("<page-id>",{type:"frame",name:"page-header",
  layout:"horizontal",alignItems:"center",justifyContent:"space_between",
  width:"fill_container",height:96,padding:[60,32],
  fill:"$color-surface",
  x:0,y:0})
headerName=I(header,{type:"text",content:"<Page Name>",
  fontFamily:"$font-family-default",fontSize:"$font-size-headline-sm",
  fontWeight:"$font-weight-headline-sm",lineHeight:"$line-height-headline-sm",
  fill:"$color-on-surface"})
headerIndex=I(header,{type:"text",content:"<NN>",
  fontFamily:"$font-family-default",fontSize:"$font-size-headline-sm",
  fontWeight:"$font-weight-headline-sm",lineHeight:"$line-height-headline-sm",
  fill:"$color-on-surface-muted"})
```

`<NN>` is the two-digit page index (`"01"` for Cover, `"02"` for Colors, etc., counting in the canvas-row order). Page index resets per `.pen` file — it identifies the page on the canvas, not a global identifier.

## Sub-section label and hairline

Every sub-section starts with a label and (after the first sub-section) a hairline above it.

```javascript
subLabel=I("<page-id>",{type:"text",content:"<Sub-section Name>",
  fontFamily:"$font-family-default",fontSize:"$font-size-headline-md",
  fontWeight:"$font-weight-headline-md",lineHeight:"$line-height-headline-md",
  fill:"$color-primary",
  x:60,y:<sub-y>})
subHairline=I("<page-id>",{type:"rectangle",
  width:<pageWidth - 120>,height:1,fill:"$color-outline",
  x:60,y:<sub-y - 24>})
```

The hairline sits 24 px above the label, separating this sub-section from the previous one. Skip the hairline for the first sub-section on the page.

## State matrix

For component pages with a multi-axis state matrix (Buttons, Fields), the matrix lives inside its sub-section's content area at `x: 508`, `y: <sub-y>`. The matrix is **one frame** with `layout: "vertical"`, `gap: 24`, containing one header row and N variant rows.

```javascript
matrix=I("<page-id>",{type:"frame",name:"<base>-matrix",
  layout:"vertical",gap:24,padding:0,fill:"transparent",
  x:508,y:<sub-y>})

// header row: empty corner cell + one cell per state
headerRow=I(matrix,{type:"frame",layout:"horizontal",gap:32,padding:0,fill:"transparent"})
corner=I(headerRow,{type:"frame",width:168,height:24,fill:"transparent"})  // placeholder
state1Hdr=I(headerRow,{type:"text",content:"Default",
  fontFamily:"$font-family-default",fontSize:"$font-size-body-md",
  fontWeight:"$font-weight-body-md",fill:"$color-on-surface-muted",
  width:220,textGrowth:"fixed-width"})
// ...repeat for each state present in YAML

// variant rows: variant label + one component instance per state
row1=I(matrix,{type:"frame",layout:"horizontal",alignItems:"center",
  gap:32,padding:0,fill:"transparent"})
row1Label=I(row1,{type:"text",content:"Primary",
  fontFamily:"$font-family-default",fontSize:"$font-size-body-md",
  fontWeight:"$font-weight-body-md",fill:"$color-on-surface-muted",
  width:168,textGrowth:"fixed-width"})
row1Default=I(row1,{type:"ref",ref:"<button-primary-id>"})
row1Hover=I(row1,{type:"ref",ref:"<button-primary-hover-id>"})
// ...repeat for each state cell

// row2: secondary, row3: tertiary, etc. — one row per variant in YAML
```

The corner cell width is `168` so it aligns with the variant labels in the variant rows. Each state column width is `220` (matches the cell width default for buttons; widen to `360` for inputs).

If the YAML only defines one state for a variant (e.g., only `button-primary` with no `-hover`), still render the matrix — it'll be a single-column matrix. Don't pad with empty cells.

## Atoms

Atoms are the smallest reusable units. Molecules and organisms compose them via `ref`.

**Definition placement.** Reusable atom definitions are inserted into a hidden `library` frame placed **just above the cover** at `x: 0, y: -200`, `width: 1, height: 1`, `clip: false`, `layout: "none"`. The frame is 1×1 px so it has no visual footprint, but it sits **inside the canvas bounding box** so Pencil's fit-to-canvas zoom on file open frames the actual content cleanly. The Atoms page contains `ref` instances of each atom, not the definitions themselves.

> **Critical: do NOT place the library at `x: -100000`.** Pencil's "zoom to fit canvas" computes the union bounding box of every top-level child. A library at `x: -100000` and pages starting at `x: 0` produces a ~117k-px-wide bbox; on file open the canvas zooms out to ~1.5%, and pages render as invisible specks. Users will see what looks like a blank document. Keep the library inside the visible canvas region (e.g., the 200 px gap above the cover) to avoid this.

If the user prefers in-page definitions for live debugging, the recipe author may instead place each atom definition at the same `x: 60, y: <slot-y>` slot on the Atoms page; subsequent `ref` instances on the same page will overlap the definition exactly. Either approach is valid; the **near-canvas hidden library** is the default because it scales as the system grows without breaking initial zoom.

### `text-<level>` (one per typography token)

For each `typography.<level>` in the DESIGN.md, produce one reusable text atom. Naming follows the level: `text-headline-display`, `text-headline-lg`, `text-body-md`, `text-label-md`, etc.

```javascript
textHeadlineMd=I("<library-id>",{type:"text",name:"text-headline-md",reusable:true,
  content:"Headline",
  fontFamily:"$font-family-default",fontSize:"$font-size-headline-md",
  fontWeight:"$font-weight-headline-md",lineHeight:"$line-height-headline-md",
  letterSpacing:"$letter-spacing-headline-md",fill:"$color-on-surface"})
```

The `<library-id>` is the hidden 1×1 library frame at `(0, -200)` (or the Atoms page if using in-page definitions).

Notes:

- The text node itself is the reusable, with no wrapper frame — consumers override `content` and `fill` on the `ref` directly (`I(parent, { type: "ref", ref: "<text-headline-md-id>", content: "...", fill: "..." })`).
- `letterSpacing` is omitted from the op if the typography level didn't define one — don't reference an undefined variable.
- `fill` for the text defaults to `$color-on-surface` for body/label and `$color-primary` for headlines if the DESIGN.md prose declares headlines use the primary color. Read the prose; default to `$color-on-surface` when unclear.
- For levels described as uppercase in the prose, set the text content to uppercase (`"HEADLINE"` instead of `"Headline"`) so the atom's preview matches its intended use.

### `icon-container`

A square slot that holds an icon. Always produced.

```javascript
iconContainer=I("<library-id>",{type:"frame",name:"icon-container",reusable:true,
  layout:"vertical",alignItems:"center",justifyContent:"center",
  width:24,height:24,padding:0,fill:"$color-surface",placeholder:true})
```

Default size is 24×24. If the DESIGN.md prose specifies a different default icon size, use that. The `placeholder: true` flag marks this as a slot — consumers insert an `icon_font` node (or another icon source) into the instance via `R`.

### `divider`

```javascript
divider=I("<library-id>",{type:"rectangle",name:"divider",reusable:true,
  width:200,height:1,fill:"$color-outline"})
```

Consumer-side, override `width: "fill_container"` on the `ref` if a full-width divider is needed.

Only produced if either:

- `components.divider` exists in the YAML, or
- The prose explicitly mentions hairlines / 1px outlines.

If the YAML defines a different fill (e.g., `colors.on-surface-muted`), use that variable. Default to `$color-outline`.

### `link` and `link-hover`

Only produced if the prose mentions links or anchors. The recipe defaults to body text + underline:

```javascript
linkBase=I("<library-id>",{type:"frame",name:"link",reusable:true,
  layout:"horizontal",alignItems:"center",padding:0,fill:"transparent"})
linkText=I(linkBase,{type:"text",content:"Link text",
  fontFamily:"$font-family-default",fontSize:"$font-size-body-md",
  fontWeight:"$font-weight-body-md",lineHeight:"$line-height-body-md",
  fill:"$color-primary",textDecoration:"underline"})

linkHover=I("<library-id>",{type:"frame",name:"link-hover",reusable:true,
  layout:"horizontal",alignItems:"center",padding:0,fill:"transparent"})
linkHoverText=I(linkHover,{type:"text",content:"Link text",
  fontFamily:"$font-family-default",fontSize:"$font-size-body-md",
  fontWeight:"$font-weight-body-md",lineHeight:"$line-height-body-md",
  fill:"$color-secondary",textDecoration:"underline"})
```

If the prose specifies a different hover behaviour (color shift, underline appears/disappears, weight change), implement that — but always as a separate reusable, never as a theme axis.

### `chip`

Only produced if the prose mentions chips, tags, badges, or pills (other than buttons). The recipe is a small horizontal frame with a subtle fill and `label-sm` text:

```javascript
chip=I("<library-id>",{type:"frame",name:"chip",reusable:true,
  layout:"horizontal",alignItems:"center",justifyContent:"center",
  padding:"$spacing-sm",gap:"$spacing-xs",
  fill:"$color-surface",cornerRadius:"$rounded-full"})
chipLabel=I(chip,{type:"text",content:"Chip",
  fontFamily:"$font-family-default",fontSize:"$font-size-label-sm",
  fontWeight:"$font-weight-label-sm",fill:"$color-on-surface"})
```

If the system uses sharp corners exclusively (e.g., the DESIGN.md says "binary: sharp surfaces, pill CTAs"), use `cornerRadius: "$rounded-xs"` (or `0`) for chips so they read as data labels rather than CTAs.

### `list-item`

Only produced if the prose mentions lists, list items, or footer column links specifically.

```javascript
listItem=I("<library-id>",{type:"frame",name:"list-item",reusable:true,
  layout:"horizontal",alignItems:"center",
  width:200,padding:"$spacing-sm",gap:"$spacing-sm",
  fill:"transparent"})
listItemLabel=I(listItem,{type:"text",content:"List item",
  fontFamily:"$font-family-default",fontSize:"$font-size-body-md",
  fontWeight:"$font-weight-body-md",fill:"$color-on-surface"})
```

Consumer-side, override `width: "fill_container"` on the `ref` to stretch to the column width.

Used by `footer-shell` for column links. If the prose says footer links are uppercase or use a specific weight or size, adjust the typography accordingly.

## Molecules

Molecule definitions live in the hidden library frame (same `<library-id>` used by atoms). The display of molecules — including state matrices — happens on their dedicated page (Buttons, Fields). They compose atoms via `ref` where possible. When an atom doesn't fit (e.g., a button needs a label that mirrors the button's text color and hover state), inline the text node — composability is a goal but not a religion.

### `button-primary` and `button-primary-hover`

The DESIGN.md typically defines:

```yaml
button-primary:
  backgroundColor: "{colors.primary}"
  textColor: "{colors.neutral}"
  typography: "{typography.label-md}"
  rounded: "{rounded.full}"
  padding: 13px
button-primary-hover:
  backgroundColor: "{colors.secondary}"
  textColor: "{colors.neutral}"
  rounded: "{rounded.full}"
```

Recipe:

```javascript
btnPrimary=I("<library-id>",{type:"frame",name:"button-primary",reusable:true,
  layout:"horizontal",alignItems:"center",justifyContent:"center",
  padding:[38,13],gap:"$spacing-sm",
  fill:"$color-primary",cornerRadius:"$rounded-full"})
btnPrimaryLabel=I(btnPrimary,{type:"text",content:"BUTTON LABEL",
  fontFamily:"$font-family-default",fontSize:"$font-size-label-md",
  fontWeight:"$font-weight-label-md",letterSpacing:"$letter-spacing-label-md",
  fill:"$color-neutral"})

btnPrimaryHover=I("<library-id>",{type:"frame",name:"button-primary-hover",reusable:true,
  layout:"horizontal",alignItems:"center",justifyContent:"center",
  padding:[38,13],gap:"$spacing-sm",
  fill:"$color-secondary",cornerRadius:"$rounded-full"})
btnPrimaryHoverLabel=I(btnPrimaryHover,{type:"text",content:"BUTTON LABEL",
  fontFamily:"$font-family-default",fontSize:"$font-size-label-md",
  fontWeight:"$font-weight-label-md",letterSpacing:"$letter-spacing-label-md",
  fill:"$color-neutral"})
```

Rules:

- Padding is `padding: [horizontal, vertical]` (Pencil convention). If the DESIGN.md gives only one value, use it as the vertical and infer horizontal as ≈3× for pill buttons (`padding: [38, 13]` if vertical is 13).
- The label text is uppercase if the prose says so; otherwise sentence case.
- Borders: if the YAML specifies `border` or the prose says "2px solid border", add `stroke: { thickness: 2, fill: "$color-primary", align: "inside" }` to the button frame. Don't invent borders.

### `button-secondary` and `button-secondary-hover`

Identical recipe to primary, with the fills inverted per the YAML. If the DESIGN.md secondary uses `colors.neutral` background + `colors.primary` text + `colors.primary` border, the recipe must include the border (`stroke` + `strokeWidth`). For the hover state, the fill flips and the text color flips with it — read the YAML.

### `input` and `input-error`

The DESIGN.md typically defines:

```yaml
input:
  backgroundColor: "{colors.surface}"
  textColor: "{colors.on-surface}"
  typography: "{typography.label-lg}"
  rounded: "{rounded.none}"
  padding: "{spacing.sm}"
  height: 40px
input-error:
  backgroundColor: "{colors.surface}"
  textColor: "{colors.error}"
  ...
```

Recipe:

```javascript
input=I("<library-id>",{type:"frame",name:"input",reusable:true,
  layout:"horizontal",alignItems:"center",
  width:320,height:40,padding:["$spacing-md","$spacing-sm"],
  fill:"$color-surface",cornerRadius:"$rounded-none",
  stroke:{fill:"$color-on-surface",thickness:{bottom:2}}})
inputValue=I(input,{type:"text",content:"Placeholder",
  fontFamily:"$font-family-default",fontSize:"$font-size-label-lg",
  fontWeight:"$font-weight-label-lg",fill:"$color-on-surface-muted"})

inputError=I("<library-id>",{type:"frame",name:"input-error",reusable:true,
  layout:"horizontal",alignItems:"center",
  width:320,height:40,padding:["$spacing-md","$spacing-sm"],
  fill:"$color-surface",cornerRadius:"$rounded-none",
  stroke:{fill:"$color-error",thickness:{bottom:2}}})
inputErrorValue=I(inputError,{type:"text",content:"Invalid value",
  fontFamily:"$font-family-default",fontSize:"$font-size-label-lg",
  fontWeight:"$font-weight-label-lg",fill:"$color-error"})
```

Notes:

- For underline-only inputs use `stroke: { thickness: { bottom: N }, fill: "..." }` — Pencil supports per-edge stroke thicknesses. For fully-bordered inputs use `stroke: { thickness: N, fill: "..." }`.
- The placeholder text is the literal word "Placeholder" for the default state and "Invalid value" for the error state — it's a design-system specimen, not real content.
- Default width is 320 unless the DESIGN.md says inputs are full-width-only, in which case use `width: "fill_container"`.
- If the YAML doesn't include an `input-error` variant, do not render one. Atoms and molecules without explicit DESIGN.md backing are not invented (links, dividers, and chips are inferred from prose; component-state variants are not).

### `form-field-group` and `form-field-group-error`

Composes a label atom + an input molecule + an optional helper text atom. This is the canonical "input row" pattern.

```javascript
formField=I("<library-id>",{type:"frame",name:"form-field-group",reusable:true,
  layout:"vertical",width:320,gap:"$spacing-xs",padding:0,
  fill:"transparent"})
formFieldLabel=I(formField,{type:"ref",ref:"<text-label-sm-id>",
  content:"FIELD LABEL",fill:"$color-secondary"})
formFieldInput=I(formField,{type:"ref",ref:"<input-id>",width:"fill_container"})
formFieldHelper=I(formField,{type:"ref",ref:"<text-body-sm-id>",
  content:"Helper text",fill:"$color-on-surface-muted"})

formFieldErr=I("<library-id>",{type:"frame",name:"form-field-group-error",reusable:true,
  layout:"vertical",width:320,gap:"$spacing-xs",padding:0,
  fill:"transparent"})
formFieldErrLabel=I(formFieldErr,{type:"ref",ref:"<text-label-sm-id>",
  content:"FIELD LABEL",fill:"$color-secondary"})
formFieldErrInput=I(formFieldErr,{type:"ref",ref:"<input-error-id>",width:"fill_container"})
formFieldErrHelper=I(formFieldErr,{type:"ref",ref:"<text-body-sm-id>",
  content:"This field is required.",fill:"$color-error"})
```

`<text-label-sm-id>`, `<input-id>`, etc. are real node IDs returned from the atom and input recipes. Substitute them before sending the batch.

Since text atoms are now bare `text` nodes (no wrapper frame), `content` and `fill` overrides go on the `ref` itself rather than on a nested path. Same for the input refs: width override goes on the ref directly.

## Organisms

Organism definitions live in the hidden library frame. The display of organisms happens on their dedicated pages (Cards, Banners, Footer).

### `card` and any YAML variants (e.g., `card-<variant>`)

Cards are flat by default — no shadow, no border, no radius — unless the DESIGN.md says otherwise.

```javascript
card=I("<library-id>",{type:"frame",name:"card",reusable:true,
  layout:"vertical",width:320,gap:"$spacing-md",padding:"$spacing-md",
  fill:"$color-neutral",cornerRadius:"$rounded-none"})
cardImage=I(card,{type:"frame",name:"card-image",
  width:"fill_container",height:200,
  fill:"$color-surface",placeholder:true})
cardTitle=I(card,{type:"ref",ref:"<text-headline-md-id>",content:"CARD TITLE"})
cardBody=I(card,{type:"ref",ref:"<text-body-md-id>",
  content:"Card body copy describing the card content in one or two sentences.",
  textGrowth:"fixed-width",width:"fill_container"})
cardCta=I(card,{type:"ref",ref:"<button-primary-id>",
  descendants:{"<btn-label-id>":{content:"BUTTON LABEL"}}})
```

The `descendants` map on the button ref overrides the inner label text by addressing it through its node ID inside the button definition. Look up that ID once via `batch_get` after the button recipe runs and re-use it in every consumer.

For each YAML variant (e.g., `card-<variant>`):

- Same structure, different fill from the variant's `backgroundColor`.
- Different inner text fills from the variant's `textColor`.
- The image slot retains the same placeholder fill (`$color-surface`) since variant fills usually don't apply to image areas.

### `warning-banner`

```javascript
banner=I("<library-id>",{type:"frame",name:"warning-banner",reusable:true,
  layout:"horizontal",alignItems:"center",justifyContent:"center",
  width:"fill_container",padding:["$spacing-md","$spacing-sm"],
  gap:"$spacing-sm",fill:"$color-warning",cornerRadius:"$rounded-none"})
bannerText=I(banner,{type:"text",content:"WARNING: Banner message goes here.",
  fontFamily:"$font-family-default",fontSize:"$font-size-body-md",
  fontWeight:"$font-weight-body-md",fill:"$color-on-surface"})
```

If the banner needs a leading icon, insert a `ref` to `icon-container` before the text.

If the DESIGN.md describes the banner as text-only (no leading icon), drop the icon ref and the gap.

### `footer-shell`

A three-column footer. Composes list-item atoms and divider atoms. Uses the YAML `footer-shell` token for the chrome.

```javascript
footer=I("<library-id>",{type:"frame",name:"footer-shell",reusable:true,
  layout:"vertical",width:"fill_container",padding:0,
  fill:"$color-primary"})
footerInner=I(footer,{type:"frame",name:"footerInner",layout:"vertical",
  width:"fill_container",padding:"$spacing-lg",gap:"$spacing-md"})
footerCols=I(footerInner,{type:"frame",name:"footerCols",layout:"horizontal",
  width:"fill_container",gap:"$spacing-lg"})

col1=I(footerCols,{type:"frame",layout:"vertical",width:"fill_container",gap:"$spacing-sm"})
col1Heading=I(col1,{type:"ref",ref:"<text-headline-sm-id>",
  content:"COLUMN HEADING",fill:"$color-neutral"})
col1Divider=I(col1,{type:"ref",ref:"<divider-id>",width:"fill_container"})
col1Item1=I(col1,{type:"ref",ref:"<list-item-id>",
  width:"fill_container",
  descendants:{"<list-item-text-id>":{content:"Link one",fill:"$color-neutral"}}})
col1Item2=I(col1,{type:"ref",ref:"<list-item-id>",
  width:"fill_container",
  descendants:{"<list-item-text-id>":{content:"Link two",fill:"$color-neutral"}}})

// Repeat for col2, col3 — same pattern, different content

// Optional copyright strip (only if prose describes one)
footerCopy=I(footer,{type:"frame",name:"footerCopy",layout:"horizontal",
  alignItems:"center",justifyContent:"center",
  width:"fill_container",padding:"$spacing-md",
  fill:"$color-secondary"})
copyText=I(footerCopy,{type:"text",content:"\u00a9 <year> <NAME>. ALL RIGHTS RESERVED.",
  fontFamily:"$font-family-default",fontSize:"$font-size-label-md",
  fontWeight:"$font-weight-label-md",letterSpacing:"$letter-spacing-label-md",
  fill:"$color-neutral"})
```

Notes:

- Column headings use the `headline-sm` typography because that's the typical footer-heading level. If the DESIGN.md prose specifies a different level, use that.
- The list-item text fill is overridden to `$color-neutral` because the footer's dark fill needs light text. This is a deliberate variant-via-override — the atom is reused, the consumer controls the color via the `descendants` map on the ref.
- If the DESIGN.md `footer-shell` token defines a `padding` value, use it. Otherwise default to `$spacing-lg`.
- A two-tone footer (e.g., a copyright strip below the main footer block) is implemented as in the snippet above: outer footer is a `vertical` frame with two children, the inner block and the strip. Add the strip only when the prose explicitly describes it.

## Recipe selection logic

When the skill runs, walk the `designSystem` object and pick recipes:

1. For each `typography.<level>`, render `text-<level>` atom.
2. Always render `icon-container`.
3. If `components.divider` exists OR prose mentions dividers/hairlines → render `divider`.
4. If prose mentions links → render `link` and `link-hover`.
5. If prose mentions chips/tags/badges → render `chip`.
6. If prose mentions lists or footer columns → render `list-item`.
7. For each `components.button-*`, render the corresponding button molecule.
8. For each `components.input*`, render the input molecule.
9. If at least one input molecule exists → render `form-field-group` + `form-field-group-error` (the latter only if `input-error` exists).
10. For each `components.card*`, render the card organism.
11. If `components.warning-banner` exists OR prose mentions warning banners → render `warning-banner`.
12. If `components.footer-shell` exists OR prose mentions a chromed footer → render `footer-shell`.

Anything not in the table above and not in the YAML is **not rendered**. The skill reports the skipped components in the final summary so the user can decide whether to extend the DESIGN.md.

## Splitting across `batch_design` calls

`batch_design` accepts ≤25 ops per call. Most recipes fit in 2–6 ops, so a single batch can cover several recipes. The recommended grouping:

- **Library scaffolding**: one batch creating the hidden 1×1 library frame at `(0, -200)` + all `text-<level>` atoms (atoms are now bare text nodes, 1 op each, so 10–14 atoms fit in one batch).
- **Other atoms**: one batch for `icon-container` + `divider` + `link` + `link-hover` + `chip` + `list-item`.
- **Button variants**: one batch per button base (primary / secondary / tertiary), each containing all states (default + hover + focus + ...). Cap each batch at 25 ops; split a single base into two batches if it has many states.
- **Input variants**: one batch for `input` + `input-error` + any other state.
- **Form fields**: one batch for `form-field-group` + `form-field-group-error`.
- **Cards**: one batch for `card` + every `card-*` variant.
- **Banners**: one batch for `warning-banner` and any other banner variants.
- **Footer**: one batch for `footer-shell` (the recipe is large; may need 2 batches).
- **Page rendering** (separate from library creation): one batch per page for sub-section labels, hairlines, and matrix instances. Each matrix is itself one batch.

After each batch, capture the returned binding → ID map. The next batch references those IDs for `ref`, `U`, `M`, and `R` operations.

## Looking up inner node IDs

Some recipes need to override deeply-nested children of a reusable (e.g., the button label inside `button-primary`). After the recipe creates the reusable, call `batch_get` on the reusable's ID with `readDepth: 2` to get the inner child IDs, then use them in `descendants` overrides on subsequent `ref` ops.

This lookup is a once-per-reusable cost, paid right after the recipe runs. Cache the inner IDs in the recipe author's bookkeeping (`{ "button-primary": "jBww4", "button-primary-label": "ikDOX", ... }`) so every consumer can address them without repeating the lookup.

If a batch returns errors (e.g., a missing variable, an invalid `ref`), all ops in that batch roll back. Fix the issue and retry — do not partial-commit.
