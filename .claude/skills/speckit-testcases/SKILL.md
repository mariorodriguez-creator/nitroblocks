---
name: speckit-testcases
description: Generate a testcases.csv from a speckit feature spec. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-testcases".
disable-model-invocation: true
---

# Speckit Testcases Workflow

Generates `testcases.csv` from the feature spec, covering all user journeys, acceptance criteria, and edge cases.

**Workflow position:** Suggested after `/speckit-specify` or `/speckit-clarify` when spec.md is ready. Can be run at any later phase — not tied to a specific position in the pipeline.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json` from repo root. Parse `FEATURE_DIR`.

## Load Context

- **REQUIRED**: `FEATURE_DIR/spec.md` — user stories, acceptance criteria, edge cases
- **OPTIONAL**: `FEATURE_DIR/quickstart.md`
- Load `.specify/templates/test-cases.csv` for column structure

## Coverage Requirements

| Source | Type | Minimum |
|--------|------|---------|
| User journeys/primary flows | Happy path | One per distinct journey |
| Acceptance Criteria | Functional verification | One or more per AC |
| Edge cases/boundary conditions | Negative/boundary | One per edge case |
| Required-field misconfiguration | Negative/boundary | See sweep rules below |
| Published page behaviour | Publication verification | At least one end-to-end |

### Required-Field Misconfiguration Sweep

For every field the spec marks as **required**, generate test cases for each of these failure modes:

1. **Row absent** — the key-value row is missing entirely
2. **Value empty** — the row is present but the value cell is blank
3. **Value malformed** — the row is present but the value is not in the expected format (e.g. non-ISO date, invented timezone)

Additionally, always include a **zero-input boundary** test: the block header exists but contains no configuration rows at all.

These cases may overlap with edge cases listed in the spec. Deduplicate by title, but never skip a failure mode just because the spec didn't call it out explicitly. The spec's edge-case list is a floor, not a ceiling.

## Test Case Writing Rules

1. **Author perspective**: All steps executable by content author in AEM Editor or published site — no dev tools, no code inspection
2. **Atomic steps**: One action per step
3. **Unambiguous expected results**: Every step has clear, observable expected result
4. **Title pattern**: `[Component / Feature Area] | [What is verified]`
5. **Preconditions in step 1**: First step sets up starting state
6. **No implementation details**: No Java, Sling Models, HTL, or AEM APIs in steps

## CSV Format

```
ID,Work Item Type,Title,Test Step,Step Action,Step Expected,Area Path,Assigned To,State
"","Test Case","[Title]",,,,"Consumer Platforms\Adobe Experience Manager (AEM)","","Design"
,,,"1","[Action]","[Expected]",,,
,,,"2","[Action]","[Expected]",,,
```

- `ID`: always empty
- `Work Item Type`: always `"Test Case"` for header row
- `Area Path`: always `"Consumer Platforms\Adobe Experience Manager (AEM)"`
- `State`: `"Design"` for test case header; empty for step rows

## Test Case Organization

1. Author experience (finding/using component in AEM Editor)
2. Functional / AC verification (one per AC)
3. Variations and combinations
4. Responsive / cross-device (if relevant)
5. Publication verification
6. Edge cases and negative tests
7. Regression guard

## Quality Checklist Before Writing

- [ ] Every user journey has at least one test case
- [ ] Every acceptance criterion has at least one test case
- [ ] Every identified edge case has at least one test case
- [ ] Required-field misconfiguration sweep completed (absent / empty / malformed for each required field, plus zero-input boundary)
- [ ] All test case titles are unique
- [ ] All steps have both action and expected result
- [ ] No step references implementation details
- [ ] At least one test case verifies published page behaviour

## Report

Output: testcases.csv path, total count, coverage breakdown (journeys, ACs, edge cases), unmapped spec sections, and readiness for next phase: `/speckit-testcontent` (recommended to generate reference content in digitalxn-aem-nc-sites-reference-content).

## Errors

- ERROR if `spec.md` not found
- ERROR if `spec.md` contains `[NEEDS CLARIFICATION]` markers
