---
name: athenai-testcases
description: Phase 4 of athenai-implement pipeline — generate testcases.csv from spec.md. Includes guard for --no-test-cases flag and coverage requirements for user journeys, acceptance criteria, and edge cases.
---
# Athenai Test Cases — Phase 4

**Goal**: Produce `testcases.csv`.

## Guard (when --no-test-cases flag is set)

If `NO_TEST_CASES=true`, skip test case **generation** but still check for an existing `testcases.csv`:

1. Check if `FEATURE_DIR/testcases.csv` exists.
2. If it **exists**: note it in the report so downstream phases (and the developer) know edge cases were already captured. The edge cases from this file were already factored into draft test content during Phase 1.
3. If it **does not exist**: note that no test cases are available.

Print:
```
## ✓ Phase 4 — Test Cases skipped (generation)
- **Outputs**: none (generation skipped via --no-test-cases flag)
- **Key decisions**: skipped generation; existing testcases.csv: [found / not found]
- **Edge case coverage**: edge cases from spec.md were applied to draft test content in Phase 1
- **Next**: Phase 5 — Test Content
```
Then proceed to Phase 5. **Do not** record `4-testcases` timer events when skipped.

When running: if `NO_PARALLEL=false`, this phase runs as Subagent B in parallel with Phase 2 → 3. If `NO_PARALLEL=true`, it runs sequentially in the main agent after Phase 3. Starts immediately after Phase 1 (parallel) or Phase 3 (sequential).

## Timer

When Phase 4 **runs**: `start`/`end` `4-testcases` on Subagent B log (parallel) or main log (sequential).

## Load Context

- **Required**: `spec.md` (must not contain `[NEEDS CLARIFICATION]` markers — if found, warn but continue)
- Load `.specify/templates/test-cases.csv` for column structure

## Coverage Requirements


| Source                      | Minimum                  |
| ----------------------------- | -------------------------- |
| User journeys (happy path)  | One per distinct journey |
| Acceptance Criteria         | One or more per AC       |
| Edge cases                  | One per edge case        |
| Published page verification | At least one end-to-end  |

## Test Case Rules

1. **Author perspective**: All steps executable in AEM Editor or published site — no dev tools, no code inspection
2. **Atomic steps**: One action per step
3. **Unambiguous expected results**: Clear, observable result per step
4. **Title pattern**: `[Component / Feature Area] | [What is verified]`
5. **No implementation details**: No Java, Sling Models, HTL, APIs

## CSV Format

```
ID,Work Item Type,Title,Test Step,Step Action,Step Expected,Area Path,Assigned To,State
"","Test Case","[Title]",,,,"Consumer Platforms\Adobe Experience Manager (AEM)","","Design"
,,,"1","[Action]","[Expected]",,,
```

## Organization Order

1. Author experience
2. Functional / AC verification
3. Variations and combinations
4. Responsive / cross-device (if relevant)
5. Publication verification
6. Edge cases and negative tests
7. Regression guard

Print Phase 4 report on completion.
