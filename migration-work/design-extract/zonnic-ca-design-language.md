# Design Language: Nicotine Pouches To Quit Smoking | ZONNIC Canada

> Extracted from `https://www.zonnic.ca/ca/en` on April 29, 2026
> 10986 elements analyzed across 10 pages

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#182465` | rgb(24, 36, 101) | hsl(231, 62%, 25%) | 4535 |
| Secondary | `#3860be` | rgb(56, 96, 190) | hsl(222, 54%, 48%) | 28 |
| Accent | `#a0ff9d` | rgb(160, 255, 157) | hsl(118, 100%, 81%) | 8 |

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#616069` | hsl(247, 4%, 39%) | 9804 |
| `#ffffff` | hsl(0, 0%, 100%) | 2307 |
| `#000000` | hsl(0, 0%, 0%) | 1508 |
| `#2f2f2f` | hsl(0, 0%, 18%) | 1202 |
| `#f6f6f6` | hsl(0, 0%, 96%) | 312 |
| `#555555` | hsl(0, 0%, 33%) | 217 |
| `#3a3a3f` | hsl(240, 4%, 24%) | 152 |
| `#ebecf1` | hsl(230, 18%, 93%) | 104 |
| `#dedede` | hsl(0, 0%, 87%) | 85 |
| `#808080` | hsl(0, 0%, 50%) | 72 |
| `#9a9ca8` | hsl(231, 7%, 63%) | 37 |
| `#767676` | hsl(0, 0%, 46%) | 28 |

### Background Colors

Used on large-area elements: `#ffffff`, `#182465`, `#f4f5f7`, `#ebecf1`, `#141e53`, `#ededed`, `#000000`, `#252c68`

### Text Colors

Text color palette: `#000000`, `#616069`, `#182465`, `#141e53`, `#2f2f2f`, `#ffffff`, `#e00830`, `#3a3a3f`, `#808080`, `#666666`

### Gradients

```css
background-image: linear-gradient(rgb(157, 159, 161) 50%, rgb(137, 208, 200));
```

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#616069` | text, border | 9804 |
| `#182465` | background, text, border | 4535 |
| `#ffffff` | background, text, border | 2307 |
| `#000000` | text, border, background | 1508 |
| `#2f2f2f` | text, border, background | 1202 |
| `#141e53` | text, border, background | 962 |
| `#e00830` | text, border | 880 |
| `#252d65` | text, border, background | 505 |
| `#f6f6f6` | background, border, text | 312 |
| `#555555` | text, border | 217 |
| `#3a3a3f` | text, border | 152 |
| `#ebecf1` | background | 104 |
| `#dedede` | border, text | 85 |
| `#808080` | text, border | 72 |
| `#27455c` | background | 56 |
| `#ad1f8c` | text, border | 52 |
| `#9a9ca8` | background, border | 37 |
| `#3860be` | text, border, background | 28 |
| `#767676` | background, border | 28 |
| `#a0ff9d` | background | 8 |
| `#4cae04` | background | 8 |
| `#e3ffe2` | background | 8 |
| `#a6a6a6` | border | 8 |
| `#32ae88` | border | 7 |
| `#bbbbbb` | border | 7 |
| `#6aaae4` | background | 7 |
| `#88cfc7` | background | 4 |

## Typography

### Font Families

- **Santral** — used for all (10218 elements)
- **Arial** — used for body (440 elements)
- **Times** — used for body (298 elements)
- **Font Awesome 5 Free** — used for body (22 elements)
- **sans-serif** — used for all (8 elements)

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 42px | 2.625rem | 800 | 46px | normal | h1, br, h2 |
| 34px | 2.125rem | 800 | 40px | normal | h1, font, br, h2 |
| 32px | 2rem | 800 | 40px | normal | h2, center |
| 30px | 1.875rem | 300 | 25px | normal | i, svg, use |
| 24px | 1.5rem | 400 | normal | normal | div, span |
| 22px | 1.375rem | 800 | 26px | 0.5px | h2, div, span, h3 |
| 20px | 1.25rem | 700 | 28px | normal | h4, bat-headline-default, div |
| 18px | 1.125rem | 600 | 25px | normal | p, span |
| 16px | 1rem | 400 | normal | normal | html, head, meta, script |
| 15px | 0.9375rem | 400 | 15px | normal | span, a, p, br |
| 14.4px | 0.9rem | 400 | 38px | 0.144px | button, svg, title, g |
| 14px | 0.875rem | 300 | 20px | normal | p, span, b, br |
| 13.6px | 0.85rem | 400 | 27.2px | normal | div, svg, path, span |
| 13.3333px | 0.8333rem | 400 | normal | normal | button, i, svg, use |
| 13.008px | 0.813rem | 400 | 19.512px | normal | div, a, button |

### Heading Scale

```css
h1 { font-size: 42px; font-weight: 800; line-height: 46px; }
h1 { font-size: 34px; font-weight: 800; line-height: 40px; }
h2 { font-size: 32px; font-weight: 800; line-height: 40px; }
h2 { font-size: 22px; font-weight: 800; line-height: 26px; }
h4 { font-size: 20px; font-weight: 700; line-height: 28px; }
h2 { font-size: 16px; font-weight: 400; line-height: normal; }
h4 { font-size: 14px; font-weight: 300; line-height: 20px; }
```

### Body Text

```css
body { font-size: 16px; font-weight: 400; line-height: normal; }
```

### Font Weights in Use

`300` (6733x), `400` (2221x), `700` (1463x), `800` (384x), `600` (133x), `500` (38x), `900` (8x), `100` (6x)

## Spacing

**Base unit:** 2px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-0 | 0px | 0rem |
| spacing-38 | 38px | 2.375rem |
| spacing-48 | 48px | 3rem |
| spacing-55 | 55px | 3.4375rem |
| spacing-60 | 60px | 3.75rem |
| spacing-70 | 70px | 4.375rem |
| spacing-78 | 78px | 4.875rem |
| spacing-95 | 95px | 5.9375rem |
| spacing-102 | 102px | 6.375rem |
| spacing-120 | 120px | 7.5rem |
| spacing-123 | 123px | 7.6875rem |
| spacing-140 | 140px | 8.75rem |
| spacing-203 | 203px | 12.6875rem |
| spacing-207 | 207px | 12.9375rem |
| spacing-213 | 213px | 13.3125rem |
| spacing-236 | 236px | 14.75rem |
| spacing-256 | 256px | 16rem |
| spacing-320 | 320px | 20rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| xs | 1px | 56 |
| md | 6px | 8 |
| lg | 14px | 26 |
| xl | 17px | 7 |
| xl | 20px | 21 |
| full | 50px | 15 |
| full | 100px | 163 |

## Box Shadows

**sm** — blur: 5px
```css
box-shadow: rgba(47, 47, 47, 0.3) 0px 2px 5px 0px;
```

**md** — blur: 5px
```css
box-shadow: rgb(199, 197, 199) -3px -3px 5px -2px;
```

**md** — blur: 10px
```css
box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 10px 0px;
```

**md** — blur: 10px
```css
box-shadow: rgb(153, 153, 153) 0px 2px 10px -3px;
```

**md** — blur: 12px
```css
box-shadow: rgb(199, 197, 199) 0px 0px 12px 2px;
```

**md** — blur: 8px
```css
box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
```

**md** — blur: 10px
```css
box-shadow: rgb(97, 96, 105) 0px 5px 10px 0px;
```

**lg** — blur: 10px
```css
box-shadow: rgba(0, 0, 0, 0.3) 3px 6px 10px 0px;
```

**lg** — blur: 12px
```css
box-shadow: rgba(0, 0, 0, 0.2) 0px 6px 12px 0px;
```

**lg** — blur: 18px
```css
box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 18px 0px;
```

## CSS Custom Properties

### Colors

```css
--bg-color: #fff;
--border-color: #dedede;
--text-color: #182465;
--mapbbox-search-color: #182465;
--eswIconFillColor: #FFF;
```

### Spacing

```css
--eswIconFontSize: 16px;
```

### Other

```css
--eswButtonBottom: 25px;
--eswButtonRight: 30px;
```

### Semantic

```css
success: [object Object];
warning: [object Object];
error: [object Object];
info: [object Object];
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| xs | 320px | min-width |
| xs | 376px | max-width |
| 400px | 400px | min-width |
| sm | 425px | min-width |
| sm | 426px | min-width |
| sm | 500px | max-width |
| sm | 530px | max-width |
| 550px | 550px | max-width |
| sm | 576px | min-width |
| sm | 577px | min-width |
| sm | 600px | max-width |
| md | 768px | max-width |
| md | 769px | min-width |
| 890px | 890px | min-width |
| 896px | 896px | max-width |
| 897px | 897px | min-width |
| lg | 992px | min-width |
| lg | 993px | min-width |
| lg | 1023px | max-width |
| lg | 1024px | min-width |
| lg | 1025px | min-width |
| 1199px | 1199px | max-width |
| 1200px | 1200px | min-width |
| 1201px | 1201px | min-width |
| xl | 1280px | min-width |
| 2xl | 1500px | min-width |

## Transitions & Animations

**Easing functions:** `[object Object]`

**Durations:** `0.5s`, `0.1s`, `0.3s`, `0.2s`, `0.25s`, `0.6s`

### Common Transitions

```css
transition: all;
transition: color 0.5s;
transition: background-color 0.5s;
transition: border 0.5s, color 0.5s;
transition: 0.1s ease-in;
transition: background-color 0.1s ease-in;
transition: color 0.1s ease-in;
transition: max-height 0.3s ease-in;
transition: opacity 0.2s ease-in;
transition: 0.5s;
```

### Keyframe Animations

**fa-spin**
```css
@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**bounce-arrow**
```css
@keyframes bounce-arrow {
  0% { transform: translateX(0px); }
  50% { transform: translateX(15%); }
  100% { transform: translateX(0px); }
}
```

**spin**
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**slide-down**
```css
@keyframes slide-down {
  0% { opacity: 0; transform: translateY(-100%); }
  100% { opacity: 1; transform: translateY(0px); }
}
```

**fade-out**
```css
@keyframes fade-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.5); }
}
```

**expanderOut**
```css
@keyframes expanderOut {
  0% { height: auto; opacity: 1; transform: scale(1); }
  100% { opacity: 0; }
}
```

**expanderIn**
```css
@keyframes expanderIn {
  0% { opacity: 0; transform-origin: 50% 0px; }
  100% { height: auto; opacity: 1; }
}
```

**showHours**
```css
@keyframes showHours {
  0% { opacity: 0; transform: translateY(-100%); }
  100% { opacity: 1; transform: translateY(0px); }
}
```

**rotateGeoloc**
```css
@keyframes rotateGeoloc {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(90deg); }
}
```

**slideInUp**
```css
@keyframes slideInUp {
  0% { transform: translate3d(0px, 100%, 0px); visibility: visible; }
  100% { transform: translate3d(0px, 0px, 0px); }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (499 instances)

```css
.button {
  background-color: rgb(24, 36, 101);
  color: rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 700;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Cards (685 instances)

```css
.card {
  background-color: rgb(255, 255, 255);
  border-radius: 0px;
  box-shadow: rgb(97, 96, 105) 0px 5px 10px 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Inputs (265 instances)

```css
.input {
  background-color: rgb(246, 246, 246);
  color: rgb(47, 47, 47);
  border-color: rgb(47, 47, 47) rgb(47, 47, 47) rgba(0, 0, 0, 0);
  border-radius: 0px;
  font-size: 14px;
  padding-top: 8px;
  padding-right: 20px;
}
```

### Links (544 instances)

```css
.link {
  color: rgb(24, 36, 101);
  font-size: 12px;
  font-weight: 300;
}
```

### Navigation (459 instances)

```css
.navigatio {
  background-color: rgb(255, 255, 255);
  color: rgb(24, 36, 101);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: static;
  box-shadow: rgb(97, 96, 105) 0px 5px 10px 0px;
}
```

### Footer (270 instances)

```css
.foote {
  background-color: rgb(24, 36, 101);
  color: rgb(255, 255, 255);
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 16px;
}
```

### Modals (163 instances)

```css
.modal {
  background-color: rgb(255, 255, 255);
  border-radius: 0px;
  padding-top: 0px;
  padding-right: 0px;
  max-width: 90%;
}
```

### Dropdowns (216 instances)

```css
.dropdown {
  background-color: rgb(255, 255, 255);
  border-radius: 0px;
  box-shadow: rgb(97, 96, 105) 0px 5px 10px 0px;
  border-color: rgb(255, 255, 255);
  padding-top: 0px;
}
```

### Badges (19 instances)

```css
.badge {
  color: rgb(24, 36, 101);
  font-size: 10px;
  font-weight: 300;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Tabs (18 instances)

```css
.tab {
  background-color: rgb(154, 156, 168);
  color: rgb(0, 0, 0);
  font-size: 13.3333px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-color: rgb(0, 0, 0);
  border-radius: 14px;
}
```

### Accordions (28 instances)

```css
.accordion {
  color: rgb(97, 96, 105);
  font-size: 16px;
  padding-top: 0px;
  padding-right: 0px;
  border-color: rgb(97, 96, 105) rgb(216, 216, 216) rgb(216, 216, 216);
}
```

### Switches (89 instances)

```css
.switche {
  background-color: rgb(118, 118, 118);
  border-radius: 0px;
  border-color: rgb(0, 0, 0);
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 9 instances, 2 variants

**Variant 1** (3 instances)

```css
  background: rgb(24, 36, 101);
  color: rgb(255, 255, 255);
  padding: 10px 30px 10px 30px;
  border-radius: 100px;
  border: 2px solid rgb(24, 36, 101);
  font-size: 12px;
  font-weight: 700;
```

**Variant 2** (6 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(24, 36, 101);
  padding: 11px 30px 11px 30px;
  border-radius: 100px;
  border: 2px solid rgb(24, 36, 101);
  font-size: 12px;
  font-weight: 700;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 13.3333px;
  font-weight: 400;
```

### Card — 7 instances, 2 variants

**Variant 1** (4 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

**Variant 2** (3 instances)

```css
  background: rgb(235, 236, 241);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 3.5px 0px 3.5px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgb(244, 245, 247);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 15 instances, 2 variants

**Variant 1** (3 instances)

```css
  background: rgb(244, 245, 247);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

**Variant 2** (12 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 6 instances, 1 variant

**Variant 1** (6 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 40px 8px 16px 40px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 12 instances, 1 variant

**Variant 1** (12 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 3.5px 0px 3.5px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 3.5px 0px 3.5px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(97, 96, 105);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(97, 96, 105);
  font-size: 16px;
  font-weight: 300;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgb(24, 36, 101);
  color: rgb(255, 255, 255);
  padding: 11px 30px 11px 30px;
  border-radius: 100px;
  border: 2px solid rgb(24, 36, 101);
  font-size: 12px;
  font-weight: 700;
```

### Button — 2 instances, 2 variants

**Variant 1** (1 instance)

```css
  background: rgb(46, 46, 46);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 50%;
  border: 0px none rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

**Variant 2** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 13.3333px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 13.3333px;
  font-weight: 400;
```

## Layout System

**20 grid containers** and **1574 flex containers** detected.

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 1500px | 20px |
| 1260px | 0px |
| 400px | 0px |
| 100% | 0px |
| 768px | 20px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 1-column | 10x |

### Grid Templates

```css
grid-template-columns: 847px;
grid-template-columns: 417.328px;
grid-template-columns: 417.328px;
grid-template-columns: 417.328px;
grid-template-columns: 417.328px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/wrap | 299x |
| row/nowrap | 1074x |
| column/nowrap | 193x |
| column/wrap | 8x |

## Responsive Design

### Viewport Snapshots

| Viewport | Body Font | Nav Visible | Max Columns | Hamburger | Page Height |
|----------|-----------|-------------|-------------|-----------|-------------|
| mobile (375px) | 16px | Yes | 1 | Yes | 6518px |
| tablet (768px) | 16px | Yes | 1 | Yes | 8483px |
| desktop (1280px) | 16px | Yes | 1 | Yes | 5354px |
| wide (1920px) | 16px | Yes | 1 | Yes | 5966px |

### Breakpoint Changes

**375px → 768px** (mobile → tablet):
- Page height: `6518px` → `8483px`

**768px → 1280px** (tablet → desktop):
- H1 size: `24px` → `34px`
- Page height: `8483px` → `5354px`

**1280px → 1920px** (desktop → wide):
- Page height: `5354px` → `5966px`

## Interaction States

### Button States

**"YES, I AM 18+"**
```css
/* Hover */
background-color: rgb(24, 36, 101) → rgb(23, 34, 96);
border-color: rgb(24, 36, 101) → rgb(20, 30, 83);
```
```css
/* Focus */
background-color: rgb(24, 36, 101) → rgb(21, 32, 89);
border-color: rgb(24, 36, 101) → rgb(20, 30, 83);
box-shadow: none → rgb(255, 255, 255) 0px 0px 0px 1px, rgb(24, 36, 101) 0px 0px 0px 4px;
outline: rgb(255, 255, 255) none 3px → rgb(24, 36, 101) solid 3px;
```

**"NO, I'M NOT 18+"**
```css
/* Hover */
color: rgb(24, 36, 101) → rgb(46, 54, 102);
border-color: rgb(24, 36, 101) → rgb(23, 34, 96);
outline: rgb(24, 36, 101) none 3px → rgb(46, 54, 102) none 3px;
```
```css
/* Focus */
color: rgb(24, 36, 101) → rgb(75, 78, 104);
border-color: rgb(24, 36, 101) → rgb(21, 32, 88);
box-shadow: none → rgb(255, 255, 255) 0px 0px 0px 1px, rgb(24, 36, 101) 0px 0px 0px 4px;
outline: rgb(24, 36, 101) none 3px → rgb(24, 36, 101) solid 3px;
```

### Link Hover

```css
border-color: rgb(24, 36, 101) rgb(24, 36, 101) rgba(0, 0, 0, 0) → rgb(24, 36, 101) rgb(24, 36, 101) rgb(47, 47, 47);
```

## Accessibility (WCAG 2.1)

**Overall Score: 94%** — 94 passing, 6 failing color pairs

### Failing Color Pairs

| Foreground | Background | Ratio | Level | Used On |
|------------|------------|-------|-------|---------|
| `#000000` | `#182465` | 1.48:1 | FAIL | button (6x) |

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#ffffff` | `#182465` | 14.2:1 | AAA |
| `#000000` | `#9a9ca8` | 7.69:1 | AAA |
| `#2f2f2f` | `#eef5ff` | 12.2:1 | AAA |
| `#2f2f2f` | `#f4f4f4` | 12.17:1 | AAA |
| `#182465` | `#ffffff` | 14.2:1 | AAA |

## Dark Mode

The site has a distinct dark mode color scheme:

- **Primary:** `#182465`
- **Secondary:** `#3860be`
- **Backgrounds:** `#ffffff`, `#182465`, `#f4f5f7`, `#ebecf1`, `#3a3a3f`, `#2f2f2f`, `#ededed`
- **Text:** `#000000`, `#616069`, `#182465`, `#141e53`, `#2f2f2f`

### Dark Mode CSS Variables

```css
--bg-color: #fff;
--border-color: #dedede;
--text-color: #182465;
--mapbbox-search-color: #182465;
--eswIconFillColor: #FFF;
--eswIconFontSize: 16px;
--eswButtonBottom: 25px;
--eswButtonRight: 30px;
success: [object Object];
warning: [object Object];
error: [object Object];
info: [object Object];
```

## Design System Score

**Overall: 73/100 (Grade: C)**

| Category | Score |
|----------|-------|
| Color Discipline | 80/100 |
| Typography Consistency | 35/100 |
| Spacing System | 85/100 |
| Shadow Consistency | 90/100 |
| Border Radius Consistency | 90/100 |
| Accessibility | 94/100 |
| CSS Tokenization | 75/100 |

**Strengths:** Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- 5 font families — consider limiting to 2 (heading + body)
- 8 font weights in use — consider standardizing to 3 (regular, medium, bold)
- 6 WCAG contrast failures
- 179 !important rules — prefer specificity over overrides
- 93% of CSS is unused — consider purging
- 11611 duplicate CSS declarations

## Gradients

**1 unique gradients** detected.

| Type | Direction | Stops | Classification |
|------|-----------|-------|----------------|
| linear | — | 2 | brand |

```css
background: linear-gradient(rgb(157, 159, 161) 50%, rgb(137, 208, 200));
```

## Z-Index Map

**22 unique z-index values** across 4 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 1000,2147483647 | div.b.a.t.-.h.e.a.d.e.r.-.a.c.c.o.u.n.t.-.m.e.n.u, div.b.a.t.-.h.e.a.d.e.r.-.a.c.c.o.u.n.t.-.m.e.n.u, div.b.a.t.-.h.e.a.d.e.r.-.a.c.c.o.u.n.t.-.m.e.n.u |
| dropdown | 898,999 | header, header, header |
| sticky | 10,99 | div.b.a.t.-.f.o.o.t.e.r.-.z.o.n.n.i.c.-.-.r.o.w, div.b.a.t.-.f.o.r.m.-.f.i.e.l.d.-.t.i.p, div.b.a.t.-.f.o.r.m.-.f.i.e.l.d.-.t.i.p |
| base | -1,9 | div.b.a.t.-.h.e.a.d.e.r.-.m.e.n.u._._.o.v.e.r.l.a.y, div, div.b.a.t.-.h.e.a.d.e.r.-.m.e.n.u._._.o.v.e.r.l.a.y |

**Issues:**
- [object Object]

## SVG Icons

**12 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| sm | 2 |
| md | 8 |
| lg | 2 |

**Icon colors:** `rgb(224, 8, 48)`, `rgb(58, 58, 63)`, `rgb(136, 136, 136)`, `rgb(24, 36, 101)`, `rgb(255, 255, 255)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Font Awesome 5 Free | self-hosted | 400, 900 | normal |
| Santral | self-hosted | 300, 600, 700, 900 | normal |
| Zonnic | self-hosted | 400 | normal |
| icomoon | self-hosted | 400 | normal |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| general | 6 | objectFit: fill, borderRadius: 0px, shape: square |
| thumbnail | 6 | objectFit: fill, borderRadius: 0px, shape: square |
| gallery | 4 | objectFit: cover, borderRadius: 0px, shape: square |

**Aspect ratios:** 4:3 (4x), 3:4 (3x), 16:9 (3x), 7.46:1 (1x), 2:1 (1x), 1.97:1 (1x), 4.33:1 (1x), 3:1 (1x)

## Motion Language

**Feel:** smooth · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `100ms` | 100 |
| `sm` | `200ms` | 200 |
| `md` | `300ms` | 300 |
| `lg` | `500ms` | 500 |

### Easing Families

- **ease-in-out** (573 uses) — `ease`

### Keyframes In Use

| name | kind | properties | uses |
|---|---|---|---|
| `slide-down` | slide-y | opacity, transform | 33 |
| `onetrust-fade-in` | fade | opacity | 14 |
| `otFloatingBtnIntro` | fade | opacity, left | 7 |

## Component Anatomy

### card — 65 instances

**Slots:** media
**Sizes:** sm

### button — 14 instances

**Slots:** label
**Variants:** secondary

| variant | count | sample label |
|---|---|---|
| default | 8 | QuitZone |
| secondary | 6 | LEARN MORE |

## Brand Voice

**Tone:** friendly · **Pronoun:** you-only · **Headings:** Title Case (balanced)

### Top CTA Verbs

- **learn** (6)
- **quitzone** (1)
- **log** (1)
- **watch** (1)
- **find** (1)
- **sign** (1)
- **give** (1)

### Button Copy Patterns

- "learn more" (6×)
- "quitzone" (1×)
- "log in" (1×)
- "watch their stories" (1×)
- "find a pharmacy" (1×)
- "sign up now" (1×)
- "give feedback" (1×)

### Sample Headings

> Sign In To Your Account

## Page Intent

**Type:** `legal` (confidence 0.4)
**Description:** ZONNIC is a form of Nicotine Replacement Therapy. It can help you quit smoking by delivering nicotine to your body in the form of nicotine pouches.

## Section Roles

Reading order (top→bottom): feature-grid → nav → footer → footer → footer

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | feature-grid | Sign In To Your Account | 0.8 |
| 1 | nav | — | 0.9 |
| 2 | footer | — | 0.95 |
| 3 | footer | — | 0.95 |
| 4 | footer | — | 0.95 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.317 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 100px |
| backdrop-filter in use | no |
| Gradients | 1 |

## Imagery Style

**Label:** `photography` (confidence 0.375)
**Counts:** total 16, svg 2, icon 2, screenshot-like 0, photo-like 10
**Dominant aspect:** landscape
**Radius profile on images:** square

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Santral` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
