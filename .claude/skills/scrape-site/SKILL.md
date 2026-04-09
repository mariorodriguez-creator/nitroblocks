---
name: scrape-site
description: Create a fully functional offline copy of a website — all pages, CSS, JavaScript, images, fonts, and other assets downloaded and URL-rewritten to work without a server. Includes visual screenshot diff validation against the live site. Use when asked to mirror a site, create an offline copy, download a full website, or archive a site locally.
---

# Scrape Site (Offline Mirror + Validation)

## Step 1 — Ask before running

**ALWAYS ask the user these questions before executing any script.** Use the `AskQuestion` tool when available; otherwise ask conversationally. Do not assume defaults — the wrong settings on a large site waste significant time.

```
Questions to ask (AskQuestion tool format):

1. id: url
   prompt: "What is the URL of the site to mirror?"
   (skip if the user already provided it in their message)

2. id: scope
   prompt: "How much of the site do you want to capture?"
   options:
     - full:     Full site — crawl everything (may take a long time for large sites)
     - section:  A specific section only (e.g. /docs, /en/products)
     - limited:  First N pages — quick test or partial mirror

3. id: external_assets
   prompt: "Should external assets be included? (fonts, CSS, and images hosted on CDNs like Google Fonts, jsDelivr, etc.)"
   options:
     - yes:  Include external assets — more complete but slower
     - no:   Same-domain only — faster, may have missing fonts/styles

4. id: exclude
   prompt: "Are there any URL patterns to skip? (e.g. /blog, /search, /user-profile)"
   (free text — user can say 'none' or list patterns)

5. id: threshold
   prompt: "How strict should the visual validation be?"
   options:
     - strict:   2% — flag nearly any difference
     - normal:   5% — default, ignores minor rendering noise (recommended)
     - relaxed:  15% — only flag significant differences (good for dynamic content)
```

Once you have answers, **show the user the exact command you are about to run** and confirm before executing.

Example confirmation message:
```
I'll run the following:

  node .claude/skills/scrape-site/scripts/scrape-and-validate.js "https://example.com/docs" \
    --output ./scrape \
    --external-assets \
    --exclude "/blog" \
    --threshold 2

This will mirror the /docs section including CDN assets, then validate each page.
Shall I proceed?
```

---

## Step 2 — Prerequisites (if not already installed)

```bash
cd .claude/skills/scrape-site/scripts && npm install
npx playwright install chromium
```

Check whether node_modules already exists before running:
```bash
ls .claude/skills/scrape-site/scripts/node_modules 2>/dev/null | head -1
```

---

## Step 3 — Run

**Run the script in the background** so it doesn't block the agent window. Use `block_until_ms: 0` when calling the Shell tool so the process is immediately backgrounded.

```bash
node .claude/skills/scrape-site/scripts/scrape-and-validate.js "<url>" [options]
```

**All options:**

| Flag | Phase | Default | Purpose |
|---|---|---|---|
| `--output <dir>` | both | `./scrape` | Root output folder |
| `--max-pages <n>` | mirror | unlimited | Cap on HTML pages to crawl |
| `--exclude <pattern>` | mirror | — | Skip URLs matching regex (repeatable) |
| `--concurrency <n>` | mirror | 3 | Parallel browser tabs during crawl |
| `--external-assets` | mirror | off | Also download assets from CDNs / external domains |
| `--threshold <pct>` | validate | 5 | Pixel diff % to flag as different |
| `--limit <n>` | validate | all | Validate only first n pages |
| `--port <n>` | validate | 4042 | Local server port |
| `--no-mirror` | — | — | Skip mirroring, only re-validate existing mirror |
| `--no-validate` | — | — | Skip validation, mirror only |

**Mapping user answers → flags:**

| Answer | Flag(s) to add |
|---|---|
| scope = section | Use section URL directly: `"https://example.com/docs"` |
| scope = limited | `--max-pages 50` (or whatever limit they specify) |
| external_assets = yes | `--external-assets` |
| threshold = strict | `--threshold 2` |
| threshold = relaxed | `--threshold 15` |
| exclude patterns | `--exclude "/blog" --exclude "\?page="` etc. |

**Monitoring the background job:**

> ⚠️ **NEVER use `sleep` in a Shell tool call to poll** — it blocks the agent window and will time out. Always use the **Read tool** directly on the terminal file to check progress without blocking.

1. After launching, use the **Read tool** on the terminal file immediately to confirm the process started.
2. Poll by reading the terminal file with the **Read tool** (not Shell) — check the last 15–20 lines for milestones like "Crawling page 12/48…", "Mirror complete, starting validation…".
3. Stop polling when an `exit_code` line appears in the terminal file footer.
4. Report progress updates to the user after each read.

---

## Step 4 — Review results and iterate

After the run completes:

1. Report the score to the user: `✅ Score: 96% — 46 of 48 pages fully match`
2. Open the validation report: `open "./scrape/<hostname>/validation/report.html"`
3. If score < 100%, explain what the issues are and suggest fixes:

| Issue | Likely cause | Suggested fix |
|---|---|---|
| Broken resources (404) | Assets from CDNs not captured | Re-run with `--external-assets` |
| Visual diff, no broken resources | Dynamic content (ads, dates, counters) | Raise `--threshold` or accept as expected |
| Height mismatch | Missing assets broke layout | Fix broken resources first |
| Pages missing | Site blocked headless browser | Ask user — reduce `--concurrency 1` |

4. For fixes, re-run with `--no-mirror` to skip re-scraping and only re-validate:
```bash
node .claude/skills/scrape-site/scripts/scrape-and-validate.js "https://example.com" \
  --no-mirror --threshold 10
```
Or re-run the full thing with adjusted flags until score reaches 100%.

---

## Output structure

```
scrape/<hostname>/
  mirror-index.json         All crawled pages
  index.html                Homepage (URLs rewritten to relative paths)
  about/index.html
  styles/main.css
  images/logo.png
  validation/
    report.html             Visual diff report (open in browser)
    report.json             Machine-readable results
    screenshots/
      index--live.png
      index--local.png
      index--diff.png       Red = different, green = added
```

## Browse the mirror

```bash
npx serve ./scrape/<hostname>      # recommended (correct MIME types)
open ./scrape/<hostname>/index.html
```

## Individual scripts (when re-running phases separately)

Run these in the background the same way as the main script (`block_until_ms: 0`) and poll the terminal file for progress.

```bash
# Mirror only
node .claude/skills/scrape-site/scripts/mirror-site.js "https://example.com" --output ./scrape

# Validate only (existing mirror)
node .claude/skills/scrape-site/scripts/validate-mirror.js "https://example.com" --output ./scrape
```

## Cookie banner cleanup (post-processing)

The mirror script automatically dismisses cookie banners during crawling via a heuristic that:
1. Clicks visible "Accept all / Allow / Agree" buttons by matching button text (works for any CMP)
2. Removes fixed-position, high-z-index overlays whose content contains cookie/consent keywords
3. Removes known CMP root containers by well-known IDs (OneTrust, Cookiebot, CookieReports, etc.)

If banners still appear in saved HTML files (e.g. from a previous run, or a site that loads its CMP very late), run the post-processing script:

```bash
python3 .claude/skills/scrape-site/scripts/strip-cookie-banners.py ./scrape/<hostname>
```

This script applies the same two-strategy approach to all saved `.html` files — no site-specific configuration needed.

## Limitations

- **API/XHR data**: Dynamic data loaded at runtime won't work offline — only static assets are captured
- **Auth-gated content**: Requires Playwright `storageState` with exported browser cookies
- **JS-only navigation**: Only links in `<a href>` are followed; JS-router-only pages won't be discovered
