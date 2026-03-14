---
name: speckit-fix
description: Auto-apply fixes from speckit-validate output. Trigger when user provides a VALIDATE-OUTPUT block from speckit-validate and wants to fix HTL, dialog, ESLint, or Stylelint issues.
disable-model-invocation: true
---

# Speckit Fix Workflow

Consumes the compact VALIDATE-OUTPUT block from `speckit-validate` and applies fixes.

## Input Format

Expect the `---VALIDATE-OUTPUT---` block from the user:

```
---VALIDATE-OUTPUT---
SCOPE:<component>
HTL:<n>
DLG:<n>
LINT:<n>
---
file:PATH|rule:ID|line:L|col:C|fix:FIX
---END---
```

If input is empty, prompt: "Paste the validate-generated output block to fix."

## Fix Application

1. **Parse**: Extract lines between `---` (after header) and `---END---`. Split each line on `|`, parse `file`, `rule`, `line`, `col`, `fix`. Skip malformed lines.

2. **Apply per rule type**:
   - **HTL-N / DLG-N**: Use string replacement with `fix` value at given line. Match offending content; use `fix` as `old_string` when unique.
   - **ESL / STL**: Run auto-fixer first:
     ```bash
     # From digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/
     npx eslint --fix <file>
     npx stylelint --fix <file>
     ```
     If `fix` is descriptive (not `AUTO`), apply rule-specific logic.
   - Group edits by file to avoid redundant reads.

3. **Known fixes**:
   - `HTL-2` (data-nc-params context): Remove `@ context="attribute"` or `@ context='attribute'` from params JSON
   - `DLG-0` (Coral 2): Replace `granite/ui/components/foundation/` with `granite/ui/components/coral/foundation/`
   - `DLG-2` (untyped boolean): Replace `required="true"` with `required="{Boolean}true"`

4. **Re-validate**:
   ```bash
   npm run lint:js 2>&1 | grep -E '(error|\d+ problem)'
   npm run lint:css 2>&1 | grep -E '(error|\d+ problem)'
   ```
   On success: output `LINT:OK`. On failure: emit remaining issues in compact format.

## Report

Output: count of fixes applied per category (HTL, DLG, ESL, STL), re-validation status (`LINT:OK` or list of remaining errors), and readiness for next phase:

- **If LINT:OK**: `/speckit-design-compliance` (recommended only if `design.md` exists). Optionally `/speckit-testcontent` or `/speckit-document`. Optionally re-run `/speckit-validate` to confirm first.
- **If remaining errors**: Re-run `/speckit-validate` and paste the new VALIDATE-OUTPUT block for another fix pass.
