# DESIGN.md Format — Spec Reference

This is a faithful, locally-mirrored reference of the Google Labs DESIGN.md format spec at <https://github.com/google-labs-code/design.md> (`docs/spec.md`). Treat the upstream as the source of truth; this file exists so the agent can work without a network call.

DESIGN.md is a self-contained, plain-text representation of a design system. A file has two parts:

1. **YAML front matter** — machine-readable design tokens, fenced by lines containing exactly `---`.
2. **Markdown body** — human-readable design rationale organized into `##` sections.

Prose may use descriptive color names (e.g. "Midnight Forest Green") that correspond to systematic token names (e.g. `primary`). Tokens are normative; prose provides context for how to apply them.

---

## Token schema (YAML front matter)

```yaml
version: <string>          # optional, current: "alpha"
name: <string>
description: <string>      # optional
colors:
  <token-name>: <Color>
typography:
  <token-name>: <Typography>
rounded:
  <scale-level>: <Dimension>
spacing:
  <scale-level>: <Dimension | number>
components:
  <component-name>:
    <token-name>: <string | token reference>
```

`<scale-level>` is a named level in a sizing or spacing scale. Common names: `xs`, `sm`, `md`, `lg`, `xl`, `full`. Any descriptive string key is valid.

### Token types

| Type | Format | Example |
|---|---|---|
| Color | `#` + hex (sRGB) | `"#1A1C1E"` |
| Dimension | number + unit (`px`, `em`, `rem`) | `48px`, `-0.02em`, `1.5rem` |
| Token Reference | `{path.to.token}` | `"{colors.primary}"` |
| Typography | object — see below | — |

Token references must be wrapped in curly braces and contain an object path to another value in the YAML tree. For most token groups the reference must point to a primitive value (e.g. `colors.primary-60`), not a group (e.g. `colors`). **Within `components`, references to composite values (e.g. `{typography.label-md}`) are permitted.**

### Typography object

| Field | Type | Notes |
|---|---|---|
| `fontFamily` | string | — |
| `fontSize` | Dimension | — |
| `fontWeight` | number | e.g. `400`, `700`. Bare number or quoted string both valid. |
| `lineHeight` | Dimension or number | A unitless number is a multiplier of `fontSize` (recommended). |
| `letterSpacing` | Dimension | — |
| `fontFeature` | string | Maps to CSS `font-feature-settings`. |
| `fontVariation` | string | Maps to CSS `font-variation-settings`. |

### Example front matter

```yaml
---
version: alpha
name: Daylight Prestige
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
---
```

---

## Section order

Every `DESIGN.md` follows the same structure. Sections may be omitted, but those present **must appear in this order**:

| # | Section | Aliases |
|---|---|---|
| 1 | Overview | Brand & Style |
| 2 | Colors | — |
| 3 | Typography | — |
| 4 | Layout | Layout & Spacing |
| 5 | Elevation & Depth | Elevation |
| 6 | Shapes | — |
| 7 | Components | — |
| 8 | Do's and Don'ts | — |

All sections use `##` headings. An optional `#` heading may appear for document titling but is not parsed as a section.

---

## Section-by-section guidance

### Overview (also: "Brand & Style")

Holistic description of the product's look and feel: brand personality, target audience, the emotional response the UI should evoke (playful vs professional, dense vs spacious). Foundational context for high-level stylistic decisions when a specific rule or token isn't defined.

### Colors

Defines color palettes. At minimum the `primary` color must be defined. When multiple palettes exist, the design system may assign a semantic role for each. A common convention is `primary`, `secondary`, `tertiary`, `neutral`.

Prose example:

```markdown
## Colors

The palette is rooted in high-contrast neutrals and a single, evocative accent color.

- **Primary (#1A1C1E):** A deep ink used for headlines and core text.
- **Secondary (#6C7278):** A sophisticated slate for borders, captions, metadata.
- **Tertiary (#B8422E):** A vibrant earthy red, the sole driver for interaction.
- **Neutral (#F7F5F2):** A warm limestone foundation, softer than pure white.
```

Tokens example:

```yaml
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
```

### Typography

Most design systems have **9–15 typography levels**. Common naming uses semantic categories (`headline`, `display`, `body`, `label`, `caption`) further divided by size (`small`, `medium`, `large`).

Tokens example:

```yaml
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.1em
```

### Layout (also: "Layout & Spacing")

Describes the layout and spacing strategy: grid model, columns, gutters, margins, dynamic padding. The `spacing` token map captures the scale.

Tokens example:

```yaml
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  gutter: 24px
  margin: 32px
```

### Elevation & Depth (also: "Elevation")

Describes how visual hierarchy is conveyed (shadows, tonal layers, borders, color contrast). Prose-only — there is no shadow token in the spec.

### Shapes

Describes the shape language. Tokens for rounded corners go here.

Tokens example:

```yaml
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
```

### Components

Style guidance for component atoms. Common types called out in the spec: buttons, chips, lists, tooltips, checkboxes, radio buttons, input fields. Domain-specific components are encouraged.

**Variants** (hover, active, pressed, disabled) are expressed as separate component entries with related key names (e.g. `button-primary`, `button-primary-hover`).

Tokens example:

```yaml
components:
  button-primary:
    backgroundColor: "{colors.primary-60}"
    textColor: "{colors.primary-20}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-70}"
```

#### Component property tokens (allowed)

- `backgroundColor` — Color or `{colors.*}` reference
- `textColor` — Color or `{colors.*}` reference
- `typography` — Typography object or `{typography.*}` reference
- `rounded` — Dimension or `{rounded.*}` reference
- `padding` — Dimension
- `size` — Dimension
- `height` — Dimension
- `width` — Dimension

> The components specification is actively evolving. The structure provides intentional flexibility for domain-specific component definitions while the spec matures.

### Do's and Don'ts

Practical guidelines and common pitfalls — guardrails for designs.

```markdown
## Do's and Don'ts

- Do use the primary color only for the single most important action per screen
- Don't mix rounded and sharp corners in the same view
- Do maintain WCAG AA contrast ratios (4.5:1 for normal text)
- Don't use more than two font weights on a single screen
```

---

## Recommended (non-normative) token names

| Group | Names |
|---|---|
| Colors | `primary`, `secondary`, `tertiary`, `neutral`, `surface`, `on-surface`, `error` |
| Typography | `headline-display`, `headline-lg`, `headline-md`, `body-lg`, `body-md`, `body-sm`, `label-lg`, `label-md`, `label-sm` |
| Rounded | `none`, `sm`, `md`, `lg`, `xl`, `full` |

---

## Consumer behavior for unknown content

| Scenario | Behavior |
|---|---|
| Unknown section heading | Preserve; do not error (e.g. `## Iconography`) |
| Unknown color token name | Accept if the value is valid (e.g. `surface-container-high: "#ede7dd"`) |
| Unknown typography token name | Accept as valid typography (e.g. `telemetry-data`) |
| Unknown spacing value | Accept; store as string if not a valid dimension (e.g. `grid-columns: "5"`) |
| Unknown component property | Accept with warning (e.g. `borderColor`) |
| Duplicate section heading | **Error; reject the file** (e.g. two `## Colors`) |

---

## Linter rules (`npx -y @google/design.md lint`)

| Rule | Severity | Checks |
|---|---|---|
| `broken-ref` | error | Token references (`{colors.primary}`) that don't resolve to any defined token |
| `missing-primary` | warning | Colors are defined but no `primary` color exists |
| `contrast-ratio` | warning | Component `backgroundColor` / `textColor` pairs below WCAG AA (4.5:1) |
| `orphaned-tokens` | warning | Color tokens defined but never referenced by any component |
| `token-summary` | info | Summary of how many tokens are defined in each section |
| `missing-sections` | info | Optional sections (spacing, rounded) absent when other tokens exist |
| `missing-typography` | warning | Colors defined but no typography tokens |
| `section-order` | warning | Sections out of canonical order |

Exit code `1` if errors are found, `0` otherwise.

---

## Useful CLI commands

```bash
# Validate
npx -y @google/design.md lint DESIGN.md

# Diff two versions
npx -y @google/design.md diff DESIGN.md DESIGN-v2.md

# Export to other formats (Tailwind v3 JSON, Tailwind v4 CSS, DTCG)
npx -y @google/design.md export --format css-tailwind DESIGN.md > theme.css
npx -y @google/design.md export --format json-tailwind DESIGN.md > tailwind.theme.json
npx -y @google/design.md export --format dtcg DESIGN.md > tokens.json

# Print the spec itself (handy when you need to re-verify)
npx -y @google/design.md spec
npx -y @google/design.md spec --rules
```

---

## Status

The DESIGN.md format is at version `alpha`. The spec, token schema, and CLI are under active development. When in doubt, consult the upstream at <https://github.com/google-labs-code/design.md> and refresh this file.
