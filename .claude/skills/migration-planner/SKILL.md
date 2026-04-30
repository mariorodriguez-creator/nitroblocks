---
name: migration-planner
description: Pre-sales discovery and scoping tool for migrating any website to AEM Edge Delivery Services. Takes a live URL, extracts design system via designlang, maps to EDS blocks using atomic design, and produces a full migration proposal with work items, t-shirt estimates, timeline, risks. Use when the user provides a URL to migrate or asks for a migration plan or proposal.
---

# Migration Planner

Pre-sales discovery tool. Given a live URL, produce a complete EDS migration
proposal: what needs to be built, how long it will take, and what could go wrong.

## When to Use

- User provides a URL and asks to plan/scope a migration to EDS
- User asks for a migration proposal, estimate, or audit
- User wants to understand the full scope before starting migration work

## Prerequisites

- Node.js 20+
- designlang CLI: `npm i -g designlang` (or use via `npx`)
- Playwright + Chromium: `npx playwright install chromium`
- scrape-webpage skill dependencies: `cd .claude/skills/scrape-webpage/scripts && npm install`

## Core Principle

> You are scoping the migration, not normalizing the design system. The planner
> catalogues what exists and estimates the work. It does NOT change token values,
> consolidate colors, snap spacing to grids, or fix typography weights. That heavy
> lifting belongs to the **migration-design-system** skill, which runs a forensic
> multi-audit process against the raw designlang output.
>
> The planner's job is to produce an accurate **inventory and estimate** based on
> designlang's first-pass analysis. Pass through designlang's token values as-is
> in the proposal documents. Flag issues (e.g., "typography consistency scored
> 35/100 — needs normalization") but do not attempt to fix them.

## Input

- **Required:** a live URL (the site to migrate)
- **Optional:** crawl depth override (auto-computed from sitemap by default),
  specific page URLs to analyze, known constraints (e.g., "must keep Algolia
  search")

## Output

Structured files in `./migration-work/proposal/` + visual HTML dashboard.
See [output-template.md](resources/output-template.md) for the Markdown file
template and [dashboard-template.html](resources/dashboard-template.html) for
the HTML dashboard template.

## Workflow

Create a TodoList tracking these phases before starting:
1. Site Discovery
2. Structure Cross-Check (per-representative agent analysis)
3. Atomic Structuring (cataloguing, no normalization)
4. EDS Mapping
5. Work Item Enumeration
6. Proposal Assembly

---

### Phase 1: Site Discovery

The discovery script handles sitemap analysis, overlay bypass, designlang
extraction, grade, and clean screenshots in a single orchestrated run.

#### 1a. Sitemap analysis and depth calculation

The discovery script runs `analyze-sitemap.mjs` **first** to determine scope:

- Fetches `/sitemap.xml` and `robots.txt` for `Sitemap:` directives
- Resolves sitemap indexes recursively, filtering to the input URL's locale
- Excludes test/draft pages (patterns like `/test0`, `/test_prashant`, etc.)
- Computes max URL depth relative to the base path
- Classifies pages into template groups by URL segment
- Picks one representative URL per template group

Output: `./migration-work/sitemap-result.json` with page counts, depth,
template groups, and representative URLs.

#### 1b. Overlay probe and bypass

The script runs `bypass-overlays.mjs` to detect and bypass blocking overlays:

- **Age gates** -- detected via `[class*="agegate"]`, `[data-component-name="ageGate"]`,
  custom elements matching `*-agegate-*`. Bypassed by discovering the cookie the
  site reads (typically `age_verify=confirmed`) and injecting it before navigation.
  Cookie injection is far more reliable than clicking through the gate.
- **Cookie consent** -- detected via `#onetrust-banner-sdk`, `#CybotCookiebotDialog`, etc.
  Bypassed via `OptanonAlertBoxClosed` cookie or by hiding the banner DOM.
- **Third-party widgets** -- Qualtrics, Salesforce chat, etc. Hidden via CSS injection
  to prevent style/z-index leaks into the extraction.
- **Location/language selectors** -- detected and bypassed similarly to age gates.

Output: `./migration-work/bypass-result.json` with bypass cookies, ignore
selectors, and hide CSS selectors.

#### 1c. Design system extraction and hardening

Run the full discovery pipeline:
```bash
bash .claude/skills/migration-planner/scripts/run-discovery.sh "<URL>" [depth-override] [--max-templates N]
```

This orchestrates 11 phases automatically:

| Phase | What it does | Output |
|---|---|---|
| A | Sitemap analysis (compute depth, classify + filter pages) | `migration-work/sitemap-result.json` |
| B | Overlay probe (discover bypass cookies + selectors) | `migration-work/bypass-result.json` |
| C | designlang extraction with `--cookie`, `--ignore-widgets`, `--ignore`, `--wait 3000` | `migration-work/design-extract/*` |
| D | designlang grade + critical-output verification | `migration-work/design-extract/*-grade.*` |
| E | Clean Playwright screenshots at 3 viewports | `migration-work/design-extract/screenshots/` |
| F | Per-template scrape with bypass cookies + HAR capture | `migration-work/pages/{slug}/{cleaned.html, screenshot.png, network.har, metadata.json}` |
| G | Runtime accessibility scan (axe-core) per representative | `migration-work/a11y/{slug}.json` + `summary.json` |
| H | Bypass-leak verification on designlang output | `migration-work/verification/bypass-leak.{json,md}` |
| I | Multi-template grade sampling (5 templates) with delta | `migration-work/verification/grade-delta.{json,md}` |
| J | DOM structure cross-check + anatomy diff + HAR inventory | `migration-work/structure/*`, `migration-work/verification/{anatomy-diff,third-party-inventory}.{json,md}` |
| K | Aggregated verification report with confidence scores | `migration-work/verification/report.{json,md}` |

Depth is auto-computed from the sitemap. Pass an explicit depth as the second
argument to override. `--max-templates N` caps the per-template hardening work
to the top N representative templates (default 10). `--skip-hardening` runs
only phases A-E.

The script does NOT use `--deep-interact` (hangs on gated sites) or
`--screenshots` (misfires on overlay fragments). Phases A-E match the original
pipeline exactly; F-K are additive and non-blocking (any failure logs a
warning and continues).

**Complete designlang output manifest** (all in `./migration-work/design-extract/`):

| File | Purpose | Used By |
|------|---------|---------|
| `*-design-language.md` | 19-section design system narrative (typography, color, spacing, layout, motion, accessibility) | Planner: cataloguing; Design System: audit evidence |
| `*-design-tokens.json` | W3C DTCG tokens — primitive + semantic + composite layers | Planner: cataloguing; Design System: audit input + normalization |
| `*-figma-variables.json` | Figma-compatible variable definitions (color, number, string modes) | Design System: direct import into Pencil via `set_variables` |
| `*-variables.css` | CSS custom properties ready for EDS `styles.css` | Design System: audit input; Site Build: starting point after normalization |
| `*-anatomy.tsx` | Component anatomy with variant × size × state matrices | Planner: organism/molecule identification; Design System: component structure |
| `*-grade.html` | Design quality report card (consistency, accessibility, complexity scores) | Planner: executive summary, risk assessment |
| `*-motion-tokens.json` | Motion language (duration, easing, choreography rules) | Design System: animation tokens; Site Build: transition CSS |
| `*-agent-rules.md` | Design rules inferred from the system (spacing conventions, color usage, layout patterns) | All downstream skills: consistent implementation decisions |
| `screenshots/` | Clean Playwright captures at mobile (375px), tablet (768px), desktop (1280px) | Planner: visual reference; Validate: regression baseline |
| `routes/` | Per-page analysis when depth > 0 (structure, tokens per page) | Discovery: per-template validation evidence |

These files are **gold for downstream skills**. They persist in `./migration-work/design-extract/`
and are the primary source material for design system reconstruction.

**Data flow across skills:**
```
migration-planner
  ├── ./migration-work/design-extract/   (raw designlang outputs -- persisted)
  └── ./migration-work/proposal/         (inventory, mapping, estimate -- no normalization)

migration-discovery
  ├── reads: design-extract/* + proposal/*
  └── writes: ./migration-work/discovery/  (validated adjustments)

migration-design-system
  ├── reads: design-extract/* + proposal/* + discovery/*
  └── writes: ./migration-work/design-system/  (token mapping, .pen file)

migration-site-build
  ├── reads: design-extract/* + proposal/* + design-system/*
  └── writes: blocks/, styles/, scripts/
```

#### 1d. Representative page scraping

Phase F of the discovery script automatically scrapes every representative
URL (up to `--max-templates`) with bypass cookies and HAR capture. Output per
page lands in `./migration-work/pages/{slug}/`:

- `cleaned.html` — body HTML with preserved class/id attributes
- `screenshot.png` — full-page retina screenshot
- `network.har` — full network trace (used by Phase J analyze-har for
  third-party inventory)
- `metadata.json` — SEO tags, OG, JSON-LD, image map, bypass + HAR refs

You should NOT need to invoke scrape-webpage manually — Phase F does it.
Only do so if a specific page outside the representative list needs
analysis (e.g., user supplied a specific URL to investigate). In that case:

```bash
node .claude/skills/scrape-webpage/scripts/analyze-webpage.js "<PAGE_URL>" \
  --output ./migration-work/pages/<slug> \
  --bypass-file ./migration-work/bypass-result.json \
  --capture-har
```

#### 1e. Third-party and backend discovery

Phase J of the discovery script auto-generates
`./migration-work/verification/third-party-inventory.{json,md}` by parsing
the HAR files from Phase F and classifying every origin the browser
contacted. This is evidence-based (not speculative) and replaces the
previous workflow of reading designlang's `stack-intel.json`.

**Use `third-party-inventory.md` as the starting point**, then review each
origin and classify by migration strategy:

- **preserve** -- move to `delayed.js` (analytics, consent, chat)
- **replace** -- swap for EDS-native or simpler alternative
- **remove** -- no longer needed post-migration
- **requires-solution** -- needs architecture decision (server-side search,
  auth, SSR features)

**Flag backend dependencies** that EDS cannot replicate client-side: SSR,
API routes, database queries, user sessions, server-side personalization.
These are inferred from request URLs (form POST endpoints, `/api/*`, GraphQL
introspection, session cookies, etc.).

If `third-party-inventory.md` is empty or only contains the primary
hostname, Phase F likely did not capture HAR successfully. Verify
`./migration-work/pages/{slug}/network.har` exists for each template.

---

### Phase 2: Structure Cross-Check

The discovery script's Phase J already runs `analyze-dom-structure.mjs`
(deterministic DOM traversal) and `compare-anatomy.mjs` (diff against
designlang's anatomy.tsx). That catches fingerprint mismatches.

**This Phase 2 adds an independent agent-driven analysis** per
representative page. designlang's anatomy is token-oriented; the structure
agents are EDS-authoring-oriented. Running both surfaces organisms missing
from designlang's view of the site.

**For each representative page in `./migration-work/pages/{slug}/`** (up
to the top 5 templates by traffic/priority):

1. **Invoke the `identify-page-structure` skill** with:
   - `screenshot.png`
   - `cleaned.html`
   - `metadata.json`

   Output: section list + per-section content sequences, saved to
   `./migration-work/structure/{slug}.md`.

2. **Invoke the `page-decomposition` skill** per section if the page has
   complex layout (multiple full-bleed bands, mixed default content +
   blocks). Save results inline in `{slug}.md`.

3. **Compare against `verification/anatomy-diff.md`** (deterministic J1
   output). The agent-generated structure should corroborate the DOM
   fingerprint diff — if they disagree dramatically, designlang's extraction
   is suspect.

**Do not** run `authoring-analysis` here. That skill makes block vs default
content decisions, which belong to the site-build phase. The planner only
catalogues what exists.

**Output aggregation:** after all representatives are analyzed, read
`verification/report.md`. If `component_anatomy` confidence is LOW and the
agent-generated structures disagree with designlang's anatomy, add an entry
to `08-risk-register.md` calling out that the atomic inventory is
homepage-biased and needs discovery-phase validation.

---

### Phase 3: Atomic Structuring (No Normalization)

Analyze Phase 1 outputs. Catalogue the design system as designlang extracted it
and structure it into atomic design levels. **Do NOT normalize token values.**
Token normalization (color clustering, spacing grid snapping, weight correction,
contrast fixes) is the responsibility of the **migration-design-system** skill.

#### 3a. Foundation cataloguing

From `*-design-tokens.json` and `*-variables.css`:
- List all colors, fonts, sizes, weights, spacing, shadows, radii, and motion
  tokens **exactly as designlang extracted them**
- Report designlang's quality scores per dimension (from `*-grade.html`)
- Flag dimensions that scored poorly and will need normalization work -- but do
  not prescribe the fix
- Note the raw counts: "18 unique colors", "11 font sizes", "21 spacing values"
- **Do NOT** deduplicate colors, consolidate scales, snap to grids, or adjust
  weights -- that work belongs to migration-design-system's audit process

#### 3b. Atom identification

From foundations + `*-anatomy.tsx`:
- Text styles: heading levels, body, captions -> EDS default content styling
- Button patterns -> EDS auto-decoration (primary/secondary/outline via link classes)
- Input patterns, icon usage, image treatment
- **EDS mapping:** atoms = default content styles + `scripts.js` decoration + `:root` CSS vars

#### 3c. Molecule identification

From component anatomy:
- Repeating sub-patterns inside multiple organisms (card units, CTA groups, media-text pairs)
- Identify near-duplicate molecules and note them as candidates for consolidation
  (but let migration-design-system make the final call)
- **EDS mapping:** molecules = internal block structure (repeating rows/columns in block tables)

#### 3d. Organism identification

From section roles + component anatomy:
- Map each unique section type to an organism
- Identify structurally equivalent sections and note them as merge candidates
- Identify variant axes (light/dark, wide/narrow, with-image/without)
- **EDS mapping:** organisms = EDS blocks (1:1)

#### 3e. Template identification

From multi-page route reports:
- Unique page composition patterns (which organisms in what order)
- Define canonical template structures per page type
- **EDS mapping:** templates = auto-blocking rules + section metadata + authoring guides

#### 3f. Design system assessment

Document:
- Raw designlang quality grade and per-dimension scores
- Issues flagged for normalization (e.g., "font weight 400 has 151 uses but
  Santral has no 400 weight -- needs investigation in design-system audit")
- Scope of normalization work needed (estimate hours for the DS phase)
- This becomes `02-design-system-assessment.md` in the proposal

---

### Phase 4: EDS Mapping

Map normalized atomic model to concrete EDS artifacts.

#### 4a. Block inventory

**Invoke block-inventory skill** to catalog:
- Local blocks in this project
- Block Collection blocks available to adopt

#### 4b. Organism-to-block mapping

**Invoke block-collection-and-party skill** for reference implementations.

For each normalized organism, classify:
- **Exact match** -- existing Block Collection block covers it
- **Partial match** -- existing block needs new variants/options
- **No match** -- custom block must be developed

#### 4c. New block specifications

For each "no match" organism:
- Proposed block name (EDS naming: lowercase, hyphenated)
- Content model sketch (rows, columns, required vs optional fields)
- Variant axes (e.g., `hero (dark)`, `hero (centered)`)
- JS complexity: none / decoration-only / interactive / async-data
- CSS complexity: simple / responsive-layout / animation / complex-grid
- Reference: closest Block Collection/Party block for inspiration

#### 4d. Artifact mapping table

| Atomic Level | EDS Artifact | Deliverables |
|---|---|---|
| Foundations | `:root` CSS vars in `styles/styles.css` | Token file, font setup, lazy-styles |
| Atoms | Default content styling + `scripts.js` decoration | Global CSS, button decoration, icons |
| Molecules | Internal block structure | Content model definitions per block |
| Organisms | `blocks/{name}/` | JS + CSS + content model per block |
| Templates | Auto-blocking + section metadata | `scripts.js` rules, authoring guides |
| Pages | Authored content (Docs/Word) | Migration scripts, page-by-page import |

#### 4e. Integration inventory

For each detected integration in `./migration-work/verification/third-party-inventory.md`:
- What it does and how it is currently loaded
- EDS migration strategy: preserve / replace / remove / requires-solution
- Flag items needing architecture decisions

#### 4f. Gap analysis

Summarize:
- Blocks: reuse as-is / adapt / develop new
- Foundations: tokens, fonts, motion to implement
- Templates: auto-blocking rules, authoring guides
- Content: pages per template, import effort
- Integrations: preserve / replace / requires-solution
- Backend gaps: features needing alternative EDS approaches

---

### Phase 5: Work Item Enumeration

Generate work items using [tshirt-estimation-guide.md](resources/tshirt-estimation-guide.md).

Organize by the 5 execution phases:

**Execution Phase 1 -- Discovery** (prefix `DISC-`):
Refine pre-sales plan into final work plan.
- Stakeholder interviews, content audit workshops
- Validate block mapping, template classification, design direction

**Execution Phase 2 -- Design System Build** (prefix `DS-`):
Build normalized design system in Pencil.
- Token definition, atom primitives, molecule composites, organism specs
- Design review and sign-off gate

**Execution Phase 3 -- Site Build** (prefix `BUILD-`):
Development via SDD/speckit methodology.
- Scaffolding, token integration, header/footer
- Core blocks, specialized blocks, template rules
- Integration work (prefix `BUILD-INT-`): analytics, forms, search, auth, e-commerce, widgets, backend replacements

**Execution Phase 4 -- Content Migration** (prefix `MIGRATE-`):
Agentic batch via page-import with review checkpoints.
- Script setup, per-template batches, SEO redirects, media assets
- Review checkpoint per template batch

**Execution Phase 5 -- Testing and UAT** (prefix `TEST-`):
- Visual regression, Lighthouse 100, WCAG 2.2 AA, author UAT, go-live checklist

**Per work item:**
- Unique ID, description, atomic level
- T-shirt size (XS/S/M/L/XL)
- Dependencies, methodology, notes

---

### Phase 6: Proposal Assembly

Write all output files to `./migration-work/proposal/`.
Follow [output-template.md](resources/output-template.md) for structure.

**Files to generate:**

| File | Content |
|------|---------|
| `00-executive-summary.md` | Site overview, scope, key metrics, total estimate, overall confidence (from `verification/report.md`) |
| `01-design-system-audit.md` | Raw designlang findings, grade, accessibility, **runtime a11y summary from `migration-work/a11y/summary.json`** |
| `02-design-system-assessment.md` | Quality scores per dimension, issues flagged for DS phase, normalization scope estimate. **Calibrate every claim by its confidence level from `verification/report.md` (HIGH → state plainly; MEDIUM → qualify; LOW → flag as open question).** |
| `03-atomic-inventory.md` | Foundations, atoms, molecules, organisms, templates. **Cross-reference against `verification/anatomy-diff.md` — list DOM-only organisms as discovered-but-uncatalogued additions.** |
| `04-block-mapping.md` | Organism -> block: reuse / adapt / develop |
| `05-work-items.md` | Full list organized by execution phase |
| `06-phase-plan.md` | 5-phase roadmap with gates and dependencies |
| `07-timeline-and-resources.md` | Calendar, milestones, resource allocation |
| `08-risk-register.md` | Categorized risks with severity and mitigation. **Add a risk entry for every LOW-confidence dimension in `verification/report.md`, with severity proportional to downstream impact.** |
| `09-validation-strategy.md` | Fidelity verification at each phase gate |

**HTML Dashboard:**

Generate `migration-proposal.html` in `./migration-work/proposal/` using the
template at [dashboard-template.html](resources/dashboard-template.html).

The template is a self-contained HTML file with dark theme, inline CSS, and
`{{PLACEHOLDER}}` markers showing where data goes. Read it, then generate the
final HTML by populating every section from the proposal Markdown files and
discovery JSON artifacts.

**Required sections** (all present in the template):

| # | Section | Data Source |
|---|---------|-------------|
| 1 | Header | site name, source stack, URL, date |
| 2 | KPI stat cards | pages, templates, blocks, integrations, work items, effort, weeks, grade |
| 3 | Design grade bar chart | `*-grade.html` / `01-design-system-audit.md` (one bar per dimension, high-to-low) |
| 4 | Design system quality issues table | `02-design-system-assessment.md` |
| 5 | Discovered templates grid | `03-atomic-inventory.md` + `sitemap-result.json` (representative URLs for live links) |
| 6 | Block inventory (stats + table) | `04-block-mapping.md` |
| 7 | Atomic design mapping table | `03-atomic-inventory.md` |
| 8 | Third-party integrations table | `01-design-system-audit.md` |
| 9 | Work items by phase bar chart | `05-work-items.md` |
| 10 | Effort by phase bar chart | `07-timeline-and-resources.md` (midpoint + max range overlay) |
| 11 | T-shirt size distribution | `05-work-items.md` (inline proportion bars) |
| 12 | Project timeline Gantt | `06-phase-plan.md` (week columns, colored bars, critical path in red) |
| 13 | Resource allocation table | `07-timeline-and-resources.md` (pills: Full / Advisory / Partial / —) |
| 14 | Risk register (stats + table) | `08-risk-register.md` |
| 15 | Methodology 3-column | static content from template |
| 16 | Footer | generation meta |

**Styling rules:**
- Dark theme (already in template CSS — do not change to light)
- Use `.pill-*` classes for status pills (reuse/adapt/new/preserve/solution/critical/high/medium/low)
- Use `.pill-advisory` for Advisory/Partial role involvement, `.pill-inactive` for —
- Template cards must include `<a class="live-link">` pointing to the
  representative URL from `sitemap-result.json` (`target="_blank"`)
- Template cards should include an `<img class="thumb">` pointing to the
  desktop screenshot at `../design-extract/screenshots/{slug}-desktop-1440.png`.
  The slug is the template key from `sitemap-result.json` (e.g. `homepage`,
  `pouches`). The template already has a `onerror` fallback to the legacy
  `-desktop.png` filename. If a screenshot does not exist for this slug,
  replace the `<img class="thumb">` with `<div class="thumb thumb-placeholder">no preview</div>`
- Grade bar chart: use `.bar-fill.red` for scores < 50, `.bar-fill.navy` otherwise
- Gantt critical path bar uses `background:var(--red)`
- Hypercare bar uses `background:#555568`

---

## Dos and Don'ts

**DO:**
- Run sitemap analysis first to compute depth -- never hardcode a crawl depth
- Probe for bypass cookies before extraction -- cookie injection is more reliable
  than clicking through overlays (age gates, consent banners, location selectors)
- Use `--wait 3000` for sites with custom Web Component hydration (BAT, Lit, etc.)
- Run designlang extraction before any analysis
- Pass through designlang token values exactly as extracted -- no normalization
- Flag quality issues from designlang's grade for the design-system phase to address
- Identify new blocks explicitly (don't just map to existing)
- Include integration and backend discovery
- Use t-shirt sizes from the estimation guide consistently
- Generate all 10 proposal Markdown files + `migration-proposal.html` dashboard

**DON'T:**
- Don't use `--deep-interact` on sites with age gates or modal overlays (it will hang)
- Don't use designlang's `--screenshots` on gated sites (use the dedicated Playwright
  capture script instead -- designlang's heuristic misfires on overlay fragments)
- Don't pass cookies with `/` in the value to designlang's `--cookie` flag (parser bug
  silently cancels all cookies -- use only simple `name=value` pairs)
- Don't use `networkidle` wait strategy (long-poll trackers like Salesforce/ContentSquare
  prevent it from ever firing -- use `domcontentloaded` + explicit waits instead)
- Don't normalize token values (no color clustering, no grid snapping, no weight fixing)
- Don't propose a "target" palette or "ideal" token set -- that is the DS skill's job
- Don't skip organisms that lack a Block Collection match (spec them as new)
- Don't ignore third-party integrations or backend dependencies
- Don't combine analysis phases -- each builds on the previous
- Don't estimate without the rubric

## Discovery Scripts

The `scripts/` directory contains the automated discovery pipeline:

| Script | Purpose |
|--------|---------|
| `run-discovery.sh` | 11-phase orchestrator (A-K). Phases A-E are the original design extraction; F-K add coverage, verification, and cross-check signals. Flags: `--max-templates N` (default 10), `--skip-hardening` |
| `analyze-sitemap.mjs` | Fetch sitemap, compute depth, classify pages, pick representative URLs. Emits `exclusion_reasons` for every dropped URL |
| `bypass-overlays.mjs` | Probe for age gates/consent/widgets, discover bypass cookies + selectors |
| `capture-clean-screenshots.mjs` | Playwright retina screenshots with cookie bypass + widget hiding. Filenames include pixel width (e.g. `-mobile-375.png`) |
| `a11y-scan.mjs` | **(Phase G)** Runtime WCAG 2.2 AA scan via axe-core per representative page |
| `verify-extraction.mjs` | **(Phase H)** Scan designlang output for overlay / age-gate / consent / chat-widget fingerprints that indicate bypass leakage |
| `grade-sample.mjs` | **(Phase I)** Run `designlang grade` on 3-5 representative templates and emit a per-dimension delta report |
| `analyze-dom-structure.mjs` | **(Phase J1)** Deterministic section + repeating-pattern extraction from scraped HTML |
| `analyze-har.mjs` | **(Phase J)** Third-party origin inventory from HAR files captured in Phase F |
| `compare-anatomy.mjs` | **(Phase J)** Diff designlang's anatomy.tsx against DOM evidence — surfaces over- and under-extraction |
| `build-verification-report.mjs` | **(Phase K)** Aggregate every hardening signal into `verification/report.md` with per-dimension confidence (HIGH / MEDIUM / LOW) |

## Related Skills

- **scrape-webpage** -- invoked in Phase 1d / pipeline Phase F for per-template page scraping (cleaned HTML + HAR)
- **identify-page-structure** -- invoked in Phase 2 per representative page for agent-driven section identification
- **page-decomposition** -- invoked in Phase 2 for per-section sequence analysis on complex pages
- **block-inventory** -- invoked in Phase 4a for block catalog
- **block-collection-and-party** -- invoked in Phase 4b for reference blocks
- **page-import** -- downstream: content migration execution (Execution Phase 4)
- **content-driven-development** / **building-blocks** -- downstream: block development (Execution Phase 3)
- **speckit** skills -- downstream: SDD methodology for site build
- **Pencil MCP** -- downstream: design system definition (Execution Phase 2)
- **testing-blocks** -- downstream: validation (Execution Phase 5)
