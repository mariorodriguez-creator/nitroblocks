# Validation Strategy

How we verify fidelity at every phase gate. Every claim below is measurable.

## Principles

1. **Every phase has a gate** — no work in the next phase until the previous gate passes.
2. **Automated tests run on every PR** — humans never block on regression they could have caught automatically.
3. **Three fidelity axes**: visual, behavioral, content. All three must pass.
4. **Baselines are locked after discovery** — deviation from baseline requires an explicit decision, not a silent accept.

## Phase 1 → 2 Gate: Discovery Sign-off

### Artifacts produced
- Locked scope document (in/out/deferred)
- Architectural decisions (DISC-02 Salesforce, DISC-05 minicart, DISC-08 PriceSpider, DISC-11 Santral licensing)
- Refined work plan with per-item confidence ratings
- Content freeze schedule + author training schedule
- Design baseline: `migration-work/design-extract/` fully validated + second bypass-leak scan clean

### Validation checks
| Check | Method | Pass criteria |
|---|---|---|
| Page inventory complete | All 106 URLs in sitemap-result.json scraped; 25/25 representatives have `cleaned.html` + `network.har` | Scrape coverage = 100% |
| Bypass integrity re-verified | Re-run `verify-extraction.mjs` after `designlang` rerun | 0 consent-banner / 0 chat-widget / 0 age-gate keyword hits |
| Vendor snippet manifest complete | Every integration listed in `01-design-system-audit.md` has a named snippet owner + expected placement | All 14 snippets documented with owners |
| Architectural decisions documented | Written in scope doc + signed off by stakeholder | 4/4 decisions signed |
| Accessibility baseline | Axe-core violations catalogued, each assigned to a block | 100% of violations have owner block |

### Sign-off owner
Stakeholder (product owner) + tech lead.

## Phase 2 → 3 Gate: Design System Sign-off

### Artifacts produced
- `styles/styles.css` with `:root` tokens (colors, type, spacing, radii, shadows, motion)
- `styles/fonts.css` with Santral + fallback metrics
- Pencil canvas with atoms, molecules, and organism frames for top 10 blocks
- Audit docs in `migration-work/design-system/` (color audit, type audit, spacing audit, etc.)

### Validation checks
| Check | Method | Pass criteria |
|---|---|---|
| Token consistency | All values in `styles.css` come from audited token set; no hardcoded hex/px values in block CSS | 0 hardcoded values |
| Contrast (WCAG AA) | Run axe-core on Pencil pages + sample block grid | 0 contrast violations |
| Font weight coverage | All text styles use Santral weights that exist in the font file | 0 missing weights |
| Visual parity on sample | Render a demo page with 3 blocks in new system; visually compare to live site | ≥ 90% pixel-level match |
| Lighthouse sample | Demo page scored on PSI | Performance + Accessibility ≥ 100 |

### Sign-off owner
Designer + tech lead + brand steward (if applicable).

## Phase 3 → 4 Gate: Site Build Complete

### Artifacts produced
- All 23 EDS blocks under `blocks/` with `.js` + `.css`
- Authoring guide per template in `migration-work/templates/`
- `scripts/delayed.js` + `scripts/scripts.js` wired with auto-blocking rules
- Feature-preview URL live on `{branch}--nitroblocks--{owner}.aem.page`

### Validation checks
| Check | Method | Pass criteria |
|---|---|---|
| Linting | `npm run lint` | 0 errors |
| Lighthouse per template | Run PSI on one representative of each template using test content | Performance ≥ 95, a11y ≥ 100, Best Practices ≥ 95, SEO ≥ 100 |
| Block rendering | Each block has a test page; visual diff vs baseline | ≥ 95% match |
| Integration smoke | Login, signup, chat, newsletter, store-locator search work end-to-end | 100% pass |
| Cross-browser smoke | Latest Chrome, Firefox, Safari, Edge — desktop + iOS + Android | No render breaks |
| Unit tests | Logic utilities (forms, Mapbox adapter, carousel math) | All pass |

### Sign-off owner
Tech lead + QA.

## Phase 4 → 5 Gate: Content Migrated

### Artifacts produced
- 106 pages authored under the new EDS content root (Docs/Drive/SharePoint)
- `.helix/redirects.xlsx` with legacy → new URL map
- `bulk-metadata.xlsx` with template values
- Per-batch review notes in `migration-work/migration-log/`

### Validation checks
| Check | Method | Pass criteria |
|---|---|---|
| Content completeness | Diff source page text vs migrated page text for each batch | ≥ 99% text match (allow whitespace/quotes) |
| Redirect coverage | Every legacy URL in the old sitemap has a mapping | 100% of URLs mapped |
| Image asset presence | Every image referenced in migrated pages resolves (HTTP 200) | 0 broken images |
| Metadata parity | OG, canonical, hreflang, title, description match source | 0 missing tags |
| Author spot check | Human review of 100% batch 1, 10% batches 2–5 | 0 content truncation |

### Sign-off owner
Content author lead + SEO + tech lead.

## Phase 5 → Go-live Gate: UAT Complete

### Validation checks
| Check | Method | Pass criteria |
|---|---|---|
| Visual regression | `designlang visual-diff` against live baseline for 25 representatives × 3 viewports | ≤ 3% delta per template |
| Lighthouse | PSI for every template on preview URL | **Performance = 100, a11y = 100, BP = 100, SEO = 100** on every template |
| WCAG 2.2 AA | Axe-core + manual VoiceOver/NVDA pass | 0 critical + 0 serious violations |
| Cross-browser | Safari 15+, Chrome latest, Firefox latest, Edge latest, iOS Safari, Chrome Android | All pass |
| Integration E2E | Playwright suite covering login, signup, password reset, chat open/close, newsletter submit, store-locator search, age-gate flow | All pass |
| Analytics parity | dataLayer events captured in Chrome DevTools match a pre-migration recording | 100% of expected events fire |
| SEO parity | Screaming Frog crawl on preview URL | 0 broken links, 100% canonical/title/description present |
| Author UAT | Author can create a new page and publish | Successful publish on feature preview |
| Rollback drill | DNS rollback rehearsed with ops | Rollback completes in < 15 minutes |
| Legal sign-off | Age gate, privacy, consent reviewed | Signed by legal |

### Sign-off owner
Tech lead + product owner + legal.

## Post go-live: Hypercare

2-week monitoring window (TEST-12).

### Checks
| Check | Tool | Frequency |
|---|---|---|
| Core Web Vitals field | CrUX / RUM | Daily |
| 404 spikes | CDN logs | Daily |
| Error rates | Sentry or equivalent | Continuous |
| Author issues | Triage queue | As reported |
| P1 incidents | On-call | Instant |

### Exit criteria
- Zero P1/P2 incidents open for 5 consecutive days
- Core Web Vitals green on mobile + desktop
- Author training feedback addressed

## Continuous validation (after go-live)

- PR template requires preview URL `https://{branch}--nitroblocks--{owner}.aem.page/{path}` — failure to provide blocks PSI bot check
- Lighthouse CI: every PR tests the touched pages; score < 100 fails the PR
- Axe-core runs in CI on every PR for 5 sampled pages
- Monthly visual-diff snapshot + comparison

## Traceability matrix

Each validation check maps back to a work item so it can be executed, not hand-waved.

| Gate | Key work items | Checks tracked above |
|---|---|---|
| Discovery sign-off | DISC-01..15 | All DISC checks |
| DS sign-off | DS-14 (a11y review) + DS-15 (sign-off) | DS checks |
| Site build | TEST-01..04 | Lighthouse, a11y, visual |
| Content migrated | MIGRATE-02..09 reviews | Content completeness checks |
| Go-live | TEST-05..11 | UAT checks |
| Hypercare end | TEST-12 | Post-go-live checks |
