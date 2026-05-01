# Timeline and Resources — Zonnic Canada Migration

## Effort Summary

Hours derived from t-shirt midpoint aggregation per `tshirt-estimation-guide.md`. Min uses XS=1, S=2, M=4, L=8, XL=16. Max uses XS=2, S=4, M=8, L=16, XL=40. Then add a 20% contingency buffer.

| Phase | Min hours | Max hours | Min weeks (1 FTE) | Max weeks (1 FTE) | Calendar (typical 3-FTE team) |
|-------|----------|----------|----|---|---|
| 1. Discovery | 80 | 110 | 2.0 | 2.8 | 2 weeks |
| 2. Design System Build | 90 | 130 | 2.3 | 3.3 | 2–3 weeks |
| 3. Site Build | 240 | 340 | 6.0 | 8.5 | 6–8 weeks |
| 4. Content Migration | 80 | 120 | 2.0 | 3.0 | 3–4 weeks (gated by reviews) |
| 5. Testing & UAT + Hypercare | 90 | 130 | 2.3 | 3.3 | 3 weeks |
| **Total** | **580** | **840** | **15** | **21** | **16–20 weeks** |

A 1-FTE timeline would take ≈ 5 calendar months at the lower bound (assuming 35 effective hours per week) and ≈ 7 months at the upper bound. The recommended team is **3 FTE plus 1 designer plus 1 content lead plus 1 QA**, which compresses the total to **16–20 calendar weeks** as shown.

## Resource Allocation

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------|---------|---------|---------|---------|---------|
| Project Manager | 0.5 FTE | 0.25 FTE | 0.25 FTE | 0.25 FTE | 0.25 FTE |
| EDS Developer A | 0.5 FTE | 1.0 FTE | 1.0 FTE | 0.25 FTE | 0.5 FTE |
| EDS Developer B | 0.25 FTE | 0.5 FTE | 1.0 FTE | 0.25 FTE | 0.5 FTE |
| Designer | 0.5 FTE | 1.0 FTE | 0.5 FTE | 0.25 FTE | 0.25 FTE |
| Content Lead | 0.25 FTE | 0.25 FTE | 0.25 FTE | 1.0 FTE | 0.5 FTE |
| QA | — | — | 0.25 FTE | 0.25 FTE | 1.0 FTE |
| Platform / SRE | 0.25 FTE | — | 0.25 FTE | — | 0.5 FTE |

(0.25 FTE ≈ 10 hours per week; 1.0 FTE = full-time on this project)

## Milestones

| # | Milestone | Target week | Gate criteria |
|---|---|---|---|
| M1 | Kick-off complete | week 0 | Project plan circulated, environments provisioned |
| M2 | Discovery sign-off | week 2 | All Phase 1 exit criteria met |
| M3 | Design system signed off | week 5 | Pencil file approved by Zonnic brand team |
| M4 | Homepage live in feature-preview | week 7 | Wave A complete |
| M5 | Campaign template live | week 9 | Wave B complete; analytics on `delayed.js` |
| M6 | Forms live | week 11 | Wave C complete; sign-up form happy-path tested |
| M7 | All blocks live | week 13 | Wave D complete; store-locator working |
| M8 | Content fully migrated | week 17 | Phase 4 sign-off |
| M9 | UAT signed off | week 19 | Phase 5 exit criteria met |
| M10 | Production cut-over | week 20 | DNS / CDN / monitoring live; redirects active |
| M11 | Hypercare ends | week 22 | RUM stable, no regression burn-down active |

## Parallelisation Opportunities

The proposal explicitly relies on these concurrent threads to hit the calendar timeline:

- **Phase 1**: stakeholder track (interviews + sign-offs) runs alongside technical track (atomic structuring + a11y audit).
- **Phase 2**: Pencil design system (designer) runs alongside foundation CSS (developer).
- **Phase 3 Waves A↔D**: edge-worker age-gate (BUILD-INT-01) runs alongside marketing-block development. Store-locator (BLOCK-NEW-08) runs alongside Wave C late half.
- **Phase 4**: media migration (MIGRATE-12), redirect map (MIGRATE-13), bulk metadata (MIGRATE-14) run alongside the page batches.
- **Phase 5**: automated test track and manual/UAT track run in parallel.

## Calendar View (3-FTE typical team)

```
Week:        1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22
─────────────────────────────────────────────────────────────────────────────
Discovery    ██ ██
Design Sys      ▓▓ ██ ██
Site Build              ▓▓ ██ ██ ██ ██ ██ ██ ██
  Wave A               ██ ██
  Wave B                  ██ ██ ██
  Wave C                        ██ ██ ██
  Wave D                              ██ ██
  Wave E                                    ██ ██
Content Mig                                        ██ ██ ██ ██
Testing/UAT                                                 ██ ██ ██
Cutover                                                              ▓▓
Hypercare                                                               ██ ██
```

## Risks to the timeline

| Risk | Worst-case slip |
|---|---|
| Santral license unavailable | +1 week (Phase 2 start delayed) |
| Salesforce API contract not written | +2 weeks (Wave C pushes to Wave D) |
| Edge-worker age-gate harder than scoped | +1 week |
| Adobe Target migration scope unclear | +1 week (Wave D) |
| Content freeze slips | +1–2 weeks in Phase 4 |
| Lighthouse-100 not held with all third-parties | +1 week of perf hardening |
