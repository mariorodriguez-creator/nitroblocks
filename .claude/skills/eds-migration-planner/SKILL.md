---
name: eds-migration-planner
description: Scope and produce a project plan for migrating a live website to Adobe Edge Delivery Services. The plan is grounded by applying the same methodology the project itself will follow during execution — deconstruction, design system normalization (atomic design), and conceptual reconstruction in EDS — then converted into task-level estimates and a weekly timeline. Use when the user asks for a migration plan, migration scope, EDS roadmap, estimates, or a timeline from a URL.
---

# EDS Migration Planner

## Primary goal

Scope an EDS migration and turn that scope into a defensible project plan from a live site URL. The headline deliverables are the **task-level estimates**, the **weekly timeline**, and the **wave strategy** that follows from them.

## How the scope is built

The plan is grounded by applying — at planning altitude — the same three-step process the project itself will follow during execution:

1. **Deconstruct** the source site (audit / inventory)
2. **Normalize** the design system (atomic design)
3. **Reconstruct** conceptually in EDS (DS → EDS mapping)

This is intentional: by walking the same path the implementation team will walk, the resulting scope is evidence-based, the backlog is structured the way the work will actually be done, and the methodology stays consistent from kickoff through cutover. The audit and mapping outputs are **inputs to the scope**, not standalone deliverables.

## Expected output

A scoping document and project plan. Do not generate implementation code.

It must include:
- **Task-level estimates** (hybrid model: conservative / base / accelerated)
- **Weekly timeline** with milestones, dependencies, critical path, and parallelisable work
- **Wave strategy** (Foundational → Scale-out → Optimization)
- **Risks, assumptions and dependencies** with mitigations
- **Site deconstruction** (full inventory) — the evidence base for the scope
- **Design system normalization** (atomic design + consistency) — the target shape the scope sizes against
- **Conceptual reconstruction in EDS** (DS → EDS pattern mapping) — the breakdown the estimates are built on

## Skill Contract

### Required input
- Base URL of a live site

### Crawling scope (default)
- Full-domain crawl of the detected internal domain
- Include all discovered internal navigable pages

### Standard exclusions
- External domains
- Tracking query params (e.g. `utm_*`, `gclid`, `fbclid`)
- Non-navigable assets (fonts, JS, CSS, PDFs) except for technical inventory references
- Transactional or non-indexable endpoints (logout, cart, checkout), when applicable

### Output restrictions
- Do not generate blocks, JS, CSS, or implementation HTML
- Do not propose changes as code
- Deliver only audit, mapping, estimation, and roadmap

## Mandatory Workflow

Follow these phases in order and do not skip any.

1. Deconstruction
2. Design system normalization
3. Conceptual reconstruction in EDS
4. Estimation and timeline
5. Final report

## Phase 1: Deconstruction

Goal: understand the current site with evidence.

### Step 1.1 - URL discovery
- Execute full-domain crawling
- Generate a page inventory by template/pattern
- Identify canonical and duplicate paths

### Step 1.2 - Functional and visual inventory
For each recurring template or pattern, extract:
- Layout and content hierarchy
- Navigation (header, menus, breadcrumbs, footer)
- Reusable components
- Forms, validations, and states
- Visible integrations (analytics, embeds, third-party services)
- Technical debt signals (inconsistencies, duplication, anti-patterns)

### Step 1.3 - Current state matrix
Classify each element as:
- Keep
- Refactor
- Replace
- Retire

## Phase 2: Design System Normalization

Goal: distill a clean, scalable, and consistent design system from what the source site already uses — collapsing variants, resolving inconsistencies, and lifting the result into an atomic structure.

### Step 2.1 - Foundations
Define:
- Color, typography, spacing, border radius, shadow, and motion tokens
- WCAG 2.2 AA accessibility principles
- Responsive behavior and interaction state rules

### Step 2.2 - Atomic Design
Design the target inventory:
- Atoms
- Molecules
- Organisms
- Templates
- Page types

### Step 2.3 - Consistency governance
Document:
- Naming conventions
- Allowed variants per component
- Composition rules and constraints
- Visual and accessibility acceptance criteria

## Phase 3: Conceptual Reconstruction in EDS

Goal: translate the target design system into EDS architecture.

### Step 3.1 - DS -> EDS mapping
For each design system component, map it to:
- Default content (if no block is required)
- Existing EDS block (if applicable)
- Required new block (if there is a gap)
- Section metadata and required section variants

### Step 3.2 - Gap analysis
Generate a list of:
- Functional gaps
- Accessibility gaps
- Performance gaps
- Migration risks by dependency or complexity

### Step 3.3 - Migration strategy
Define migration waves/phases:
- Wave 1: Foundational (tokens, base templates, critical components)
- Wave 2: Scale-out (secondary templates and content)
- Wave 3: Optimization (debt cleanup, improvements, hardening)

## Phase 4: Estimation and Timeline

Use a mandatory hybrid model.

### Step 4.1 - Task estimation (days)
- Estimate days for each migration backlog activity
- Include at least three scenarios:
  - Conservative
  - Base
  - Accelerated

### Step 4.2 - Weekly timeline
- Build a week-by-week schedule with milestones
- Include dependencies, critical path, and parallelizable activities
- Show team capacity assumptions

### Step 4.3 - Risk and uncertainty
- Document key assumptions
- Assign uncertainty level per workstream
- Explain schedule/cost deviation triggers

## Phase 5: Final Report

Use the structure in `report-template.md`.

It must include:
- Executive summary
- Deconstruction audit
- Design system proposal
- EDS reconstruction plan with mapping
- Task-level estimates
- Weekly timeline
- Risks, assumptions, and dependencies
- Recommendations and next steps

## Quality Gates

Do not close the plan if any of these are missing:
- Complete hybrid estimates (days + weeks)
- Timeline with milestones and critical path
- Wave strategy (Foundational → Scale-out → Optimization)
- Explicit risks and assumptions with mitigations
- Coverage of the domain page/template inventory (evidence base)
- Complete Keep/Refactor/Replace/Retire matrix
- Complete DS → EDS mapping (no orphan elements)
- Zero implementation code in the output

## Output Format

Precise, consistent and actionable for technical and business stakeholders.

Use:
- Tables for inventories and estimates
- Short lists for risks and decisions
- Sections grouped by phase

## Internal References

- Taxonomy and matrix guide: [reference.md](reference.md)
- Final report template: [report-template.md](report-template.md)

