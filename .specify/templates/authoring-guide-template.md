# [COMPONENT_TITLE] Component – Authoring Guide
<!-- From .content.xml jcr:title. Use the same title consistently in Overview and body. -->

[INTRO_PARAGRAPH]
<!-- One or two sentences: what the component does and for whom. End with: "This guide explains how to add and configure the component in AEM." -->

---

## Overview

| Property | Value |
|----------|--------|
| **Component name** | [COMPONENT_TITLE] |
| **Component group** | [COMPONENT_GROUP] |
| **Description** | [COMPONENT_DESCRIPTION] |
<!-- [COMPONENT_GROUP]: From .content.xml componentGroup (e.g. DigitalXn General). -->
<!-- [COMPONENT_DESCRIPTION]: One short sentence for the table; optional—omit the row if not needed. -->

## User Interface

[SCREENSHOT]
<!-- Screenshot: Markdown image line if the spec or implementation has a component image; otherwise use "Screenshot to be added." -->

## Functionality

[BEHAVIOUR]
<!-- Bullet list of what the component renders and key author-configurable behaviour. Include: main output, optional features (e.g. variations, styles, inheritance), accessibility or config notes. -->

## Prerequisites

[PREREQUISITES]
<!-- Short list of what authors need (e.g. DAM assets, CAC config), or "None. Required fields are indicated in the dialog." -->

---

## Adding the Component

[ADDING_STEPS]
<!-- Numbered steps: open page in Edit mode → Component browser → [COMPONENT_GROUP] → drag [COMPONENT_TITLE] onto page. Adjust if the component is added differently. -->

---

## Configuring the Component

[DIALOG_INTRO]
<!-- One sentence: "Double-click the component, use the Configure (wrench) icon, or find the component on the component tree side panel to open the dialog. The dialog has N tabs: Tab1, Tab2, …." -->

[TABS_AND_FIELDS]
<!-- For each dialog tab (from _cq_dialog): "### Tab name" then a table: Field | Description | Required. Use fieldLabel, fieldDescription, and required from the dialog. For multifields, describe the structure. For tabs that only apply in certain conditions, add one line (e.g. "This tab is relevant when…"). Preserve tab order. -->

[STYLES_SECTION]
<!--
  Choose ONE of the following according to whether the component has policy-defined styles:

  A) Component has NO or only minimal Styles tab:
     Use a single short paragraph, e.g.:
     "The Styles tab (if present) is provided by the AEM Style System. Options depend on template policy."

  B) Component HAS many style groups / layout variants:
     Add a "### Styles" subsection here that briefly states that options depend on template policy (and brand/site if relevant), then add a separate top-level section below (after "---" and before "Where the Component Can Be Used") titled "## Styles and layouts (reference)" containing [STYLE_GROUPS_AND_OPTIONS].
-->

---

[STYLES_AND_LAYOUTS_REFERENCE]
<!--
  ONLY when the component has many policy-defined style groups:
  Add "## Styles and layouts (reference)" with intro sentence that which options appear depends on template/brand.
  Then for each style group from the policy (cq:styleGroupLabel), add a "### Group name" and a table of style labels and short descriptions (cq:styleLabel). You MUST use "Style label | Description" table. For description, inspect related CSS code and thoroughly describe layout and features. 
  Some styles might be prefixed with brand (velo, dxn, glo, vuse...). Create brand titled subtables for those, with the same columns.
  DON'T group multiple styles into the same rows.
  When the component has NO such styles, omit this entire section (leave placeholder empty or remove it).
-->

[VARIATION_SECTIONS]
<!-- Optional. If the component has named usage variations (e.g. a distinct "mode" with its own steps), add "## [Variation name]" with a short summary and numbered steps. Otherwise omit this block. -->

---

## Where the Component Can Be Used

[WHERE_USED]
<!-- One or two sentences: the component is available on templates that include it in their policy mapping; if authors do not see it in the component browser, the page template may not allow it in that location. Optionally name example templates (e.g. content page, column control). -->

---

## Use cases

[USE_CASES]
<!-- What this component is best suited for from a marketer’s perspective, and when it is not suitable. One or two short paragraphs. -->
