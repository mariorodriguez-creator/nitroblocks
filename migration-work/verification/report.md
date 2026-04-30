# Migration-Planner Verification Report

**Overall confidence:** LOW

## Confidence by dimension

| Dimension | Confidence | Reason |
|---|---|---|
| page_inventory | **HIGH** | corroborated |
| bypass_integrity | **LOW** | overlay fingerprints leaked into extraction; bypass probe did not verify |
| design_tokens | **HIGH** | corroborated |
| component_anatomy | **LOW** | anatomy does not reflect DOM evidence |
| template_coverage | **MEDIUM** | partial evidence |
| third_party_integrations | **LOW** | no direct evidence |
| accessibility | **LOW** | 3 critical WCAG violation(s) at runtime |
| visual_reference | **HIGH** | corroborated |

## Evidence summary

### Page inventory (sitemap)

- Total URLs discovered: 142
- After filtering: 106
- Template groups: 25
- Representative URLs: 25
- Exclusions by reason:
  - test-page: 6
  - test-bucket: 1
  - test-ip: 1
  - locale-mismatch: 28

### Bypass

- Overlays detected: age-gate, cookie-consent, salesforce-chat, location-selector
- Probe verified: no
- Post-extraction leak check: **FAIL** (2 keyword hits)
  - Critical categories: consent-banner, chat-widget

### Design token consistency across templates

- Sampled templates: 5
- Homepage is a safe proxy: yes

### Component anatomy vs DOM evidence

- Signal: LOW
- DOM patterns covered by anatomy: 0%
- Anatomy-only organisms: 2
- DOM-only organisms: 8

### Runtime accessibility

- Pages scanned: 10
- Total violations: 9
- Critical: 3 · Serious: 11 · Moderate: 0 · Minor: 0

### Scrape coverage

- Representative URLs: 25
- Pages successfully scraped: 10
- Coverage: 40%

### Visual reference (screenshots)

- Total screenshot files: 75
- By viewport: mobile 25, tablet 25, desktop 25
- Templates fully covered (mobile + tablet + desktop): 25 / 25
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
