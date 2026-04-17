# Specification-Driven Development (SDD) Workflow

This directory implements a Specification-Driven Development lifecycle based on [GitHub's Spec Kit](https://github.com/github/spec-kit), customized for AEM Platform Core development.

## Overview

Specification-Driven Development ensures features are thoroughly documented, planned, and validated before implementation, reducing rework and improving code quality through AI-assisted workflows.

# Customizations from ootb speckit 

1. Spec files are generated in ./specify/specs, instead of at the root folder of the codebase
2. A feature generates a single User Story, instead of multiple prioritized optional stories

# design.md Source of Truth

When `design.md` exists (created by `/speckit.figma-specify`), it is the **source of truth for all HTML/CSS/design-specific content**. Plan, quickstart, and task summaries must not override or simplify design.md. For HTML structure, SCSS layout, variants, breakpoints, and visual design — implement exactly per design.md.

# Third-Party Dependency Audit

When migrating from an existing live page, `design.md` **MUST** include a `## Third-Party Dependencies` section (see `design-reference-template.md`). During source-page analysis, detect all third-party libraries via `<script>`/`<link>` tag scanning and DOM marker inspection. Document each library's version, which block uses it, its configuration/options, and the EDS loading strategy (eager/lazy/delayed). `speckit-implement` must use the same libraries and configuration unless an alternative is explicitly justified.

# Visual Regression Testing

Static CSS property compliance (`assert-design-compliance.js`) is necessary but **not sufficient**. It cannot detect rendering-method mismatches (e.g., CSS border arrows vs icon font glyphs), incorrect `object-fit`, or absolute-positioning drift. After `speckit-implement`, a **Playwright-based visual regression** step must compare rendered output:

1. **Reference screenshots**: Captured during `speckit.figma-specify` from the source page at each breakpoint (375, 768, 1200). Saved in `page-styles/`.
2. **Implementation screenshots**: Captured from `localhost:3000` after implement.
3. **Comparison**: Side-by-side or diff overlay per block × breakpoint. Interactive elements (arrows, buttons, toggles) should also be compared per-state.
4. **Integration**: `speckit.design-compliance` should run both the static CSS check AND the visual regression check.

See the `## Visual Regression Testing` section in `design-reference-template.md` for the full procedure.

# Breakpoint Conflict Resolution

When migrating from an existing page, `speckit.figma-specify` must compare the source page's CSS `@media` breakpoints against the project's EDS defaults (600px / 900px). If any differ, a `## Breakpoint Conflict Detection` section is written to `design.md` with a `<!-- DECISION REQUIRED: Breakpoints -->` marker. `speckit.clarify` detects this marker and asks the developer which breakpoints to use. `speckit.analyze` warns if the marker is still unresolved. **If unresolved at implement time, project EDS defaults are kept.** See `design-reference-template.md` for the full procedure.

# Global Style Conflicts

When migrating from an existing page, `speckit.figma-specify` must compare the source page's container, typography, and component styles against the project's EDS global styles (`styles.css`). Conflicts (section padding, max-width, font families, colors, button shapes, etc.) are written to a `## Global Style Conflicts` table in `design.md` with a `<!-- DECISION REQUIRED: Global Style Conflicts -->` marker. `speckit.clarify` presents each conflict with resolution options: modify global style (Option A — appropriate for full-site migrations), override per-block (Option B — scoped fix), or keep EDS default (Option C). **If unresolved at implement time, EDS project defaults are kept.**

# Design Expectations Completeness

`design-expectations.json` must be **exhaustive** — every CSS rule in the `design.md` CSS skeleton must have corresponding expectations. Typography properties (`font-family`, `font-size`, `font-weight`, `line-height`, `color`, `letter-spacing`, `text-transform`) are **never optional** for text elements. When `speckit.design-compliance` generates expectations, it must cover all property categories: Layout, Sizing, Typography, and Visual. Uncovered rules should trigger a warning. See `## Design Expectations Completeness` in `design-reference-template.md`.

# Interactive States — Rendering Methods

`design.md` must document not just the CSS property changes per interactive state, but the **rendering technique** used to produce each visual element (icon font, SVG data URI, CSS border trick, etc.). This prevents the implement step from choosing a visually different rendering method even if the CSS dimensions match. See `## Interactive States > Rendering Methods` in `design-reference-template.md`.

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
