---
name: speckit-document
description: Generate or update the component authoring guide after implementation. Trigger when user asks to document a component, create an authoring guide, or generate component documentation before raising a PR.
disable-model-invocation: true
---

# Speckit Document Workflow

Generates or updates the component authoring guide for content authors.

Run **after implementation is complete**, before the PR is raised.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json` (no `--require-tasks`) from repo root. Parse `FEATURE_DIR`.

Set: `AUTHORING_GUIDES_DIR = REPO_ROOT/.specify/memory/components/authoring-guides`

## Load Context

- **REQUIRED**: `FEATURE_DIR/spec.md` — feature name, user story, acceptance criteria, author-facing behaviour
- **IF EXISTS**: `FEATURE_DIR/plan.md` — component paths
- **IF EXISTS**: `FEATURE_DIR/quickstart.md` or `FEATURE_DIR/data-model.md` — entity/dialog hints

## Locate Component

From plan.md "Project Structure" or "Files to Create/Modify", identify the AEM component path:
```
digitalxn-aem-base/digitalxn-aem-base-apps/.../components/<component-name>/v1/<component-name>/
```

**REQUIRED**: Read `<component-path>/.content.xml` for `jcr:title` and `componentGroup`.

**REQUIRED**: Read `<component-path>/_cq_dialog/.content.xml` for tabs and fields (fieldLabel, fieldDescription, name, required, defaults).

## Fill Template

Load `.specify/templates/authoring-guide-template.md`. Replace each placeholder per the HTML comment placeholder rules in the template.

To fill UI and Behaviour sections, read:
- HTL files for markup structure
- SCSS for visual behavior across breakpoints
- Sling Model and JS for component logic, interactions, external calls

**Author-focused language**: "Authors can…", "When the style is applied…". Avoid `sling:resourceType`, Sling Model, Java class names unless necessary.

**Screenshot**: If spec folder contains a screenshot, add it. If none found, ask user for an image.

## Create or Update

Output path: `AUTHORING_GUIDES_DIR/<component-name>.md`

- **New file**: Write filled content
- **Existing file**: Full refresh — replace contents entirely (no merging with old sections)

## Report

Print output path, state whether created or updated, and one-line summary of tabs and content.
