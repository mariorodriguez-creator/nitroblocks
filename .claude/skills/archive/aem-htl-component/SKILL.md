---
name: aem-htl-component
description: AEM HTL templates and component folder structure. Trigger when writing HTL templates, creating AEM component folder structure, using data-sly-use/data-sly-list/data-sly-test, or referencing Sling Models from HTL.
---

# AEM HTL Component Rules

## Component Folder Structure

Path pattern: `apps/digitalxn/base/components/<component-name>/v1/<component-name>`

```
dxn-teaser
├── .content.xml  (component folder definition)
└── v1
    ├── .content.xml  (version folder)
    └── dxn-teaser
        ├── .content.xml  (main component definition, jcr:primaryType="cq:Component")
        ├── _cq_dialog/.content.xml  (authoring dialog)
        ├── _cq_template/.content.xml  (optional initial content)
        ├── dxn-teaser.html  (main HTL script)
        └── image.html  (supporting HTL scripts)
```

### Component .content.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:Component"
    jcr:title="Component Title"
    jcr:description="Description"
    sling:resourceSuperType="core/wcm/components/teaser/v2/teaser"
    componentGroup="DigitalXn General"/>
```

### _cq_template Namespaces (CRITICAL)
Always include `xmlns:cq` + `xmlns:sling` + `xmlns:jcr` + `xmlns:nt`. Missing `cq` namespace causes Maven build failure: "Given root node name 'cq:template' cannot be resolved".

## HTL Template Rules

### Structure Pattern
```html
<!-- Client library at top -->
<sly data-sly-use.clientlibs="${'com.adobe.cq.wcm.core.components.models.ClientLibraries' @
  categories='digitalxn.components.dxn-component', defer=true}">
  ${clientlibs.jsAndCssIncludes @ context="unsafe"}
</sly>

<!-- Wrap in top-level <sly> with all data-sly-use declarations -->
<sly data-sly-use.componentModel="biz.netcentric.digitalxn.aem.models.DxnComponent"
     data-sly-use.templates="core/wcm/components/commons/v1/templates.html"
     data-sly-test.hasContent="${componentModel.title}">

  <!-- Root div is first BEM element (__base), NOT the block class -->
  <div class="dxn-component__base"
       data-nc="Component"
       data-nc-params-Component='{
           "stringProp": "${componentModel.stringProp}",
           "boolProp": ${componentModel.boolProp}
       }'>
    <!-- content -->
  </div>

</sly>

<!-- Placeholder at bottom -->
<sly data-sly-call="${templates.placeholder @ isEmpty=!hasContent}"></sly>
```

### Key Rules

**Comments**: Use `<!--/* */-->` for dev notes (not rendered). Use `<!-- -->` only when comment must appear in output.

**data-nc / data-nc-params**:
- `data-nc="ComponentName"` must match JS `register({ ComponentName })`.
- `data-nc-params-ComponentName` JSON — **NO HTL context allowed**. Never add `@ context='attribute'` or `@ context='scriptString'` inside the JSON attribute. It breaks JSON output.
  - ✅ `"endDate": "${model.endDate}"`
  - ❌ `"endDate": "${model.endDate @ context='attribute'}"`

**Conditionals** — use server-side, not JS:
```html
<div data-sly-test="${model.isValid}" class="dxn-component__content">...</div>
```

**Lists**:
```html
<div data-sly-list.item="${model.items}" class="item">
  <h3>${item.title}</h3>
</div>
```

**Safe rendering**: Use `data-sly-text` for user content. Only use `context="unsafe"` for client library includes.

**Default values**: `${model.title || 'Default Title'}`

**Conditional attributes**: `data-sly-attribute.disabled="${model.isExpired}"`

**AEM wrapper**: The AEM component wrapper already has the block class (`dxn-component`). HTL root must be `__base` (or first BEM element). Do NOT output the block class in HTL.

**CSS class wrapper note**: `component-name` class is on AEM wrapper — do not use it in child elements. Use BEM: `dxn-component__image`.

**Child component inclusion (data-sly-resource)**: When including a child component (e.g. embedded button, CTA), use `decorationTagName='div'` so the child appears in the Content Tree and receives proper authoring overlays: `data-sly-resource="${'button' @ resourceType='...', decorationTagName='div'}"`

### Image Rendering
```html
<img data-sly-test="${model.image}"
     src="${model.image.src}"
     alt="${model.image.alt || model.title}"
     loading="lazy" />
```

### Link Handling
```html
<a data-sly-test="${model.linkUrl}"
   href="${model.linkUrl}"
   data-sly-attribute.target="${model.linkTarget}">
  ${model.linkText}
</a>
```

### Debug Only in Edit Mode
```html
<div class="debug-info" data-sly-test="${wcmmode.edit}">
  <pre>${model.debugInfo}</pre>
</div>
```

### XSS Prevention
- Use `data-sly-text` for user content (auto-escaped)
- Only use `data-sly-unescape` for trusted authored content
- Never: `${userInput @ context="unsafe"}`

## Naming Conventions
- HTL files: kebab-case (`dxn-teaser.html`)
- CSS classes: BEM (`dxn-teaser__content`, `dxn-teaser--hero`)
- data attributes: kebab-case (`data-nc-params-Teaser`)
- Sling Model references: camelCase (`teaserModel`)

## Sling Model Integration
```html
<div data-sly-use.teaserModel="biz.netcentric.digitalxn.aem.models.DxnTeaser"
     class="dxn-teaser__base"
     data-nc="Teaser"
     data-nc-params-Teaser='{
         "linkUrl": "${teaserModel.linkUrl}",
         "openInNewTab": ${teaserModel.openInNewTab}
     }'>
</div>
```

See REFERENCE.md for full boilerplate templates.
