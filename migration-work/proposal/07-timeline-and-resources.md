# Timeline and Resources

## Effort Summary

Aggregated from [05-work-items.md](05-work-items.md) using midpoint and max-hours per t-shirt.

| Phase | Items | Min Hours | Max Hours | Min Weeks | Max Weeks |
|-------|------:|---------:|---------:|---------:|---------:|
| 1. Discovery | 13 | 28 | 44 | 1 | 1 |
| 2. Design System Build | 15 | 65 | 116 | 2 | 3 |
| 3. Site Build | 45 | 210 | 400 | 5 | 8 |
| 4. Content Migration | 14 | 55 | 100 | 2 | 3 |
| 5. Testing & UAT | 12 | 55 | 96 | 2 | 3 |
| **Subtotal** | **99** | **413h** | **756h** | **12w** | **18w** |
| +15% contingency | | **475h** | **870h** | **14w** | **21w** |

Single-threaded estimate: **3–4.5 months** calendar time for one dev + supporting designer + content author.

## Resource Allocation (parallel team model)

Assume team of: 2 EDS Developers · 1 Designer · 1 Content Author · 0.5 QA · 0.25 SEO.

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------|---------|---------|---------|---------|---------|
| EDS Developer (Dev A) | Advisory | Partial | **Full** | Partial | **Full** |
| EDS Developer (Dev B) | — | Partial | **Full** | — | Partial |
| Designer | Advisory | **Full** | Partial | — | Advisory |
| Content Author | Advisory | — | Advisory | **Full** | Partial |
| QA | — | — | Partial | Partial | **Full** |
| SEO | Advisory | — | — | Partial | Partial |
| Stakeholder / Architect | **Full** | Advisory | Advisory | Advisory | Advisory |

Parallel calendar target: **~8–11 weeks** from kickoff to go-live.

## Milestones

| Milestone | Target week | Gate criteria |
|---|---:|---|
| M1 — Discovery sign-off | Week 1 | Work plan approved; vendor snippet manifest delivered; minicart decision signed; Santral licensing confirmed |
| M2 — Design system sign-off | Week 4 | Pencil review approved; tokens committed to `styles.css`; Lighthouse budget validated on demo |
| M3 — Alpha build (chrome + hero + 3 content blocks) | Week 6 | Homepage renders end-to-end with sample content; Lighthouse 100 |
| M4 — Beta build (all blocks + snippets) | Week 9 | All 23 blocks demo-ready; all 14 vendor snippets placed and verified |
| M5 — Content migrated | Week 10 | 106 pages authored; redirects in place |
| M6 — UAT complete | Week 11 | Visual diff, WCAG 2.2 AA, Lighthouse 100, author sign-off |
| M7 — Go-live | Week 11–12 | DNS cutover; 24-hour hypercare start |
| M8 — Hypercare end | Week 13–14 | No P1/P2 open; monitoring green |

## Parallelization Opportunities

Concurrent work streams that reduce calendar without increasing effort:

| Stream | Can run in parallel with |
|---|---|
| DS-06/07/08 (spacing, shadows, radii normalization) | DS-02/04/05 (color, type) |
| BUILD-CHROME + BUILD-INT-01..05 snippet drops | BUILD-CONTENT-01..08 (single dev each) |
| BUILD-SPECIAL-01 (product-carousel) | BUILD-CONTENT-09/10/11 (forms) |
| MIGRATE content batches 1–5 | Later BUILD-SPECIAL / BUILD-INT-14 perf verification |
| TEST-01/02 (visual) + TEST-03 (Lighthouse) + TEST-04 (a11y) + TEST-06 (cross-browser) | All four fully parallel |

Sequential bottlenecks (cannot parallelize):

- DISC-02 (snippet manifest) → all BUILD-INT-*
- DS-15 (design sign-off) → all Phase 3
- MIGRATE review checkpoints (each blocks the next batch)
- TEST-11 (go-live) follows every other test

## Calendar View (team-of-4, parallel)

```
W1  ████████  DISC kickoff + snippet manifest collection + initial scrape + decisions
W2  ████████  DS-01..05 (token audit + color + type) + DS-06..08 (spacing/shadow/radii) in parallel
W3  ████████  DS-09..13 (tokens to styles.css + Pencil atoms + molecules + organisms)
W4  ████████  DS-14..15 sign-off · BUILD-CHROME-01..05 scaffolding start · BUILD-INT-01..05 snippet drops
W5  ████████  BUILD-CHROME-06..10 + BUILD-INT-11/13 · BUILD-CONTENT-01..04 wave 1 start
W6  ████████  BUILD-CONTENT-05..08 + BUILD-CONTENT-06 (faq) + BUILD-SPECIAL-01 (product-carousel)
W7  ████████  BUILD-CONTENT-09..11 (forms) + BUILD-INT-06/07 (Salesforce snippets) · BUILD-SPECIAL-05 (store-locator) + BUILD-INT-09 (Mapbox)
W8  ████████  BUILD-SPECIAL-02 (tabbed-carousel — critical) · BUILD-TMPL-01..04 · BUILD-INT-12/14 · MIGRATE-01 orchestrator
W9  ████████  MIGRATE-02/03 batch 1 + checkpoint · TEST-01 visual setup · TEST-03 Lighthouse start
W10 ████████  MIGRATE-04..09 batches 2/blog/FAQ + checkpoints · TEST-04 a11y · TEST-06 cross-browser
W11 ████████  MIGRATE-10..14 specialized + SEO + metadata · TEST-02/07/08/09/10 (visual regression + UAT + integrations)
W12 ████░░░░  TEST-11 go-live checklist + DNS cutover (M7)
W13 ████████  Hypercare 1 (TEST-12)
W14 ████░░░░  Hypercare 2 (TEST-12 wrap) → M8
```

If the minicart scope is dropped (DISC-03), Phase 3 compresses by ~1 week → overall go-live shifts left to **W10–W11**.

## Budget Summary

| Model | Hours | Calendar |
|---|---:|---:|
| Single dev, single-threaded | 475–870h | 12–21 weeks (3–5 months) |
| Team-of-4, parallelized | 475–870h (same effort) | 8–11 weeks + 2 weeks hypercare |
| Team-of-4, minicart deferred | ~410–750h | 7–10 weeks + 2 weeks hypercare |
