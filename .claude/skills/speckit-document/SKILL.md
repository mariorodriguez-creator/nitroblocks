---
name: speckit-document
description: Generate or update an EDS block authoring guide after implementation. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-document".
disable-model-invocation: true
---

# Speckit Document Workflow

Generates or updates **author-facing documentation** for an **AEM Edge Delivery Services (EDS)** block after implementation. Authors work in **Google Docs/Drive, SharePoint, or Document Authoring (DA)**.

Run **after implementation is complete**, before the PR is raised.

## Setup

Run: `.specify/scripts/bash/check-prerequisites.sh --json` (no `--require-tasks`) from repo root. Parse `FEATURE_DIR`.

- **Template:** `REPO_ROOT/.specify/templates/authoring-guide-template.md` — read in full (top comment block = agent policies). Build the guide from its sections and HTML comments.
- `AUTHORING_GUIDES_DIR = REPO_ROOT/.specify/memory/components/authoring-guides` — alternate output for supplementary or multi-block guides
- **Preferred output** for a single block: `REPO_ROOT/blocks/{block-name}/README.md`

## Load context

- **REQUIRED**: `FEATURE_DIR/spec.md` — feature name, user story, acceptance criteria, author-facing behaviour, content model hints
- **IF EXISTS**: `FEATURE_DIR/plan.md` — block paths, files touched
- **IF EXISTS**: `FEATURE_DIR/data-model.md` — authored table examples, rows/columns, variants (highest value for Content Model and Authoring)
- **IF EXISTS**: `FEATURE_DIR/quickstart.md` — test scenarios and preview URLs
- **IF EXISTS**: `FEATURE_DIR/design.md` — visual reference only (screenshots, states); do not paste implementation jargon for authors

## Resolve block name and files

1. From `plan.md` **Project Structure** / **Files to Create/Modify**, find paths matching `blocks/<block-name>/<block-name>.js` (hyphenated folder name = block name).
2. If ambiguous, use the final directory segment of `FEATURE_DIR` as `{block-name}` (typical layout: `.specify/specs/<block-name>/`) and confirm `blocks/{block-name}/` exists.

**REQUIRED** (for an implemented block):

- Read `blocks/{block-name}/{block-name}.js` — `default function decorate(block)`, options/classes authors affect
- Read `blocks/{block-name}/{block-name}.css` — variant effects to describe under **Variants**

## Fill the template

1. Read `.specify/templates/authoring-guide-template.md` from top to bottom; follow the **AGENT INSTRUCTIONS** comment block for policies (paths, authoring surfaces, Mermaid, tone).
2. Replace every body placeholder (`[INTRO_PARAGRAPH]`, tables, etc.); remove optional sections when the template says they do not apply.
3. **Strip all HTML comments** (`<!-- ... -->`) from the file you write — including inline section hints — so authors only see clean Markdown.
4. Use author language: *"Authors add…"*, *"In the first row…"*, *"Options in parentheses…"*. Avoid `querySelector`, `decorate`, and ESM paths in author-facing sections; **Testing** may list draft paths and preview URLs for QA.

## Create or update

**Preferred** (single-block feature with `blocks/{block-name}/`):

- Path: `blocks/{block-name}/README.md`
- **New or existing:** full refresh — replace entire file (no partial merge)

**Alternate** (multi-block feature or team policy):

- Path: `AUTHORING_GUIDES_DIR/{block-name}.md` or `AUTHORING_GUIDES_DIR/{feature-short-name}.md`
- One document may cover multiple blocks; use the template once per logical guide and name blocks clearly in Overview and Block Details.

**Screenshots:** use assets from `FEATURE_DIR` or `blocks/{block-name}/` when present; otherwise keep a short “Screenshot to be added” line for the team.

## Report

Print: output path(s), created vs updated, block name(s), and one-line summary of variants and content model coverage.
