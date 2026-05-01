# Migration-Planner Verification Report

**Overall confidence:** LOW

## Confidence by dimension

| Dimension | Confidence | Reason |
|---|---|---|
| page_inventory | **HIGH** | corroborated |
| bypass_integrity | **LOW** | overlay fingerprints leaked into extraction |
| design_tokens | **HIGH** | corroborated |
| component_anatomy | **MEDIUM** | anatomy.tsx undersupplied; rely on *-screenshots.json and DOM structure |
| template_coverage | **LOW** | weak evidence |
| third_party_integrations | **LOW** | no direct evidence |
| accessibility | **LOW** | 2 critical WCAG violation(s) at runtime |
| visual_reference | **HIGH** | corroborated |

## Evidence summary

### Page inventory (sitemap)

- Total URLs discovered: 94
- After filtering: 92
- Template groups: 23
- Representative URLs: 23
- Exclusions by reason:
  - test-page: 2

### Bypass

- Overlays detected: age-gate, cookie-consent, salesforce-chat, location-selector
- Probe verified: yes
- Post-extraction leak check: **FAIL** (1 keyword hits)
  - Critical categories: consent-banner

### Design token consistency across templates

- Sampled templates: 5
- Homepage is a safe proxy: yes

### Component anatomy vs DOM evidence

- Signal: UNDERSUPPLIED
- Anatomy components: 2
- DOM organisms: 8
- DOM patterns covered by anatomy: 0%
- Anatomy-only organisms: 2
- DOM-only organisms: 8

> `anatomy.tsx` is a supplementary source and is thinly populated here. Use `*-screenshots.json` + DOM structure aggregate + `identify-page-structure` output as the primary component inventory.

### Runtime accessibility

- Pages scanned: 8
- Total violations: 5
- Critical: 2 · Serious: 5 · Moderate: 0 · Minor: 0

### Scrape coverage

- Representative URLs: 23
- Pages successfully scraped: 8
- Coverage: 35%

### Visual reference (screenshots)

- Total screenshot files: 69
- By viewport: mobile 23, tablet 23, desktop 23
- Templates fully covered (mobile + tablet + desktop): 23 / 23
- Partially covered: 0
- Missing entirely: 0
- Coverage (all-3-viewports / expected): 100%

## How to consume this report

When writing `02-design-system-assessment.md`, use the per-dimension
confidence levels to calibrate claims:

- **HIGH** — state findings plainly ("the site uses 4 core color tokens…")
- **MEDIUM** — qualify ("based on homepage extraction, the color palette appears to use…")
- **LOW** — flag as an open question requiring discovery-phase validation

When writing `08-risk-register.md`, add a risk entry for every LOW
dimension with severity proportional to its impact on downstream phases.
