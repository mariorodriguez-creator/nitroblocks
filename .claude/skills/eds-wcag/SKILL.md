---
name: eds-wcag
description: WCAG 2.2 AA accessibility for AEM Edge Delivery blocks. Trigger when implementing ARIA attributes, keyboard navigation, focus management, live regions, or accessibility features in HTML/JS/CSS.
---

# EDS WCAG Rules (WCAG 2.2 AA)

Follow WCAG 2.2 AA for all blocks. These rules apply to HTML, JavaScript, and CSS in AEM Edge Delivery Services blocks.

## HTML and Semantic Structure

**Unique IDs**: Use block-scoped or component-scoped IDs so `id`, `for`, `aria-describedby` stay unique across multiple instances.

```html
<label for="email-${blockId}">Email</label>
<input id="email-${blockId}" aria-describedby="email-${blockId}-desc email-${blockId}-error">
<div id="email-${blockId}-desc">...</div>
<div id="email-${blockId}-error" role="alert" aria-live="polite">...</div>
```

**Conditional alt**: Decorative images get `alt=""` and `role="presentation"`; content images get descriptive alt text.

**External links**: Must have `rel="noopener noreferrer"` and sr-only "(opens in a new tab)":

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Link text<span class="sr-only"> (opens in a new tab)</span>
</a>
```

## Forms

- Associate errors with field via `aria-describedby` (include both help and error IDs)
- Use `role="alert"` + `aria-live="polite"` or `"assertive"` for dynamic errors

## Navigation and Breadcrumbs

**Dropdown nav**: `role="menubar"` on list, `role="menuitem"` on links, `role="menu"` on submenus, `aria-expanded`/`aria-controls`/`aria-haspopup="true"` on toggles. Keyboard: Arrow, Enter, Space, Escape.

**Breadcrumb**:
```html
<nav aria-label="Breadcrumb"><ol>
  <li><a href="/path">Item</a></li>
  <li><span aria-current="page">Current</span></li>
</ol></nav>
```

## Focus (CSS + JS)

**Not obscured**: Use `scroll-margin` in CSS on focusable elements inside modals. When moving focus in JS, use `scrollIntoView({ block: 'center' })`.

**Visible focus**: Never remove `:focus`. Minimum 2px outline/offset (WCAG 2.4.11).

## Dynamic Content (JS)

**Announcements**: Single element with `aria-live="polite"` or `"assertive"`, `aria-atomic="true"`, `class="sr-only"`. Update `textContent` when status changes.

```javascript
setupAccessibility() {
  this.announcer = document.createElement('div');
  this.announcer.setAttribute('aria-live', 'polite');
  this.announcer.setAttribute('aria-atomic', 'true');
  this.announcer.className = 'sr-only';
  document.body.appendChild(this.announcer);
}

announce(message) {
  if (this.announcer) this.announcer.textContent = message;
}
```

**Keyboard Navigation**:
```javascript
handleKeydown(event) {
  switch (event.key) {
    case 'Enter':
    case ' ':
      this.activate();
      break;
    case 'Escape':
      this.close();
      break;
    default:
      break;
  }
}
```

## Motion (CSS)

**Reduced motion**: Honor `prefers-reduced-motion: reduce` for carousels, accordions, any motion.

```css
@media (prefers-reduced-motion: reduce) {
  .my-block,
  .my-block .animated {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1;
  }
}
```

## Color Contrast

Minimum 4.5:1 for normal text. Use CSS variables from `styles/styles.css` — never hardcode colors.

## Project Conventions

- Block class prefixes: `.{block-name}` (e.g. `.countdown`, `.hero`)
- Semantic HTML: `<article>`, `<section>`, `<nav>`, `<main>`, `<header>`, `<footer>`
