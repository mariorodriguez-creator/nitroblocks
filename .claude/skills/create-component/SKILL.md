---
name: create-component
description: Scaffold a new AEM component folder structure with all required XML, HTL, and clientlib files. Use when asked to create a new component, scaffold a component, or generate component boilerplate.
argument-hint: <component-name> [--title "Title"] [--description "Desc"] [--group "Group"] [--super-type "path"] [--is-container] [--version v1] [--with-js] [--dry-run]
allowed-tools: Bash, Read, Write, Glob
---

# Create AEM Component Skill

## What This Does

Scaffolds a complete AEM component with the correct folder hierarchy, XML namespaces, and naming conventions. 

## How to Use

1. Parse the user's arguments. The component name (kebab-case, without `dxn-` prefix) is required. Optional flags:
   - `--title "Component Title"` — sets `jcr:title` (defaults to title-cased name)
   - `--description "Description"` — sets `jcr:description`
   - `--group "Group Name"` — sets `componentGroup` (default: `DigitalXn General`)
   - `--super-type "path"` — sets `sling:resourceSuperType` (default: `core/wcm/components/component/v1/component`)
   - `--is-container` — sets `cq:isContainer` to true
   - `--version v1` — version folder (default: `v1`)
   - `--with-js` — include JS bundle file and js.txt in clientlibs
   - `--dry-run` — preview file tree without creating files

2. Run the scaffolding script:

```bash
python3 scripts/create_component.py <component-name> [flags]
```

3. Report what was created to the user, listing all generated files.

4. Remind the user of recommended next steps:
   - Edit `_cq_dialog/.content.xml` to add component-specific dialog fields
   - Implement the HTL template in `dxn-{name}.html`
   - Add CSS styles in the clientlib CSS bundle
   - If needed, create a Sling Model Java class
   - Reference `REFERENCE.md` in this skill folder for XML template examples

## Reference

For detailed XML templates and naming conventions, see `REFERENCE.md` in this directory.
