---
name: speckit-analyze
description: Analyze cross-artifact consistency across spec.md, plan.md, and tasks.md. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-analyze".
disable-model-invocation: true
---

# Speckit Analyze Workflow

Performs read-only cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md.

**STRICTLY READ-ONLY**: Never modify any files. Output a structured analysis report only.

Run AFTER `/speckit-tasks` has produced a complete `tasks.md`.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root. Parse `FEATURE_DIR`.

## Load Artifacts

**Always:**
- **spec.md**: Overview, Functional Requirements, Non-Functional Requirements, User Stories, Edge Cases
- **plan.md**: Architecture/stack, Data Model references, Phases, Technical constraints
- **tasks.md**: Task IDs, descriptions, phase grouping, parallel markers [P], file paths
- **constitution**: `.specify/memory/constitution.md` for principle validation

**When present:**
- **design.md**: Code Scaffold, CSS Skeleton, variant classes, Layout Caveats
- **Block CSS**: Path from plan.md or tasks.md (e.g. `blocks/{blockname}/{blockname}.css`)

## Detection Passes

**Duplication Detection**: Near-duplicate requirements → mark for consolidation.

**Ambiguity Detection**: Vague adjectives (fast, secure, robust) without measurable criteria; unresolved placeholders (TODO, ???).

**Underspecification**: Requirements missing measurable outcomes; user stories missing AC alignment; tasks referencing undefined files.

**Constitution Alignment**: Requirements/plan conflicting with MUST principles (always CRITICAL).

**Coverage Gaps**: Requirements with zero tasks; tasks with no mapped requirement; non-functional requirements not in tasks.

**Inconsistency**: Terminology drift across files; entities in plan but not in spec; task ordering contradictions.

**Variant Implementation** (when design.md and block CSS exist): For each variant class mentioned in design.md (e.g. `.blockname--dark`, `.blockname--light`) for colour or visual overrides, verify the block CSS file contains rules for that selector. If design.md says "adds .blockname--dark for colour overrides" but the block CSS has no `.blockname--dark` (or equivalent) selector with colour properties, flag as MEDIUM. Recommendation: Add CSS for the variant or ensure design.md includes the concrete rules.

**Layout matrix vs CSS** (when `## Layout matrix (flex / grid)` exists in design.md): For each row, verify block CSS applies the stated `flex-direction` (and critical `gap`/width) at the correct breakpoint. If desktop should be `column` but only tablet sets `row` and desktop omits `flex-direction`, flag **MEDIUM** (inherited tablet layout). Verify **mobile-first file order** in `*.css`: base → 600px → 900px → optional 1200px.

## Severity

- **CRITICAL**: Constitution MUST violation, missing core artifact, or zero-coverage requirement blocking baseline
- **HIGH**: Duplicate/conflicting requirement, ambiguous security/performance attribute
- **MEDIUM**: Terminology drift, missing non-functional task coverage
- **LOW**: Style/wording, minor redundancy

## Output Format

```markdown
## Specification Analysis Report

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| A1 | Duplication | HIGH | spec.md:L120 | Two similar requirements | Merge phrasing |

**Coverage Summary Table:**
| Requirement Key | Has Task? | Task IDs | Notes |

**Constitution Alignment Issues:** (if any)
**Unmapped Tasks:** (if any)
**Metrics:** Total Requirements, Total Tasks, Coverage %, Ambiguity Count, Critical Issues Count
```

Limit to 50 findings; summarize overflow.

## Next Actions

- CRITICAL issues: Recommend resolving before `/speckit-implement`
- LOW/MEDIUM only: User may proceed with improvement suggestions
- Offer remediation suggestions (user must explicitly approve before any edits)
