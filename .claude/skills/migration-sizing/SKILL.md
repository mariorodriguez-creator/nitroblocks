---
name: migration-sizing
description: >-
  Analyse an existing website from its sitemap to size an AEM Edge Delivery
  Services (EDS) migration effort. Identifies page templates, deduplicates UI
  patterns across templates, classifies them into effort tiers, and produces
  high-confidence sizing estimates. Use when asked to size, scope, estimate, or
  analyse a website migration to EDS, or when given a sitemap URL and asked to
  understand a site's structure before migration.
---

# Migration Sizing for AEM EDS

A repeatable, data-driven methodology for sizing any website migration to AEM Edge Delivery Services. Combines automated sitemap analysis with stratified HTML sampling, structural fingerprinting for template grouping, and a semantic content analysis that identifies UI patterns, deduplicates them across templates, and classifies them into three effort tiers.

## Workflow Overview

```
URLs → Categorise → Sample → Structural fingerprint → Group templates → Semantic gap analysis → Effort sizing → Dashboard
```

## Philosophy

The goal is **coverage, not exhaustiveness**. You want every *unique UI pattern* that appears on the source site, not a per-page catalog. A "3-column card grid" that appears on 8 templates is one pattern with a frequency of 8 — identifying it once is enough, but its frequency drives prioritization.

Migration is reverse-engineering: the source site is the design reference, EDS is the target platform. The sizing exercise answers a single question: **"What must be built before pages can be imported, and how long will it take?"**

### Two-Pass Block Discovery

This methodology uses a deliberate two-pass approach to avoid bias from the source site's CSS implementation:

| Pass | Method | Purpose |
|---|---|---|
| **Pass 1 — Structural fingerprint** (Steps 4–5) | CSS class extraction | Groups pages into templates by structural similarity |
| **Pass 2 — Semantic gap analysis** (Step 6) | Content sequence analysis | Identifies the actual EDS blocks needed, by purpose |

**Why two passes?** CSS class names reflect the source site's technology choices (Bootstrap, BEM, Tailwind, custom framework), not the EDS block model. A `card-list__item` class on the source may map to a `cards` block in EDS — or to `columns`, or to default content. Only semantic content analysis ("a grid of repeating items, each with an image, heading, and description") reliably maps to the correct EDS block. Use CSS classes to cluster pages; use content analysis to identify blocks.

## Authority Rules

Each artifact has a strict scope. Enforce these rules — mixing them creates confusion and unreliable estimates.

| Artifact | Describes | Must NOT contain |
|---|---|---|
| `block-inventory.md` | Blocks that **currently exist** (local + Block Collection) | Sections about what to build, modify, or create |
| `patterns.md` | **What the source site contains** — neutral patterns with frequencies | Tier classifications, block names, build recommendations |
| `gap-analysis.md` | **What to build** — sole source of truth for tiers, effort, and priority | Raw pattern descriptions or block inventory entries |

Run all scripts from the **project root** unless stated otherwise.

All outputs live under `./site-migration/<hostname>/`. Create it before starting:

```bash
mkdir -p ./site-migration/<hostname>
```

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
  require('fs').writeFileSync('./site-migration/<hostname>/urls.txt', urls.join('\n'));
  console.log(urls.length + ' URLs extracted');
"
```

Then skip Steps 4a–4b (live fetch) and go to **Step 4A — local analysis** instead.

### Path B — sitemap (fallback, no mirror available)

```bash
# Download sitemap
curl -sA "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  "https://example.com/sitemap.xml" -o ./site-migration/<hostname>/sitemap.xml

# Count total URLs
grep -c '<loc>' ./site-migration/<hostname>/sitemap.xml

# Extract URLs to a flat text file
grep -oE 'https?://[^<]+' ./site-migration/<hostname>/sitemap.xml | sort \
  > ./site-migration/<hostname>/urls.txt
```

If the sitemap is an index, fetch each child sitemap and concatenate. Continue to Step 4B — live fetch.

---

## Step 2 — Categorise URLs by section

Run the categorisation script, which groups URLs by their first path segment:

```bash
bash .claude/skills/migration-sizing/scripts/extract-urls.sh \
  ./site-migration/<hostname>/urls.txt ./site-migration/<hostname>/sections
```

This creates `./site-migration/<hostname>/sections/sec_*.txt` files (one per top-level section) and prints a summary table with page counts. Note which sections are **small** (<100), **mid** (100–200), and **large** (>200) — these determine sample rates.

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
  ./site-migration/<hostname>/sections ./site-migration/<hostname>/samples
```

Output: `./site-migration/<hostname>/samples/sample_*.txt` files and a summary of how many pages were selected per section.

---

## Step 4 — Structural fingerprinting (Pass 1)

This step extracts CSS class signatures from the sampled pages. The output is used **only to group pages into templates** — not to name EDS blocks. Treat class names as structural fingerprints, not block identifiers.

### 4A — From a local scrape-site mirror (Path A)

Reads HTML directly from disk — no network calls, much faster:

```bash
python3 .claude/skills/migration-sizing/scripts/run-batch-local.py \
  ./site-migration/<hostname>/samples \
  ./scrape/<hostname> \
  ./site-migration/<hostname>/results.tsv
```

### 4B — Live fetch (Path B, no mirror)

```bash
# First, run the per-URL fetcher (for testing a single URL)
bash .claude/skills/migration-sizing/scripts/parse-components.sh <URL> <SECTION>

# Then batch all samples in parallel (uses 20 workers by default)
python3 .claude/skills/migration-sizing/scripts/run-batch.py \
  ./site-migration/<hostname>/samples \
  ./site-migration/<hostname>/results.tsv
```

Each result line: `section|url|class1,class2,...`

> **Tip**: If a section has pages behind authentication or geo-restriction, note those separately. Fetch 100% of such sections manually if possible.

---

## Step 5 — Template classification

Analyse `results.tsv` to group pages into templates by structural signature similarity:

```bash
python3 .claude/skills/migration-sizing/scripts/analyze-results.py \
  ./site-migration/<hostname>/results.tsv \
  ./site-migration/<hostname>/analysis.json
```

The script outputs:
- **Templates**: sections with a dominant component signature (>70% of pages share the same top-3 components = one template)
- **Class frequencies**: all unique class names ranked by frequency and cross-section reuse — **treat these as structural identifiers only, not EDS block names**
- **Confidence level**: `high` (≥10 pages sampled), `med` (3–9), `low` (<3)

Review `./site-migration/<hostname>/analysis.json` and apply judgement:
- Pages with identical signatures in the same section → one EDS template
- A "General Hub" section with 3–4 distinct signatures → decompose into sub-templates
- Very low-frequency classes (<3 occurrences total) → likely one-offs, deprioritise

> **Important**: The class names in `analysis.json` reflect the source site's CSS framework, not EDS blocks. A class like `feature-card__grid` may map to `cards`, `columns`, or even default content in EDS. Step 6 resolves this via semantic analysis.

---

## Step 6 — Semantic block gap analysis (Pass 2) ✦ Core step

This is the **primary block identification step**. For each template identified in Step 5, perform a semantic content analysis on a representative page: neutral pattern discovery → cross-template deduplication → tiered classification → gap analysis.

**This step is not optional** for producing an accurate block inventory. CSS class analysis alone cannot reliably determine which EDS blocks are needed.

This step produces two authoritative files:
- `./site-migration/<hostname>/patterns.md` — deduplicated neutral patterns with frequencies
- `./site-migration/<hostname>/gap-analysis.md` — tiered classification, sole source of truth for what to build

---

### 6a — Survey the EDS block palette

Before analysing any page, build the block inventory:

**Invoke the [`block-inventory`](./../block-inventory/SKILL.md) skill** to catalog local blocks and Block Collection options. Save the output to `./site-migration/<hostname>/block-inventory.md`.

**CRITICAL scope rule:** `block-inventory.md` must ONLY describe blocks that currently exist. Do NOT add sections like "Blocks to Create" or "Recommended New Blocks" — those belong exclusively in `gap-analysis.md`. If the skill adds such sections, delete them before saving.

Keep this inventory in context for the entire gap analysis.

---

### 6b — For each template: identify content sequences (neutral descriptions)

Pick the most representative URL for each template. Read its HTML (from mirror or live fetch) and identify content sequences using **neutral, visual descriptions only** — do not use source CSS class names, do not assign EDS block names yet.

**What to look for:**
- Repeating structured patterns (how many items? what does each item contain?)
- Interactive components (expandable, switchable, animated)
- Layout patterns (side-by-side, grid, stacked, full-width)
- Typical page zones (hero area at top, footer CTA, navigation, body text)

**Output format (one per template):**
```
Template: Article Detail
Representative URL: https://example.com/news/article-1

Section 1 (light):
  - Sequence 1: Full-width banner image with overlaid heading and breadcrumb
  - Sequence 2: Heading, date, author name, body text with inline images

Section 2 (grey):
  - Sequence 1: Centered heading
  - Sequence 2: Grid of 3 items, each with thumbnail image, date, heading, short description

Section 3 (dark):
  - Sequence 1: Centered heading, paragraph, two call-to-action links
```

---

### 6c — Deduplicate patterns across all templates

Collate every content sequence from every template and group similar patterns together. This is the core value of the analysis — the same pattern appearing across 4 templates is higher priority than a pattern unique to one.

**Same pattern criteria:**
- Same structural intent (grid of items, side-by-side layout, tabbed content, expandable sections)
- Same content type (image + text cards, icon + description lists, testimonial quotes)
- Column count differences are **variants**, not different patterns (3-col vs 4-col card grid = one pattern)
- With/without image variants are **the same pattern**

**Different pattern criteria:**
- Different structural intent (card grid vs accordion vs carousel)
- Different interaction model (static grid vs swipeable carousel)
- Different content types despite similar layout (image gallery vs feature card grid)

**For each unique pattern, record:**
- **Name**: Descriptive, author-friendly (e.g., "Icon + text feature grid", "Full-width hero with background image", "Testimonial carousel")
- **Description**: Neutral — what it looks like, what it contains
- **Frequency**: How many templates it appears in
- **Locations**: Which templates and sections
- **Variations**: Notable differences (e.g., "3-col on article pages, 4-col on product pages; some with icons, some with images")

**Save to `./site-migration/<hostname>/patterns.md`:**

```markdown
# Pattern Inventory

**Source site:** {base URL}
**Templates analyzed:** {N}
**Total content sequences found:** {N}
**Unique patterns after deduplication:** {N}

---

## Pattern 1: {Name}

**Description:** {Neutral description}
**Frequency:** {N} templates
**Locations:** {template §section, template §section, ...}
**Variations:** {Notable differences}

---
```

Order patterns by frequency (highest first). **Do not add tier classifications here** — that's the gap analysis's job.

---

### 6d — Classify patterns into three tiers

With the block inventory (Step 6a) and deduplicated patterns (Step 6c), classify each pattern:

**Tier 1 — Covered:**
An existing block handles this pattern as-is. No code changes needed — only global design token (CSS variable) adjustments.
- The block's content model (rows/columns) matches the pattern
- No new CSS variants or JS changes required
- Example: "Full-width hero with heading, paragraph, CTA buttons" → `hero` block ✅

**Tier 2 — Variant:**
An existing block handles the structure, but needs a CSS variant or minor decoration tweak.
- The core content model maps to an existing block
- Needs a new block option class (e.g., `cards (icon-grid)`)
- May need minor JS restructuring, but the fundamental approach is the same
- Example: "Icon + text grid with centered layout" → `cards` block + new `icon-grid` variant

**Tier 3 — New Block:**
No existing block matches. Must be built from scratch — new JS decoration, new CSS, new content model.
- The content structure doesn't map to any available block
- The interaction pattern is unique
- Example: "Interactive timeline with milestone markers" → new `timeline` block

**When uncertain:** Lean toward Tier 2 (variant) over Tier 3 (new). Reusing existing blocks is simpler for authors, less code, and more maintainable.

**For default content patterns** (headings, paragraphs, inline images, simple lists): mark as "Default content, no block needed" and exclude from the gap analysis tiers.

---

### 6e — Produce the gap analysis

Save to `./site-migration/<hostname>/gap-analysis.md`. This is the **sole authoritative artifact** for what to build — all effort sizing in Step 7 reads from here.

```markdown
# Migration Gap Analysis

**Source site:** {URL}
**Date:** {ISO date}
**Templates analyzed:** {N}
**Unique patterns found:** {N}

## Summary

| Tier | Count | Description |
|------|-------|-------------|
| Tier 1 — Covered | {N} | Existing blocks, no code changes |
| Tier 2 — Variant | {N} | Existing blocks, need CSS variant or minor JS tweak |
| Tier 3 — New Block | {N} | Must be built from scratch |

---

## Tier 3 — New Blocks

| # | Pattern | Proposed Block Name | Frequency | Templates | Effort | Notes |
|---|---------|-------------------|-----------|-----------|--------|-------|
| 1 | {name} | {block-name} | {N} | {list} | S/M/L | {notes} |

Effort guide: **S** = simple structure, minimal JS · **M** = moderate decoration, responsive · **L** = complex interaction or API integration

---

## Tier 2 — Variant Blocks

| # | Pattern | Base Block | Proposed Variant | Frequency | Templates | Effort | Notes |
|---|---------|-----------|-----------------|-----------|-----------|--------|-------|
| 1 | {name} | {block} | {variant class} | {N} | {list} | S/M | {notes} |

---

## Tier 1 — Covered Blocks (no code needed)

Verify visual output against source after applying global design tokens.

| # | Pattern | Block | Frequency | Notes |
|---|---------|-------|-----------|-------|
| 1 | {name} | {block} | {N} | {notes} |

---

## Global Style Observations

Observations about the source site's visual DNA that will inform design token extraction:
- **Colors:** {Primary, secondary, accent, background palette observed}
- **Typography:** {Font families, heading sizes, body text treatment}
- **Spacing:** {Section padding, content max-width, grid gaps}
- **Other:** {Border radii, shadows, button styles, transitions}

---

## Template Readiness Matrix

| Template | Tier 3 Blockers | Tier 2 Blockers | Ready for Import? |
|----------|-----------------|-----------------|-------------------|
| {template} | {blocks needed} | {variants needed} | Yes / No |

---

## Recommended Build Order

{Ordered list of blocks to build. Prioritize by:}
1. High frequency (unblocks the most templates)
2. Dependencies (other blocks embed or depend on this)
3. Complexity (simpler blocks first to build momentum)

---

## Structural Decisions

Key architectural choices that must be made before block development starts. These are forks where the approach significantly affects implementation scope and authoring experience.

For each decision:
- **Decision:** {What needs to be decided}
- **Options:** {Option A vs Option B (vs Option C)}
- **Recommendation:** {Which option and why}
- **Impact:** {What this decision affects downstream}

Common decision types to evaluate:
- Extend existing block vs build new block (e.g., mega-nav: extend boilerplate header or build from scratch?)
- Single block with variants vs multiple blocks (e.g., one hero block with options or separate hero/banner/feature-band blocks?)
- Auto-block vs authored block (e.g., breadcrumbs: auto-generated from page path or authored in content?)
- Block vs default content + CSS (e.g., CTA bar: dedicated block or styled section with default content?)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| {risk} | H/M/L | H/M/L | {mitigation} |

Common migration risks to evaluate:
- Navigation complexity exceeds estimate (mega-navs are the #1 risk in migrations)
- Additional patterns found on unaudited pages (coverage gaps from sampling)
- Performance budget exceeded by complex blocks (JS payload, TBT)
- Content model too complex for authors (Word/GDocs authoring friction)
- Third-party integrations requiring API access (stock tickers, search, consent)
- Responsive image handling causing CLS (dual hero images, lazy load timing)
```

---

### 6f — Reconcile with CSS fingerprint (sanity check)

Compare the gap analysis block list against the CSS class frequencies from Step 5. Flag discrepancies for review:
- CSS class present but no matching pattern in gap analysis → decorative/utility CSS or missed pattern?
- Pattern in gap analysis but no corresponding CSS class → check if content is dynamically rendered
- CSS classes like `container`, `wrapper`, `row`, `col-*` → layout utilities, ignore

This reconciliation is a sanity check only — the semantic analysis takes precedence.

---

### 6g — Artifact consistency check

Before moving to effort sizing, verify the three artifacts are internally consistent:

1. Open `block-inventory.md` — confirm it contains ONLY existing blocks (no "Blocks to Create" sections). If such sections exist, **delete them**.
2. Open `patterns.md` — confirm patterns are listed neutrally with frequencies, without tier classification labels.
3. Open `gap-analysis.md` — confirm it is the sole source of tier classification, effort estimates, and build recommendations.
4. Cross-check: every pattern in `patterns.md` must appear in exactly one tier of `gap-analysis.md`. If any pattern is missing, classify it. If any tier entry has no corresponding pattern, remove it.

---

## Step 7 — Effort sizing

Read `./site-migration/<hostname>/gap-analysis.md` as input. The three tiers map directly to effort points — no further judgement is needed on block classification. Use the reference table in [resources/effort-reference.md](resources/effort-reference.md) for additional detail.

| Item | Points |
|---|---|
| Tier 1 block (covered, design tokens only) | 0 pts |
| Tier 2 block (variant — CSS class + minor JS tweak) | 1 pt |
| Tier 3 block — S effort (simple structure, minimal JS) | 2 pts |
| Tier 3 block — M effort (moderate decoration, responsive) | 3 pts |
| Tier 3 block — L effort (complex interaction, API integration) | 5 pts |
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

## Step 8 — Dashboard

Use the [canvas skill](~/.cursor/skills-cursor/canvas/SKILL.md) to create an interactive HTML dashboard. Save it to `./site-migration/<hostname>/dashboard.html`. See the AstraZeneca example at `.claude/skills/migration-sizing/resources/az-migration-analysis.html` for a reference implementation.

The dashboard should have tabs for:
- **Overview** — headline metrics (URLs, templates, blocks, effort, timeline)
- **Site Tree** — D3 hierarchical tree of section → sub-section → leaf pages
- **Methodology** — sampling approach and pipeline steps with stats
- **Templates** — one card per template with component signature and sample page links
- **Block Inventory** — Tier 1/2/3 breakdown, pattern frequency table, template readiness matrix (sourced from `gap-analysis.md`)
- **Effort Sizing** — tabbed breakdown (Scenario A / B / C) with sprint timeline
- **Migration Phases** — recommended phased delivery plan and build order

---

## Output deliverables

All outputs live under `./site-migration/<hostname>/` and are committed to the repo.

| File | Purpose |
|---|---|
| `./site-migration/<hostname>/urls.txt` | Full URL list |
| `./site-migration/<hostname>/sections/` | URLs grouped by top-level section |
| `./site-migration/<hostname>/samples/` | Stratified sample per section |
| `./site-migration/<hostname>/results.tsv` | CSS class fingerprints per sampled page |
| `./site-migration/<hostname>/analysis.json` | Machine-readable template signatures (CSS fingerprint) |
| `./site-migration/<hostname>/block-inventory.md` | Available blocks catalog (what exists now) |
| `./site-migration/<hostname>/patterns.md` | Deduplicated neutral pattern inventory with frequencies |
| `./site-migration/<hostname>/gap-analysis.md` | Tiered classification — sole source of truth for what to build |
| `./site-migration/<hostname>/dashboard.html` | Interactive stakeholder dashboard |
| `./site-migration/<hostname>/summary.md` | Static markdown summary (for repo / docs) |

---

## Key Principles

**Coverage over depth.** The sizing exercise identifies what to build — it doesn't build anything. Resist the urge to start coding blocks during the audit. Get the full picture first.

**Neutral descriptions first, block names second.** Describe patterns using what they look like and contain ("grid of items with images and text") before assigning any EDS block name. This prevents premature commitment to a specific block when a different one might fit better.

**Frequency drives priority.** A pattern appearing in 1 template is less urgent than one in 8 templates, regardless of complexity. The build order should unblock the most pages fastest.

**Variants over new blocks.** When a pattern could reasonably be a variant of an existing block OR a new block, prefer the variant. It's less code, simpler for authors, and easier to maintain. The gap analysis should reflect this bias toward Tier 2 over Tier 3.

**CSS classes cluster pages; content analysis identifies blocks.** The structural fingerprint is a grouping mechanism, not a block inventory. Never read block names directly from source CSS class names.

---

## Common issues

| Issue | Fix |
|---|---|
| Sitemap returns 500 | Add `-A "Mozilla/5.0 ..."` user-agent header to curl |
| `grep -P` fails on macOS | Use `grep -oE` instead |
| Geo-restricted pages return empty HTML | Fetch manually, note in dashboard caveats |
| AEM CLI preview 404 for local `.plain.html` | Verify file path matches URL exactly; CLI proxies to remote backend first |
| CSS classes are all generic (`container`, `row`, `col`) | Source uses a utility-first CSS framework; skip Pass 1 block inference entirely, go straight to Step 6 semantic analysis |
| CSS analysis shows many unique class names with low frequency | Source uses BEM with per-component namespacing; group by prefix rather than exact class, use semantic analysis to confirm |
| Semantic analysis identifies more blocks than CSS analysis | Expected — CSS fingerprint misses blocks with generic class names; trust the semantic analysis |
| Semantic analysis identifies fewer blocks than CSS analysis | CSS classes include layout utilities counted as components; cross-reference with Step 6f reconciliation |
| block-inventory.md contains "Blocks to Create" sections | The block-inventory skill added them; delete those sections before saving — they belong in gap-analysis.md |
