# Token mapping: DESIGN.md → Pencil variables

This file is the canonical mapping rules for step 4 of the [SKILL.md](../SKILL.md) workflow. It is purely mechanical — given the same input, the output is identical. The goal is **one Pencil variable per DESIGN.md token**, named so a reader can scan a `batch_design` op and immediately know which token they're looking at.

## Variable definition shape

Every variable passed to `set_variables` must be an object with `type` and `value`:

```json
{
  "color-primary": { "type": "color", "value": "#1A2A6C" },
  "spacing-md":    { "type": "number", "value": 20 },
  "font-family-default": { "type": "string", "value": "Inter" }
}
```

Bare values (`"#1A2A6C"` or `20`) will be rejected by `set_variables`.

Variable **names** never start with `$`. The `$` prefix is only used at the **reference site** inside `batch_design` ops (`fill: "$color-primary"`).

## Color tokens

DESIGN.md schema:

```yaml
colors:
  primary: "#1A2A6C"
  secondary: "#0F1840"
  ...
```

Mapping rule: each `colors.<name>` becomes a `color` variable named `color-<name>`, with the hex preserved verbatim.

| DESIGN.md path | Variable name | Variable type | Value (illustrative) |
|---|---|---|---|
| `colors.primary` | `color-primary` | `color` | `"#1A2A6C"` |
| `colors.secondary` | `color-secondary` | `color` | `"#0F1840"` |
| `colors.tertiary` | `color-tertiary` | `color` | `"#22C5B4"` |
| `colors.neutral` | `color-neutral` | `color` | `"#FFFFFF"` |
| `colors.surface` | `color-surface` | `color` | `"#F4F4F7"` |
| `colors.on-surface` | `color-on-surface` | `color` | `"#1A1A1A"` |
| `colors.on-surface-muted` | `color-on-surface-muted` | `color` | `"#595960"` |
| `colors.error` | `color-error` | `color` | `"#D32F2F"` |
| `colors.warning` | `color-warning` | `color` | `"#F5A623"` |
| `colors.outline` | `color-outline` | `color` | `"#DCDCE0"` |

The hex values above are illustrative placeholders. The actual values come verbatim from the input DESIGN.md.

Names with hyphens (e.g., `on-surface-muted`) keep the hyphens in the variable name. Names with dots (rare) replace the dot with a hyphen.

Hex values must be 6 or 8 digit `#RRGGBB[AA]` strings. If a DESIGN.md ships an invalid hex, fail fast — do not normalise silently.

## Typography tokens

DESIGN.md schema:

```yaml
typography:
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0.02em
```

Each typography level produces **up to five** variables, one per property present. Missing properties produce no variable; do not invent defaults.

| DESIGN.md path | Variable name | Variable type | Conversion |
|---|---|---|---|
| `typography.<level>.fontFamily` | `font-family-<level>` | `string` | as-is |
| `typography.<level>.fontSize` | `font-size-<level>` | `number` | strip `px` → integer |
| `typography.<level>.fontWeight` | `font-weight-<level>` | `number` | as-is |
| `typography.<level>.lineHeight` | `line-height-<level>` | `number` | unitless multiplier (`1.2`) → as-is float; `px` → strip and float; `rem` → multiply by 16 |
| `typography.<level>.letterSpacing` | `letter-spacing-<level>` | `string` | preserve units (`em`, `px`) |

### Why `letter-spacing` is a string

Pencil number variables can't carry units. The DESIGN.md spec uses `em` for letter-spacing in nearly every example, and `em` is the right unit because it scales with font size. We keep it as a string and the recipe code consumes it as a CSS-like value at the text-node level. If a DESIGN.md uses `px`, that's also fine — the string preserves it.

### Family collapse

If every typography level shares one `fontFamily` (a single-typeface system), still emit `font-family-<level>` for each level. **Also** emit a single `font-family-default` set to the same value. Recipes can reference whichever is more readable; the duplication is intentional and trivially small.

If the DESIGN.md uses two or more families (e.g., display + body), emit per-level family variables only — no `font-family-default`.

### Unsupported properties

`fontFeature` and `fontVariation` from the DESIGN.md spec are not currently consumed by Pencil text nodes. If they are present in the input, **emit them as string variables anyway** (`font-feature-<level>`, `font-variation-<level>`) so the .pen file remains a faithful record of the design intent, and so future Pencil schema versions can pick them up. They will be unused by recipes in this skill version.

## Rounded tokens

DESIGN.md schema:

```yaml
rounded:
  none: 0px
  xs: 2px
  full: 9999px
```

| DESIGN.md path | Variable name | Variable type | Conversion |
|---|---|---|---|
| `rounded.<level>` | `rounded-<level>` | `number` | strip `px` → integer; `rem` → multiply by 16; `em` is rejected (rounded values don't scale with type) |

Pencil's `cornerRadius` property accepts a number variable directly via `cornerRadius: "$rounded-full"`.

## Spacing tokens

DESIGN.md schema:

```yaml
spacing:
  xs: 4px
  sm: 8px
  md: 20px
  gutter: 20px
  margin: 20px
```

| DESIGN.md path | Variable name | Variable type | Conversion |
|---|---|---|---|
| `spacing.<level>` | `spacing-<level>` | `number` | dimension → strip unit and convert to px integer; unitless number → as-is integer |

Numeric spacing entries (e.g., `grid-columns: 12`) are kept as `number` variables with the unitless integer.

Both layout-related entries (`gutter`, `margin`) and the scale entries (`xs`/`sm`/`md`/`lg`/`xl`) follow the same rule and produce the same `spacing-<level>` naming. There is **no** separate `gutter-` or `margin-` prefix; the `<level>` already disambiguates.

## Component tokens — NOT variables

The `components` block in the DESIGN.md is **not** translated to variables. Each entry under `components.<name>` already references other tokens via the `{path.to.token}` syntax, e.g.:

```yaml
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 13px
```

These are consumed as **input** to the recipes in [component-recipes.md](component-recipes.md). The recipe knows the property names defined by the DESIGN.md spec (`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`) and translates them into Pencil node properties:

| DESIGN.md component property | Pencil node property |
|---|---|
| `backgroundColor` | `fill` |
| `textColor` | `fill` (on the inner text node) |
| `typography` | spreads to `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` on the inner text node |
| `rounded` | `cornerRadius` |
| `padding` | `padding` |
| `size` | `width` + `height` |
| `height` | `height` |
| `width` | `width` |

When the DESIGN.md uses a token reference (`"{colors.primary}"`), the recipe substitutes the matching Pencil variable reference (`"$color-primary"`). When the DESIGN.md uses a literal value (`13px`), the recipe substitutes the literal — but **only inside the recipe**, never in component-token usage you author by hand. If a recipe finds a literal where a reference would be expected, leave a TODO note in the report so the user knows to add the missing token to the DESIGN.md.

## Themed values

DESIGN.md as currently specified does not have a first-class theme axis (e.g., `mode: light | dark`), but a project may extend the YAML with one. If you encounter a theme-related extension (typically a top-level `themes:` key or per-token `light`/`dark` siblings), translate it to Pencil's themed variable shape:

```json
{
  "color-surface": {
    "type": "color",
    "value": [
      { "value": "#FFFFFF", "theme": { "mode": "light" } },
      { "value": "#0F1840", "theme": { "mode": "dark" } }
    ]
  }
}
```

Pencil registers the `mode` axis automatically — do not pass themes separately.

If the DESIGN.md does not define theme variants, do **not** invent them. A single-mode design system stays single-mode.

## One `set_variables` call

All of the above is sent in a single `set_variables` call with `replace: true`. Re-running the skill replaces the variable set deterministically:

```jsonc
{
  "filePath": "<absolute-path-to-pen>",
  "replace": true,
  "variables": {
    "color-primary":   { "type": "color",  "value": "#1A2A6C" },
    "color-secondary": { "type": "color",  "value": "#0F1840" },
    // ...all colors
    "font-family-default":      { "type": "string", "value": "Inter" },
    "font-size-headline-md":    { "type": "number", "value": 22 },
    "font-weight-headline-md":  { "type": "number", "value": 800 },
    "line-height-headline-md":  { "type": "number", "value": 1.2 },
    "letter-spacing-headline-md": { "type": "string", "value": "0.02em" },
    // ...all typography levels
    "rounded-none": { "type": "number", "value": 0 },
    "rounded-xs":   { "type": "number", "value": 2 },
    "rounded-full": { "type": "number", "value": 9999 },
    "spacing-xs":     { "type": "number", "value": 4 },
    "spacing-sm":     { "type": "number", "value": 8 },
    "spacing-md":     { "type": "number", "value": 20 },
    "spacing-gutter": { "type": "number", "value": 20 },
    "spacing-margin": { "type": "number", "value": 20 }
  }
}
```

After the call, `get_variables` should return every variable above. Diff and fix before proceeding to the canvas build.
