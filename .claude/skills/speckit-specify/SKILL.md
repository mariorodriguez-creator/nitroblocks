---
name: speckit-specify
description: Create a new feature specification from a natural language description. Trigger when user invokes the speckit specify workflow, asks to create a feature spec, or starts a new feature with a description.
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
- Prioritize clarifications by impact: scope > security/privacy > UX > technical details
- Fill all sections: Overview, Functional Requirements, User Stories, Acceptance Criteria, Edge Cases
- Write to `SPEC_FILE`

**Do NOT add implementation details (languages, frameworks, code structure).**

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
- Avoid HOW (no tech stack, APIs, code structure)
- Written for business stakeholders, not developers
- Do NOT embed checklists in the spec — they are separate files
- Common reasonable defaults (don't ask): data retention, performance targets, error handling, auth method
