---
name: speckit-da-upload
description: Upload a speckit block's draft HTML to the DA Library and register it in blocks.json. Atomic skill — invoke manually after speckit-fast (or any pipeline that produced a local draft HTML file). Reads drafts/{blockname}.plain.html, wraps it, uploads to DA, and updates blocks.json. Explicit invocation only.
---
# Speckit DA Upload

Uploads a completed block's draft HTML to the DA Library and registers it in `blocks.json`. Run this after `speckit-fast` (or any pipeline that produced a local `.plain.html` draft).

## Pre-conditions

1. `drafts/{blockname}.plain.html` must exist on disk.
2. The DA MCP server (`da-mcp` or `project-*-da-mcp`) must be reachable — this skill will verify that before attempting any upload.
3. The block name is taken from the file name of the `.plain.html` file (e.g. `drafts/countdown.plain.html` → blockname `countdown`). If the caller provides an explicit block name, use that instead.

## Input Resolution

Run these in parallel at skill start:

**A — Resolve block name**

If the user supplied a block name explicitly, use it. Otherwise, look for `.plain.html` files under `drafts/`:

```bash
ls drafts/*.plain.html 2>/dev/null
```

- If exactly one match: derive blockname from file name.
- If multiple matches: list them and ask the user which one to upload.
- If none: abort with:

```
ERROR: No drafts/{blockname}.plain.html found.
Run speckit-fast first, or provide the path to an existing .plain.html file.
```

**B — Resolve org/repo**

```bash
git remote -v
```

Parse `origin` to extract `{org}` and `{repo}`. Store for URL construction. Abort with a clear message if parsing fails.

**C — Check DA MCP availability**

List the MCP tools directory (or attempt a lightweight DA MCP call) to confirm the server is reachable. If unavailable, abort with:

```
ERROR: DA MCP server not reachable.
Ensure the DA MCP server (da-mcp or project-*-da-mcp) is configured and running.
Local draft HTML is available at: drafts/{blockname}.plain.html
```

## Steps

### Step 1 — Read draft HTML

Read `drafts/{blockname}.plain.html`. Confirm it contains at least one `<div>` element. If the file is empty or missing, abort with a clear message.

### Step 2 — Wrap for DA

Wrap the section content (the full file contents) in a DA-compatible document structure:

```html
<body>
  <header></header>
  <main>
    <!-- draft content here -->
  </main>
  <footer></footer>
</body>
```

### Step 3 — Upload to DA Library

- Tool: `da_create_source` (first attempt) or `da_update_source` (if path already exists)
- Path: `docs/library/blocks/{blockname}.html`
- `contentType`: `"text/html"`

If upload fails: warn, note local HTML as fallback, proceed to Step 5 (skip Step 4).

### Step 4 — Register in blocks.json

1. `da_get_source` → path `docs/library/blocks.json`
2. Parse the JSON. If a row already exists whose `path` ends with `/{blockname}`, skip and note "already registered".
3. Otherwise append:

   ```json
   { "name": "<Display Name>", "path": "https://content.da.live/{org}/{repo}/docs/library/blocks/{blockname}" }
   ```

   Display name: title-case the blockname, replacing hyphens with spaces (e.g. `countdown` → `Countdown`, `hero-banner` → `Hero Banner`).
4. Sort `data` by `name` ascending, case-insensitive.
5. `da_update_source` → `docs/library/blocks.json`, `contentType: "application/json"`
6. If update fails: warn, provide manual instructions.

### Step 5 — Summary

Print a summary table:

| Resource    | Content (DA)         | Edit (DA)             | Preview (AEM)         | Live (AEM)            |
|-------------|----------------------|-----------------------|-----------------------|-----------------------|
| Block HTML  | `https://content.da.live/{org}/{repo}/docs/library/blocks/{blockname}.html` | `https://da.live/edit#/{org}/{repo}/docs/library/blocks/{blockname}` | `https://main--{repo}--{org}.aem.page/docs/library/blocks/{blockname}` | `https://main--{repo}--{org}.aem.live/docs/library/blocks/{blockname}` |
| blocks.json | `https://content.da.live/{org}/{repo}/docs/library/blocks.json` | `https://da.live/edit#/{org}/{repo}/docs/library/blocks` | — | — |

Then print:

```markdown
## DA Upload Complete

- **Block**: {blockname}
- **DA Library path**: docs/library/blocks/{blockname}.html
- **blocks.json**: updated (or manual action required — see warnings)

### Warnings
[List any non-blocking issues]

### Next Steps
- Open the DA edit link above to preview the block in the DA Library sidebar
- Run /speckit-validate for full production validation before opening a PR
```

## Key Rules

- Never modify `scripts/aem.js`
- DA upload failure is non-blocking — local HTML at `drafts/{blockname}.plain.html` is always the fallback
- Do not re-run any speckit pipeline phases — this skill is upload-only
- If `blocks.json` does not exist yet, create it with the standard structure:

  ```json
  {
    "total": 1,
    "offset": 0,
    "limit": 1,
    "data": [
      { "name": "<Display Name>", "path": "https://content.da.live/{org}/{repo}/docs/library/blocks/{blockname}" }
    ],
    ":type": "sheet"
  }
  ```
