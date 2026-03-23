# Specification-Driven Development (SDD) Workflow

This directory implements a Specification-Driven Development lifecycle based on [GitHub's Spec Kit](https://github.com/github/spec-kit), customized for AEM Platform Core development.

## Overview

Specification-Driven Development ensures features are thoroughly documented, planned, and validated before implementation, reducing rework and improving code quality through AI-assisted workflows.

# Customizations from ootb speckit 

1. Spec files are generated in ./specify/specs, instead of at the root folder of the codebase
2. A feature generates a single User Story, instead of multiple prioritized optional stories

# design.md Source of Truth

When `design.md` exists (created by `/speckit.figma-specify`), it is the **source of truth for all HTML/CSS/design-specific content**. Plan, quickstart, and task summaries must not override or simplify design.md. For HTML structure, SCSS layout, variants, breakpoints, and visual design — implement exactly per design.md.

# How to use

Open an Agent Chat:

1. RE steps:
   1. Call `/speckit.specify` with the best, most detailed, most comprehensive description of the business need. This will create the user story specification under ./specify/specs/<story-number>-<short-name>/spec.md
   2. (Optional) Call `/speckit.figma-specify` when the feature has a Figma design — extracts visual context (HTML/SCSS scaffold, breakpoints, design tokens) and saves it as `design.md`. Run **after** specify; the spec must already exist. When used, run **before** clarify so clarify can use design.md as context.
   3. Call `/speckit.clarify` to refine the story (uses design.md as read-only context when it exists).
2. DEV steps
   1. Call `/speckit.plan` to create the implementation plan
   2. Call `/speckit.tasks` to create the task breakdown
   3. Call `/speckit.analyze` to verify consistenty
   4. Call `/speckit.implement` to update the codebase
3. QA steps (after implementation)
   1. Call `/speckit.testcases` to generate testcases.csv from the spec
   2. Optionally call `/speckit.testcontent` to create reference content in digitalxn-aem-nc-sites-reference-content (prompted after testcases)
