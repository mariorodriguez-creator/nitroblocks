---
name: speckit-specify
description: Create a new feature specification from a natural language description. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-specify".
disable-model-invocation: true
---

# Speckit Specify Workflow

Creates a feature specification from a natural language description, sets up a feature branch, and validates spec quality.

## User Input

The feature description provided after the skill invocation. Process this as the feature to specify.

## Execution Flow

### 1. Generate Branch Name

Create a concise 2-4 word short name from the feature description:
- Action-noun format: `user-auth`, `analytics-dashboard`, `fix-payment-timeout`
- No longer than 30 characters
- Preserve technical terms (OAuth2, API, JWT)
- Ask user for ticket number (gitflow naming: `feature/<number>-<short-name>`)

### 2. Check for Existing Branches

```bash
git fetch --all --prune
git ls-remote --heads origin | grep -Ei 'refs/heads/.*<ticket-number>-<short-name>$'
```

If branch exists, return ERROR. Do NOT create a duplicate.

### 3. Create Branch and Spec Directory

Run: `.specify/scripts/bash/create-new-feature.sh --json --number <ticket-number> --short-name "<short-name>" "<feature description>"`

Parse JSON output for `BRANCH_NAME` and `SPEC_FILE` paths.

### 4. Load Spec Template

Read `.specify/templates/spec-template.md` for required sections.

### 5. Generate Specification

Focus on WHAT and WHY, not HOW. Written for business stakeholders.

- Parse user description: extract actors, actions, data, constraints
- For unclear aspects: make informed guesses using industry standards; mark only significant ambiguities as `[NEEDS CLARIFICATION: specific question]`
- Prioritize clarifications by impact: scope > security/privacy > UX > content authoring > technical details
- Fill all sections: Project Context, User Story & Testing, Functional Requirements, Non-Functional Requirements (if applicable), Edge Cases
- Consider Phases 1.1 and 1.2 from the **Content Driven Development** skill (.claude/skills/content-driven-development):
   - Content Discovery (CDD Phase 1.1): Search `blocks/` for existing blocks relevant to this feature. For modifications, identify pages already using the block (via `find-block-content.js` or user). Document findings in "Existing Blocks/Patterns" section. See `content-driven-development` skill for the full process.
   - Content Model Design (CDD Phase 1.2): Design the author-facing content model and include it in the spec's "Content Approach" section. Use the `content-modeling` skill for canonical model types and best practices. The content model defines WHAT authors create — it belongs in the spec, not in implementation artifacts.
- Write to `SPEC_FILE`

**Do NOT add implementation details (block decoration JS, CSS selectors, loading phases, code structure).**

### 6. Spec Quality Validation

Generate checklist at `FEATURE_DIR/checklists/requirements-readiness-check.md`:

Items to validate:
- No implementation details in spec
- All mandatory sections completed
- Requirements are testable and unambiguous
- No `[NEEDS CLARIFICATION]` markers remain
- User journeys cover primary flows
- Acceptance criteria clearly stated and testable
- Edge cases and dependencies identified

If `[NEEDS CLARIFICATION]` markers remain, present options to user sequentially:
```
## Question [N]: [Topic]
**Context**: [Quote relevant spec section]
**Suggested Answers**:
| Option | Answer | Implications |
```

After user responds, update spec and re-validate.

### 7. Report

Output: branch name, spec file path, checklist results, and readiness for next phase: `/speckit-plan` (default when spec is ready), or optionally `/speckit-figma-specify` (if Figma design exists), `/speckit-clarify` (if ambiguities remain), or `/speckit-testcases` (spec is ready).

## Guidelines

- Focus on **WHAT** users need and **WHY**
- Avoid HOW (no block JS/CSS, decoration patterns, loading phases, or code structure)
- Written for business stakeholders, not developers
- **Content-first**: always describe the feature from the author's perspective (what they create in their document) before describing visitor-facing behavior. The content model in the spec defines the author-developer contract.
- The content model section defines the block table structure, not implementation — it belongs in the spec because it answers "what do authors create?"
- Do NOT embed checklists in the spec — they are separate files
- Common reasonable defaults (don't ask): Lighthouse 100 target, WCAG 2.2 AA, responsive behavior across standard breakpoints, backward-compatible content models
