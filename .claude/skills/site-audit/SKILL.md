---
name: site-audit
description: Audit an entire source website to identify every unique UI pattern, map patterns to available EDS blocks, and produce a prioritized gap analysis that drives migration. Use this skill when migrating a website to AEM Edge Delivery Services, when a user wants to understand what blocks need to be created before importing pages, or when starting a full site migration, bulk import, or multi-page analysis.
---

# Site Audit

Orchestrate a site-wide pattern analysis for website migration to AEM Edge Delivery Services. Scrapes representative pages, identifies all unique UI patterns across the site, maps them to available blocks, and produces a prioritized gap analysis with speckit integration tiers.

## When to Use This Skill

Use this skill when:
- Migrating an entire website (or a significant portion) to EDS
- Starting a multi-page import and need to understand what blocks exist vs what must be built
- Want a comprehensive inventory of UI patterns across a source website before writing any code

**Do NOT use this skill for:**
- Importing a single page (use **page-import** skill)
- Building a new block (use **content-driven-development** or **building-blocks** skill)
- Auditing an existing EDS site's blocks (use **block-inventory** skill directly)

## Prerequisites

- Node.js available
- Playwright and Chromium installed (`npx playwright install chromium`)
- Sharp installed (`cd .claude/skills/scrape-webpage/scripts && npm install`)
- A list of representative URLs from the source website

## Related Skills

**This skill invokes:**
- **scrape-webpage** — Extracts content, metadata, and images from each source URL
- **identify-page-structure** — Identifies sections and content sequences per page
- **block-inventory** — Catalogs available blocks (local + Block Collection)

**Downstream consumers:**
- **page-import** — Imports individual pages once blocks are ready
- **building-blocks** — Creates blocks identified in the gap analysis
- **speckit-specify** — Specs each new or variant block for development

## Philosophy

The goal is **coverage, not exhaustiveness**. You want every *unique UI pattern* that appears on the source site, not a per-page catalog. A "3-column card grid" that appears on 8 pages is one pattern with a frequency of 8 — identifying it once is enough, but its frequency drives prioritization.

Migration is reverse-engineering: the source site is the design reference, EDS is the target platform. The audit answers a single question: **"What must be built before pages can be imported?"**

## Data Flow

Each step produces an artifact that feeds strictly into the next. Respect the pipeline — earlier artifacts are inputs, not conclusions.

```
Step 1: scrape-webpage          → pages/{name}/ (raw scrape data)
Step 2: identify-page-structure → per-page section/sequence analysis (ephemeral, not saved as a file)
Step 2: block-inventory         → block-inventory.md (INVENTORY ONLY — what exists now)
Step 3: deduplication           → patterns.md (cross-page unique patterns with frequencies)
Step 4: classification          → (ephemeral — feeds Step 5)
Step 5: gap-analysis.md         → SINGLE SOURCE OF TRUTH for what to build
```

**Authority rules:**
- `block-inventory.md` describes **what exists**. It must never contain sections about what to build, modify, or create. Those conclusions belong exclusively in `gap-analysis.md`.
- `patterns.md` describes **what the source site contains** (neutral patterns with frequencies). It must not classify patterns against blocks — that's the gap analysis's job.
- `gap-analysis.md` is the **sole authoritative artifact** for classification (tiers), priority, effort, and development guidance. All downstream consumers (speckit, building-blocks, page-import) read this file.

## Workflow

### Step 0: Gather URLs and Set Up

**Ask the user for:**
1. A list of representative URLs from the source website
2. What page types they cover (homepage, product pages, articles, about, contact, etc.)

**URL selection guidance:**
- Aim for 8–15 pages covering all distinct templates/layouts on the site
- If the user provides fewer than 5, ask whether they've covered all template types
- If more than 15, ask which can be dropped — diminishing returns set in quickly
- Prioritize: homepage, one of each content template, one listing/index page, one form page

**Create the working directory:**

```
.specify/migration/
├── pages/                  # Per-page scrape + analysis output
│   ├── {page-name}/        # One directory per scraped page
│   │   ├── screenshot.png
│   │   ├── cleaned.html
│   │   ├── metadata.json
│   │   └── images/
│   └── ...
├── block-inventory.md      # Available blocks catalog
├── patterns.md             # Deduplicated pattern inventory
└── gap-analysis.md         # Final classified gap analysis
```

**Create a TodoList** with:
- One todo per page (scrape + analyze)
- "Compile block inventory"
- "Deduplicate patterns across pages"
- "Classify patterns and produce gap analysis"

---

### Step 1: Scrape All Pages

For EACH URL, invoke the **scrape-webpage** skill:

1. Create page directory: `.specify/migration/pages/{page-name}/`
2. Run the scrape script:
   ```bash
   node .claude/skills/scrape-webpage/scripts/analyze-webpage.js "{url}" --output .specify/migration/pages/{page-name}
   ```
3. Verify outputs: screenshot.png, cleaned.html, metadata.json, images/

**Naming convention:** Derive `{page-name}` from the URL path — e.g., `homepage`, `about-us`, `careers-engineering`. Keep names short and descriptive.

**Parallelism:** If subagents are available, scrape pages in parallel. Otherwise, scrape sequentially. **If parallel scraping stalls or fails** (e.g., sandbox restrictions, network contention, Chromium resource limits), fall back to sequential scraping — one page at a time. For 5+ pages, try batches of 2-3 rather than all at once.

Mark each page's scrape todo complete after verifying outputs exist.

---

### Step 2: Analyze Structure Per Page

For EACH scraped page, invoke the **identify-page-structure** skill:

1. Provide: screenshot.png, cleaned.html, metadata.json from that page's directory
2. Record the output for each page:
   - Section boundaries with styling notes (background color, visual treatment)
   - Content sequences per section (neutral descriptions — no block names yet)

**Block inventory:** The identify-page-structure skill invokes block-inventory internally. Run the full inventory on the **first page only**. For subsequent pages, reuse the inventory — it doesn't change between pages.

Save the block inventory to `.specify/migration/block-inventory.md`.

**CRITICAL — block-inventory.md scope:** This file must ONLY describe blocks that currently exist (local project blocks and Block Collection candidates). It is an **input** to the classification step, not an output. Do NOT add sections like "Blocks to Create", "Blocks to Modify", or "Recommended New Blocks" — those conclusions belong exclusively in `gap-analysis.md`. If the block-inventory skill or subagent adds such sections, remove them before saving.

Mark each page's analysis todo complete.

---

### Step 3: Deduplicate Patterns Across Pages

This is the core value-add of the site audit. Collate all content sequences from all analyzed pages and group similar patterns together.

**Similarity criteria — SAME pattern:**
- Same structural intent (grid of items, side-by-side layout, tabbed content, expandable sections)
- Same content type (image + text cards, icon + description lists, testimonial quotes)
- Column count differences are variants, not different patterns (3-col vs 4-col card grid = one pattern)
- With/without image variants are the same pattern (cards with images vs cards without)

**Similarity criteria — DIFFERENT patterns:**
- Different structural intent (card grid vs accordion vs carousel)
- Different content types despite similar layout (image gallery vs feature card grid — both grids, different purpose)
- Different interaction model (static grid vs swipeable carousel)

**For each unique pattern, record:**
- **Name**: Descriptive, author-friendly (e.g., "Icon + text feature grid", "Full-width hero with background image", "Testimonial carousel")
- **Description**: Neutral description from page-decomposition output
- **Frequency**: How many pages it appears on
- **Locations**: Which pages and sections (e.g., "homepage §1, about §3, services §1")
- **Variations**: Notable differences across pages (e.g., "3-col on homepage, 4-col on services; some with icons, some with images")

**Save to `.specify/migration/patterns.md`:**

```markdown
# Pattern Inventory

**Source site:** {base URL}
**Pages analyzed:** {N}
**Total content sequences found:** {N}
**Unique patterns after deduplication:** {N}

---

## Pattern 1: {Name}

**Description:** {Neutral description}
**Frequency:** {N} pages
**Locations:** {page §section, page §section, ...}
**Variations:** {Notable differences across pages}

---

## Pattern 2: {Name}
...
```

Order patterns by frequency (highest first).

---

### Step 4: Classify Patterns Against Available Blocks

With the block inventory (from Step 2) and the deduplicated patterns (from Step 3), classify each pattern into one of three tiers.

**Tier 1 — Covered:**
An existing block handles this pattern as-is. The content model (rows/columns) matches, the decoration logic works, and only global style adjustments (design tokens) are needed.
- No new CSS variants or JS changes required
- The block's existing structure accommodates the content
- Example: "Full-width hero with heading, paragraph, buttons" → hero block

**Tier 2 — Variant:**
An existing block handles the structure, but needs a CSS variant or minor decoration tweak.
- The core content model (rows/columns) maps to an existing block
- Needs a new block option class for visual differentiation (e.g., `cards (icon-grid)`)
- May need minor JS restructuring, but the fundamental decoration approach is the same
- Example: "Icon + text grid with centered layout" → cards block with a new `icon-grid` variant

**Tier 3 — New Block:**
No existing block matches. Must be built from scratch — new JS decoration, new CSS, new content model.
- The content structure doesn't map to any available block's rows/columns
- The interaction pattern is unique to this component
- The layout requires dedicated decoration logic
- Example: "Interactive timeline with milestone markers" → new `timeline` block

**When uncertain:** Lean toward Tier 2 (variant) over Tier 3 (new). Reusing existing blocks is always preferred — simpler for authors, less code, better maintainability.

---

### Step 5: Produce Gap Analysis

Generate the final output at `.specify/migration/gap-analysis.md`.

```markdown
# Migration Gap Analysis

**Source site:** {URL}
**Date:** {ISO date}
**Pages analyzed:** {N}
**Unique patterns found:** {N}

## Summary

| Tier | Count | Description |
|------|-------|-------------|
| Tier 1 — Covered | {N} | Existing blocks, no code changes |
| Tier 2 — Variant | {N} | Existing blocks, need CSS variant or minor JS tweak |
| Tier 3 — New Block | {N} | Must be built from scratch |

---

## Tier 3 — New Blocks (Full Speckit Pipeline)

These patterns require new blocks. Each should go through the full speckit workflow:
`speckit-specify` → `speckit-plan` → `speckit-tasks` → `speckit-implement` → `speckit-validate`

| # | Pattern | Proposed Block Name | Frequency | Pages | Effort | Notes |
|---|---------|-------------------|-----------|-------|--------|-------|
| 1 | {name} | {block-name} | {N} | {pages} | {S/M/L} | {notes} |

Effort guide: **S** = <4h (simple structure, minimal JS), **M** = 4–12h (moderate decoration, responsive), **L** = 12h+ (complex interaction, API integration, multi-variant)

---

## Tier 2 — Variant Blocks (Abbreviated Speckit)

These patterns extend existing blocks with new variants. Use an abbreviated speckit flow:
`speckit-specify` → `speckit-plan` → `speckit-implement` → `speckit-validate`

| # | Pattern | Base Block | Proposed Variant | Frequency | Pages | Effort | Notes |
|---|---------|-----------|-----------------|-----------|-------|--------|-------|
| 1 | {name} | {block} | {variant class} | {N} | {pages} | {S/M} | {notes} |

---

## Tier 1 — Covered Blocks (No Speckit)

These patterns are handled by existing blocks. Verify visual output against source after applying global design tokens.

| # | Pattern | Block | Frequency | Pages | Notes |
|---|---------|-------|-----------|-------|-------|
| 1 | {name} | {block} | {N} | {pages} | {notes} |

---

## Global Style Observations

{Observations about the source site's visual DNA that will inform design token extraction:}
- **Colors:** {Primary, secondary, accent, background palette observed}
- **Typography:** {Font families, heading sizes, body text treatment}
- **Spacing:** {Section padding, content max-width, grid gaps}
- **Other:** {Border radii, shadows, button styles, transitions}

---

## Recommended Execution Order

{Ordered list of blocks to build, with reasoning. Prioritize by:}
1. High frequency (more pages unblocked)
2. Dependency (other blocks may embed or depend on it)
3. Complexity (start with simpler blocks to build momentum)

---

## Page Readiness Matrix

| Page | Tier 3 Blockers | Tier 2 Blockers | Ready for Import? |
|------|-----------------|-----------------|-------------------|
| {page} | {blocks needed} | {variants needed} | {Yes/No} |

---

## Structural Decisions

{List the key architectural choices that must be made before block development starts. These are forks where the approach significantly affects implementation scope and authoring experience.}

For each decision:
- **Decision:** {What needs to be decided}
- **Options:** {Option A vs Option B (vs Option C)}
- **Recommendation:** {Which option and why}
- **Impact:** {What this decision affects downstream}

Common decision types:
- Extend existing block vs build new block (e.g., mega-nav: extend boilerplate header or build from scratch?)
- Single block with variants vs multiple blocks (e.g., one hero block with options or separate hero/banner/feature-band blocks?)
- Auto-block vs authored block (e.g., breadcrumbs: auto-generated from page path or authored in content?)
- Block vs default content + CSS (e.g., CTA bar: dedicated block or styled section with default content?)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| {risk description} | {High/Med/Low} | {High/Med/Low} | {mitigation strategy} |

Common migration risks to evaluate:
- Navigation complexity exceeds estimate (mega-navs are the #1 risk in migrations)
- Additional patterns found on unaudited pages (coverage gaps)
- Performance budget exceeded by complex blocks (JS payload, TBT)
- Content model too complex for authors (Word/GDocs authoring friction)
- Third-party integrations requiring API access (stock tickers, search, consent)
- Responsive image handling causing CLS (dual hero images, lazy load timing)
```

---

### Step 6: Reconcile and Present Results

**Reconciliation check:** Before presenting results, verify artifact consistency:
1. Open `block-inventory.md` — confirm it contains ONLY existing blocks (no "Blocks to Create" or "Blocks to Modify" sections). If such sections exist, **delete them**.
2. Open `patterns.md` — confirm patterns are listed neutrally with frequencies, without tier classification labels.
3. Open `gap-analysis.md` — confirm it is the sole source of tier classification, effort estimates, and build recommendations.
4. Cross-check: every pattern in `patterns.md` must appear in exactly one tier of `gap-analysis.md`. If any pattern is missing, classify it. If any tier entry doesn't correspond to a pattern, remove it.

**Summarize findings to the user:**
- Total unique patterns found and classification breakdown
- Which blocks must be created (Tier 3) — these are the critical path
- Which blocks need variants (Tier 2) — usually faster to implement
- Which pages can be imported immediately (only Tier 1 patterns)
- Recommended execution order for block development
- Estimated scope (rough sense of effort)
- Key structural decisions that need stakeholder input
- Top risks and mitigations

## Output

This skill produces three artifacts in `.specify/migration/`:

1. **`patterns.md`** — Deduplicated pattern inventory with frequencies and locations
2. **`gap-analysis.md`** — Classified gap analysis with speckit tiers, priority queue, and page readiness
3. **`block-inventory.md`** — Available blocks catalog (from block-inventory skill)

Plus per-page scrape data in `.specify/migration/pages/`.

## Next Steps After Audit

The gap analysis directly feeds into three parallel workstreams:

1. **Design token extraction** — Use the Global Style Observations to populate `styles/styles.css` with CSS custom properties. (No existing skill — manual or create `design-token-extraction` skill.)

2. **Block development** — Work through the Recommended Execution Order:
   - **Tier 3 blocks:** Run `/speckit-specify` for each, then full pipeline
   - **Tier 2 variants:** Run abbreviated speckit for each
   - **Tier 1 blocks:** Verify visual output, no code needed

3. **Page import** — As blocks become available, use the **page-import** skill for each page. The Page Readiness Matrix shows which pages are unblocked.

## Key Principles

**Coverage over depth.** The audit identifies what to build — it doesn't build anything. Resist the urge to start coding blocks during the audit. Get the full picture first.

**Neutral descriptions first, block names second.** The identify-page-structure and page-decomposition skills deliberately describe patterns neutrally ("grid of items with images and text") before any block mapping happens. This prevents premature commitment to a specific block when a different one might fit better.

**Frequency drives priority.** A pattern on 1 page is less urgent than a pattern on 8 pages, regardless of complexity. The execution order should unblock the most pages fastest.

**Variants over new blocks.** When a pattern could reasonably be a variant of an existing block OR a new block, prefer the variant. It's less code, simpler for authors, and easier to maintain. The gap analysis should reflect this bias.
