<!--
  AGENT INSTRUCTIONS — Edge Delivery block authoring guides (Speckit and manual).
  Do not copy this comment block into the author-facing README. Deliver clean Markdown only: strip every `<!-- ... -->` from output files.

  Output paths:
  - Preferred: `blocks/{block-name}/README.md`
  - Alternate: `.specify/memory/components/authoring-guides/{name}.md` (multi-block features or team policy)

  Pick authoring surface in **Authoring** (check the repo):
  - **Sidekick Library** — if `tools/sidekick/library.html` (or project equivalent) exists; see https://github.com/adobe/franklin-sidekick-library
  - **Document Authoring (DA) Library** — if the team uses DA; see https://docs.da.live/administrators/guides/setup-library
  - **Generic doc** — block table in Word/Google Docs/SharePoint; https://www.aem.live/developer/markup-sections-blocks

  **Mermaid** (only if you add diagrams): no HTML in node labels (`<br/>`, `<b>`, `<i>`, etc.); plain text and line breaks in labels only.

  **Tone / scope**: author-facing wording; avoid implementation file names in body text except optional **Testing** paths/URLs for QA. Skip performance and “future enhancements” unless the spec requires it. Document options, errors, and troubleshooting briefly when authors need them.

  **Cross-references**: Link related blocks or guides when helpful.

  Non-Speckit doc polish (optional read): `.claude/skills/eds-documentation/SKILL.md`
-->

# [BLOCK_DISPLAY_NAME] Block – Authoring Guide

<!-- [BLOCK_DISPLAY_NAME]: Human-friendly title (from spec or block purpose). Example: "Embed Instagram". -->

[INTRO_PARAGRAPH]
<!-- One or two sentences: what the block does for visitors and authors. No JavaScript or implementation file names. -->

---

## Overview

[BULK_OVERVIEW]
<!-- Short paragraph expanding purpose, typical placement, and what authors control vs what is automatic. -->

## Block Details

| Item | Value |
|------|--------|
| **Block name (table)** | `[block-name]` |
<!-- Lowercase hyphenated name as it appears in the first cell of the block table, e.g. embed-instagram. -->
| **Files** | `blocks/[block-name]/[block-name].js`, `blocks/[block-name]/[block-name].css` |
| **Content summary** | [CONTENT_MODEL_SUMMARY]
<!-- One line: what rows/cells represent (e.g. "One row per card; columns for image, title, link."). -->

[SCREENSHOT]
<!-- Optional. Markdown image, or "Screenshot to be added after preview." Use author-visible UI or published page, not code. -->

---

## Content Model

<!-- Authors use a block table in Word/Google Docs, SharePoint, or Document Authoring. Max 4 cells per row where applicable; follow project conventions. See https://www.aem.live/developer/markup-sections-blocks -->

[CONTENT_MODEL_TABLE]
<!--
  Replace with a markdown table:

  | Cell / column | Content | Required |
  |---------------|---------|----------|
  | … | … | yes/no |

  Describe header row vs data rows, repeating rows, and any metadata row patterns from data-model.md or spec.
-->

---

## Authoring

[AUTHORING_STEPS]
<!--
  Numbered steps for this project’s surface:

  - Sidekick Library: how to insert from library (if tools/sidekick/library.html exists).
  - DA Library: how to insert from DA (if used).
  - Else: how to add a block table with the correct block name in the first row and fill cells.

  Use "Authors add…", "In the first row…". Block options / variants go in parentheses on the same line as the block name where applicable (e.g. Columns (wide)).
-->

[SECTION_METADATA_NOTES]
<!-- Optional. If the block relies on Section Metadata or section-level styles, describe how authors set them. If none, delete this subsection or write "None.". -->

---

## Variants

[VARIANTS]
<!--
  List each variant (block options in parentheses → CSS class). Table or bullets.

  Example: | Option (authoring) | Effect |
  
  If no variants: "No block options; styling is fixed."
-->

---

## Accessibility

[ACCESSIBILITY]
<!--
  Author-facing: required alt text, visible labels, link behavior. No ARIA implementation detail unless it helps authors (e.g. "Do not remove heading in first cell — it becomes the accessible name").
-->

---

## Testing

[TESTING]
<!--
  Draft paths, preview URLs (`https://{branch}--{repo}--{owner}.aem.page/...`), or CMS paths QA should use. Optional short note for developers: keeper tests, lint — keep minimal and separate from author steps if needed.
-->

---

## Use cases

[USE_CASES]
<!-- When to use this block vs default content or another block. When not to use it. One or two short paragraphs. -->

---

## Prerequisites

[PREREQUISITES]
<!-- Assets, placeholders, external accounts, or "None beyond a normal edit surface and publish/preview access." -->
