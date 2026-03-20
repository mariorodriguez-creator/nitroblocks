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

**Order (mandatory)**: (1) Base mobile, no `@media` → (2) `@media (width >= 600px)` → (3) `@media (width >= 900px)` → (4) optional `@media (width >= 1200px)`.

```css
.[block-name] {
  /* base */
}

@media (width >= 600px) {
  .[block-name] {
    /* tablet */
  }
}

@media (width >= 900px) {
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

---

## Dynamic Content Elements

---

## Interactive States

---

## Visual Acceptance Checklist

- [ ] Mobile: …
- [ ] Tablet: …
- [ ] Desktop: …
- [ ] Layout matrix: teaser group / inner flex directions match Figma at each breakpoint

---

## EDS Block Integration

---
