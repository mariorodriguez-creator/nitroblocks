# Migration Proposal Output Template

Use this template when generating the 10 proposal files in `./migration-work/proposal/`.
Each section below maps to one file. Follow the structure exactly.

---

## 00-executive-summary.md

```markdown
# Migration Proposal: [Site Name]

**Source:** [URL]
**Date:** [date]
**Prepared by:** [agent/team]

## Site Overview

- **Tech stack:** [framework, CMS, CDN, CSS approach]
- **Design quality grade:** [letter grade from designlang]
- **Total pages discovered:** [count]
- **Unique templates:** [count]
- **Unique organisms (blocks needed):** [count]

## Scope Summary

| Category | Count | Effort |
|----------|-------|--------|
| Blocks to reuse as-is | [n] | -- |
| Blocks to adapt (new variants) | [n] | [total t-shirt] |
| Blocks to develop (new) | [n] | [total t-shirt] |
| Templates to define | [n] | [total t-shirt] |
| Pages to migrate | [n] | [total t-shirt] |
| Integrations to handle | [n] | [total t-shirt] |

## Total Estimated Effort

| Phase | Effort Range | Duration |
|-------|-------------|----------|
| 1. Discovery | [range] | [weeks] |
| 2. Design System Build | [range] | [weeks] |
| 3. Site Build | [range] | [weeks] |
| 4. Content Migration | [range] | [weeks] |
| 5. Testing & UAT | [range] | [weeks] |
| **Total** | **[range]** | **[weeks]** |

## Key Risks

[Top 3-5 risks with severity]

## Methodology

- Design system: Pencil (`.pen` files alongside code)
- Development: SDD via speckit (orchestrates CDD internally)
- Content migration: agentic batch processing via page-import with human review checkpoints
- Validation: visual regression + Lighthouse 100 + WCAG 2.2 AA
```

---

## 01-design-system-audit.md

```markdown
# Design System Audit

## Source Site Health

**Grade:** [letter] ([score]/100)
**Dimensions:** [list 8 grade dimensions with scores]

## Foundations Extracted

### Colors
- Primitives: [count] unique values
- Semantic tokens: [count]
- Issues: [contrast failures, inconsistencies]

### Typography
- Font families: [list]
- Scale: [sizes found]
- Issues: [one-off sizes, missing weights]

### Spacing
- Base unit: [detected or inconsistent]
- Scale: [values found]
- Issues: [irregularities]

### Shadows, Radii, Motion
[Summary of each]

## Accessibility
- WCAG pass rate: [percentage]
- Failing pairs: [count]
- Critical failures: [list]

## Tech Stack Fingerprint
- Framework: [detected]
- CSS approach: [Tailwind, custom, Bootstrap, etc.]
- Analytics: [detected services]
- CDN: [detected]

## Third-Party Integrations Detected
[Table: service | category | current loading | migration strategy]

## Backend Dependencies
[List of server-side features that need alternatives]
```

---

## 02-normalization-report.md

```markdown
# Normalization Report

## Principle
The migration target is a normalized, best-practice EDS system -- not a
like-for-like replica of the source.

## Changes Applied

### Colors
- **Removed:** [n] near-duplicate colors consolidated
- **Fixed:** [n] WCAG contrast failures remediated
- **Result:** [n] primitives, [n] semantic tokens

### Typography
- **Removed:** [n] one-off sizes
- **Normalized:** line-heights to [ratio]
- **Result:** [n]-step type scale

### Spacing
- **Normalized to:** [base]px grid
- **Removed:** [n] arbitrary values
- **Result:** [n]-step spacing scale

### Components
- **Merged:** [n] near-duplicate organisms into [n] with variants
- **Rationalized:** [n] molecule patterns

## Delta Summary
| Aspect | Source | Normalized | Change |
|--------|--------|-----------|--------|
| Color tokens | [n] | [n] | -[n] |
| Type sizes | [n] | [n] | -[n] |
| Spacing values | [n] | [n] | -[n] |
| Organisms | [n] | [n] | -[n] |

## Justification
[Why each normalization decision was made]
```

---

## 03-atomic-inventory.md

```markdown
# Atomic Inventory

## Foundations
[Table: token category | count | notes]

## Atoms
[Table: pattern | EDS artifact | notes]

## Molecules
[Table: pattern | appears in organisms | EDS mapping]

## Organisms
[Table: organism | variant count | EDS block | match type (exact/partial/new)]

## Templates
[Table: template name | page count | organisms used | auto-blocking needed]
```

---

## 04-block-mapping.md

```markdown
# Block Mapping

## Reuse As-Is
[Table: organism | Block Collection block | notes]

## Adapt (Add Variants)
[Table: organism | base block | variants needed | effort]

## Develop New
[Table: organism | proposed name | content model sketch | JS complexity |
CSS complexity | reference block | effort]

## Content Model Sketches
For each new block, include:
- Block name
- Row/column structure (what authors type in the table)
- Required vs optional fields
- Variant options (parenthetical: e.g., `block-name (dark)`)
```

---

## 05-work-items.md

```markdown
# Work Items

## Execution Phase 1: Discovery
[Table: ID | Description | Atomic Level | Size | Dependencies | Methodology]

## Execution Phase 2: Design System Build
[Table: same columns]

## Execution Phase 3: Site Build
[Table: same columns]

### Integration Work
[Table: same columns, for BUILD-INT- items]

## Execution Phase 4: Content Migration
[Table: same columns]

## Execution Phase 5: Testing and UAT
[Table: same columns]

## Summary
| Phase | Items | XS | S | M | L | XL |
|-------|-------|----|---|---|---|-----|
[Counts per phase and size]
```

---

## 06-phase-plan.md

```markdown
# Phase Plan

## Phase 1: Discovery ([duration])
**Entry:** signed engagement
**Exit:** approved work plan
[Work items, dependencies, deliverables]

## Phase 2: Design System Build ([duration])
**Entry:** approved work plan
**Exit:** signed-off design system in Pencil
**Tool:** Pencil MCP
[Work items, dependencies, deliverables]

## Phase 3: Site Build ([duration])
**Entry:** signed-off design system
**Exit:** all blocks and templates implemented, integrations working
**Methodology:** SDD via speckit
[Work items grouped by priority, dependencies, deliverables]

## Phase 4: Content Migration ([duration])
**Entry:** all blocks implemented
**Exit:** all content migrated and reviewed
**Approach:** agentic batch via page-import with review checkpoints
[Work items, batch groups, checkpoint schedule]

## Phase 5: Testing and UAT ([duration])
**Entry:** content migrated
**Exit:** go-live approval
[Work items, test types, UAT schedule]

## Critical Path
[Identify items that gate the entire timeline]

## Phase Gate Criteria
[What must be true to proceed from each phase to the next]
```

---

## 07-timeline-and-resources.md

```markdown
# Timeline and Resources

## Effort Summary
| Phase | Min Hours | Max Hours | Min Weeks | Max Weeks |
|-------|----------|----------|----------|----------|
[Per phase from t-shirt aggregation]

## Resource Allocation
| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|------|---------|---------|---------|---------|---------|
| EDS Developer | | | | | |
| Designer | | | | | |
| Content Author | | | | | |
| QA | | | | | |

## Milestones
[Table: milestone | target date | gate criteria]

## Parallelization Opportunities
[Which work items can run concurrently]

## Calendar View
[Week-by-week breakdown if total duration is estimable]
```

---

## 08-risk-register.md

```markdown
# Risk Register

| ID | Category | Risk | Severity | Likelihood | Impact | Mitigation |
|----|----------|------|----------|------------|--------|------------|
[One row per risk]

## Categories
- **Design:** complex interactions, animations, fonts, brand compliance
- **Content:** dynamic content, forms, auth pages, SEO, volume
- **Technical:** performance budget, a11y gaps, browser compat
- **Integration:** third-party dependencies, APIs, auth, vendor lock-in
- **Backend:** SSR features, DB content, sessions, personalization
- **Process:** stakeholder availability, content freeze, training, vendors

## Severity Scale
- **Critical:** blocks migration or requires architectural change
- **High:** significant effort increase or timeline risk
- **Medium:** manageable with planning, adds some effort
- **Low:** minor inconvenience, easily mitigated
```

---

## 09-validation-strategy.md

```markdown
# Validation Strategy

## Per-Phase Validation

### Phase 2 Gate: Design System
- Token coverage: all extracted primitives mapped to normalized tokens
- Component coverage: all organisms have visual specs

### Phase 3 Gate: Site Build
- All blocks render with test content
- Lighthouse >= 100 on test pages
- Linting passes: `npm run lint`
- WCAG 2.2 AA on all blocks

### Phase 4 Gate: Content Migration
- Sample review per template batch (human checkpoint)
- URL redirect mapping verified
- Media assets accessible
- No content truncation

### Phase 5 Gate: Go-Live
- Visual regression: EDS vs original (designlang visual-diff)
- Lighthouse 100 on all page templates
- WCAG 2.2 AA full audit
- Content author sign-off
- SEO checklist (redirects, canonical, sitemap)
- Go-live checklist (DNS, CDN, monitoring)

## Tools
- `designlang visual-diff` for structural comparison
- `designlang drift` for token consistency
- Lighthouse CI for performance
- axe-core or similar for accessibility
- testing-blocks skill for EDS-specific validation
```

---

## migration-proposal.html

Self-contained HTML dashboard (dark theme) generated alongside the Markdown
files. See [dashboard-template.html](dashboard-template.html) for the full
template with CSS, section structure, and `{{PLACEHOLDER}}` markers.

Populate every section from the proposal Markdown files and discovery JSON
artifacts (`sitemap-result.json`, `bypass-result.json`, `*-grade.html`).

**Sections:** Header, KPI stats, Design grade chart, Normalization delta,
Templates grid (with live links from `sitemap-result.json`), Block inventory,
Atomic mapping, Integrations, Work items chart, Effort chart, T-shirt
distribution, Gantt timeline, Resource allocation, Risk register, Methodology,
Footer.

The file must be fully self-contained (inline CSS, no external dependencies)
and openable in any browser.
