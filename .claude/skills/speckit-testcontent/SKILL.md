---
name: speckit-testcontent
description: Upload block test content to the DA Library via MCP. Uses speckit draft or user-specified HTML.
disable-model-invocation: true
---

# Speckit Test Content → DA Library

Upload block test content to the Document Authoring (DA) Library so authors can insert blocks from the Library sidebar. Uses **da-mcp** (`da_create_source`, `da_update_source`, `da_list_sources`).

## When to Use

- User invokes "speckit-testcontent" or asks to upload block content to DA Library
- After creating/updating a block draft in `drafts/{blockname}.plain.html`

## Prerequisites

- **da-mcp** in `.cursor/mcp.json`
- **org** and **repo** (from user or `git remote -v`)

## Workflow

### 0. Confirm DA library Sheet tabs are closed

**Stop and ask the user** to confirm every **`da.live/sheet#`** tab on **library index** paths in DA for **org/repo** is **closed** (e.g. `docs/library/blocks` or `docs/library/blocks.json` in Sheet view—same sheet—and `docs/library/icons` / `icons.json` if open). An open Sheet with an old grid can **Preview/Save** and overwrite API-updated JSON.

**Do not start step 1** until the user confirms, or explicitly accepts that risk.

*Note:* `da.live/#/…/docs/library/blocks` (**Browse**) is the **folder** of block HTML, not the index sheet; the overwrite risk is **Sheet** sessions, not Browse.

### 1. Resolve source

| User provides | Block name | Draft path |
|---------------|------------|------------|
| File path (e.g. `drafts/embed-instagram.plain.html`) | from filename | user path |
| Block name (e.g. `embed-instagram`) | user input | `drafts/{blockname}.plain.html` |
| Nothing | `basename(FEATURE_DIR)` from `check-prerequisites.sh --json` | `drafts/{blockname}.plain.html` |

If the file does not exist, report and stop.

### 2. Prepare content

Wrap draft content (section divs only) in full document structure:

```html

<body>
  <header></header>
  <main>
    <!-- draft content -->
  </main>
  <footer></footer>
</body>

```

### 3. Resolve org and repo

User input → `git remote -v` (parse origin) → ask user.

### 4. Upload

- Path under `docs/library/blocks/`—match sibling files from `da_list_sources` (often `{blockname}.html`). Public block URLs stay extensionless: `…/docs/library/blocks/{blockname}`.
- If your project uses another content root than **`docs/library/`**, adjust paths.
- `da_create_source` or `da_update_source` with `contentType: "text/html"`

### 5. Update the blocks sheet in DA (`docs/library/blocks.json`)

Authors only see a block in the Library if this sheet lists it. Per [DA Setup Library](https://docs.da.live/administrators/guides/setup-library): `name` and `path` columns; `path` like `https://content.da.live/{org}/{repo}/docs/library/blocks/{blockname}`.

1. `da_get_source` → path `docs/library/blocks.json` (sheet JSON: `data` array of `{ name, path }`, plus `:type`, `:sheetname`, pagination — **preserve** when updating).
2. If a row already exists for the same `path` (or slug), skip or rename only if the user asked.
3. Else append `{ "name": "<Display Name>", "path": "<block URL>" }` to `data`:
   - `name`: draft `h1` (strip trailing “ Block” if redundant) or Title Case of block slug.
4. Sort `data` by `name` ascending, **case-insensitive** (`localeCompare` / `sensitivity: 'base'`).
5. `da_update_source` → path `docs/library/blocks.json`, body = stringified JSON, `contentType: "application/json"`.

If `da_get_source` / `da_update_source` fails, report the row for **manual** add in DA and still finish the block document upload.

### 6. Report

End every successful run with a **Resources** summary: a markdown **table** listing **every DA file touched** (block HTML and, when updated, `blocks.json`). Include **all** of the following link columns when URLs are known (prefer values from MCP tool responses: `source.contentUrl`, `source.editUrl`, `aem.previewUrl`, `aem.liveUrl`; if any are missing, construct from `{org}`, `{repo}`, `{blockname}`, and repo paths—AEM host pattern is typically `https://main--{repo}--{org}.aem.page` and `.aem.live`, with the same path suffix as the document, e.g. `/docs/library/blocks/{blockname}` and `/docs/library/blocks.json`).

| Column | Meaning |
|--------|---------|
| **Content** | `content.da.live` (canonical document / JSON) |
| **Edit (DA)** | `da.live/edit#/…` |
| **Preview (AEM)** | `*.aem.page` |
| **Live (AEM)** | `*.aem.live` |

One table row per resource (e.g. block + `blocks.json`). After the table, add:

- **Repo paths** (logical): `docs/library/blocks/{blockname}.html`, and `docs/library/blocks.json` if updated
- **Local draft** used as source: `drafts/{blockname}.plain.html`
- Whether the blocks sheet was updated in DA or only noted for **manual** row (with reason)
- **Authors:** verify `https://content.da.live/{org}/{repo}/docs/library/blocks.json` matches expectations. [Sheets](https://docs.da.live/authors/guides/editing-sheets): open the index in a **new** `da.live/sheet#` tab if needed; **Preview** only once the grid matches `content.da.live` (preview persists the sheet).

## Validation

- [ ] **§0:** User confirmed library **Sheet** tabs closed or accepted risk
- [ ] Draft exists; org/repo resolved; content wrapped
- [ ] Block document uploaded; blocks sheet in DA updated or manual row noted; `data` sorted by `name` (case-insensitive)
- [ ] **§6 Resources table** with Content / Edit / Preview / Live links for each created or updated DA file, plus repo paths and local draft path
- [ ] Short author note (verify `content.da.live`; new Sheet tab + Preview if editing the grid)
