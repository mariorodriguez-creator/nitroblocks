# EDS Migration Audit Reference

This reference defines taxonomies, matrices, and criteria to keep audit outputs consistent.

## 1) Deconstruction Taxonomy

Use these categories when inventorying the site:

| Category | Description | Examples |
|---|---|---|
| Template | Repeating page structure type | Home, PLP, PDP, Article |
| Section | Main visual block within a page | Hero, card grid, FAQ |
| Component | Reusable UI unit | Card, CTA, tabs, accordion |
| Content pattern | Recurring authorable structure | Benefit list, comparison table |
| Integration | Visible external dependency | Maps, video embed, SaaS forms |
| Technical constraint | Current limitation affecting migration | Legacy JS dependency |

## 2) Current State Matrix

Classify each element as:

| Decision | Definition | Quick criterion |
|---|---|---|
| Keep | Stays mostly unchanged | Meets goals and quality bar |
| Refactor | Retained with improvements | Works but has consistency issues |
| Replace | Redesigned from the ground up | Broken pattern or high technical cost |
| Retire | Removed | Low value or redundant |

## 3) Atomic Design Taxonomy

| Level | Scope | Expected output |
|---|---|---|
| Tokens | Foundations | Scales and base rules |
| Atoms | Minimum elements | Button, input, badge |
| Molecules | Simple combinations | Search box, card header |
| Organisms | Complex sections | Hero, testimonials, pricing |
| Templates | Page structure | Category template |
| Page Types | Business instances | Landing page, article, product page |

## 4) DS -> EDS Mapping Matrix

Use this as the base matrix:

| DS Element | Atomic Type | EDS Equivalent | Decision | Notes |
|---|---|---|---|---|
| Component name | Atom/Molecule/Organism | Default content / Existing block / New block | Reuse / Adapt / Create | Variants, constraints |

Rules:
- Prioritize `default content` whenever sufficient.
- Prefer existing blocks before proposing new ones.
- Record explicit gaps when no direct equivalent exists.

## 5) Complexity and Estimation

### Task complexity levels

| Level | Criterion | Typical range (days) |
|---|---|---|
| Low | Scoped change, no critical dependencies | 0.5-1 |
| Medium | Variants and light integrations | 1-3 |
| High | New architecture or complex integrations | 3-8 |
| Very high | Multiple teams/external dependencies | 8+ |

### Estimation scenarios

| Scenario | Suggested multiplier | Use case |
|---|---|---|
| Conservative | Base x 1.35 | High uncertainty or technical debt |
| Base | Base x 1.00 | Most likely case |
| Accelerated | Base x 0.80 | High availability, fewer dependencies |

## 6) Weekly Timeline

Include:
- Numbered weeks and date ranges
- Milestones by wave (foundational, scale-out, optimization)
- Critical path
- Parallel work opportunities

Structure template:

| Week | Key deliverables | Dependencies | Risks |
|---|---|---|---|
| 1 | Discovery + complete inventory | Domain access | Incomplete coverage |
| 2 | Token + atom definitions | Branding approval | Decision churn |

## 7) Risks and Assumptions

### Minimum risks to cover
- Incomplete crawl coverage on large or restricted sites
- Content inconsistency across templates
- Third-party dependencies without direct EDS equivalents
- Scope changes during migration

### Minimum assumptions to make explicit
- Weekly team capacity (roles and allocation)
- Stakeholder availability for design system decisions
- Prioritization of critical templates
- Access to required environments and assets

## 8) Completion Checklist

- Full-domain inventory completed
- Target atomic design defined
- DS -> EDS mapping completed
- Migration backlog estimated (days)
- Weekly timeline with milestones and critical path
- Risks and assumptions documented
- Report contains no implementation code
