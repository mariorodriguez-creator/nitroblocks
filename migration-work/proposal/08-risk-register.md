# Risk Register — Zonnic Canada Migration

| ID | Category | Risk | Severity | Likelihood | Impact | Mitigation |
|----|----------|------|----------|------------|--------|------------|
| R1 | Backend | Age-gate + region-cookie mechanics must be replicated as edge middleware. EDS does not natively support gates. | High | High | Site cannot ship without this; it locks every page. | Build a lightweight edge function (Cloudflare Worker / hlx Function) early in Phase 3 (BUILD-INT-01). Static `/age-gate` page sets the cookies. Test in Phase 5. |
| R2 | Performance | Adobe Experience Cloud stack (DTM/Launch + AAM + Target + Analytics + Adcoud + ContentSquare + Qualtrics) is heavy and traditionally render-blocking; loading without breaking Lighthouse-100 is not trivial. | High | High | Lighthouse 100 cannot be held → PSI bot rejects PRs → cannot merge to main | Move ALL of it to `delayed.js`, ≥ 3s after LCP. Use web-worker pattern where vendor allows. Run continuous Lighthouse on every block PR via PSI bot. |
| R3 | Design | Santral typeface — proprietary BAT corporate font. License may not extend to public CDN hosting. | Medium | Medium | Brand team rejects fallback fonts | Confirm license in DISC-02. Self-host with the [font-fallback technique](https://www.aem.live/developer/font-fallback) so fallback fonts visually match before swap. |
| R4 | Integration | PriceSpider commerce widget + Felix online-purchase iframe are vendor-controlled — they may not behave well after LCP and can blow CWV scores. | High | Medium | Lighthouse 100 lost; commerce CTAs lose revenue | Lazy-load via IntersectionObserver per block. Negotiate vendor lazy-load contract. Fall back to a static "Buy at Felix" button if widget cannot meet performance budget. |
| R5 | Integration | Salesforce Embedded Messaging chat introduces a second-origin TLS handshake that can compete with critical-path budget. | Medium | High | TBT spikes, CWV regression | Move to `delayed.js` ≥ 3s after LCP. Negotiate widget owner to allow lazy init. |
| R6 | Design | Site-wide health-warning banner is regulator-mandated and must always render above the fold; locks the LCP candidate. | Medium | High | LCP optimisation flexibility reduced | Keep banner content lightweight (text only); pre-render in HTML; ensure regulator copy is correct. |
| R7 | Accessibility | Source has 4 WCAG AA contrast failures and 1 critical missing-label violation. | Medium | High | Like-for-like migration carries the debt | Normalise text colours in design system (R7 is mitigated by R8 below). Audit forms in TEST-03. |
| R8 | Process | Brand team may resist normalisation deltas (color collapse, font-weight reduction). | Low | Medium | Phase 2 sign-off slips | DISC-14 secures sign-off before Phase 2 starts; Pencil renders the deltas visually for stakeholder review. |
| R9 | Integration | Two Salesforce-backed origins (`bat-sea.my.site.com`, `bat-sea.my.salesforce-scrt.com`) supply account flows the migration team does not own. | High | Medium | Sign-up / contact / chat flows non-functional at cut-over | DISC-05 negotiates contract with BAT platform team early. Build SF API client (BUILD-INT-04) on top of a documented API spec. |
| R10 | Integration | Adobe Target experiments inventory unknown — some may be live and break if not migrated. | Medium | Medium | Personalisation regressions or experiment data loss | DISC-03 audits experiment inventory. Decide migrate / retire per experiment with marketing team. |
| R11 | Integration | ContentSquare RUM + Qualtrics SiteIntercept use heavy synchronous JS. | Medium | Medium | TBT regressions | Same `delayed.js` strategy as R2; TEST-02 enforces budget. |
| R12 | Content | Zonnic site uses 6 font families and 8 weights; normalising to 1 family + 3 weights changes visual feel slightly. | Low | High | Minor visual delta on legacy pages | Stakeholder review in DISC-14 + Pencil walkthrough; document the delta in 02-normalization-report. |
| R13 | Content | Approximately 92 pages to migrate; some pages contain rich custom layouts (campaign archives, Quit Zone) that may not map cleanly to existing organisms. | Medium | Medium | Some pages need bespoke handling | Phase 4 has a review checkpoint per batch; bespoke pages flagged for designer pass; absorb into estimate via 20% contingency. |
| R14 | SEO | URL paths `/ca/en/{slug}` are well-structured; risk is in updating canonical tags + redirects on cut-over. | Medium | Low | SEO traffic dip | MIGRATE-13 produces a redirect spreadsheet validated by SEO lead before cut-over. |
| R15 | Backend | Mapbox API key may be tied to legacy domain. | Low | Low | Store-locator broken on launch | DISC-07 confirms key transferability or provisions a new key. |
| R16 | Process | Bot-detection on the source site (Imperva) limits depth of the planner's automated probe; some integrations may be missed. | Low | Medium | Phase 3 surprises | Verification report calls out LOW-confidence dimensions; Discovery phase walks through remaining gaps with platform team. |
| R17 | Backend | RUM endpoint `rum.hlx.page` already present — suggests parallel EDS work elsewhere in BAT; possibility of duplicated effort or contradictory standards. | Low | Medium | Conflict with parallel BAT EDS efforts | DISC-01 surfaces this with stakeholder; align with BAT global EDS programme if any. |
| R18 | Process | The migration touches a regulated product (nicotine replacement therapy); legal sign-off may be required on any copy or layout change. | High | Medium | Legal review delays Phase 5 | Loop legal early in Discovery (DISC-13); track regulator-mandated content as a separate, unmigratable copy block. |
| R19 | Design | Magenta `#ad1f8c` campaign palette appears on 1 archived page — sunset vs. preserve unclear. | Low | Low | Stakeholder dispute | DISC-14 resolves; default plan = retire (page is archived). |
| R20 | Operations | Hypercare period is only 2 weeks; longer regulated-product sites typically benefit from 4 weeks. | Low | Medium | Tail-risk regressions surface after hypercare | OPS-02 includes a runbook for post-hypercare incidents; option to extend hypercare by negotiation. |

## Categories Summary

- **Design** (R3, R6, R8, R12, R19): font, banner, normalisation deltas, magenta palette
- **Content** (R13, R14, R18): pages, redirects, regulated copy
- **Performance** (R2): Adobe stack, Lighthouse 100
- **Integration** (R4, R5, R9, R10, R11, R15, R17): commerce, chat, Salesforce, Adobe Target, ContentSquare, Qualtrics, Mapbox, RUM
- **Backend** (R1): age-gate edge worker
- **Process** (R7, R16, R20): a11y debt, bot-detection limits, hypercare length

## Severity Scale

- **Critical:** blocks migration or requires architectural change — none currently
- **High:** significant effort increase or timeline risk — R1, R2, R4, R9, R18 (5)
- **Medium:** manageable with planning, adds some effort — R3, R5, R6, R7, R10, R11, R13, R14, R16, R17, R20 (11)
- **Low:** minor inconvenience, easily mitigated — R8, R12, R15, R19 (4)

## Top-5 to brief stakeholders

1. **R1 (age-gate edge worker)** — non-negotiable; needs CDN-level access agreement on day one
2. **R2 (Adobe stack performance)** — Lighthouse 100 is the merge gate; brief marketing/analytics teams that critical-path JS is impossible
3. **R9 (Salesforce ownership)** — secure API documentation + a named platform-team contact in Discovery
4. **R4 (PriceSpider/Felix)** — negotiate vendor lazy-load contract before Phase 3
5. **R18 (legal review)** — loop in regulator-affairs counsel from day one
