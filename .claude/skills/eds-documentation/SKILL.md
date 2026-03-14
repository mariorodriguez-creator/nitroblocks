---
name: eds-documentation
description: EDS block documentation authoring. Trigger when creating or updating block README files, authoring guides, or technical docs for AEM Edge Delivery blocks.
---

# EDS Block Documentation Rules

Apply when creating or updating documentation for EDS blocks. Skip for temporary files or personal notes.

## Block README Template

```markdown
# [Block Name] Block

## Overview
Brief description of the block's purpose and functionality.

## Block Details
- **Block Name**: `[block-name]`
- **Files**: `blocks/[block-name]/[block-name].js`, `blocks/[block-name]/[block-name].css`
- **Content Model**: [Describe the block table structure authors use]

## Content Model
| Column | Content | Required |
|--------|---------|----------|
| [column-name] | [description] | yes/no |

## Authoring
[How authors add and configure the block in the CMS]

## Variants
[Document any variant classes and their effects]

## Accessibility
[Document accessibility features and WCAG compliance]

## Testing
[Document testing requirements and test content paths]
```

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
