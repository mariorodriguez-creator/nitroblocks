---
name: aem-wcag
description: WCAG 2.2 AA accessibility for AEM components. Trigger when implementing ARIA attributes, keyboard navigation, focus management, live regions, or accessibility features in HTL/JS/SCSS.
---

# AEM WCAG Rules (WCAG 2.2 AA)

Follow WCAG 2.2 AA for everything. These are AEM/HTL/project-specific supplementary rules.

## HTL

**Attribute output**: Use `@ context='attribute'` for `alt`, `aria-label`, `href`, and attribute values.

**Unique IDs**: Use component/model IDs so `id`, `for`, `aria-describedby` stay unique across multiple instances.

```html
<label for="email-${form.id}">${form.emailLabel @ context='html'}</label>
<input id="email-${form.id}" aria-describedby="email-${form.id}-desc email-${form.id}-error">
<div id="email-${form.id}-desc">...</div>
<div id="email-${form.id}-error" role="alert" aria-live="polite">...</div>
```

**Conditional alt**: Two branches — decorative images get `alt=""` and `role="presentation"`, content images get descriptive alt.

```html
<img src="${image.src @ context='uri'}" alt="${image.alt @ context='attribute'}" data-sly-test="${image.alt}">
<img src="${image.src @ context='uri'}" alt="" role="presentation" data-sly-test="${!image.alt}">
```

**External links**: Must have `rel="noopener noreferrer"` and sr-only "(opens in a new tab)":

```html
<a href="${link.url @ context='uri'}" target="_blank" rel="noopener noreferrer">
  ${link.text @ context='html'}<span class="sr-only"> (opens in a new tab)</span>
</a>
```

## Forms

- Associate errors with field via `aria-describedby` (include both help and error IDs)
- Use `role="alert"` + `aria-live="polite"` or `"assertive"` for dynamic errors
- Form title and description are part of AEM title/text components

## Navigation and Breadcrumbs

**Dropdown nav**: `role="menubar"` on list, `role="menuitem"` on links, `role="menu"` on submenus, `aria-expanded`/`aria-controls`/`aria-haspopup="true"` on toggles. Keyboard: Arrow, Enter, Space, Escape.

**Breadcrumb**:
```html
<nav aria-label="Breadcrumb"><ol>
  <li><a href="${item.url @ context='uri'}">${item.title @ context='html'}</a></li>
  <li><span aria-current="page">${item.title @ context='html'}</span></li>
  <span aria-hidden="true">/</span>
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
  .cmp-carousel, .cmp-animation {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1;
  }
}
```

## SCSS Color Contrast

Minimum 4.5:1 for normal text. Use `--dxn-color-*` variables — never hardcode colors.

## Project Conventions

- Class prefixes: `cmp-*` (core component pattern), `dxn-*` (project components)
- Semantic HTML: `<article>`, `<section>`, `<nav>`, `<main>`, `<header>`, `<footer>`
