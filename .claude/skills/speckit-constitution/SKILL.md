---
name: speckit-constitution
description: Create or update the project constitution and propagate changes to dependent templates. Trigger when user asks to update the project constitution, add or change principles, or amend governance rules.
disable-model-invocation: true
---

# Speckit Constitution Workflow

Updates `.specify/memory/constitution.md` and propagates amendments to dependent artifacts.

## Execution Flow

### 1. Load Constitution

Read `.specify/memory/constitution.md`. Identify all placeholder tokens `[ALL_CAPS_IDENTIFIER]`.

The user may require fewer or more principles than the template. Respect explicit principle counts.

### 2. Collect Values

- Use values from user input/conversation when supplied
- Infer from repo context (README, docs, prior versions) when not specified
- `LAST_AMENDED_DATE`: today if changes made, else keep previous (ISO format: YYYY-MM-DD)
- `CONSTITUTION_VERSION` — increment per semantic versioning:
  - **MAJOR**: Principle removals or backward-incompatible redefinitions
  - **MINOR**: New principle/section added or materially expanded
  - **PATCH**: Clarifications, wording, typo fixes

### 3. Draft Updated Constitution

- Replace every placeholder with concrete text
- No bracket tokens remaining (except explicitly deferred — justify any left)
- Each Principle section: succinct name, rules, rationale
- Governance section: amendment procedure, versioning policy, compliance review

### 4. Consistency Propagation

Read and update if needed:
- `.specify/templates/plan-template.md` — Constitution Check alignment
- `.specify/templates/spec-template.md` — mandatory sections/constraints
- `.specify/templates/tasks-template.md` — task types reflecting principles

Update any outdated principle references in these files.

### 5. Sync Impact Report

Prepend as HTML comment at top of constitution:
```html
<!-- Sync Impact Report
Version: old → new
Modified principles: [list]
Added sections: [list]
Removed sections: [list]
Templates updated: [file] ✅ | [file] ⚠ pending
Deferred TODOs: [list]
-->
```

### 6. Validation

- No unexplained bracket tokens remain
- Version matches report
- Dates in ISO format YYYY-MM-DD
- Principles are declarative, testable, use MUST/SHOULD (not vague "should")

### 7. Write

Overwrite `.specify/memory/constitution.md` with completed content.

### 8. Report

Output:
- New version and bump rationale
- Files flagged for manual follow-up
- Suggested commit: `docs: amend constitution to vX.Y.Z (...)`
