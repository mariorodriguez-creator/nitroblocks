---
name: aem-styles
description: AEM component SCSS/CSS styling. Trigger when writing SCSS/CSS for AEM components, using --dxn- CSS variables, or applying BEM naming to component styles.
---

# AEM Styles Rules

## Core Theming Rule

**NEVER hardcode colors or typography.** Always use CAC (Context-Aware Configuration) theming variables.

```scss
// ❌ NEVER
color: #0e2b63;
font-family: 'Arial', sans-serif;
font-size: 16px;

// ✅ ALWAYS
color: var(--dxn-color-component-text);
font-family: var(--dxn-typography-body-family);
font-size: var(--dxn-typography-body-size-desktop);
```

Optionally, avoid hardcoding layout/spacing too (use `--dxn-layout-*`).

## Variable Naming Pattern

`--dxn-[context]-[component]-[property]-[modifier]`

- `--dxn-color-*` — all color values
- `--dxn-typography-*` — font properties
- `--dxn-layout-*` — spacing, dimensions

Examples:
- `--dxn-color-button-primary-bg-hover`
- `--dxn-typography-h1-size-desktop`
- `--dxn-layout-container-padding-mobile`

## Allowed Hardcoded Exceptions

Only: `margin: 0`, `padding: 0`, `width: 100%`, `display: flex`, `position: absolute`, `z-index: 1000`.

## BEM Methodology

```scss
// Block
.dxn-component {
  &__label { ... }   // Element
  &--primary { ... } // Modifier
  &--is-loading { ... } // State modifier
}
```

Prefix: `dxn-` for all component classes.

## Design-to-SCSS Mapping (when implementing without design.md)

When implementing SCSS for a component that has no design.md, or when design.md was authored manually: the design's root element corresponds to the HTL root (`__base`). The block class is on the AEM wrapper. Put root-level layout styles under `&__base`:

```scss
.dxn-component {
  &__base {
    // Root layout (position, width, padding, etc.)
    position: relative;
    width: 100%;
    ...
  }
  &__content { ... }
  &__wrapper { ... }
}
```

## AEM Style System Integration

AEM adds modifier class to the wrapper. Internal elements use standard block__element classes.

```scss
// ✅ CORRECT: Modifier at root, descendant selectors for elements
.dxn-component--variation {
  .dxn-component {
    &__element { ... }
  }
}

// ❌ WRONG: Hybrid Block-Modifier__Element
.dxn-component--variation {
  &__element { ... }  // Creates .dxn-component--variation__element — WRONG
}
```

Apply styles via descendant selectors: `.dxn-button--primary .dxn-button__btn { ... }`

## CSS Variables at Component Root

```scss
.dxn-accordion {
  &__base {
    --dxn-accordion-color: var(--dxn-color-accordion-text);
    --dxn-accordion-bg: var(--dxn-color-accordion-bg);
  }
  &__header {
    color: var(--dxn-accordion-color);
    background: var(--dxn-accordion-bg);
  }
}
```

## Responsive Design (Mobile-First)

```scss
.dxn-component {
  font-size: var(--dxn-typography-body-size-mobile);

  @media (min-width: 768px) {
    font-size: var(--dxn-typography-body-size-tablet);
  }

  @media (min-width: 1024px) {
    font-size: var(--dxn-typography-body-size-desktop);
  }
}
```

Use breakpoint mixins (`@include tablet-up`, `@include desktop-up`) where available.

## Inverted Theme

```scss
.component {
  background: var(--dxn-color-component-bg);
  &--inverted { background: var(--dxn-color-component-bg-inverted); }
}
```

## Palette Variables

`var(--dxn-color-palette-1)` through `var(--dxn-color-palette-9)`, plus `-inverted` variants.

## Accessibility

```scss
.dxn-button {
  &:focus {
    outline: 2px solid var(--dxn-color-focus);
    outline-offset: 2px;
  }
  &:focus:not(:focus-visible) { outline: none; }
}
```

## Reduced Motion

```scss
@media (prefers-reduced-motion: reduce) {
  .dxn-component {
    animation: none;
    transition: none;
  }
}
```

## SCSS File Structure

```scss
// 1. Import commons abstracts
@import '../../../commons/sass/abstracts';

// 2. CSS Variables at component root
.dxn-component { --dxn-component-*: *; }

// 3. Base styles
// 4. Elements (__element)
// 5. Modifiers (--modifier)
// 6. States (.is-active)
// 7. Responsive @media
```

## Stylelint Rules

- `max-nesting-depth`: 8 levels max
- Font sizes: `rem`, `px`, `em` only
- Target browsers: last 2 versions, iOS >= 9, Android >= 5, no IE/Opera Mini
- Rules: empty line before top-level rules

## Creating New Variables

1. Add to `ThemeVariablesCAConfig.java` (Java property)
2. Add to `Group` enum
3. Configure in CAC XML (`colorFooter="[bg:#fff,text:#000]"`)
4. Use in SCSS: `var(--dxn-color-footer-bg)`

## Mandatory Pre-commit Checks

- [ ] Ran `npm run lint:css` — no Stylelint errors
- [ ] No hardcoded colors/typography (use `--dxn-*` variables)
- [ ] BEM naming convention followed
- [ ] Empty lines before top-level rules
- [ ] Max 8 nesting depth

Build: `@netcentric/fe-build` via `npm run build:css`. Lint: `npm run lint:css`.
