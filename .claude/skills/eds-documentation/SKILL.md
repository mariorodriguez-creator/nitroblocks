---
name: eds-documentation
description: EDS block documentation authoring. Trigger when creating or updating block README files, authoring guides, or technical docs for AEM Edge Delivery blocks.
---

# EDS Block Documentation Rules

Apply when creating or updating documentation for EDS blocks. Skip for temporary files or personal notes.

## Document structure

**Canonical section order and placeholders for full block authoring guides:** `.specify/templates/authoring-guide-template.md`

That file includes an **AGENT INSTRUCTIONS** comment block at the top (output paths, authoring surfaces, Mermaid, tone) — apply when generating from the template; strip comments from author-facing deliverables.

For a **short** README, you may condense sections but keep the same concepts (overview, content model, authoring, variants, a11y, testing) so authors and QA can still find them.

## Diagram Standards

- Mermaid diagrams must **not** contain HTML markup (`<br/>`, `<b>`, `<i>`, etc.)
- Use plain text with line breaks or descriptive text within node labels
- Keep node labels concise and readable
- Use descriptive edge labels to clarify relationships

## Content Guidelines

- Do not include performance or future enhancement topics unless relevant
- Keep README.md index current with all documents
- Use consistent formatting and structure across all block documentation
- Include practical examples and usage scenarios
- Document all configuration options and their effects
- Provide clear error handling and troubleshooting information

## Authoring Documentation

Author-facing documentation helps content authors understand how to use the block. Different projects use different approaches:

1. **Sidekick Library** (Google Drive/SharePoint authoring):
   - Uses https://github.com/adobe/franklin-sidekick-library
   - Check for `/tools/sidekick/library.html` in the codebase

2. **Document Authoring (DA) Library**:
   - Uses [Document Authoring (DA) Library setup](https://docs.da.live/administrators/guides/setup-library)
   - Different implementation than Sidekick Library

3. **Universal Editor (UE) projects**:
   - Often skip dedicated author documentation libraries
   - May use inline help or other mechanisms

4. **Simple documentation pages**:
   - Some projects maintain documentation under `/drafts` or `/docs`
   - Pages contain authoring guides and block examples

## File Organization

- Place block README in `blocks/{block-name}/README.md` when block is complex
- Authoring guides in project-specific location (e.g. `.specify/memory/components/authoring-guides/`)
- Maintain cross-references between related documentation
