# Validation Strategy — Zonnic Canada Migration

Each phase has explicit validation gates that must pass before the next phase can begin.

## Per-Phase Validation

### Phase 1 Gate: Discovery → Design System

Required artifacts:
- Atomic inventory v2 confirmed against `identify-page-structure` per representative URL
- Approved normalisation deltas (signed)
- Vendor confirmations: Santral license, Mapbox key, Salesforce API contract
- A11y audit baseline (axe + manual) on representative pages
- PSI baseline on existing site

Pass criteria:
- Stakeholders + brand team + legal sign-off on the proposal
- Atomic inventory delta vs. proposal ≤ 10%
- All HIGH-severity risks (R1, R2, R4, R9, R18) have a named owner

### Phase 2 Gate: Design System

Required artifacts:
- Pencil design system (`migration-work/zonnic-design-system.pen`)
- `styles/styles.css`, `styles/lazy-styles.css`, `styles/fonts.css` populated
- `/icons/*.svg` library
- Section style guide

Pass criteria:
- All extracted primitives (per `01-design-system-audit.md`) mapped to normalised tokens
- All organisms identified in `03-atomic-inventory.md` have visual specs in Pencil
- `designlang drift` clean (target tokens vs. source within negotiated delta)
- Brand team sign-off on Pencil walkthrough

### Phase 3 Gate: Site Build

Required artifacts:
- Every block in `04-block-mapping.md` rendering with test content
- Every template in `03-atomic-inventory.md` rendering at feature-preview URL
- Every integration in `01-design-system-audit.md` ("Third-Party Integrations Detected") configured

Pass criteria (run on every block PR via `testing-blocks` skill):
- **Lighthouse ≥ 100** on the test page (PSI bot enforces in CI)
- **Linting passes:** `npm run lint`
- **WCAG 2.2 AA** on the block (eds-wcag skill: keyboard nav, screen-reader, focus, aria, contrast)
- **Visual diff** against the corresponding clean template screenshot ≤ 5%
- **Token drift** clean (`designlang drift` against the published design system)
- Block has an authoring guide (per `eds-documentation` skill)
- Block exports a default decorate function and uses block-isolated CSS (no `!important`)

### Phase 4 Gate: Content Migration

Required artifacts:
- 92 pages live in feature-preview
- `redirects.json` published
- `bulk-metadata.json` published
- Media assets in published source

Pass criteria (per batch):
- Sample review: random 10% of pages in the batch reviewed by content lead + designer
- URL redirect mapping verified (every old URL → new URL, no 404s)
- Media assets accessible (no broken image errors)
- No content truncation (compare word count with source)
- A11y blocks introduced by migration: zero (a11y must remain at the block-level pass from Phase 3)

### Phase 5 Gate: Go-Live

Required artifacts:
- Visual regression report (designlang `visual-diff` per template)
- Lighthouse 100 sustained over 24h on RUM
- WCAG 2.2 AA full audit (axe + manual + screen-reader on every template)
- Cross-browser smoke test (Chrome / Safari / Firefox / Edge)
- Form submission tests (sign-up + newsletter + contact, happy + error paths)
- Age-gate / region-routing manual flow tests
- Content author UAT sign-off
- SEO checklist (redirects, canonical, sitemap, robots)
- Go-live checklist (DNS, CDN, monitoring, runbook)

Pass criteria:
- Visual diff ≤ 2% per template (or signed-off as intentional delta in 02-normalization-report)
- Lighthouse 100 sustained on every template via RUM
- Zero new WCAG violations beyond the 5 already remediated
- Forms post + receive expected responses
- Age-gate flow end-to-end works (cookie set → page renders → cookie cleared → gate re-appears)
- Stakeholder sign-off (Zonnic brand + content + legal)

## Tools

| Concern | Tool | When |
|---|---|---|
| Visual regression | `designlang visual-diff` | Phase 5 (TEST-01) |
| Token consistency | `designlang drift` | Phase 2 gate, Phase 3 ongoing |
| Performance | Lighthouse CI + PSI bot | every PR + Phase 5 (TEST-02) |
| Performance (live) | EDS RUM (`rum.hlx.page`) | Phase 5 ongoing + hypercare |
| Accessibility | axe-core (CI), screen-reader manual | every block PR + Phase 5 (TEST-03) |
| EDS-specific validation | `testing-blocks` skill | every block PR |
| Linting | `npm run lint` (eslint + stylelint) | every PR (must pass to merge) |
| Browser smoke | Playwright cross-browser | Phase 5 (TEST-05) |
| Code review | `code-review` skill | every PR |

## Continuous Validation (Phase 3 onward)

Per AEM Edge Delivery best practices, every PR is verified by the AEM Code Sync bot via PageSpeed Insights. Any PR with a Lighthouse score < 100 is rejected.

PR description must contain a preview link of the form:

```
https://{branch}--{repo}--{owner}.aem.page/{path}
```

without which the PSI check fails and the PR is automatically rejected. This is enforced on every block, integration, and template PR.

## Hypercare Validation

For 2 weeks after cut-over (OPS-02):

- Daily RUM dashboard review (LCP / CLS / INP / TBT)
- Daily error-log review (Sentry or equivalent)
- Weekly stakeholder check-in
- Track-and-fix any regressions
- Capture and apply fixes to a hypercare runbook for post-hypercare reference

## Rollback Strategy

If a major regression is found post-cutover:

1. **Within 4h:** revert DNS to legacy AEM origin (TTL was lowered to 5min during cutover)
2. **Within 24h:** identify the regression, fix in feature-preview, validate via Phase 5 gate, re-cutover
3. **If unfixable:** escalate to brand team; may require regulator notification depending on impact

The legacy AEM origin remains live (read-only) for 30 days post-cutover to support rollback.
