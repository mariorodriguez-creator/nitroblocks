# Effort Reference — AEM EDS Migration Sizing

Use this table when sizing an EDS migration project. All estimates are in **story points** where 1 point ≈ half a developer-day (assuming a 10 pt/week velocity for one developer). Adjust sprint velocity for team size.

---

## Block Development

| Block type | Points | Notes |
|---|---|---|
| Simple display block (rich text, stats, callout) | 2 pts | Minimal JS, straight CSS |
| Standard content block (cards, accordion, tabs) | 3 pts | Moderate JS decoration |
| Complex interactive block (carousel, video, map) | 5 pts | IntersectionObserver, lazy loading |
| Block Collection adaptation (existing reference) | 1 pt | CSS/content model tweaks only |
| 3rd-party integration block (forms, recaptcha, chat) | 8 pts | Auth, API, consent handling |

**Multiplied by**: number of net-new blocks required (after deducting Block Collection equivalents).

---

## Template Wire-up

| Item | Points | Notes |
|---|---|---|
| Simple template (≤4 blocks, no complex layout) | 2 pts | Section metadata + basic sequencing |
| Medium template (5–8 blocks, conditional logic) | 3 pts | Auto-blocking, metadata-driven variants |
| Complex template (9+ blocks, personalisation) | 5 pts | Fragment stitching, lazy sections |

**Multiplied by**: number of distinct page templates.

---

## Core Infrastructure

| Item | Points | Notes |
|---|---|---|
| Global styles (styles.css, lazy-styles.css) | 4 pts | Typography, colour tokens, breakpoints |
| Header + footer blocks | 5 pts | Navigation, mega-menu, responsive |
| scripts.js modifications (auto-blocking, etc.) | 4 pts | Build-phase decoration only |
| Font fallback implementation | 1 pt | Font metric override approach |

---

## Integrations

| Integration | Points | Notes |
|---|---|---|
| Analytics (Adobe Web SDK / GTM) | 5 pts | Data layer + delayed.js integration |
| Cookie consent (OneTrust / similar) | 5 pts | Deferred load, callback hooks |
| Search (Coveo, Algolia, native) | 8 pts | API integration, facets, pagination |
| Forms (Marketo, Veeva, reCAPTCHA) | 8 pts | Validation, submission, GDPR |
| Translation / localisation | 6 pts | Placeholders spreadsheet, hreflang |
| DAM / media integration | 4 pts | Image optimisation pipeline, smart crop |
| Personalisation (Target, AJO) | 10 pts | Deferred fragment loading, experiments |

---

## Content Migration

| Volume | Points | Notes |
|---|---|---|
| Per 100 pages (human-led, author-executed) | 5 pts | Document authoring + preview/publish |
| Per 100 pages (tooling-assisted migration) | 10 pts | Import scripts, QA, redirect mapping |
| Redirect map creation | 3 pts | Spreadsheet + validation |
| Metadata / taxonomy migration | 4 pts | Bulk metadata spreadsheets |

---

## QA and Validation

| Item | Points | Notes |
|---|---|---|
| Functional testing per template | 1 pt | Manual browser testing, 3 viewports |
| Accessibility audit (WCAG 2.2 AA) | 4 pts | Automated + manual, screen reader spot-check |
| Performance validation (Lighthouse 100) | 4 pts | PSI, CWV, image optimisation pass |
| Cross-browser / device testing | 3 pts | Chrome, Safari, Firefox + mobile |

---

## Scenario Calculator

Use these three scenarios when presenting to stakeholders:

### Scenario A — Code-only delivery
> Client authors migrate their own content; dev team delivers code and templates only.

```
= block development
+ template wire-up
+ core infrastructure
+ integrations (relevant subset)
+ QA
```

### Scenario B — Assisted migration
> Dev team also provides import tooling and migrates content in batches.

```
= Scenario A
+ content migration (tooling-assisted, full volume)
+ redirect map
```

### Scenario C — Full project delivery
> End-to-end delivery including performance hardening and accessibility audit.

```
= Scenario B
+ full QA suite
+ performance validation
+ accessibility audit
```

---

## Sprint Velocity Assumptions

| Team composition | Points / week |
|---|---|
| 1 senior developer | 10 pts |
| 1 senior + 1 mid developer | 18 pts |
| 2 senior + 1 mid + 1 QA | 28 pts |

Weeks = Total points ÷ weekly velocity. Add 20% buffer for discovery, PR review, and stakeholder feedback rounds.

---

## Reference: AstraZeneca.com sizing (April 2026)

Actual sizing produced by this methodology as a calibration reference:

| Item | Count | Points |
|---|---|---|
| Templates | 18 | 40 pts |
| Blocks (new) | 25 | 75 pts |
| Blocks (Block Collection) | 8 | 8 pts |
| Core infrastructure | — | 13 pts |
| Integrations | 5 | 34 pts |
| Content migration (2,455 pages, tooling) | — | 10 pts |
| Redirects + metadata | — | 6 pts |
| Full QA | — | 12 pts |
| **Total (Scenario C)** | | **~188 pts** |
| **At 5pts/week (1 dev)** | | **~38 weeks** |
| **At 18pts/week (2 devs)** | | **~11 weeks** |
