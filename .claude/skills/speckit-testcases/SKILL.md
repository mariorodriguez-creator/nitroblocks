---
name: speckit-testcases
description: Generate testcases.csv from a speckit feature spec for EDS (Document Authoring / doc-based authoring and published site). Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-testcases".
disable-model-invocation: true
---

# Speckit Testcases Workflow

Generates `testcases.csv` from the feature spec, covering all user journeys, acceptance criteria, and edge cases.

**Workflow position:** After `/speckit-specify` or `/speckit-clarify` when `spec.md` is ready. May be run at any later phase.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json` from repo root. Parse `FEATURE_DIR`.

## Load context

- **REQUIRED**: `FEATURE_DIR/spec.md` — user stories, acceptance criteria, edge cases
- **OPTIONAL**: `FEATURE_DIR/quickstart.md`, `FEATURE_DIR/data-model.md` — concrete authoring examples and preview URLs
- **OPTIONAL**: `.specify/templates/testcases.csv` — column header row and format reference (file may include markdown preamble; use the CSV header and row pattern from it)

## Coverage requirements

| Source | Type | Minimum |
|--------|------|---------|
| User journeys / primary flows | Happy path | One per distinct journey |
| Acceptance criteria | Functional verification | One or more per AC |
| Edge cases / boundary conditions | Negative / boundary | One per edge case |
| Published / preview behaviour | End-to-end | At least one (preview or live URL) |

## Test case writing rules

1. **Author perspective only**: Steps use the **document** or **DA** workflow (edit block table, section metadata, placeholders, preview/publish via Sidekick or DA). No browser DevTools, no “inspect network”, no reading source or block JS/CSS/repo paths unless the **expected result** is visibly on the page for any visitor.
2. **Atomic steps**: One author action per step where possible.
3. **Unambiguous expected results**: Observable outcome on the page or in the authoring surface (e.g. “Block appears with title and image”, “Preview shows two columns on desktop”).
4. **Title pattern**: `[Block or feature area] | [What is verified]`
5. **Preconditions in step 1**: Starting state (e.g. “Author has edit access to test doc X”, “Page exists in drafts at path Y”).
6. **No implementation details**: No HTML/CSS/JS, or **block implementation file names**. You may name the **block as authors see it** (block table name) and **variant labels** from the spec.

## CSV format

Use the same columns as `.specify/templates/testcases.csv`:

```
ID,Work Item Type,Title,Test Step,Step Action,Step Expected,Area Path,Assigned To,State
```

Example header row for step rows (adjust Area Path for your tracker):

- `ID`: always empty
- `Work Item Type`: always `"Test Case"` for the testcase title row
- `Area Path`: use a consistent EDS-oriented value, e.g. `Edge Delivery Services` or `Edge Delivery Services\<site-or-program-name>` (backslash as in the template tool)
- `State`: `"Design"` on the testcase header row; empty on step rows

```text
"","Test Case","[Title]",,,,"Edge Delivery Services","","Design"
,,,"1","[Action]","[Expected]",,,
,,,"2","[Action]","[Expected]",,,
```

## Test case organization

1. **Authoring** — add block, fill cells/rows, apply variants (parentheses options), section styling if spec requires
2. **Functional / AC** — one or more cases per acceptance criterion
3. **Variants and combinations** — each distinct option from the spec
4. **Responsive / device** — if spec requires layout at 600px / 900px / 1200px behaviour, verify via author-visible preview at those widths (describe author steps, not CSS)
5. **Preview and publish** — Sidekick/DA preview, and published or production URL if applicable
6. **Edge cases and negative tests** — empty fields, invalid URLs, missing images per spec
7. **Regression guard** — if spec calls out backwards compatibility with existing authored content

## Quality checklist before writing

- [ ] Every user journey has at least one test case
- [ ] Every acceptance criterion has at least one test case
- [ ] Every identified edge case has at least one test case
- [ ] All test case titles are unique
- [ ] All steps have both action and expected result
- [ ] No step references implementation files, APIs, or DevTools
- [ ] At least one test case verifies preview or published page behaviour

## Report

Output: path to `FEATURE_DIR/testcases.csv` (or path used), total testcase count, coverage breakdown (journeys, ACs, edge cases), any spec sections without coverage, and suggested next steps: e.g. `/speckit-testcontent` for DA Library upload, or creating/updating draft pages under `drafts/` and a **branch preview URL** `https://{branch}--{repo}--{owner}.aem.page/...` for execution.

## Errors

- ERROR if `spec.md` not found
- ERROR if `spec.md` contains unresolved `[NEEDS CLARIFICATION]` markers (same bar as implementation)
