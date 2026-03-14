---
name: eds-styles
description: EDS block CSS styling. Trigger when writing CSS for AEM Edge Delivery blocks, using shared tokens (--dxn-* or project vars), or applying BEM naming to block styles.
---

# EDS Styles Rules

## Core Theming Rule

**NEVER hardcode colors or typography.** Always use shared tokens from `styles/styles.css` or a central variables file.

```css
/* ❌ NEVER */
color: #0e2b63;
font-family: 'Arial', sans-serif;
font-size: 16px;

/* ✅ ALWAYS */
color: var(--text-color);
font-family: var(--body-font-family);
font-size: var(--body-font-size-m);
```

Optionally, avoid hardcoding layout/spacing too (use project layout tokens if available).

## Variable Naming Pattern

`--[context]-[property]-[modifier]`

- `--color-*` or `--[block]-color-*` — color values
- `--[block]-*` — block-specific overrides

Examples:
- `--link-color`, `--background-color`
- `--countdown-timer-gap`

## Allowed Hardcoded Exceptions

Only: `margin: 0`, `padding: 0`, `width: 100%`, `display: flex`, `position: absolute`, `z-index: 1000`.

## BEM Methodology

```css
/* Block - scoped to main */
main .block-name {
  /* block styles */
}

/* Element */
main .block-name__element {
  /* element styles */
}

/* Modifier */
main .block-name--modifier {
  /* modifier styles */
}

main .block-name.is-active {
  /* state modifier */
}
```

## File Location

Block CSS lives at `blocks/{block-name}/{block-name}.css`. Shared tokens defined in `styles/styles.css` or a central variables file.

## Responsive Design (Mobile-First)

```css
main .block-name {
  font-size: var(--body-font-size-m);
}

@media (width >= 600px) {
  main .block-name {
    font-size: var(--body-font-size-l);
  }
}

@media (width >= 900px) {
  main .block-name {
    font-size: var(--body-font-size-xl);
  }
}
```

Standard breakpoints: 600px, 900px, 1200px. Use modern syntax: `(width >= 600px)`.

## CSS Variables at Block Root

```css
main .block-name {
  --block-name-color: var(--text-color);
  --block-name-bg: var(--background-color);
}

main .block-name__element {
  color: var(--block-name-color);
  background: var(--block-name-bg);
}
```

## Accessibility

```css
main .block-name button:focus,
main .block-name a:focus {
  outline: 2px solid var(--link-color);
  outline-offset: 2px;
}

main .block-name button:focus:not(:focus-visible),
main .block-name a:focus:not(:focus-visible) {
  outline: none;
}
```

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  main .block-name {
    animation: none;
    transition: none;
  }
}
```

## Stylelint Rules

- Follow Stylelint standard configuration
- Font sizes: `rem`, `px`, `em` only
- Empty line before top-level rules

## Mandatory Pre-commit Checks

- [ ] Ran `npm run lint` — no Stylelint errors
- [ ] No hardcoded colors/typography (use `var(--*)` from styles)
- [ ] BEM-like naming convention followed
- [ ] All selectors scoped to block
- [ ] Mobile-first responsive
