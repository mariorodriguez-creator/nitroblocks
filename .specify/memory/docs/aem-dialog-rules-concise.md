# AEM Dialog Rules (Concise)

Apply when creating or editing `_cq_dialog/.content.xml`. Validation reports use **DLG-0** / **DLG-Coral3** for Coral violations and **DLG-1** … **DLG-18** for section topics. Full reference: `.cursor/rules/frontend/aem-dialog-rules.mdc`.

---

## Coral 3 only (DLG-0 / DLG-Coral3)

- **Use:** `granite/ui/components/coral/foundation/*` and `granite/ui/components/coral/foundation/form/*`.
- **Do not use:** `granite/ui/components/foundation/*` (no `coral` in path).
- **Allowed exceptions:** `cq/gui/components/authoring/dialog/*`, `cq/gui/components/coral/common/*`.

---

## Root and content (DLG-1, DLG-2)

- **Root:** `jcr:primaryType="nt:unstructured"`, `jcr:title` (component name), `sling:resourceType="cq/gui/components/authoring/dialog"`, `extraClientlibs="[lib1,lib2]"`.
- **Namespaces (required):** `xmlns:sling`, `xmlns:granite`, `xmlns:cq`, `xmlns:jcr`, `xmlns:nt` on root.
- **Content:** One child `<content>` with `sling:resourceType="granite/ui/components/coral/foundation/container"` and `<items jcr:primaryType="nt:unstructured">` for tabs.

Minimal skeleton:

```xml
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:granite="http://www.adobe.com/jcr/granite/1.0"
  xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
  jcr:primaryType="nt:unstructured" jcr:title="Component Name"
  sling:resourceType="cq/gui/components/authoring/dialog" extraClientlibs="[digitalxn.author.components.dxn-foo]">
  <content jcr:primaryType="nt:unstructured" sling:resourceType="granite/ui/components/coral/foundation/container">
    <items jcr:primaryType="nt:unstructured">
      <tabs ...><items>...</items></tabs>
    </items>
  </content>
</jcr:root>
```

---

## Typed parameters (DLG-2)

- **Booleans:** Use `{Boolean}true` / `{Boolean}false` for `required`, `value` (checkbox), `margin`, `maximized`, `composite`, `allowUpload`, `deleteHint`, etc. Never unquoted or `"true"`/`"false"`.
- **Strings with `{` or `}`:** Use `value="{String}..."` so literals (e.g. placeholders `{days}`, `{hours}`) are stored correctly.

```xml
required="{Boolean}true"  value="{Boolean}true"  value="{String}{days} days {hours} hours"
```

---

## Tabs (DLG-3)

- **Default:** Direct nesting. Tab content = `<tabName><items><fieldGroup>...</fieldGroup></items></tabName>`. Do **not** wrap tab content in `<columns>`/`<column>` unless you need side-by-side layout.
- **Tabs node:** `sling:resourceType="granite/ui/components/coral/foundation/tabs"`, `maximized="{Boolean}true"`.
- **Tab containers:** `sling:resourceType="granite/ui/components/coral/foundation/container"`, `margin="{Boolean}true"`.
- **Standard tab node names:** `actions`, `text`, `image` or `asset`, `settings`, `extraStyles`.

---

## Fields (DLG-4)

- **Textfield:** `granite/ui/components/coral/foundation/form/textfield`; `name="./prop"`; `required="{Boolean}true"`; use `value="{String}..."` when default contains `{`/`}`.
- **Checkbox:** `granite/ui/components/coral/foundation/form/checkbox`; `value="{Boolean}true"`, `uncheckedValue` as needed (e.g. `_self`/`_blank` for link target).
- **Select:** `granite/ui/components/coral/foundation/form/select`; options under `<items>` with `text` and `value`.
- **RTE (DXN):** `sling:resourceType="cq/gui/components/authoring/dialog/richtext"`; `externalStyleSheets="[/bin/digitalxn/theme/variables.css,/apps/digitalxn/base/clientlibs/author/rte/rte.bundle.css]"`; child nodes `rtePlugins` and `uiSettings` with `sling:resourceSuperType="digitalxn/base/components/shared/rteConfigs/basic/rtePlugins"` and `sling:resourceSuperType="digitalxn/base/components/shared/rteConfigs/basic/uiSettings"` respectively; `removeSingleParagraphContainer="{Boolean}true"`, `useFixedInlineToolbar="{Boolean}true"`.
- **File upload:** `cq/gui/components/authoring/dialog/fileupload`; `fileNameParameter`, `fileReferenceParameter` (e.g. `./fileName`, `./fileReference`); `allowUpload="{Boolean}false"`; `mimeTypes="[image/gif,image/jpeg,image/png,image/tiff,image/svg+xml]"`; `class="cq-droptarget"`.
- **Link (page):** `cq/gui/components/coral/common/form/pagefield`; `rootPath="/content"`; `name="link"` (no `./` in composite contexts).
- **Multifield:** `granite/ui/components/coral/foundation/form/multifield` with `composite="{Boolean}true"`; inner `<field>` with `sling:resourceType="granite/ui/components/coral/foundation/container"`, `layout="fixed"`, `name="./actions"` (or equivalent). Item fields inside composite use relative names (e.g. `name="text"`) not `./`.

---

## Layout (DLG-5)

- **Columns:** Use only for side-by-side layout (e.g. desktop vs mobile image). `granite/ui/components/coral/foundation/fixedcolumns` with `<column>` children (each `granite/ui/components/coral/foundation/container`).
- **Grouping:** Use `granite/ui/components/coral/foundation/well` with `<items>` for related fields.

---

## Image and accessibility (DLG-7)

- For image tabs with desktop/mobile: use columns; desktop column + mobile column (e.g. well with `mobileAssetNote` + file + accessibility group). Use separate `fileNameParameter`/`fileReferenceParameter`/`name` for mobile (e.g. `./fileMobile`, `./fileNameMobile`, `./fileReferenceMobile`).
- **Always** include: (1) well with `alt` (textfield, `fieldLabel="Alternative text for accessibility"`) and `altValueFromDAM` (checkbox, `value="{Boolean}true"`, `uncheckedValue="false"`); (2) `decorative` checkbox (`./isDecorative`, "Don't provide an alternative text").

---

## Design and integration (DLG-9, 11–14)

- **Design-aware visibility:** `granite:hide="${cqDesign.propertyName}"` on section or field.
- **Author CSS/JS:** `granite:class="cmp-component__editor-..."`; `granite:data` child for JS hooks (e.g. `cmp-teaser-v2-dialog-edit-hook="actionLink"`).
- **extraStyles tab:** Use include: `sling:resourceType="granite/ui/components/coral/foundation/include"`, `path="/apps/digitalxn/base/components/shared/authoring/dialog/extra_style/tab_edit/extrastyletab"`.
- **Core link (complex):** `granite/ui/components/coral/foundation/include` with `path="/mnt/overlay/core/wcm/components/commons/editor/dialog/link/v1/link/edit/link"` when needed.

**Clientlibs (root):** `extraClientlibs="[digitalxn.author.components.[component-name],core.wcm.components.image.v3.editor,...]"` — only what the dialog needs (e.g. image editor, page thumbnail).

---

## Naming and file (DLG-15, 16)

- JCR node names: **camelCase** (e.g. `titleGroup`, `alternativeGroup`, `desktopAssetNote`). Property paths: `./` prefix (e.g. `./titleFromLinkedPage`).
- Dialog file: `_cq_dialog/.content.xml`, UTF-8.

---

## Validation reference (for agents)

| ID | Topic |
|----|--------|
| DLG-0 / DLG-Coral3 | Coral 3 only; no foundation without coral |
| DLG-1 | Dialog structure (root, content, items) |
| DLG-2 | Root config, typed parameters |
| DLG-3 | Tab organization, direct nesting, no default columns |
| DLG-4 | Form field types and usage |
| DLG-5 | Field grouping, well, columns only when needed |
| DLG-6 | Multifield (composite, field, item names) |
| DLG-7 | Image/asset, desktop+mobile, accessibility (alt, altValueFromDAM, decorative) |
| DLG-8 | Link (pagefield, include) |
| DLG-9 | Design integration (granite:hide, design props) |
| DLG-10 | Validation/constraints (required, validation, mimeTypes) |
| DLG-11 | Client libraries |
| DLG-12 | CSS classes (granite:class) |
| DLG-13 | Data attributes (granite:data) |
| DLG-14 | Include components (extraStyles, shared) |
| DLG-15 | Naming (camelCase, ./ paths) |
| DLG-16 | File location and naming |
| DLG-17 | Best practices (fold into rules above) |
| DLG-18 | Common patterns (direct nesting, image tab, actions) |
