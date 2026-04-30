---
name: migration-discovery
description: Comprehensive site-wide discovery phase led by Requirements Engineering. Generates a discovery plan then executes it task-by-task across multiple agent sessions, persisting state between sessions. Exhaustively validates, adjusts, and expands the migration-planner proposal. Produces a locked scope and refined work plan. Use after migration-planner to run the formal discovery engagement.
---

# Migration Discovery

Execution Phase 1 of the EDS migration pipeline. A thorough, long-running
requirements engineering process that takes the migration-planner's proposal
and refines it into a concrete, locked scope with a refined work plan.

This is NOT a quick validation pass. It is a full discovery engagement covering
the entire site, every template, every component, every integration, and every
edge case -- led by Requirements Engineering with participation from design,
development, content, and client stakeholders.

## Execution Model

This skill runs across **multiple agent sessions**. State is persisted to disk
so any session can pick up where the previous one left off.

1. **First invocation:** generates the discovery plan (`discovery-plan.md`)
2. **Subsequent invocations:** reads the plan, finds the next pending task, executes it
3. **Each session:** updates task status and writes artifacts before ending

The agent should always start by reading the plan state file to understand
where it is in the process.

## When to Use

- After `migration-planner` has produced a proposal and the client has approved
  the engagement
- To produce the final, locked scope before development begins
- When you need to guarantee nothing is missed before committing resources
- To resume discovery work from a previous session

## Scope

This skill covers the **full site**, not samples. The goal is to uncover
hidden scope and refine the plan -- NOT to produce specifications (that's the
build phase's job). Discovery answers: "what exists, what did we miss, and
what's the real effort?"

- Every page template classified and confirmed or reclassified
- Every unique component (organism/molecule) identified and counted
- Every integration found and its migration strategy validated
- Every content type inventoried
- Every edge case and exception surfaced
- Stakeholder sign-off on scope, priorities, and trade-offs

## Roles

| Role | Responsibility |
|------|---------------|
| **Requirements Engineer (lead)** | Drives the process, documents findings, manages sessions |
| **Design** | Validates design system normalization, visual fidelity decisions |
| **Development** | Validates block complexity, integration feasibility, estimates |
| **Content/Authoring** | Validates content models, authoring experience, migration approach |
| **Client stakeholders** | Provide domain knowledge, confirm priorities, approve trade-offs |

## Input

- **Required:** migration-planner proposal in `./migration-work/proposal/`
- **Required:** designlang extraction in `./migration-work/design-extract/`
- **Required:** the source site URL

## Output

- `./migration-work/discovery/` directory containing:
  - `discovery-plan.md` -- the plan itself with task statuses (the state file)
  - `discovery-report.md` -- master findings document (built incrementally)
  - `scope-lock.md` -- final approved scope (signed off)
  - `refined-work-plan.md` -- updated, detailed work plan with refined estimates
  - `component-findings/` -- per-component discovery notes (what was found, not specs)
  - `integration-findings/` -- per-integration findings and strategy confirmation
  - `content-inventory.md` -- full content type inventory
  - `session-log.md` -- chronological record of what was done in each session
  - `decisions-log.md` -- trade-offs and decisions made, with rationale
  - `risks-updated.md` -- refined risk register post-discovery
  - `open-questions.md` -- items requiring further investigation or stakeholder input

- `./migration-work/discovery/refined/` -- refined versions of planner inputs:
  - `normalization-report-refined.md` -- normalization decisions after stakeholder approval
  - `design-tokens-refined.json` -- DTCG tokens after discovery validation (added/removed/corrected)
  - `figma-variables-refined.json` -- variable definitions with confirmed modes/theming
  - `variables-refined.css` -- CSS custom properties after normalization decisions approved
  - `anatomy-refined.tsx` -- component anatomy updated with discovered organisms/variants
  - `motion-tokens-refined.json` -- motion tokens confirmed/adjusted for EDS use
  - `atomic-inventory-refined.md` -- updated atomic inventory (confirmed + newly discovered)
  - `block-mapping-refined.md` -- updated block mapping (reuse/adapt/new reassessed)
  - `integrations-refined.md` -- updated integration inventory with validated strategies

These refined artifacts supersede the planner's originals and become the
authoritative inputs for `migration-design-system` and `migration-site-build`.

---

## Workflow

### On Every Invocation: Resume Protocol

Before doing any work, execute this protocol:

```
1. Check if ./migration-work/discovery/discovery-plan.md exists
   - YES → read it, find next task with status "pending", execute it
   - NO  → this is the first invocation, generate the plan (Step 0)

2. Read ./migration-work/discovery/session-log.md for context on prior sessions

3. Announce: "Resuming discovery — next task: [task ID and title]"
   or: "Starting discovery — generating plan"
```

---

### Step 0: Generate Discovery Plan (First Invocation Only)

Read the migration-planner proposal and designlang extraction to understand scope.
Generate `./migration-work/discovery/discovery-plan.md` with this structure:

```markdown
# Discovery Plan

**Source site:** [URL]
**Generated:** [date]
**Last updated:** [date]
**Overall status:** in-progress

## Progress
- Total tasks: [n]
- Completed: 0
- In progress: 0
- Pending: [n]
- Blocked: 0

---

## Phase A: Setup and Kickoff

### DISC-A1: Verify inputs
- **Status:** pending
- **Requires:** source URL
- **Produces:** confirmation that all required inputs are present
- **Description:** Verify migration-planner proposal and designlang extraction
  are present and complete. Flag any missing or incomplete artifacts.

### DISC-A2: Kickoff preparation
- **Status:** pending
- **Requires:** DISC-A1
- **Produces:** kickoff deck / summary for stakeholders
- **Description:** Prepare discovery kickoff materials. Summarize planner findings,
  identify areas of concern, propose discovery cadence.
- **Stakeholder session:** YES — kickoff with full team + client

### DISC-A3: Discovery cadence agreement
- **Status:** pending
- **Requires:** DISC-A2 (post-session)
- **Produces:** session-log.md entry with agreed cadence
- **Description:** Record agreed session cadence, attendees per track, timeline.

---

## Phase B: Component Audit

### DISC-B1: Full template crawl — [template-group-1]
- **Status:** pending
- **Requires:** DISC-A1
- **Produces:** evidence/[template-group-1]/ scraped pages
- **Description:** Scrape all representative pages for [template-group-1].
  Identify organisms, sections, variants.

### DISC-B2: Full template crawl — [template-group-2]
- **Status:** pending
- ...

[One task per template group from sitemap-result.json]

### DISC-B[n]: Component findings — [organism-name]
- **Status:** pending
- **Requires:** DISC-B1..B[template-count]
- **Produces:** component-findings/[organism-name].md
- **Description:** Document what was found for [organism-name]: where it appears,
  how many variants exist, what's different from planner assumptions, edge cases.

[One task per organism from 03-atomic-inventory.md + any newly discovered]

### DISC-B[n+1]: Component review session
- **Status:** pending
- **Requires:** all DISC-B component findings
- **Stakeholder session:** YES — Design + Development
- **Description:** Walk through all findings. Confirm which organisms are real,
  which were over/under-counted. Identify complexity the planner missed.
  Agree on updated scope.

---

## Phase C: Integration Audit

### DISC-C1: Integration deep-scan — [template-group-1]
- **Status:** pending
- **Requires:** DISC-B1
- **Produces:** list of integrations found on [template-group-1] pages
- **Description:** Inspect script tags, network requests, iframes, form actions
  on all scraped pages for this template group.

[One task per template group]

### DISC-C[n]: Integration findings — [integration-name]
- **Status:** pending
- **Requires:** DISC-C1..C[template-count]
- **Produces:** integration-findings/[integration-name].md
- **Description:** Document what [integration-name] does, how it's loaded,
  confirm/adjust the planner's migration strategy, note dependencies and risks.

[One task per integration from 01-design-system-audit.md + newly discovered]

### DISC-C[n+1]: Integration review session
- **Status:** pending
- **Requires:** all DISC-C integration findings
- **Stakeholder session:** YES — Development + Client
- **Description:** Walk through each integration. Client confirms which are
  still needed vs deprecated. Development validates feasibility of strategies.
  Identify hidden effort the planner missed.

---

## Phase D: Design System Validation

### DISC-D1: Token validation (full site)
- **Status:** pending
- **Requires:** DISC-A1, DISC-B1..B[template-count]
- **Produces:** token-validation.md
- **Description:** Compare raw designlang tokens against normalized proposal
  across ALL route reports. Verify nothing meaningful was dropped.

### DISC-D2: Visual fidelity decisions
- **Status:** pending
- **Requires:** DISC-D1
- **Produces:** decisions-log.md entries
- **Description:** Document each normalization trade-off. Prepare for client review.

### DISC-D3: Design system review session
- **Status:** pending
- **Requires:** DISC-D2
- **Stakeholder session:** YES — Design + Client
- **Description:** Present normalized vs. original. Get explicit approval for
  each normalization decision.

---

## Phase E: Block Mapping Refinement

### DISC-E1: Reuse block validation
- **Status:** pending
- **Requires:** DISC-B component findings complete
- **Produces:** block-mapping-refined.md (reuse section)
- **Description:** For each "reuse" block, verify Block Collection version
  covers ALL discovered variants. Downgrade to "adapt" where it doesn't.

### DISC-E2: Adapt block reassessment
- **Status:** pending
- **Requires:** DISC-B component findings complete
- **Produces:** block-mapping-refined.md (adapt section)
- **Description:** For each "adapt" block, confirm the scope of changes needed
  based on real findings. Reassess effort.

### DISC-E3: New block scope confirmation
- **Status:** pending
- **Requires:** DISC-B component findings complete
- **Produces:** block-mapping-refined.md (new section)
- **Description:** For each "new" block, confirm the scope is accurate: are there
  more variants than assumed? More interactions? Higher complexity? Simpler
  alternatives the planner missed?

### DISC-E4: Block mapping review session
- **Status:** pending
- **Requires:** DISC-E1, DISC-E2, DISC-E3
- **Stakeholder session:** YES — Development
- **Description:** Development validates updated mapping and revised estimates.
  Identify items needing prototyping spikes before committing.

---

## Phase F: Content Landscape

### DISC-F1: Content inventory
- **Status:** pending
- **Requires:** DISC-B1..B[template-count]
- **Produces:** content-inventory.md
- **Description:** Full content type inventory: page counts per template,
  media assets, metadata, URLs, localization, freeform vs structured.
  Identify which templates have consistent structure (batch-migratable) vs
  freeform (manual review required).

### DISC-F2: Content complexity assessment
- **Status:** pending
- **Requires:** DISC-F1
- **Produces:** content-inventory.md (complexity annotations)
- **Description:** For each template group, assess migration difficulty:
  how structured is the content? How much manual review is needed?
  Are there content patterns the planner didn't account for?

### DISC-F3: Content strategy session
- **Status:** pending
- **Requires:** DISC-F1, DISC-F2
- **Stakeholder session:** YES — Content/Authoring + Client
- **Description:** Walk through content landscape. Agree on migration batch
  order, review cadence, and effort implications. Identify content that
  might need restructuring before migration.

---

## Phase G: Estimates and Risks

### DISC-G1: Estimate refinement
- **Status:** pending
- **Requires:** DISC-E4, DISC-C[integration-review], DISC-F3
- **Produces:** refined estimates in refined-work-plan.md
- **Description:** Reassess every work item size based on discovery findings.
  Flag items needing prototyping spikes before committing to an estimate.

### DISC-G2: Risk reassessment
- **Status:** pending
- **Requires:** DISC-G1
- **Produces:** risks-updated.md
- **Description:** Update risk register with discovery findings. New risks,
  mitigated risks, changed severity.

---

## Phase H: Scope Lock

### DISC-H1: Final scope preparation
- **Status:** pending
- **Requires:** DISC-G1, DISC-G2
- **Produces:** scope-lock.md (draft)
- **Description:** Compile complete discovery findings into scope lock document.
  List all in-scope and out-of-scope items.

### DISC-H2: Scope lock session
- **Status:** pending
- **Requires:** DISC-H1
- **Stakeholder session:** YES — full team + client
- **Description:** Present complete findings. Get explicit sign-off.
  Document approved scope, timeline, risks.

### DISC-H3: Refined work plan
- **Status:** pending
- **Requires:** DISC-H2
- **Produces:** refined-work-plan.md (final)
- **Description:** Produce the final work plan with locked scope, refined
  estimates, dependency graph, and critical path.
```

**The plan is dynamic.** As discovery progresses, tasks may be added (new
organisms discovered, new integrations found). The plan file is the living
state of the engagement.

After generating the plan, initialize `session-log.md`:
```markdown
# Session Log

## Session 1 — [date]
- **Tasks completed:** DISC-A1 (plan generation)
- **Findings:** [any initial observations]
- **Next session:** [suggested next tasks]
```

---

### Executing a Task

When executing any task from the plan:

1. **Read** `discovery-plan.md` — find the task, note its requirements
2. **Verify prerequisites** — all required tasks must be `completed`
3. **Mark task** as `in-progress` in the plan file
4. **Execute** the task (invoke skills, analyze data, write artifacts)
5. **Write artifacts** to the specified output location
6. **Mark task** as `completed` in the plan file, add completion date
7. **Update** `session-log.md` with what was done
8. **Update progress counters** at the top of the plan
9. **Check for newly discovered work** — if the task revealed new organisms,
   integrations, or edge cases, ADD new tasks to the plan as `pending`

For tasks marked `Stakeholder session: YES`:
- Prepare materials and present findings to the user
- Wait for input/decisions before marking complete
- Record decisions in `decisions-log.md`
- If the session reveals new requirements, add tasks to the plan

---

### Ending a Session

Before ending any agent session:

1. Ensure current task is marked `completed` or `in-progress` (if interrupted)
2. Update `session-log.md` with session summary
3. Update progress counters in `discovery-plan.md`
4. Note recommended next tasks for the following session

---

## State File Format

The `discovery-plan.md` file uses these task statuses:
- `pending` — not yet started
- `in-progress` — started but not finished (interrupted session)
- `completed` — finished, date noted
- `blocked` — waiting on external input (stakeholder, client, vendor)
- `added` — dynamically added during discovery (was not in original plan)

When a task is completed, append the date:
```markdown
- **Status:** completed (2026-04-30)
```

When a task is blocked, note what it's waiting for:
```markdown
- **Status:** blocked — waiting for client confirmation on analytics vendor
```

---

## How to Test This Skill

For a quick validation (single template group):
- Generate the plan, then execute only DISC-A1 + DISC-B1 (one template crawl)
  + one DISC-B component findings task
- Validates: plan generation, state persistence, artifact production
- Next session: read plan, confirm it picks up at the right task

## Process Notes

- **Duration:** Typically 2-4 weeks depending on site complexity
- **Cadence:** 2-3 sessions per week with relevant stakeholders
- **Artifacts are living documents** — updated throughout discovery
- **Decisions log is critical** — every trade-off recorded with rationale
- **No scope creep after lock** — changes after Phase H go through formal change request
- **Plan evolves** — new tasks are added as complexity is uncovered

## Related Skills

- **migration-planner** — produces the proposal this skill refines
- **scrape-webpage** — invoked to gather evidence across the full site
- **identify-page-structure** — invoked for structure analysis
- **block-inventory** — referenced for block catalog
- **block-collection-and-party** — invoked to verify block matches
- **migration-design-system** — downstream, uses locked scope and findings
- **migration-site-build** — downstream, uses refined work plan and findings
- **migration-content** — downstream, uses content inventory and batch plan
