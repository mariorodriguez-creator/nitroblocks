---
name: aem-dialog
description: AEM component dialog and policy creation. Trigger when creating or editing _cq_dialog/.content.xml, adding Coral UI fields, configuring component policies in /apps or /conf, or assigning policies to templates.
---

# AEM Dialog & Policy Rules

## Coral 3 Only (DLG-0)

**CRITICAL:** Use `granite/ui/components/coral/foundation/*` only. Never use `granite/ui/components/foundation/*` (no `coral` in path).

Allowed exceptions: `cq/gui/components/authoring/dialog/*`, `cq/gui/components/coral/common/*`.

## Dialog Root Structure (DLG-1, DLG-2)

Required namespaces on root: `xmlns:sling`, `xmlns:granite`, `xmlns:cq`, `xmlns:jcr`, `xmlns:nt`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          xmlns:granite="http://www.adobe.com/jcr/granite/1.0"
          xmlns:cq="http://www.day.com/jcr/cq/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="Component Name"
    sling:resourceType="cq/gui/components/authoring/dialog"
    extraClientlibs="[digitalxn.author.components.dxn-component]">
    <content jcr:primaryType="nt:unstructured"
             sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <!-- tabs or content -->
        </items>
    </content>
</jcr:root>
```

## Typed Parameters (DLG-2)

| Type | Syntax | Example |
|------|--------|---------|
| Boolean | `{Boolean}true` / `{Boolean}false` | `required="{Boolean}true"` |
| String with `{`/`}` | `{String}value` | `value="{String}{days} days {hours} hours"` |

Never use unquoted `true`/`false` or `"true"`/`"false"` for booleans. Use `{String}...` when default values contain curly braces.

## Tab Structure (DLG-3)

**Default: direct nesting — NO column wrappers around tab content.**

```xml
<tabs jcr:primaryType="nt:unstructured"
      sling:resourceType="granite/ui/components/coral/foundation/tabs"
      maximized="{Boolean}true">
    <items jcr:primaryType="nt:unstructured">
        <settings jcr:primaryType="nt:unstructured"
                  jcr:title="Settings"
                  sling:resourceType="granite/ui/components/coral/foundation/container"
                  margin="{Boolean}true">
            <items jcr:primaryType="nt:unstructured">
                <!-- Fields go directly here — NO columns wrapper -->
                <fieldGroup sling:resourceType="granite/ui/components/coral/foundation/well">
                    <items jcr:primaryType="nt:unstructured">
                        <field1 ... />
                    </items>
                </fieldGroup>
            </items>
        </settings>
    </items>
</tabs>
```

Standard tab node names: `actions` (links/CTAs), `text` (content), `image`/`asset` (media), `settings`, `extraStyles`.

Only use `<columns>/<column>` for side-by-side layout (e.g., desktop vs. mobile image). Most tabs do NOT need columns.

## Field Types (DLG-4)

**Textfield:**
```xml
<fieldName jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="Label" fieldDescription="Help text"
    name="./fieldName" required="{Boolean}true"/>
```
Use `value="{String}default text"` when default contains `{` or `}`.

**Checkbox:**
```xml
<checkboxField jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
    name="./checkboxField" text="Label"
    value="{Boolean}true" uncheckedValue="false"/>
```
For link target: `value="_blank"`, `uncheckedValue="_self"`.

**Select:**
```xml
<style jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/select"
    fieldLabel="Style" name="./style">
    <items jcr:primaryType="nt:unstructured">
        <default jcr:primaryType="nt:unstructured" text="Default" value=""/>
        <primary jcr:primaryType="nt:unstructured" text="Primary" value="primary-class"/>
    </items>
</style>
```

**RTE:**
```xml
<title jcr:primaryType="nt:unstructured"
    sling:resourceType="cq/gui/components/authoring/dialog/richtext"
    externalStyleSheets="[/bin/digitalxn/theme/variables.css,/apps/digitalxn/base/clientlibs/author/rte/rte.bundle.css]"
    fieldLabel="Title" name="./title"
    removeSingleParagraphContainer="{Boolean}true"
    useFixedInlineToolbar="{Boolean}true">
    <rtePlugins jcr:primaryType="nt:unstructured"
        sling:resourceSuperType="digitalxn/base/components/shared/rteConfigs/basic/rtePlugins"/>
    <uiSettings jcr:primaryType="nt:unstructured"
        sling:resourceSuperType="digitalxn/base/components/shared/rteConfigs/basic/uiSettings"/>
</title>
```

**File upload:**
```xml
<file jcr:primaryType="nt:unstructured"
    sling:resourceType="cq/gui/components/authoring/dialog/fileupload"
    allowUpload="{Boolean}false" class="cq-droptarget"
    fileNameParameter="./fileName" fileReferenceParameter="./fileReference"
    mimeTypes="[image/gif,image/jpeg,image/png,image/tiff,image/svg+xml]"
    name="./file" required="true"/>
```

**Page field (link):**
```xml
<link jcr:primaryType="nt:unstructured"
    sling:resourceType="cq/gui/components/coral/common/form/pagefield"
    emptyText="Link" name="link" required="{Boolean}true" rootPath="/content"/>
```
In composite multifield contexts, `name` has no `./` prefix.

**Multifield:**
```xml
<actions jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
    composite="{Boolean}true" fieldLabel="Call-to-actions">
    <field jcr:primaryType="nt:unstructured"
           sling:resourceType="granite/ui/components/coral/foundation/container"
           layout="fixed" name="./actions">
        <items jcr:primaryType="nt:unstructured">
            <!-- Item fields: use relative names without ./ in composite -->
        </items>
    </field>
</actions>
```

## Image Tab Pattern (DLG-7)

Always include `alt`, `altValueFromDAM`, and `decorative` fields for images:

```xml
<alternativeGroup sling:resourceType="granite/ui/components/coral/foundation/well">
    <items jcr:primaryType="nt:unstructured">
        <alt sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
             fieldLabel="Alternative text for accessibility" name="./alt"/>
        <altValueFromDAM sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
             name="./altValueFromDAM" text="Inherit from description of asset"
             value="{Boolean}true" uncheckedValue="false"/>
    </items>
</alternativeGroup>
<decorative sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
    name="./isDecorative" text="Don't provide an alternative text"
    value="{Boolean}true" uncheckedValue="false"/>
```

For desktop + mobile images: use `fixedcolumns` with two columns; use separate `fileNameParameter`/`fileReferenceParameter`/`name` for each (e.g. `./fileNameMobile`, `./fileReferenceMobile`, `./fileMobile`).

## Naming (DLG-15)

- Node names: camelCase (e.g., `titleGroup`, `alternativeGroup`)
- Property names: camelCase with `./` prefix (e.g., `./titleFromLinkedPage`)
- File location: `_cq_dialog/.content.xml` in the component folder

## Validation Reference

Rule IDs: **DLG-0/DLG-Coral3** (Coral 2 usage), **DLG-1** (structure), **DLG-2** (typed parameters), **DLG-3** (tab/column misuse), **DLG-4** (field types), **DLG-7** (image accessibility).

---

# AEM Component Policies

Four-step workflow for policy configuration.

## 1. Define the Policy (`/apps`)

Location: `digitalxn-aem-templates/.../apps/digitalxn/settings/wcm/policies/.content.xml`

```xml
<dxn-component jcr:primaryType="nt:unstructured">
    <v1 jcr:primaryType="nt:unstructured">
        <dxn-component jcr:primaryType="nt:unstructured">
            <component-policy
                jcr:primaryType="nt:unstructured"
                jcr:title="DigitalXn Component Policy"
                sling:resourceType="wcm/core/components/policy/policy">
                <cq:styleGroups jcr:primaryType="nt:unstructured">
                    <item0 cq:styleGroupLabel="Spacing Bottom" jcr:primaryType="nt:unstructured">
                        <cq:styles jcr:primaryType="nt:unstructured">
                            <item0 cq:styleClasses="dxn-space--largeBottom"
                                   cq:styleId="dxn-space--largeBottom"
                                   cq:styleLabel="Large Bottom"
                                   jcr:primaryType="nt:unstructured"/>
                        </cq:styles>
                    </item0>
                </cq:styleGroups>
            </component-policy>
        </dxn-component>
    </v1>
</dxn-component>
```

## 2. Enable for Templates (`/conf`)

Location: `digitalxn-aem-templates/.../conf/digitalxn/settings/wcm/policies/.content.xml`

```xml
<dxn-component jcr:primaryType="nt:unstructured">
    <v1 jcr:primaryType="nt:unstructured">
        <dxn-component jcr:primaryType="nt:unstructured" mergeList="true"/>
    </v1>
</dxn-component>
```

## 3. Assign in Template

Location: `.../conf/digitalxn/settings/wcm/templates/<template-name>/policies/.content.xml`

```xml
<dxn-component
    cq:policy="digitalxn/base/components/dxn-component/v1/dxn-component/component-policy"
    jcr:primaryType="nt:unstructured"
    sling:resourceType="wcm/core/components/policies/mapping"/>
```

## 4. Add to filter.xml

```xml
<include pattern="/conf/digitalxn/settings/wcm/policies/digitalxn/base/components/dxn-component"/>
<include pattern="/conf/digitalxn/settings/wcm/policies/digitalxn/base/components/dxn-component/v1"/>
<include pattern="/conf/digitalxn/settings/wcm/policies/digitalxn/base/components/dxn-component/v1/dxn-component"/>
```

## 5. Style System Tab (when policy has cq:styleGroups)

When the component policy defines `cq:styleGroups`, the edit dialog MUST include the Style System tab so authors can select styles. Add inside `<tabs><items>`:

```xml
<styletab
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/include"
    path="/mnt/overlay/cq/gui/components/authoring/dialog/style/tab_edit/styletab"/>
```

Without this, authors cannot access the styles defined in the policy.
