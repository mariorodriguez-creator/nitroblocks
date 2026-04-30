# Risk Register

Categorized risks with severity (`critical` / `high` / `medium` / `low`) and mitigation.
Every LOW-confidence dimension in [verification/report.md](../verification/report.md) carries a dedicated risk entry.

**Scope note:** third-party integrations are drop-in only (client provides vendor snippets). Risks that were about engineering a custom Salesforce/Mapbox/OneTrust integration have been removed or demoted accordingly. The remaining integration risks concern delivery-time issues (snippet availability, Lighthouse impact, consent gating).

## Summary

| Severity | Count |
|---|---:|
| Critical | 1 |
| High | 6 |
| Medium | 6 |
| Low | 2 |
| **Total** | **15** |

## Discovery confidence risks (from verification/report.md)

| ID | Category | Severity | Risk | Evidence | Mitigation |
|----|----------|----------|------|----------|------------|
| R-01 | Discovery | high | **Bypass integrity LOW** — overlay fingerprints (consent-banner, chat-widget) leaked into the `designlang` output, meaning some extracted styles may belong to OneTrust or Salesforce Chat, not Zonnic. Token counts could be inflated and anatomy contaminated. | `verification/bypass-leak.md` FAIL; 2 keyword hits | In Phase 1 discovery, re-run `designlang` with a strengthened `--ignore` list and verify a second bypass-leak pass is clean before locking the token set. |
| R-02 | Discovery | critical | **Component anatomy LOW** — anatomy covers 0% of DOM patterns. `anatomy.tsx` only produced `Card` and `Button`; real DOM has 28 unique `bat-*` Handlebars components. Block inventory is biased toward what `designlang` happened to sample. | `verification/anatomy-diff.md`; 8 DOM-only organisms | Treat the 20 "develop new" blocks as an estimate. During DISC-04, re-scrape all 25 templates and run the organism catalog refresh; expect ±3 blocks. Budget 10–20% headroom on BUILD phase. |
| R-03 | Discovery | medium | **Template coverage MEDIUM** — only homepage + 9 representatives scraped (40%). 15 templates inferred from sitemap pattern alone. | `verification/report.md` | Complete the scrape (DISC-04). Acceptable to proceed if the remaining templates are variations of already-captured ones. |
| R-04 | Accessibility | high | **Accessibility LOW** — 3 critical + 11 serious WCAG 2.2 AA violations at runtime across 10 sampled pages. Site fails WCAG 2.2 AA today; the migration must not inherit these issues. | `a11y/summary.json` | Catalog every violation during DISC-08. Assign fix ownership to the block that produces the markup (e.g., `link-name` → hero/cta/footer blocks). Gate Phase 5 on zero-critical a11y. |

## Design system risks

| ID | Category | Severity | Risk | Evidence | Mitigation |
|----|----------|----------|------|----------|------------|
| R-05 | Design system | high | **Typography score 35/100** — 5 font families and 8 weights detected. Santral only ships 6 weights; migrating content using unsupported weights will fall back to browser defaults and shift visually. | `zonnic-ca.grade.md`; `zonnic-ca-design-tokens.json` | Normalize in DS-02 → DS-05. Lock a 4-weight / 7-size scale; audit every observed weight/size for closest supported value; document the normalization decisions. |
| R-06 | Design system | medium | **CSS Health score — 179 `!important` rules, 92% unused CSS** — indicates accumulated authoring via Handlebars component overrides. Risk of visual regressions during token refactor. | `zonnic-ca.grade.md`; `01-design-system-audit.md` | Use forensic audit process (migration-design-system skill). Validate each normalization visually with `designlang visual-diff`. |
| R-07 | Design system | medium | **WCAG contrast failures (2)** — low-contrast text/color pair exists in current site. Normalization must fix these. | `zonnic-ca.grade.md` | DS-02 maps out the 27 extracted colors and picks a normalized palette where every text/bg pair meets WCAG AA. Expect 1–2 colors to shift. |
| R-08 | Design system | low | **Santral licensing** — web-font is currently loaded from the BAT infrastructure (`assets.vuse.com`/similar). Ability to redistribute under EDS is unknown. | visual extraction | DISC-07 resolves: either confirm licensing or pick a fallback. If fallback is needed, add DS-16 to swap and re-tune all type sizes. |

## Integration risks (post scope-clarification)

| ID | Category | Severity | Risk | Evidence | Mitigation |
|----|----------|----------|------|----------|------------|
| R-09 | Integration | high | **Vendor snippet availability & change control** — build depends on the client delivering every vendor snippet (OneTrust, Salesforce login/chat, Qualtrics, Mapbox, DTM, GTM, ContentSquare, Target, ad pixels, PriceSpider, ssapi). Late arrival blocks BUILD-INT-*; mid-project changes force re-wiring. | scope handoff from client | DISC-02 produces a snippet manifest with owners + delivery dates. Establish a single "snippets" folder in the repo with a README per snippet and a change log. Weekly check-in with client through Phase 3. |
| R-10 | Delivery | high | **Lighthouse 100 with vendor snippets** — ~14 vendor snippets (25 unique origins) must all load without tanking Core Web Vitals. OneTrust in particular often demands eager placement which blocks LCP. | `verification/third-party-inventory.md` | Default every snippet into `delayed.js`. If OneTrust (or any vendor) demands eager placement, escalate to a performance trade-off decision (DISC-11) before accepting. Gate each BUILD-INT-* item on Lighthouse before/after. |
| R-11 | Integration | medium | **OneTrust consent gating** — downstream tags (GA, Adobe, Qualtrics, PriceSpider) rely on OneTrust having written the consent cookie before they load. If the snippet placement order is wrong in `delayed.js`, analytics may fire with no consent or never fire at all. | vendor behaviour | BUILD-INT-03 explicitly orders: OneTrust first, then consent-gated tags. Verify in BUILD-INT-14 (perf budget) by inspecting network waterfall. |

## Content migration risks

| ID | Category | Severity | Risk | Evidence | Mitigation |
|----|----------|----------|------|----------|------------|
| R-12 | Content | high | **Content freeze feasibility** — marketing team may push campaign content during the migration window. Any mid-flight updates force re-migration of affected pages. | project assumption | DISC-10 coordinates a 3-week freeze window. MIGRATE-01 sets up a change log to capture any emergency updates. |
| R-13 | Content | medium | **Authoring model unfamiliar** — marketing authors have not used EDS before. Risk of content regressions during author UAT. | BAT historically on AEM Sites Classic + CSR | Include 2× author-training sessions in Phase 4. Provide cheat sheet per template. |
| R-14 | Content | medium | **Image re-hosting** — product/hero images currently live on BAT CDN (`assets.vuse.com`). Post-migration must live on AEM DAM or equivalent. | HAR + `cleaned.html` image maps | MIGRATE-11 (media assets) ingests images into the DAM. Budget S–M depending on asset count. |

## Performance and delivery risks

| ID | Category | Severity | Risk | Evidence | Mitigation |
|----|----------|----------|------|----------|------------|
| R-15 | Delivery | low | **Age-gate is required for publication** — Health Canada regulation requires the age gate to remain functional. Cannot be removed, only replaced with an EDS-native version. | regulatory | BUILD-CHROME-08 reproduces the gate with a cookie-based memory (same pattern as today). Legal sign-off required in Phase 5. |

## Risk Monitoring

- Review the register weekly during the migration.
- Convert any LOW-confidence dimension to HIGH or MEDIUM by the end of Phase 1 — otherwise it blocks entry to Phase 2.
- Raise new risks the moment they are detected (do not defer to the next review).
