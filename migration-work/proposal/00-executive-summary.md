# Migration Proposal: ZONNIC Canada (zonnic.ca/ca/en)

**Source:** https://www.zonnic.ca/ca/en
**Date:** April 29, 2026
**Prepared by:** migration-planner skill (automated discovery)

## Site Overview

- **Tech stack:** Adobe Experience Manager (AEM) author + AEM-served pages hydrated by a client-side-rendering layer built on **Handlebars templates**. Components are named with the `bat-*` prefix (British American Tobacco design system) but they are plain Handlebars-rendered DOM, not Lit/custom Web Components. Migration target is **AEM Edge Delivery Services**, replacing the CSR layer with server-rendered EDS blocks.
- **CSS approach:** Global CSS with five concurrent font stacks, 179 `!important` rules, 11,611 duplicate declarations, 92% unused. Heavily custom; no CSS framework detected.
- **Design quality grade:** **C (71/100)** per designlang — strong Spacing (85), Radii (90), Accessibility rule coverage (88), but weak Typography (35) and CSS Health (35).
- **Total pages discovered (sitemap, locale-filtered):** 106 (142 raw; 28 locale-mismatch excluded, 8 test/bucket pages excluded).
- **Unique URL template groups:** 25 (largest: `blog` 39, `contact-us` 9, `healthcare-professionals` 9, `real-people-real-success` 9, `pouches` 7, `faq` 6).
- **Unique template metadata values:** 3 (`generic-template`, `blog-article-template`, `non-branded-generic-template`).
- **Unique organisms (blocks needed):** 28 `bat-*` component shells catalogued across 10 representative pages (see [03-atomic-inventory.md](03-atomic-inventory.md)).
- **Third-party integrations:** **Not in migration scope.** The client will provide vendor HTML snippets for OneTrust, Salesforce (login/chat), Qualtrics, Mapbox, PriceSpider, Adobe DTM, GTM, ContentSquare, and advertising pixels. The migration team only wires the snippets into `delayed.js` (preserve performance) or the relevant block template. See [01-design-system-audit.md](01-design-system-audit.md).
- **Overall discovery confidence:** **LOW** — the bypass probe did not fully clear overlays (OneTrust + Salesforce chat fingerprints leaked into designlang output), and the designlang anatomy.tsx under-extracted (only 2 organisms surfaced vs. 28 observed in DOM). All downstream estimates carry a corresponding confidence qualifier.

## Scope Summary

| Category | Count | Effort (midpoint) |
|----------|-------|--------|
| Blocks to reuse as-is | 3 | — |
| Blocks to adapt (new variants) | 4 | 18–30h |
| Blocks to develop new | 20 | 150–230h |
| Templates to define (auto-blocking + metadata) | 3 | 20–30h |
| Pages to migrate | 106 | 40–70h |
| Integrations to wire (snippet-drop only; client-provided) | 14 | 15–25h |

## Total Estimated Effort

| Phase | Effort Range | Duration (sequential, 1 dev) |
|-------|-------------|----------|
| 1. Discovery | 28–44h | 1 week |
| 2. Design System Build | 65–116h | 2–3 weeks |
| 3. Site Build | 210–400h | 5–8 weeks |
| 4. Content Migration | 55–100h | 2–3 weeks |
| 5. Testing & UAT | 55–96h | 2–3 weeks |
| **Total (midpoint + 15% contingency)** | **~475–870h** | **~12–19 weeks (~3–4.5 months)** |

Parallelizable with a team: Design System Build can run concurrently with Discovery sign-off, and Integration snippet-drop can run alongside block development. With 2 devs + 1 designer + 1 author the calendar compresses to **~8–11 weeks**.

## Key Risks (top 5)

1. **Age gate on every page (High)** — regulatory requirement for nicotine products (Health Canada). Must render before first paint without tanking LCP. The current Handlebars `bat-agegate-zonnic` renders client-side; the EDS equivalent must be author-controlled and load in the eager path while keeping Lighthouse 100.
2. **Typography grade 35/100 (High)** — 5 concurrent font stacks, 8 font weights, 15 sizes with `13.008px` and `14.4px` one-offs. Normalization is mandatory but requires design decisions that belong to the `migration-design-system` phase.
3. **Discovery confidence LOW (High)** — bypass leaked consent + chat fingerprints into the token extraction, and designlang's anatomy.tsx surfaced only 2 organisms vs 28 observed in DOM. Atomic inventory is DOM-driven and biased toward the 10 scraped templates; long-tail pages were not sampled.
4. **Lighthouse 100 with vendor snippets (Medium)** — even though integrations are drop-in, the client-provided snippets still need strict `delayed.js` discipline and consent-gating to preserve performance. If a vendor demands an eager `<head>` position (typical for OneTrust bootstrap) budget a custom loader.
5. **Snippet availability & change control (Medium)** — the integration plan depends on the client handing off every vendor snippet before go-live. If a vendor changes tag format mid-project, the affected block or `delayed.js` entry needs re-wiring. Establish a single "snippets" manifest and owner early.

Full register: [08-risk-register.md](08-risk-register.md).

## Methodology

- **Design system:** Pencil MCP (`.pen` files committed alongside `styles/styles.css`), built on top of the normalized tokens produced by `migration-design-system`.
- **Development:** SDD via speckit (spec → plan → implement), orchestrating CDD (content-driven-development) internally per block.
- **Content migration:** agentic batch processing via `page-import`, with a human review checkpoint after each template batch (generic, blog, FAQ, product).
- **Validation:** visual-diff (designlang) + Lighthouse 100 (PageSpeed Insights bot) + WCAG 2.2 AA (axe-core runtime scan).

## Output artefacts in this proposal

- `00-executive-summary.md` (this file)
- `01-design-system-audit.md` — raw designlang findings + runtime a11y + integrations
- `02-design-system-assessment.md` — quality scores, normalization scope, confidence calibration
- `03-atomic-inventory.md` — foundations, atoms, molecules, organisms, templates
- `04-block-mapping.md` — organism → EDS block classification
- `05-work-items.md` — ~90 work items across 5 execution phases
- `06-phase-plan.md` — gate criteria and dependencies
- `07-timeline-and-resources.md` — calendar, resource loading, parallelization
- `08-risk-register.md` — 14 categorized risks
- `09-validation-strategy.md` — fidelity verification per phase gate
- `migration-proposal.html` — self-contained HTML dashboard
