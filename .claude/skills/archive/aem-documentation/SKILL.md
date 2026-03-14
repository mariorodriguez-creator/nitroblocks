---
name: aem-documentation
description: AEM component documentation authoring. Trigger when creating or updating component README files, authoring guides, API documentation, or technical docs for AEM components.
---

# AEM Component Documentation Rules

Apply when creating or updating documentation for AEM components. Skip for temporary files or personal notes.

## Component Documentation Template

```markdown
# [Component Name] Component

## Overview
Brief description of the component's purpose and functionality.

## Component Details
- **Resource Type**: `apps/digitalxn/base/components/[component-name]/v1/[component-name]`
- **Component Group**: [Component group in AEM]
- **Version**: v1
- **Dependencies**: [List any required dependencies]

## Authoring Interface
### Dialog Fields
| Field | Type | Required | Description | Default Value |
|-------|------|----------|-------------|---------------|
| [field-name] | [field-type] | yes/no | [description] | [default] |

### Design Dialog
[Description of design dialog options and styling capabilities]

## Frontend Implementation
### Client Libraries
- **Category**: `digitalxn.components.[component-name]`
- **JavaScript**: `[component-name].clientlibs.js`
- **SCSS**: `[component-name].clientlibs.scss`
- **Config**: `[component-name].config.js`

## Backend Implementation
### Sling Model
- **Interface**: `Dxn[ComponentName]`
- **Implementation**: `Dxn[ComponentName]Impl`

## Analytics Events
[Document all analytics events tracked by the component]

## Accessibility
[Document accessibility features and WCAG compliance]

## Testing
[Document testing requirements and mock data setup]
```

## Diagram Standards

- Mermaid diagrams must **not** contain HTML markup (`<br/>`, `<b>`, `<i>`, etc.)
- Use plain text with line breaks or descriptive text within node labels
- Keep node labels concise and readable
- Use descriptive edge labels to clarify relationships

## Content Guidelines

- Do not include performance or future enhancement topics unless relevant
- Keep README.md index current with all documents
- Use consistent formatting and structure across all component documentation
- Include practical examples and usage scenarios
- Document all configuration options and their effects
- Provide clear error handling and troubleshooting information

## File Organization

- Place component documentation in appropriate directories based on component type
- Use consistent naming conventions for documentation files
- Maintain cross-references between related documentation
- Keep documentation files up-to-date with component changes

## API-backed Component Documentation

For API-backed components, additionally document:

- **GraphQL query variables**: All variables sent in queries
- **Response processing**: All values extracted from API responses
- **Error handling**: Error types and fallback behavior
- **Mock data path**: Path to mock JSON files for development
