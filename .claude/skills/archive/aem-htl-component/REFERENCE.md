# AEM HTL Component — Reference

## Component Folder Full Structure

```
digitalxn-aem-base/digitalxn-aem-base-apps/src/main/jcr_root/apps/digitalxn/base/components/
└── dxn-[component-name]/
    ├── .content.xml                          # Component group/category
    └── v1/
        ├── .content.xml                      # Version folder
        └── dxn-[component-name]/
            ├── .content.xml                  # cq:Component definition
            ├── _cq_dialog/.content.xml       # Authoring dialog
            ├── _cq_editConfig.xml            # Edit config (optional)
            ├── _cq_template/.content.xml     # Initial content template (optional)
            └── dxn-[component-name].html     # Main HTL template
```

## .content.xml Files

### Component Group Root `.content.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="sling:Folder"
    jcr:title="dxn-[component-name]"/>
```

### Component Definition `.content.xml` (main)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          xmlns:cq="http://www.day.com/jcr/cq/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:Component"
    jcr:title="DXN Component"
    jcr:description="Component description"
    componentGroup="DigitalXn - Content"
    sling:resourceSuperType="core/wcm/components/teaser/v2/teaser"/>
```

`sling:resourceSuperType` — only when extending a Core Component.

### _cq_template/.content.xml (Initial content)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:cq="http://www.day.com/jcr/cq/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="Default"
    sling:resourceType="digitalxn/base/components/dxn-component/v1/dxn-component"/>
```

For parsys with default children, include child nodes with `sling:resourceType` and optional `cq:styleIds`.

## Complete HTL Template Skeleton

```html
<!--/* Clientlib includes */-->
<sly data-sly-use.clientlibs="${'com.adobe.cq.wcm.core.components.models.ClientLibraries' @
    categories='digitalxn.components.dxn-component', defer=true}">
    ${clientlibs.jsAndCssIncludes @ context="unsafe"}
</sly>

<!--/* Sling Model + Core component commons setup */-->
<sly data-sly-use.component="biz.netcentric.digitalxn.aem.models.DxnComponent"
     data-sly-use.templates="core/wcm/components/commons/v1/templates.html"
     data-sly-test.hasContent="${component.hasContent}">

    <!--/* Component root — AEM provides block class wrapper, HTL root is __base */-->
    <div class="dxn-component__base"
         data-nc="DxnComponent"
         data-nc-params-DxnComponent='{"title": "${component.title}",
                                       "enabled": ${component.enabled}}'
         role="region"
         aria-label="${component.ariaLabel @ context='attribute'}">

        <!--/* Conditional render */-->
        <sly data-sly-test="${component.title}">
            <h2 class="dxn-component__title">${component.title @ context='html'}</h2>
        </sly>

        <!--/* List iteration */-->
        <ul class="dxn-component__list">
            <sly data-sly-list.item="${component.items}">
                <li class="dxn-component__item">${item.text @ context='html'}</li>
            </sly>
        </ul>

        <!--/* Include another template */-->
        <sly data-sly-call="${templates.image @ src=component.imageRef}"></sly>
    </div>
</sly>

<!--/* Edit mode placeholder */-->
<sly data-sly-call="${templates.placeholder @ isEmpty=!hasContent}"></sly>
```

## data-nc-params Rules

- String: `"key": "${model.stringProp}"` — requires quotes in JSON
- Boolean: `"key": ${model.boolProp}` — NO quotes, outputs `true`/`false`
- Number: `"key": ${model.numberProp}` — NO quotes
- **No HTL context expressions** in params (no `@ context='attribute'`)

## XSS Prevention

| Location | Context |
|----------|---------|
| HTML body text | `${value @ context='html'}` |
| HTML attribute | `${value @ context='attribute'}` |
| URI attribute | `${value @ context='uri'}` |
| `data-nc-params` JSON | No context needed (plain `${model.prop}`) |
| Script | `${value @ context='scriptString'}` |

Never use `@ context='unsafe'` for user-controlled content.

## Component Registration in apps/sling:OsgiConfig

No explicit registration needed — `sling:resourceType` in `.content.xml` is sufficient.
