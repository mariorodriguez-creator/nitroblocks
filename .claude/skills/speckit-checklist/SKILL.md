---
name: speckit-checklist
description: Generate requirements quality checklists for a speckit feature. Trigger when user asks to create a checklist, validate spec quality, or generate "unit tests for requirements" for a feature domain.
disable-model-invocation: true
---

# Speckit Checklist Workflow

Generates requirements quality checklists — "unit tests for requirements writing" — NOT implementation tests.

**CRITICAL CONCEPT**: Checklists validate the quality, clarity, and completeness of requirements in a spec. They do NOT verify that code works.

- ✅ "Are visual hierarchy requirements defined with measurable criteria?" (completeness)
- ❌ "Verify the button clicks correctly" (implementation test — WRONG)

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json` from repo root. Parse `FEATURE_DIR`.

## Clarification Questions

Generate up to 3 targeted questions from:
- Scope: "Should this include X or stay limited to Y?"
- Depth: "Is this a lightweight pre-commit list or formal release gate?"
- Audience: "Will this be used by the author or peers during PR review?"
- Risk areas: "Which risk areas should have mandatory gating checks?"

## Generate Checklist

Create at `FEATURE_DIR/checklists/<domain>.md` (e.g., `ux.md`, `api.md`, `security.md`).

Each run creates a NEW file. Number items sequentially from CHK001.

### Categories

- **Requirement Completeness** — Are all necessary requirements documented?
- **Requirement Clarity** — Are requirements specific and unambiguous?
- **Requirement Consistency** — Do requirements align without conflicts?
- **Acceptance Criteria Quality** — Are success criteria measurable?
- **Scenario Coverage** — Are all flows addressed?
- **Edge Case Coverage** — Are boundary conditions defined?
- **Non-Functional Requirements** — Performance, Security, Accessibility specified?
- **Dependencies & Assumptions** — Documented and validated?

### Item Structure

```
- [ ] CHK001 Are [requirement type] defined/specified for [scenario]? [Completeness, Spec §X.Y]
- [ ] CHK002 Is '[vague term]' quantified with specific criteria? [Clarity, Spec §X.Y]
- [ ] CHK003 Are [edge cases] addressed in requirements? [Coverage, Gap]
```

Use traceability references: `[Spec §X.Y]`, `[Gap]`, `[Ambiguity]`, `[Conflict]`, `[Assumption]`.

Minimum 80% of items MUST include at least one traceability reference.

### PROHIBITED

- ❌ "Verify the button clicks correctly"
- ❌ "Test hover states work"
- ❌ "Confirm API returns 200"
- ❌ Any reference to code execution or user actions

### REQUIRED PATTERNS

- ✅ "Are [requirements] defined/specified/documented for [scenario]?"
- ✅ "Is '[vague term]' quantified with specific criteria?"
- ✅ "Are requirements consistent between [section A] and [section B]?"
- ✅ "Can [requirement] be objectively measured/verified?"
- ✅ "Does the spec define [missing aspect]?"

## Report

Output checklist path, item count, focus areas selected, and reminder that each run creates a new file.
