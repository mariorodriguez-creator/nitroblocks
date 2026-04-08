---
name: sitemap-harvest
description: Fetch and parse XML sitemaps to discover all URLs on a website, cluster them by template pattern, and select representative samples for migration analysis. Use this skill before site-audit or bulk-import when the user provides a website URL and wants to understand its scale and structure, or when you need to auto-select representative pages instead of asking the user to curate URLs manually.
---

# Sitemap Harvest

Discover every URL on a website via its XML sitemap, cluster URLs by template pattern, and select a representative sample set that covers all page types. This is the prerequisite step before any large-scale migration analysis — it answers "what pages exist and how are they organized?" without scraping any content.

## When to Use This Skill

Use this skill when:
- Starting a site migration and need to understand the source site's scale and URL structure
- The site-audit skill needs representative URLs but the user hasn't provided them
- You want to auto-select pages for scraping instead of asking the user to manually list URLs
- Assessing migration scope (how many pages, how many templates, what the URL taxonomy looks like)

**Do NOT use this skill for:**
- Scraping page content (use **scrape-webpage**)
- Analyzing page structure (use **identify-page-structure**)
- Single-page imports (use **page-import** directly with the URL)

## Prerequisites

- Node.js 18+ (uses native `fetch`)
- No additional dependencies required

## Related Skills

**Downstream consumers:**
- **site-audit** — Uses the sample URLs from this skill's output as input for Step 1 (scraping)
- **page-import** — Can import individual URLs from the sample set
- **scrape-webpage** — Scrapes each sampled URL

## Workflow

### Step 1: Determine the Sitemap URL

Ask the user for the sitemap URL. If they provide just a base domain:

1. Try `{base}/sitemap.xml`
2. If that fails, check `{base}/robots.txt` for `Sitemap:` directives
3. If both fail, report that no sitemap was found

Common sitemap locations:
- `/sitemap.xml` (most common)
- `/sitemap_index.xml`
- `/sitemap/sitemap-index.xml`
- Declared in `/robots.txt` via `Sitemap:` directive

### Step 2: Run the Harvest Script

```bash
node .claude/skills/sitemap-harvest/scripts/harvest-sitemap.js "{sitemap-url}" \
  --output .specify/migration \
  --samples 3
```

**Options:**
- `--output <dir>` — Where to write output files (default: `./sitemap-harvest`)
- `--samples <n>` — How many representative URLs to select per cluster (default: 3)
- `--locale` — Collapse locale prefixes (e.g., `/en/`, `/fr/`, `/de/`) into one cluster per template. Use for internationalized sites where the same content exists under multiple locale paths. Without this flag, each locale gets its own clusters.

The script will:
1. Fetch the sitemap (follows sitemap index references recursively)
2. Parse all `<url>` entries with their metadata (`lastmod`, `priority`, `changefreq`)
3. Cluster URLs by template pattern (detects fixed vs variable path segments)
4. Select N representative samples per cluster (prioritizes date diversity and path spread)
5. Write outputs

### Step 3: Review Output

**Output files:**
- `sitemap-manifest.json` — Machine-readable: clusters, selected samples, stats
- `sitemap-summary.md` — Human-readable: cluster overview, selected samples, distribution chart
- `all-urls.txt` — Plain text, one URL per line, safe at any scale (100K+ URLs)

**Present to the user:**
- Total URL count and cluster count
- The cluster overview table (pattern, type, URL count)
- The selected samples (these are the pages to feed into site-audit or scrape)
- Ask if they want to adjust: add/remove clusters, change sample count, include specific URLs

### Step 4: Feed Into Downstream Skills

The `sitemap-manifest.json` contains a `clusters[].samples[].url` array that downstream skills consume directly.

**For site-audit integration:**
Instead of asking the user to provide URLs in Step 0, read the manifest and collect all sample URLs:

```javascript
// Pseudocode for extracting sample URLs from manifest
const manifest = JSON.parse(fs.readFileSync('.specify/migration/sitemap-manifest.json'));
const sampleUrls = manifest.clusters.flatMap(c => c.samples.map(s => s.url));
```

Then pass `sampleUrls` to the site-audit's Step 1 (scrape all pages).

## How Clustering Works

The script identifies URL template patterns by analyzing path structure across all URLs:

1. **Group by path depth** — URLs with 2 segments vs 3 segments are structurally different
2. **Detect variable segments** — Within each depth group, a segment position is "variable" if it has many distinct values (>10% of group size or >3 distinct values, whichever is larger). Variable positions become `*` in the template.
3. **Build template signatures** — e.g., `/blog/*/*` means the first segment is always "blog" but the second and third vary across URLs

**Examples:**

| URLs | Template | Type |
|---|---|---|
| `/about`, `/contact`, `/pricing` | (each unique) | unique |
| `/blog/post-1` ... `/blog/post-500` | `/blog/*` | template |
| `/products/shoes/nike` ... `/products/electronics/iphone` | `/products/*/*` | template |
| `/en/about`, `/fr/about`, `/de/about` | `/{locale}/about` | template (with `--locale`) |

### Sample Selection Strategy

For each cluster, the script selects N samples prioritizing:
1. **Date diversity** — oldest and newest by `lastmod` (catches template evolution)
2. **Path spread** — evenly spaced across the URL list (catches content variety)
3. **Backfill** — remaining slots filled from the start of the list

## Output

Two files in the output directory:

1. **`sitemap-manifest.json`** — Full harvest data:
   - Source URL and harvest timestamp
   - Stats (total URLs, clusters, samples)
   - Per-cluster: pattern, type, total URLs, selected samples with metadata
   - Full URL list per cluster (omitted for clusters with >500 URLs to avoid serialization issues)
   - Detected locales (when `--locale` is used)

2. **`sitemap-summary.md`** — Human-readable report:
   - Cluster overview table
   - Selected sample URLs with selection reasoning
   - URL distribution visualization (bar chart)

3. **`all-urls.txt`** — Complete URL list (one per line, always written regardless of size)
