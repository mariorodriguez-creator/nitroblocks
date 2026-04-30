# Phase Plan

Gate-driven delivery plan. Each phase has an entry condition, an exit gate, and can only proceed once the gate is green.

## Phase 1: Discovery (1 week)

**Entry:** Signed engagement with stakeholder availability committed for kickoff + client ready to produce the vendor snippet manifest.

**Exit gate:** Approved work plan; LOW-confidence dimensions (bypass-integrity, component-anatomy, accessibility) converted to MEDIUM or HIGH through re-sampling + decisions; vendor snippet manifest received.

**Work items:** DISC-01 through DISC-13 (see [05-work-items.md](05-work-items.md)).

**Deliverables:**
- Locked scope document (what is in / out / deferred)
- Vendor snippet manifest (owner + expected placement for each of ~14 snippets)
- Minicart scope decision (keep / defer / drop)
- Refined t-shirt estimates with per-item confidence
- Content freeze + authoring training schedule

**Key risk addressed:** LOW overall confidence → HIGH/MEDIUM; vendor snippets have named owners.

## Phase 2: Design System Build (2–3 weeks)

**Entry:** Approved work plan from Phase 1 + Santral licensing confirmed.

**Exit gate:** Signed-off design system in Pencil; token set committed to `styles/styles.css`; normalized type scale documented; WCAG contrast failures resolved.

**Tool:** Pencil MCP (`.pen` canvas committed next to code).

**Work items:** DS-01 through DS-15.

**Deliverables:**
- `styles/styles.css` with full `:root` token set (colors, typography, spacing, shadows, radii, motion)
- `styles/fonts.css` with Santral + fallback metrics
- `migration-work/design-system/` with audit documentation
- Pencil canvas with atoms + molecules + organism frames for top 10 blocks
- Design review sign-off artifacts

**Key risk addressed:** Typography 35/100 score → normalized 4-weight / 7-size scale.

**Parallelization:** DS-06 (spacing) + DS-07 (shadows) + DS-08 (radii) can run in parallel with DS-02–05 (color + typography). DS-11–13 (Pencil frames) can start once DS-09 is partial.

## Phase 3: Site Build (5–8 weeks)

**Entry:** Signed-off design system from Phase 2. Vendor snippet manifest delivered by client (DISC-02).

**Exit gate:** All blocks and templates implemented, Lighthouse ≥ 100 on every template using test content, all vendor snippets placed and verified on feature-preview URL.

**Methodology:** SDD via speckit, invoking content-driven-development per block.

**Work items:** All BUILD-CHROME-*, BUILD-CONTENT-*, BUILD-SPECIAL-*, BUILD-TMPL-*, BUILD-INT-*.

**Build order (recommended):**

1. **Week 1 — Scaffolding**: BUILD-CHROME-01…05 (core files, delayed.js, fonts), BUILD-INT-01…05 (drop DTM/GTM/OneTrust/ContentSquare/Qualtrics snippets into delayed.js), BUILD-INT-11/13 (RUM confirm + unpkg self-host).
2. **Week 2 — Global chrome**: BUILD-CHROME-06 (header), BUILD-CHROME-07 (footer), BUILD-CHROME-08 (age-gate), BUILD-CHROME-09 (announcement-bar), BUILD-CHROME-10 (location-selector + modal).
3. **Week 3–4 — Content blocks (wave 1)**: BUILD-CONTENT-01 (hero), BUILD-CONTENT-02 (masthead-card), BUILD-CONTENT-03 (blurb-card), BUILD-CONTENT-04 (blog cards), BUILD-CONTENT-07 (cta), BUILD-CONTENT-08 (text-box), BUILD-CONTENT-06 (faq).
4. **Week 5 — Content blocks (wave 2)**: BUILD-CONTENT-09 (signup-form), BUILD-CONTENT-10 (login-form), BUILD-CONTENT-11 (password-reset), BUILD-CONTENT-05 (contact-card). Once forms land, BUILD-INT-06 (Salesforce auth snippets into forms) + BUILD-INT-07 (chat snippet) run in parallel.
5. **Week 6 — Specialized**: BUILD-SPECIAL-01 (product-carousel), BUILD-SPECIAL-05 (store-locator) + BUILD-INT-09 (Mapbox snippet), BUILD-SPECIAL-02 (tabbed-carousel — **critical path XL**).
6. **Week 7 — Commerce (conditional, per DISC-03)**: BUILD-SPECIAL-03 (product-hero), BUILD-SPECIAL-04 (product-card), BUILD-SPECIAL-06 (minicart), BUILD-INT-10 (PriceSpider snippet if retained), BUILD-INT-08 (ssapi snippet if retained).
7. **Week 8 — Snippet verification**: BUILD-INT-12 (Target snippet), BUILD-INT-14 (perf verification per snippet).
8. **Week 8 — Templates + auto-blocking**: BUILD-TMPL-01…04 (authoring guides).

**Deliverables:**
- All 23 EDS blocks in `blocks/` with `.js` + `.css`
- Updated `scripts/scripts.js` with any new auto-blocking rules
- `scripts/delayed.js` with all vendor snippets wired (consent-gated where applicable)
- Feature-preview URL on `{branch}--nitroblocks--{owner}.aem.page` with test content
- Lighthouse ≥ 100 on homepage + article + store-locator templates

**Parallelization:** 2 devs can split: 1 chrome + forms + integration snippets, 1 content + specialized carousels.

**Key risks addressed:** Vendor snippet wiring (BUILD-INT-* + BUILD-INT-14); carousel complexity (BUILD-SPECIAL-02).

## Phase 4: Content Migration (2–3 weeks)

**Entry:** All blocks from Phase 3 implemented; content freeze in effect on source site; redirect map approved.

**Exit gate:** All 106 pages migrated and reviewed; no content truncation; redirects verified; media assets accessible.

**Approach:** Agentic batch via `page-import` skill with mandatory review checkpoint after every template batch.

**Work items:** MIGRATE-01 through MIGRATE-14.

**Batch order:**

1. **Batch 1 (generic-template, ~30 pages)** — homepage + core value-prop pages (why-zonnic, what-is-zonnic, quit-zone, truth-about-zonnic, etc.)
2. **Review checkpoint 1** — human review of 100% of batch, codify fixes into orchestrator for later batches
3. **Batch 2 (generic-template, ~30 pages)** — healthcare-professionals, real-people-real-success, testimonials, insurance
4. **Review checkpoint 2**
5. **Batch 3 (blog-article-template, ~40 pages)** — complete blog migration
6. **Review checkpoint 3**
7. **Batch 4 (FAQ, ~12 pages)** — mixed faq + faq-old-donotindex
8. **Review checkpoint 4**
9. **Batch 5 (specialized, ~5 pages)** — store-locator, newsletter, sign-up, contact-us, email-verification
10. **Review checkpoint 5**

**Deliverables:**
- 106 pages authored to the new EDS content root
- Redirect sheet published via EDS `.helix/redirects.xlsx`
- Images accessible under AEM DAM / equivalent
- `bulk-metadata.xlsx` applied with correct template values

**Parallelization:** Review checkpoints are sequential; agentic scraping can run in parallel across batches.

## Phase 5: Testing and UAT (2–3 weeks)

**Entry:** Content migrated; all preview URLs accessible.

**Exit gate:** Go-live approval.

**Work items:** TEST-01 through TEST-12.

**Test types:**
- **Visual regression** — designlang `visual-diff` on 25 representative templates
- **Performance** — Lighthouse 100 on every template + mobile LCP budget
- **Accessibility** — axe-core full scan + manual VoiceOver / NVDA pass
- **Cross-browser** — Safari iOS, Chrome Android, desktop Chrome/Firefox/Edge/Safari
- **Integration E2E** — login, signup, password reset, chat, newsletter, store-locator search
- **Content UAT** — author training session + feedback collection → iteration
- **SEO** — redirects, canonical URLs, sitemap.xml, JSON-LD, hreflang
- **Analytics** — Adobe DTM dataLayer events fire correctly + Adobe Target surface visible
- **Go-live checklist** — DNS swap plan, CDN warm, monitoring on, rollback drill
- **Hypercare** — 1–2 weeks of triage queue monitoring

**Parallelization:** Automated tests (visual, Lighthouse, axe, cross-browser) run in parallel. Author UAT, SEO review, analytics verification are sequential human work.

## Critical Path

These items gate the entire timeline. Any delay shifts the go-live date 1:1.

1. **DISC-02** (vendor snippet manifest delivered by client) — blocks every BUILD-INT-* item
2. **DS-15** (design system sign-off) — blocks all Phase 3
3. **BUILD-SPECIAL-02** (tabbed-carousel, XL) — highest-complexity block
4. **MIGRATE-06** (blog batch, 40 pages, L) — largest content batch
5. **TEST-02 → TEST-11** (visual regression → go-live) — sequential testing chain

## Phase Gate Criteria

| Gate | Criteria |
|---|---|
| Phase 1 → 2 | Work plan approved; vendor snippet manifest delivered; minicart decision signed off; Santral licensing resolved |
| Phase 2 → 3 | Design system approved in Pencil review; tokens committed; no open WCAG contrast failures |
| Phase 3 → 4 | All blocks implemented; Lighthouse ≥ 100 on test content; all vendor snippets placed and verified; content freeze in place |
| Phase 4 → 5 | 106 pages authored; redirects in place; author UAT training scheduled |
| Phase 5 → Go-live | Visual diff delta < 3% per template; Lighthouse = 100 on 100% templates; no WCAG 2.2 AA blocker; stakeholder sign-off |
| Go-live → Complete | 2-week hypercare with zero P1 / P2 bugs outstanding |
