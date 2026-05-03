---
version: alpha
name: <Design System Name>
description: <One-sentence description of the brand and product this design system serves.>

colors:
  primary: "#000000"
  neutral: "#FFFFFF"
  # secondary: "#000000"
  # tertiary: "#000000"
  # surface: "#FFFFFF"
  # on-surface: "#000000"
  # error: "#B3261E"

typography:
  headline-display:
    fontFamily: <Font Name>
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: <Font Name>
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.1
  headline-md:
    fontFamily: <Font Name>
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
  body-lg:
    fontFamily: <Font Name>
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: <Font Name>
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: <Font Name>
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-lg:
    fontFamily: <Font Name>
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
  label-md:
    fontFamily: <Font Name>
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  label-sm:
    fontFamily: <Font Name>
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.04em

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  # gutter: 24px
  # margin: 32px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary}"
  # button-secondary:
  #   backgroundColor: "{colors.neutral}"
  #   textColor: "{colors.primary}"
  #   rounded: "{rounded.md}"
  #   padding: 12px
  # input:
  #   backgroundColor: "{colors.surface}"
  #   textColor: "{colors.on-surface}"
  #   rounded: "{rounded.sm}"
  #   padding: 12px
---

# <Design System Name>

## Overview

<2–6 sentences describing brand personality, target audience, and the emotional response the UI evokes. Name the typographic character, palette mood, density, and shape language. Ground every claim in something observed on the live site.>

## Colors

<Prose explaining the palette and how the roles are used. Reference token names and their hex values. Use descriptive color names if they help — they should map cleanly to the systematic token names in the front matter.>

- **Primary (#000000):** <How and where this color is used.>
- **Secondary (#000000):** <How and where this color is used.>
- **Tertiary (#000000):** <How and where this color is used.>
- **Neutral (#FFFFFF):** <How and where this color is used.>

## Typography

<Prose explaining the typographic strategy: which families are used, why, and what role each level plays. Call out any treatments (uppercase labels, tabular numerals, generous letter spacing).>

- **Headlines:** <font, weight, voice>
- **Body:** <font, size, readability notes>
- **Labels:** <font, treatment, where it appears>

## Layout

<Prose describing the layout strategy: grid model (fluid, fixed-max-width, dynamic), breakpoints if relevant, container widths, gutters, margins, and how the spacing scale is used to create rhythm.>

## Elevation & Depth

<Prose describing how visual hierarchy is conveyed: tonal layers, borders, shadows, color contrast. Note shadow values verbatim if the site uses them — there is no shadow token in the spec, so capture them in prose.>

## Shapes

<Prose describing the shape language and the corner-radius scale. Explain what feels sharp vs soft and why.>

## Components

<Prose describing the component atoms defined in the front matter, their variants, and any usage rules (e.g. one primary button per screen, when to use secondary vs tertiary, focus and disabled treatments).>

## Do's and Don'ts

- Do <observed, defensible guideline grounded in the site>
- Don't <observed anti-pattern or boundary>
- Do <…>
- Don't <…>
