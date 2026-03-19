---
name: speckit-clarify
description: Clarify ambiguous requirements in a speckit feature spec. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-clarify".
disable-model-invocation: true
---

# Speckit Clarify Workflow

Detects and resolves ambiguities in the active feature spec through targeted sequential questions. When design.md exists (from `/speckit-figma-specify`), clarify reads it as read-only context to inform questions and spec refinements — design.md is never modified.

**Workflow position:** Run it:
- **After `/speckit-figma-specify`** — when design.md exists (Figma path: specify → figma-specify → clarify → plan)
- **Right after `/speckit-specify`** — when no Figma designs (specify → clarify → plan)

Warns if user skips clarification (increases downstream rework risk).

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root. Parse `FEATURE_DIR`, `FEATURE_SPEC`, and `FEATURE_DESIGN`.

**When `design.md` exists** (FEATURE_DESIGN path points to existing file): Read it for context. Contains HTML structure, SCSS scaffold, breakpoints, design tokens, interactive states, and dynamic content elements (from `/speckit-figma-specify`).

## Ambiguity Scan

Perform structured scan across:
- **Functional Scope**: Core user goals, out-of-scope declarations, user roles
- **Content Model & Authoring** (CDD Phase 1.2 validation from ): The spec's content model defines the author-developer contract. Scan for:
  - Is the canonical model type identified (Standalone, Collection, Configuration, Auto-Blocked)?
  - Is the block table structure complete — rows, columns, header label, semantic formatting conventions?
  - Are block options/variants clearly defined with parenthetical notation?
  - Could authors intuitively create this content without developer guidance?
  - Are there content model assumptions that could break existing authored content (backward compatibility)?
  - For modifications: does the new model preserve or gracefully extend the existing structure?
  - Max 4 cells per row? Smart defaults to minimize author input?
- **Domain & Data Model**: Entities, relationships, lifecycle/state transitions
- **Interaction & UX Flow**: User journeys, error/empty/loading states, accessibility
- **Non-Functional**: Performance targets, scalability, reliability, security
- **Integration & Dependencies**: External services, failure modes, protocols
- **Edge Cases**: Negative scenarios, rate limiting, conflict resolution
- **Constraints**: Technical constraints, explicit tradeoffs
- **Terminology**: Canonical terms, avoided synonyms
- **Spec–Design Alignment** (when design.md exists): Gaps or conflicts between spec.md and design.md — e.g. spec describes components/variants/behaviors not reflected in design.md; design shows elements (BEM, breakpoints, states) not addressed in spec; missing author-configurable mapping; unclear dynamic content behavior. Also check that design variants map to block options defined in the content model.
- **Variant Completeness** (when design.md exists): When design.md mentions variant classes (e.g. `.blockname--dark`, `.blockname--light`) for colour or visual overrides, it MUST include the actual CSS rules—either in the CSS Skeleton or as concrete values (color, background-color, border-color). If design.md only says "adds .blockname--dark for colour overrides" without specifying what those overrides are, flag as ambiguous. Ask the user to clarify the variant colours/values so they can be added to spec or design.
- **Visual & Structural Gaps** (when design.md exists): Breakpoints, responsive behavior, interactive states, design tokens, embedded components, or dynamic content elements that lack clear spec coverage or acceptance criteria
- **Content Model–Design Alignment** (when design.md exists): The content model in spec.md and the HTML scaffold in design.md must be consistent — visual elements should trace back to authored content (block table cells) or decoration-added structure, not invent content that isn't in the model

Mark each category: Clear / Partial / Missing. Build priority queue.

## Sequential Questioning

Present ONE question at a time. For each:

1. **Multiple-choice questions**: Analyze options, provide recommended option with reasoning, then show table:
   ```
   **Recommended:** Option [X] — [1-2 sentence reasoning]

   | Option | Description |
   |--------|-------------|
   | A | ... |
   | B | ... |
   ```
   User can reply with letter, "yes"/"recommended", or custom answer.

2. **Short-answer questions**: Provide suggested answer with reasoning.

Only ask questions that materially impact: architecture, data modeling, content model design, task decomposition, test design, UX behavior, security posture, or (when design.md exists) spec–design alignment, variant coverage, breakpoint behavior, or author-configurable mapping. Max 15 questions total across session.

**When design.md exists:** Ask clarifying questions that bridge spec and design — e.g. which design elements map to spec acceptance criteria, whether variants/styles in design match spec scenarios, or how dynamic/author-configurable content should behave per breakpoint or state.

## Integration

After each accepted answer:
1. Add to `## Clarifications → ### Session YYYY-MM-DD` section
2. Apply clarification to appropriate spec section immediately
3. Save spec file after each integration
4. Never leave contradictory or obsolete text in spec

## Report

Output: questions asked/answered, spec path, sections touched, coverage summary table, and readiness for next phase: `/speckit-plan` (when ambiguities are resolved), or optionally `/speckit-testcases` (spec is ready). If design.md was used as context, include design path.

Stop when: all critical ambiguities resolved, user signals completion ("done", "proceed").
