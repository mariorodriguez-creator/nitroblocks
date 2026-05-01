# Phase Plan — Zonnic Canada Migration

## Phase 1: Discovery (2 weeks)

**Entry criteria:** signed engagement, kick-off scheduled
**Exit criteria:** approved work plan + commercial proposal sign-off

### Tracks (run in parallel)

- **Stakeholder track** (DISC-01, 03, 04, 05, 06, 12, 13, 14, 15) — interviews, contract confirmations, sign-offs
- **Technical validation track** (DISC-08, 09, 10, 11) — atomic structuring, a11y audit, performance baseline
- **Vendor track** (DISC-02, 07) — typeface license, Mapbox key

### Deliverables

- Atomic inventory v2 (validated against `identify-page-structure` per representative URL)
- Approved normalisation deltas (signed)
- Final SOW + commercial proposal
- Go-ahead for Phase 2

---

## Phase 2: Design System Build (2–3 weeks)

**Entry:** approved work plan
**Exit:** signed-off design system in **Pencil** (`.pen`)
**Tool:** Pencil MCP (token + atom + molecule + organism frames)

### Sequence

1. FOUND-01..05 (foundation tokens) — foundation engineer, ~2 days
2. ATOM-01..07 (atom-level CSS, decorators, icon system, banner section style) — runs in parallel — designer + developer, ~3 days
3. FOUND-06 (Pencil design system) — designer, ~3–4 days
4. FOUND-07 (sign-off) — gates Phase 3

### Deliverables

- `styles/styles.css` with all tokens published as CSS variables
- `styles/lazy-styles.css` containing default-content rules
- `styles/fonts.css` with Santral self-host + fallback technique
- `/icons/*.svg` icon library (replaces Font Awesome)
- Pencil file: `migration-work/zonnic-design-system.pen` (committed to repo)
- One-page design-system reference guide for content authors

---

## Phase 3: Site Build (6–8 weeks)

**Entry:** signed-off design system
**Exit:** all blocks render with test content, all templates published, all integrations live in feature-preview environment, Lighthouse 100 on every template, WCAG 2.2 AA passes, linting passes
**Methodology:** SDD via `speckit` per block; orchestrated by the `building-blocks` skill (which itself drives `content-driven-development` and `eds-styles` / `eds-wcag` / `eds-analytics` / `eds-documentation` per block)

### Sequence

#### Wave A (week 1) — header / footer / chrome / health-warning

- BLOCK-ADAPT-01, BLOCK-ADAPT-02, ATOM-06 (already built in Phase 2)
- TMPL-01 (homepage scaffolding)
- BUILD-INT-01, BUILD-INT-02 (age-gate edge worker + static gate page)

Goal at end of Wave A: a homepage shell renders with header, footer, warning banner, age-gate flow.

#### Wave B (weeks 2–3) — marketing / content blocks

- BLOCK-NEW-01 (marketing-banner)
- BLOCK-NEW-02 (text-image)
- BLOCK-ADAPT-03 (hero modifiers)
- BLOCK-ADAPT-04 (cards variants)
- BLOCK-ADAPT-05 (testimonial carousel)
- BUILD-INT-07 (OneTrust)
- BUILD-INT-09 (analytics in `delayed.js`)
- TMPL-04 (campaign template)
- TMPL-08 (FAQ template)

Goal: campaign template fully renders with all marketing organisms; analytics + consent live but deferred.

#### Wave C (weeks 3–5) — forms + commerce

- BLOCK-NEW-03 (newsletter-strip)
- BUILD-INT-04 (Salesforce client)
- BLOCK-NEW-04 (sign-up multi-section form) — biggest single block
- BLOCK-NEW-05 (contact form)
- BLOCK-NEW-06 (commerce / PriceSpider)
- BLOCK-NEW-07 (product-header) + TMPL-02 (product-detail template)
- BLOCK-ADAPT-04 already includes article cards → TMPL-03 (blog article template)
- TMPL-07 (form-page template)
- BUILD-INT-05 (PriceSpider)
- BUILD-INT-08 (chat in `delayed.js`)

Goal: end of Wave C every template except store-locator is live.

#### Wave D (weeks 6–7) — store locator + adobe stack

- BLOCK-NEW-08 (store-locator) — single largest work item, runs in parallel with Wave C late half
- TMPL-06 (store-locator template)
- BUILD-INT-06 (Mapbox)
- BUILD-INT-03 (Adobe Experience Cloud full stack — DTM/Launch + Analytics + AAM + Target + Adcoud)
- TMPL-05 (quit-zone template — uses many existing blocks)

Goal: every template, every block, every integration live in feature-preview.

#### Wave E (week 7–8) — hardening

- Lighthouse 100 verification per template (TEST-02 starts early here as a fitness function)
- a11y verification per block (TEST-03 starts early here)
- bug-bash + iteration

### Deliverables

- All blocks, templates, integrations live in feature-preview environment
- Authoring guides per block (`eds-documentation` skill output)
- Self-test report: Lighthouse 100 ✓, WCAG 2.2 AA ✓, lint clean ✓, visual-diff baselines captured

---

## Phase 4: Content Migration (3–4 weeks)

**Entry:** all blocks implemented + content freeze on source site
**Exit:** all 92 pages migrated, reviewed, and approved
**Approach:** agentic batch via `migration-content` skill, which wraps `page-import` per page and adds review checkpoints

### Batches

| Batch | Templates | Pages | Effort |
|---|---|---|---|
| 1 | homepage + transactional | ~5 | S |
| 2 | campaign group A | ~15 | M |
| 3 | campaign group B | ~15 | M |
| 4 | blog articles | ~8 | S |
| 5 | product detail | ~12 | M |
| 6 | healthcare-pro / FAQ / testimonials | ~25 | M |

After every batch: human review checkpoint (designer + content lead). Iteration permitted; lessons feed forward.

### Parallel work

- MIGRATE-12 (media bulk download) runs in week 1 alongside Batch 1
- MIGRATE-13 (redirect mapping) runs in week 1
- MIGRATE-14 (bulk metadata sheet) populated as batches complete

### Deliverables

- 92 pages live in feature-preview
- `redirects.json` published to `/redirects.json`
- `bulk-metadata.json` published
- Content authoring guide signed off by Zonnic content team

---

## Phase 5: Testing and UAT (3 weeks)

**Entry:** content migrated
**Exit:** go-live approval

### Tracks

- **Automated track** (week 1): TEST-01 (visual regression), TEST-02 (Lighthouse), TEST-03 (WCAG), TEST-04 (token drift), TEST-05 (cross-browser)
- **Manual / UAT track** (weeks 1–2): TEST-06 (gate / region flows), TEST-07 (forms), TEST-08 (content author UAT)
- **Sign-off + go-live** (week 3): TEST-09, OPS-01, OPS-02 hypercare begins

### Deliverables

- Test report bundle (visual diff, Lighthouse scores, WCAG report, drift report)
- Go-live checklist completed
- Production traffic cut over
- 2-week hypercare with daily RUM review

---

## Critical Path

The following items gate the entire timeline:

1. **DISC-02 (Santral license)** — without confirmation we cannot host the brand font; affects Phase 2 start
2. **DISC-05 (Salesforce API contract)** — gates BUILD-INT-04 which gates 3 form blocks and BUILD-INT-08 chat
3. **BUILD-INT-01 (Edge-worker age-gate middleware)** — every published page is private until this works; affects Phase 4 content review (cannot reasonably review pages locked behind a broken gate)
4. **BLOCK-NEW-08 (Store locator)** — single largest work item; if it slips, store-locator template ships in Wave E rather than Wave D
5. **MIGRATE-01 → checkpoint cadence** — slippage in batch reviews compresses Phase 5

## Phase Gate Criteria

| Gate | What must be true |
|---|---|
| 1 → 2 | Approved work plan; signed normalisation deltas; vendor licenses confirmed; Salesforce API contract written |
| 2 → 3 | Pencil design system signed off; foundations + atoms in `styles.css`; tokens validated by `designlang drift` against the source |
| 3 → 4 | Every block has a published authoring guide; Lighthouse 100 holds on test pages; lint clean; a11y holds on every block |
| 4 → 5 | Every page in `sitemap-result.json` has a corresponding feature-preview URL; review-checkpoint sign-off complete; redirect map verified |
| 5 → live | Visual diff < 2% per template; Lighthouse 100 sustained over 24h on RUM; WCAG audit clean; SEO checklist signed; go-live checklist green |

## Parallelisation summary

| Phase | Roles concurrently working | Notes |
|---|---|---|
| 1 | platform engineer + designer + analyst + project mgr | most discovery items run independently |
| 2 | foundation engineer + designer | Pencil work happens alongside CSS scaffolding |
| 3 | 2× EDS developers + 1× designer | Waves A→D have built-in parallelism (chrome and edge-worker run alongside marketing blocks) |
| 4 | 1× developer + 1× content reviewer + content authors | batches sequential, reviews short |
| 5 | 1× QA + 1× developer + content authors | automated + manual tracks parallel |
