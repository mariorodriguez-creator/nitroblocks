---
name: server-first-minimal-code
description: Enforces server-side rendering over JavaScript DOM manipulation for AEM components. Use when generating HTL templates, component JavaScript, or SCSS for any component where content is available from the Sling Model at page load.
---

# Server-First Rendering

When content is available from AEM (Sling Model, dialog properties, child resources), it must be rendered in HTL. JavaScript manages interaction state only -- class toggling, event handling, fetch calls. It never generates or duplicates markup that the server already knows about.

## Render all known content in HTL

If the Sling Model can provide it, the HTL template must render it. JavaScript should receive a fully populated DOM and toggle visibility, not build it from scratch.

### Lists and repeated items

**DON'T** -- empty container filled by JS:

```html
<div class="quiz__options"></div>
```

```javascript
renderQuestion(question) {
  this.container.innerHTML = '';
  question.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.textContent = opt.text;
    this.container.appendChild(btn);
  });
}
```

**DO** -- all items rendered in HTL, JS toggles the active one:

```html
<ul data-sly-list.question="${model.questions}">
  <li class="quiz__item ${questionList.index == 0 ? 'quiz__item--active' : ''}">
    <span>${question.text}</span>
    <ul data-sly-list.option="${question.options}">
      <li>${option.text}</li>
    </ul>
  </li>
</ul>
```

```javascript
handleNext() {
  active.classList.remove(this.classes.active);
  next.classList.add(this.classes.active);
}
```

**Why**: Server-rendered content is SEO-indexable, accessible to screen readers from first load, causes zero layout shift, and removes an entire class of DOM-manipulation bugs.

### Layout-affecting values

**DON'T** -- set CSS custom properties in JS after page load:

```javascript
init() {
  this.el.style.setProperty('--cols', this.params.cols);
  this.el.style.setProperty('--rows', this.params.rows);
}
```

**DO** -- set them in HTL so they apply on first paint:

```html
<div style="--cols: ${model.cols @ context='styleString'};
            --rows: ${model.rows @ context='styleString'};">
```

**Why**: The JS approach causes a visible reflow after script execution. The HTL approach is correct on first paint.

### Multiple views or sections

**DON'T** -- swap `innerHTML` to show a different view:

```javascript
showView(index) {
  this.container.innerHTML = this.buildMarkup(this.views[index]);
}
```

**DO** -- render all views in HTL, toggle visibility with a CSS class:

```scss
.view { display: none; }
.view--active { display: block; }
```

### Data serialization for JS params

**DON'T** -- pass arrays/objects through HTL string contexts:

```html
data-params='{"tags": ${model.tags @ context="scriptString"}}'
```

**DO** -- use a dedicated Sling Model getter that returns valid JSON:

```html
data-params='{"tags": ${model.tagsJson}}'
```

```java
@Override
public String getTagsJson() {
    return new Gson().toJson(tags);
}
```

**Why**: HTL string escaping on arrays produces invalid JSON. A dedicated method guarantees correct serialization.

### Buttons, labels, and messages

**DON'T** -- hardcode UI text in JS:

```javascript
this.button.textContent = 'Next Question';
this.message.textContent = 'Please select an answer';
```

**DO** -- render labels from the Sling Model (sourced from dialog or i18n):

```html
<button class="quiz__next">${model.nextLabel}</button>
<span class="quiz__message">${model.validationMessage}</span>
```

---

## Use CSS for layout, not JavaScript

When CSS can handle overflow, visibility, or spacing, do not write a JS function for it.

### Grid overflow

**DON'T** -- count cells and create empty placeholders in JS:

```javascript
for (let i = 0; i < totalCells; i += 1) {
  if (posts[i]) this.renderTile(posts[i]);
  else this.renderEmptyTile();
}
```

**DO** -- render only real items, let CSS hide extra rows:

```scss
.grid {
  display: grid;
  grid-auto-rows: 0;
  overflow: hidden;
}
```

### Height stability

**DON'T** -- let container height jump on every step transition.

**DO** -- calculate max height once and fix it:

```javascript
init() {
  const maxH = Math.max(...items.map((el) => el.getBoundingClientRect().height));
  this.container.style.height = `${maxH}px`;
}
```

**Why**: Prevents Cumulative Layout Shift (CLS), a Core Web Vital.

### Visibility toggling

**DON'T** -- manipulate `style.display` directly in JS:

```javascript
views.forEach((v) => {
  v.style.display = v.dataset.view === name ? 'block' : 'none';
});
```

**DO** -- toggle a class, let CSS own the visual rule:

```scss
.item { display: none; }
.item--active { display: block; }
```

```javascript
prev.classList.remove('item--active');
next.classList.add('item--active');
```

**Why**: CSS is the source of truth for how elements look. JS only flips a class.

---

## Quick Decision Checklist

Before writing frontend code for an AEM component:

- [ ] Is this content available from the Sling Model? **Render it in HTL.**
- [ ] Is this a label, message, or button text? **Source it from the dialog/i18n via HTL.**
- [ ] Does this value affect layout on first paint? **Set it in the HTL inline style.**
- [ ] Am I creating DOM elements in JS that could exist in HTL? **Move them to HTL.**
- [ ] Can CSS handle this visibility/overflow/spacing? **Use CSS, not JS.**
