# AEM Component XML Templates Reference

This file contains the exact XML templates used by the scaffolding script, for reference when modifying generated components.

## Folder-Level `.content.xml` (sling:Folder)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="sling:Folder"/>
```

## Version Folder `.content.xml` (nt:unstructured)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"/>
```

## Component Definition `.content.xml` (cq:Component)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:description="{description}"
    jcr:primaryType="cq:Component"
    jcr:title="{title}"
    sling:resourceSuperType="{superType}"
    componentGroup="{group}"/>
```

With `cq:isContainer`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    cq:isContainer="{Boolean}true"
    jcr:description="{description}"
    jcr:primaryType="cq:Component"
    jcr:title="{title}"
    sling:resourceSuperType="{superType}"
    componentGroup="{group}"/>
```

## Dialog `_cq_dialog/.content.xml`

Standard dialog with Settings and Accessibility tabs:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:granite="http://www.adobe.com/jcr/granite/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="{title}"
    sling:resourceType="cq/gui/components/authoring/dialog">
    <content
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <tabs
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/tabs"
                maximized="{Boolean}true">
                <items jcr:primaryType="nt:unstructured">
                    <!-- Settings Tab -->
                    <settings
                        jcr:primaryType="nt:unstructured"
                        jcr:title="Settings"
                        sling:resourceType="granite/ui/components/coral/foundation/container"
                        margin="{Boolean}true">
                        <items jcr:primaryType="nt:unstructured">
                            <columns
                                jcr:primaryType="nt:unstructured"
                                sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                                margin="{Boolean}true">
                                <items jcr:primaryType="nt:unstructured">
                                    <column
                                        jcr:primaryType="nt:unstructured"
                                        sling:resourceType="granite/ui/components/coral/foundation/container">
                                        <items jcr:primaryType="nt:unstructured">
                                            <!-- REPLACE: Add your dialog fields here -->
                                            <title
                                                jcr:primaryType="nt:unstructured"
                                                sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                                                fieldLabel="Title"
                                                name="./title"/>
                                            <description
                                                jcr:primaryType="nt:unstructured"
                                                sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
                                                fieldLabel="Description"
                                                name="./description"/>
                                        </items>
                                    </column>
                                </items>
                            </columns>
                        </items>
                    </settings>
                    <!-- Accessibility Tab -->
                    <accessibility
                        jcr:primaryType="nt:unstructured"
                        jcr:title="Accessibility"
                        sling:resourceType="granite/ui/components/coral/foundation/container"
                        margin="{Boolean}true">
                        <items jcr:primaryType="nt:unstructured">
                            <columns
                                jcr:primaryType="nt:unstructured"
                                sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                                margin="{Boolean}true">
                                <items jcr:primaryType="nt:unstructured">
                                    <column
                                        jcr:primaryType="nt:unstructured"
                                        sling:resourceType="granite/ui/components/coral/foundation/container">
                                        <items jcr:primaryType="nt:unstructured">
                                            <!-- REPLACE: Add your accessibility fields here -->
                                            <accessibilityLabel
                                                jcr:primaryType="nt:unstructured"
                                                sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                                                fieldLabel="Accessibility Label"
                                                name="./accessibilityLabel"/>
                                        </items>
                                    </column>
                                </items>
                            </columns>
                        </items>
                    </accessibility>
                </items>
            </tabs>
        </items>
    </content>
</jcr:root>
```

## Adding Dialog Fields

### Textfield

```xml
<fieldName
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="Field Label"
    name="./fieldName"
    required="{Boolean}true"/>
```

### Textarea

```xml
<fieldName
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
    fieldLabel="Field Label"
    name="./fieldName"/>
```

### Select / Dropdown

```xml
<fieldName
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/select"
    fieldLabel="Field Label"
    name="./fieldName">
    <items jcr:primaryType="nt:unstructured">
        <option1 jcr:primaryType="nt:unstructured" text="Option 1" value="option1"/>
        <option2 jcr:primaryType="nt:unstructured" text="Option 2" value="option2"/>
    </items>
</fieldName>
```

### Checkbox

```xml
<fieldName
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
    text="Checkbox Label"
    name="./fieldName"
    value="{Boolean}true"/>
```

### Pathfield (Asset/Page Picker)

```xml
<fieldName
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
    fieldLabel="Field Label"
    name="./fieldName"
    rootPath="/content/dam"/>
```

### Multifield

```xml
<fieldName
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
    composite="{Boolean}true"
    fieldLabel="Items">
    <field
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/container"
        name="./fieldName">
        <items jcr:primaryType="nt:unstructured">
            <!-- Add fields inside the multifield here -->
        </items>
    </field>
</fieldName>
```

## Template `_cq_template/.content.xml`

Empty template (no child components):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    sling:resourceType="digitalxn/base/components/{component-name}/{version}/{component-name}"/>
```

## Edit Config `_cq_editConfig.xml`

Minimal (inheriting from super type):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    cq:inherit="{Boolean}true"
    jcr:primaryType="cq:EditConfig"/>
```

## Clientlib `.content.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    allowProxy="{Boolean}true"
    categories="[digitalxn.components.{component-name}]"
    cssProcessor="[default:none,min:none]"/>
```

Note: `dependencies` (e.g., `@netcentric/component-loader`) and `jsProcessor="[default:none,min:none]"` are only added when the component has JS (via `--with-js`).

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Component folder | `dxn-{name}` | `dxn-teaser` |
| HTL file | `dxn-{name}.html` | `dxn-teaser.html` |
| CSS bundle | `dxn-{name}.bundle.css` | `dxn-teaser.bundle.css` |
| JS bundle | `dxn-{name}.bundle.js` | `dxn-teaser.bundle.js` |
| Clientlib category | `digitalxn.components.dxn-{name}` | `digitalxn.components.dxn-teaser` |
| Resource type | `digitalxn/base/components/dxn-{name}/{version}/dxn-{name}` | `digitalxn/base/components/dxn-teaser/v1/dxn-teaser` |
| Component group | `DigitalXn General` (default) | — |
