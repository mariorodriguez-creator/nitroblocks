---
name: aem-frontend-js
description: AEM frontend JavaScript and clientlib configuration. Trigger when writing component JavaScript with @netcentric/component-loader, configuring clientlibs (js.txt/css.txt), or setting up component-level JS initialization.
---

# AEM Frontend JavaScript & Clientlibs

## Clientlib Source File Structure

Source files location: `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/digitalxn/base/clientlibs/publish/components/<component-name>/`

Files:
- `<component-name>.clientlibs.js` — component behavior
- `<component-name>.clientlibs.scss` — component styles
- `<component-name>.config.js` — selectors and class names

## Compiled Clientlib Location

`digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/src/main/jcr_root/apps/digitalxn/base/clientlibs/publish/components/<component-name>/`

### .content.xml (Clientlib Definition)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[digitalxn.components.dxn-component]"
    dependencies="[core.wcm.components.accordion.v1]"/>
```

Category naming: `digitalxn.components.<component-name>`

### js.txt
```
dxn-component.bundle.js
```

### css.txt
```
dxn-component.bundle.css
```

## Component JavaScript Pattern

```javascript
import { register } from '@netcentric/component-loader';
import config from './dxn-component.config';

class Component {
  constructor(el, params) {
    // el → element with data-nc attribute
    // params → parsed JSON from data-nc-params-Component
    this.el = el;
    this.config = { ...params, ...config };
    this.selectors = this.config.selectors;
    this.classes = this.config.classes;
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    this.el.addEventListener('click', this.handleClick.bind(this));
  }

  setupAccessibility() {
    this.el.setAttribute('role', 'region');
    this.el.setAttribute('aria-label', this.config.ariaLabel);
  }

  handleClick(e) {
    // event delegation
    if (e.target.matches('[data-action="open"]')) this.open();
  }

  destroy() {
    // Remove all event listeners
    this.el.removeEventListener('click', this.handleClick);
  }
}

register({ Component });
```

## Config File Pattern

```javascript
// dxn-component.config.js
export default {
  selectors: {
    trigger: '[data-cmp-hook-component="trigger"]',
    content: '.dxn-component__content',
  },
  classes: {
    active: 'dxn-component--active',
    loading: 'dxn-component--loading',
  },
};
```

## HTL Inclusion
```html
<sly data-sly-use.clientlibs="${'com.adobe.cq.wcm.core.components.models.ClientLibraries' @
  categories='digitalxn.components.dxn-component', defer=true}">
  ${clientlibs.jsAndCssIncludes @ context="unsafe"}
</sly>
```

## HTL ↔ JS Data Mapping

```
Sling Model Method     HTL Expression              JS Constructor Param
getParam1String()  →  componentModel.param1String  →  params.param1String
isParam2Boolean()  →  componentModel.param2Boolean →  params.param2Boolean (no quotes in JSON)
getParam3JSON()    →  componentModel.param3JSON    →  params.param3JSON
```

Data types in data-nc-params JSON:
- String: `"key": "${model.stringProp}"` (needs quotes)
- Boolean: `"key": ${model.boolProp}` (no quotes — outputs true/false)
- Number: `"key": ${model.numberProp}` (no quotes)

## Key ESLint Rules

- **`no-param-reassign`**: Never reassign function parameters. Use local variable: `const validTime = time < 0 ? 0 : time;`
- **`comma-dangle`**: Trailing commas required for multiline arrays/objects
- **`no-underscore-dangle`**: No `_prefix` private methods — use descriptive names
- **`default-case`**: Always include `default` in switch statements

## Anti-Duplication Rules

```javascript
// ✅ Factory pattern over duplicate functions
const createValidator = (regex, msg) => (value) => ({ isValid: regex.test(value), error: msg });

// ✅ Event delegation over multiple handlers
this.el.addEventListener('click', (e) => {
  if (e.target.matches('[data-action="buy"]')) this.handleBuy(e);
  if (e.target.matches('[data-action="cart"]')) this.handleCart(e);
});
```

## Security

```javascript
// ✅ SECURE URL formation
const params = new URLSearchParams({ cartId: validateCartId(getCookie('cart-id')) });
const url = `${baseUrl}?${params.toString()}`;

// ✅ Use textContent not innerHTML for user data
element.textContent = `Welcome ${sanitizedInput}`;
```

## Mandatory Pre-commit Checks

- [ ] Ran `npm run lint:js` — no ESLint errors
- [ ] No parameter reassignment (local variables instead)
- [ ] Trailing commas on all multiline objects/arrays
- [ ] Checked 2-3 similar component files for patterns

Build: `@netcentric/fe-build` v4.0.1 (Webpack). Run from `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/`.

See REFERENCE.md for clientlib XML template and full component skeleton.
