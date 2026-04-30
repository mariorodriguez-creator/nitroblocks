---
name: scrape-webpage
description: Scrape webpage content, extract metadata, download images, and prepare for import/migration to AEM Edge Delivery Services. Returns analysis JSON with paths, metadata, cleaned HTML, and local images.
---

# Scrape Webpage

Extract content, metadata, and images from a webpage for import/migration.

## When to Use This Skill

Use this skill when:
- Starting a page import and need to extract content from source URL
- Need webpage analysis with local image downloads
- Want metadata extraction (Open Graph, JSON-LD, etc.)

**Invoked by:** page-import skill (Step 1)

## Prerequisites

Before using this skill, ensure:
- ✅ Node.js is available
- ✅ npm playwright is installed (`npm install playwright`)
- ✅ Chromium browser is installed (`npx playwright install chromium`)
- ✅ Sharp image library is installed (`cd .claude/skills/scrape-webpage/scripts && npm install`)

## Related Skills

- **page-import** - Orchestrator that invokes this skill
- **identify-page-structure** - Uses this skill's output (screenshot, HTML, metadata)
- **generate-import-html** - Uses image mapping and paths from this skill

## Scraping Workflow

### Step 1: Run Analysis Script

**Command:**
```bash
node .claude/skills/scrape-webpage/scripts/analyze-webpage.js "https://example.com/page" --output ./import-work
```

**All flags:**

| Flag | Repeatable | Description |
|---|---|---|
| `--output <dir>` | no | Output directory for artifacts (default `./page-analysis`) |
| `--cookie "name=value"` | yes | Inject a cookie before navigation. Use for gated sites where a probe has identified a bypass cookie (e.g., `age_verify=confirmed`) |
| `--bypass-file <path>` | no | Load both bypass cookies and overlay-hide CSS selectors from a `bypass-result.json` file (produced by `bypass-overlays.mjs` in migration-planner). Eliminates the need to pass `--cookie` and `--hide-css` individually |
| `--hide-css <selector>` | yes | Inject `display: none !important` CSS for the selector before navigation. Useful for chat widgets, sticky CTAs, live-chat launchers that designlang cannot bypass with cookies |
| `--capture-har [path]` | no | Record a HAR (HTTP Archive) of all network requests. When the path is omitted, writes `<outputDir>/network.har`. Use for third-party integration analysis (see migration-planner's `analyze-har.mjs`) |

**What the script does:**
1. Sets up network interception to capture all images
2. Loads page in headless Chromium
3. Injects any cookies and hide-CSS from `--cookie`, `--hide-css`, or `--bypass-file` so overlays never flash on screen
4. Optionally records a HAR if `--capture-har` was set
5. Scrolls through entire page to trigger lazy-loaded images
6. Downloads all images locally (converts WebP/AVIF/SVG to PNG)
7. Captures full-page screenshot for visual reference
8. Extracts metadata (title, description, Open Graph, JSON-LD, canonical)
9. **Fixes images in DOM** (background-image→img, picture elements, srcset→src, relative→absolute, inline SVG→img)
10. Extracts cleaned HTML (removes scripts/styles)
11. Replaces image URLs in HTML with local paths (./images/...)
12. Generates document paths (sanitized, lowercase, no .html extension)
13. Saves complete analysis with image mapping to metadata.json

**Examples:**

Basic scrape:
```bash
node .claude/skills/scrape-webpage/scripts/analyze-webpage.js \
  "https://example.com/page" \
  --output ./import-work
```

Scrape a gated site using a bypass file produced by `migration-planner/scripts/bypass-overlays.mjs`:
```bash
node .claude/skills/scrape-webpage/scripts/analyze-webpage.js \
  "https://zonnic.ca/ca/en/pouches" \
  --output ./migration-work/pages/pouches \
  --bypass-file ./migration-work/bypass-result.json \
  --capture-har
```

Scrape with explicit cookies + widget suppression:
```bash
node .claude/skills/scrape-webpage/scripts/analyze-webpage.js \
  "https://site.com/page" \
  --cookie "age_verified=1" \
  --cookie "locale=en-CA" \
  --hide-css ".intercom-launcher" \
  --hide-css "#qsi-survey" \
  --capture-har ./my-analysis/trace.har
```

**For detailed explanation:** See `resources/web-page-analysis.md`

---

### Step 2: Verify Output

**Output files:**
- `./import-work/metadata.json` - Complete analysis with paths and image mapping
- `./import-work/screenshot.png` - Visual reference for layout comparison
- `./import-work/cleaned.html` - Main content HTML with local image paths
- `./import-work/images/` - All downloaded images (WebP/AVIF/SVG converted to PNG)
- `./import-work/network.har` - HAR file of all network requests (only when `--capture-har` used)

**Verify files exist:**
```bash
ls -lh ./import-work/metadata.json ./import-work/screenshot.png ./import-work/cleaned.html
ls -lh ./import-work/images/ | head -5
```

---

### Step 3: Review Metadata JSON

**Output JSON structure:**
```json
{
  "url": "https://example.com/page",
  "timestamp": "2025-01-12T10:30:00.000Z",
  "paths": {
    "documentPath": "/us/en/about",
    "htmlFilePath": "us/en/about.plain.html",
    "mdFilePath": "us/en/about.md",
    "dirPath": "us/en",
    "filename": "about"
  },
  "screenshot": "./import-work/screenshot.png",
  "html": {
    "filePath": "./import-work/cleaned.html",
    "size": 45230
  },
  "metadata": {
    "title": "Page Title",
    "description": "Page description",
    "og:image": "https://example.com/image.jpg",
    "canonical": "https://example.com/page"
  },
  "images": {
    "count": 15,
    "mapping": {
      "https://example.com/hero.jpg": "./images/a1b2c3d4e5f6.jpg",
      "https://example.com/logo.webp": "./images/f6e5d4c3b2a1.png"
    },
    "stats": {
      "total": 15,
      "converted": 3,
      "skipped": 12,
      "failed": 0
    }
  },
  "bypass": {
    "cookies": ["age_verified"],
    "hide_selectors": [".intercom-launcher"]
  },
  "har": "./import-work/network.har"
}
```

**Key fields:**
- `paths.documentPath` - Used for browser preview URL
- `paths.htmlFilePath` - Where to save final HTML file
- `images.mapping` - Original URLs → local paths
- `metadata` - Extracted page metadata
- `bypass.cookies` / `bypass.hide_selectors` - Reflects what was injected pre-navigation (for audit)
- `har` - Path to the recorded HAR, or `null` if `--capture-har` was not used

---

## Output

This skill provides:
- ✅ metadata.json with paths, metadata, image mapping, bypass trace, HAR path
- ✅ screenshot.png for visual reference
- ✅ cleaned.html with local image references
- ✅ images/ folder with all downloaded images
- ✅ network.har when `--capture-har` was used (consumed by migration-planner's `analyze-har.mjs` for third-party inventory)

**Next step:** Pass these outputs to identify-page-structure skill

---

## Troubleshooting

**Browser not installed:**
```bash
npx playwright install chromium
```

**Sharp not installed:**
```bash
cd .claude/skills/scrape-webpage/scripts && npm install
```

**Image download failures:**
- Check images.stats.failed count in metadata.json
- Some images may require authentication or be blocked by CORS
- Failed images will be noted but won't stop the scraping process

**Lazy-loaded images not captured:**
- Script scrolls through page to trigger lazy loading
- Some advanced lazy-loading may need customization in scripts/analyze-webpage.js
