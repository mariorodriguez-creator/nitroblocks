---
name: speckit-validate
description: Validate generated AEM component code after speckit-implement. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-validate".
disable-model-invocation: true
---

# Speckit Validate Workflow

Validates generated HTL, dialog XML, SCSS, and JS against AEM rules and runs linters.

## Scope Resolution

1. Run: `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root
2. Determine scope:
   - User provided file paths → validate those files only
   - User provided component name → resolve to files under `digitalxn-aem-base/`
   - Neither → parse `tasks.md` for component name, glob for matching files

## Files to Validate

- **HTL**: `**/*.html` under `digitalxn-aem-base/digitalxn-aem-base-apps/.../components/`
- **Dialogs**: `**/_cq_dialog/**/*.content.xml`
- **Frontend (SCSS/JS)**: `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/` (lint runs on entire directory)

## Rule-Based Reviews

- **HTL files**: Apply `aem-htl-component` skill rules — check all rules, report violations with rule reference and fix
- **Dialog files**: Apply `aem-dialog` skill rules — Coral 3 compliance, typed parameters, tab structure

## Frontend Linters

Run from `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/`:
```bash
npm run lint:css  # Stylelint on SCSS
npm run lint:js   # ESLint on JS
```

Report errors only; filter warnings.

## VALIDATE-OUTPUT Format

When issues exist, emit this compact block for piping to `speckit-fix`:

```
---VALIDATE-OUTPUT---
SCOPE:<component-name>
HTL:<count>
DLG:<count>
LINT:<count>
---
file:PATH|rule:ID|line:L|col:C|fix:FIX
---END---
```

Rule IDs: `HTL-N` (HTL section N), `DLG-N` (dialog section N), `ESL` (ESLint), `STL` (Stylelint).

## Report

Output: table of HTL files (PASS/FAIL with violation count), table of dialog files (PASS/FAIL with violation count), lint results (CSS and JS pass/fail with error summary), overall status, and readiness for next phase:

- **If FAIL** (any HTL, dialog, or lint issues): `/speckit-fix` (emit the compact VALIDATE-OUTPUT block so the user can paste it)
- **If PASS**: `/speckit-design-compliance` (recommended only if `design.md` exists). Optionally `/speckit-testcases` or `/speckit-document`.
