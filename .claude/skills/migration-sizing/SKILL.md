---
name: migration-sizing
description: >-
  Analyse an existing website from its sitemap to size an AEM Edge Delivery
  Services (EDS) migration effort. Identifies page templates, block inventory,
  and produces effort estimates. Use when asked to size, scope, estimate, or
  analyse a website migration to EDS, or when given a sitemap URL and asked
  to understand a site's structure before migration.
---

# Migration Sizing for AEM EDS

A repeatable, data-driven methodology for sizing any website migration to AEM Edge Delivery Services. Combines automated sitemap analysis with stratified HTML sampling, template classification, and page-import validation to produce high-confidence effort estimates.

## Workflow Overview

```
URLs → Categorise → Sample → HTML analysis → Classify → Validate → Size → Dashboard
```

Run all scripts from the **project root** unless stated otherwise.

---

## Step 1 — Obtain a URL list

There are two input paths. **Prefer path A** when a site mirror already exists or can be created.

### Path A — scrape-site mirror (preferred)

If you already have (or can create) a local site mirror using the [`scrape-site`](./../scrape-site/SKILL.md) skill, use it as input. The mirror gives you pre-downloaded HTML with no network rate-limits and a complete URL manifest.

```bash
# Extract all crawled URLs from mirror-index.json
node -e "
  const idx = require('./scrape/<hostname>/mirror-index.json');
  const urls = idx.pages.map(p => p.url);
  require('fs').writeFileSync('/tmp/urls.txt', urls.join('\n'));
  console.log(urls.length + ' URLs extracted');
"
```

Then skip Steps 4a–4b (live fetch) and go to **Step 4 — local analysis** instead.

### Path B — sitemap (fallback, no mirror available)

```bash
# Download sitemap
curl -sA "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  "https://example.com/sitemap.xml" -o /tmp/sitemap.xml

# Count total URLs
grep -c '<loc>' /tmp/sitemap.xml

# Extract URLs to a flat text file
grep -oE 'https?://[^<]+' /tmp/sitemap.xml | sort > /tmp/urls.txt
```

If the sitemap is an index, fetch each child sitemap and concatenate. Continue to Step 4 — live fetch.

---

## Step 2 — Categorise URLs by section

Run the categorisation script, which groups URLs by their first path segment:

```bash
bash .claude/skills/migration-sizing/scripts/extract-urls.sh /tmp/urls.txt /tmp/sections
```

This creates `/tmp/sections/sec_*.txt` files (one per top-level section) and prints a summary table with page counts. Note which sections are **small** (<100), **mid** (100–200), and **large** (>200) — these determine sample rates.

---

## Step 3 — Stratified sampling

Apply tiered coverage to ensure statistical confidence without over-fetching:

| Section size | Sample rate |
|---|---|
| < 100 pages | 100% |
| 100–200 pages | 50% |
| > 200 pages | 25% |

```bash
python3 .claude/skills/migration-sizing/scripts/sample-urls.py \
  /tmp/sections /tmp/samples
```

Output: `/tmp/samples/sample_*.txt` files and a summary of how many pages were selected per section.

---

## Step 4 — Component extraction

### 4A — From a local scrape-site mirror (Path A)

Reads HTML directly from disk — no network calls, much faster:

```bash
python3 .claude/skills/migration-sizing/scripts/run-batch-local.py \
  /tmp/samples ./scrape/<hostname> /tmp/results.tsv
```

The script maps each sampled URL to its local file path in the mirror and extracts component classes without any HTTP requests.

### 4B — Live fetch (Path B, no mirror)

Fetches every sampled URL over the network and extracts CSS class names that look like component names (multi-word kebab-case classes):

```bash
# First, run the per-URL fetcher (for testing a single URL)
bash .claude/skills/migration-sizing/scripts/parse-components.sh <URL> <SECTION>

# Then batch all samples in parallel (uses 20 workers by default)
python3 .claude/skills/migration-sizing/scripts/run-batch.py \
  /tmp/samples /tmp/results.tsv
```

Each result line: `section|url|class1,class2,...`

> **Tip**: If a section has pages behind authentication or geo-restriction, note those separately. Fetch 100% of such sections manually if possible.

---

## Step 5 — Template and block classification

Analyse `results.tsv` to derive template signatures and block frequency:

```bash
python3 .claude/skills/migration-sizing/scripts/analyze-results.py \
  /tmp/results.tsv /tmp/analysis.json
```

The script outputs:
- **Templates**: sections with a dominant component signature (>70% of pages share the same top-3 components = one template)
- **Blocks**: all unique component names ranked by frequency and cross-section reuse
- **Confidence level**: `high` (≥10 pages sampled), `med` (3–9), `low` (<3)

Review `analysis.json` and apply judgement:
- Pages with identical signatures in the same section → one EDS template
- A "General Hub" section with 3–4 distinct signatures → decompose into sub-templates
- Very low-frequency classes (<3 occurrences total) → likely one-offs, deprioritise

---

## Step 6 — Page-import validation (recommended)

Run the [`page-import`](./../page-import/SKILL.md) skill on one representative page per identified template. This validates the block inventory using actual DOM analysis rather than CSS class inference alone, and surfaces any blocks that are visually significant but share generic class names.

1. Pick the most representative URL for each template
2. For each: run scrape → identify-page-structure → authoring-analysis → generate-import-html
3. Note any blocks discovered here that were missing from the CSS analysis
4. Update your block list and template cards accordingly

Full page-import of all pages is not necessary — one per template is sufficient for sizing.

---

## Step 7 — Effort sizing

Use the reference table in [resources/effort-reference.md](resources/effort-reference.md) for point estimates. Apply this standard formula:

| Item | Points |
|---|---|
| Per EDS block (new, no equivalent exists) | 3 pts |
| Per EDS block (adapted from Block Collection) | 1 pt |
| Per template wire-up | 2 pts |
| Integration work (analytics, forms, auth) | 8–16 pts |
| Core scripts / global styles | 8 pts |
| Content migration (per 100 pages, human-led) | 5 pts |
| QA / performance validation | 8 pts |

**Scenario tiers** (useful for presenting to stakeholders):
- **Scenario A** (code only, content migration by client): sum blocks + templates + integrations + core
- **Scenario B** (code + assisted content migration): add content migration points
- **Scenario C** (full project, QA included): add QA points

Sprint velocity assumption: **10 pts / week** (1 developer). Adjust for team size.

---

## Step 8 — Dashboard (optional)

If the output needs to be presented to stakeholders, use the [canvas skill](~/.cursor/skills-cursor/canvas/SKILL.md) to create an interactive HTML dashboard. See the AstraZeneca example at `canvas/az-migration-analysis.html` in this project for a reference implementation.

The dashboard should have tabs for:
- **Overview** — headline metrics (URLs, templates, blocks, effort, timeline)
- **Site Tree** — D3 hierarchical tree of section → sub-section → leaf pages
- **Methodology** — sampling approach and pipeline steps with stats
- **Templates** — one card per template with component signature and sample page links
- **Block Inventory** — one card per block with usage %, reuse score, and screenshot
- **Effort Sizing** — tabbed breakdown (Scenario A / B / C) with sprint timeline
- **Migration Phases** — recommended phased delivery plan

---

## Output deliverables

| File | Purpose |
|---|---|
| `/tmp/analysis.json` | Machine-readable template + block inventory |
| `canvas/<site>-migration-analysis.html` | Interactive dashboard |
| `canvas/<site>-migration-analysis.md` | Static markdown summary (for repo / docs) |
| `import-work/<template>/` | Generated import HTML per template (from Step 6) |

---

## Common issues

| Issue | Fix |
|---|---|
| Sitemap returns 500 | Add `-A "Mozilla/5.0 ..."` user-agent header to curl |
| `grep -P` fails on macOS | Use `grep -oE` instead |
| Geo-restricted pages return empty HTML | Fetch manually, note in dashboard caveats |
| AEM CLI preview 404 for local `.plain.html` | Verify file path matches URL exactly; CLI proxies to remote backend first |
| Block class names are generic (e.g. `container`) | Cross-reference with page-import DOM analysis to confirm |
