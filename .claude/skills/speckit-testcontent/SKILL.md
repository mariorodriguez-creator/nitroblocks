---
name: speckit-testcontent
description: Creates and extends test content for DigitalXn AEM components in digitalxn-aem-nc-sites-reference-content. Explicit invocation only — never load from context or topic. Use only when the user types the exact command "speckit-testcontent".
disable-model-invocation: true
---

# Speckit Test Content

## Critical Constraints (Never Violate)

**Scope**: Only modify files inside `digitalxn-aem-nc-sites/digitalxn-aem-nc-sites-reference-content`. Full path: `digitalxn-aem-nc-sites/digitalxn-aem-nc-sites-reference-content/src/main/jcr_root/content/netcentric-digitalxn-reference/de/en/components/`. Filter: `/content/netcentric-digitalxn-reference`.

1. **No codebase modifications** — Do NOT edit policies, SCSS, Java, HTL, or any other code outside the reference content module.
2. **Use existing styles only** — Apply only `cq:styleId` values that already exist in component policies. For child components, use the child's built-in styles (e.g. `dxn-button--secondary`, `dxn-button--center`). Never add new styles to policies or SCSS.
3. **Container layout** — Always use `layout="responsiveGrid"` for container nodes, unless the prompt explicitly says otherwise.
4. **Container/background decision** — Before finishing, you must resolve:
   - User said "with container examples" / "including containers" → add the section.
   - User said "without container examples" → omit it.
   - User did not specify → **ask**: *"Do you want to include examples with different container layouts and backgrounds (layout × background combinations)?"* Add only if they confirm.
   - **Never infer "omit"** from context. Component style variants (teaser, layout, spacing) do not count as "without container examples."

## Definitions

- **Component style variants** — Appearance, layout, spacing applied via Style System (e.g. teaser, layout, spacing-bottom).
- **Container examples** — Layout × background combinations (full-page-width, background-full-page-width, primary-light, primary-dark, secondary-light, secondary-dark) on a wrapper container.

## Handling User-Specified Variants

When the user lists specific variants (e.g. "accordion with teaser variant", "teaser with CTA button"):

1. **Create only those variants** — do not add the full default set unless asked.
2. **Use the skill's patterns** — apply Property Mapping, Style System, Child Components as needed for each variant.
3. **Resolve overlaps** — some variants imply others (e.g. CTA button only renders in teaser mode; "teaser" and "CTA button" → one teaser variant with button child).
4. **Child variants** — use base/default for nested components unless the user specifies a child variant (e.g. "use the secondary button variation" → apply `cq:styleIds="[dxn-button--secondary]"` to the CTA).
5. **Add or reuse page** — if the component page exists, **add** variants to it (append; preserve existing content). Do not replace the entire file unless the user explicitly asks to replace or recreate. If the page does not exist, create it first (register in components index, create .content.xml with correct namespace).
6. **Include intro text + separator** per variant (dxn_text-{variant}, dxn_separator-{variant}, component instance).

When the user asks generically ("add test content for {component}"), use the full Use-Case Derivation Process and Test-Case Alignment to create a comprehensive set.

## Inputs to Read Before Creating Content

Read these files before generating reference content. **FEATURE_DIR** comes from `check-prerequisites.sh --json` when run via the command; when invoked standalone, resolve from the current feature branch or from user arguments.

| Input | Path pattern | Purpose |
|-------|--------------|---------|
| Test cases | `FEATURE_DIR/testcases.csv` (when present) | **Primary**: Map test case titles to reference variants. When present, use this only — do not also read spec.md for scenario derivation. |
| Spec | `FEATURE_DIR/spec.md` | **Fallback** when testcases.csv is absent: derive scenarios from acceptance criteria, user story, edge cases. |
| Spec/docs | `AUTHOR.md`, `README.md` in component folder | Implementation details, field usage, examples |
| Dialog | `digitalxn-aem-base-apps/.../components/{name}/v1/{name}/_cq_dialog/.content.xml` | Field names, types, required/optional |
| Sling Model | `digitalxn-aem-base-core/.../models/Dxn{Name}.java` | Getters, validation, optional vs required |
| Unit tests | `digitalxn-aem-base-core/.../internal/models/v1/{name}/{Name}ImplTest.java` | Scenarios to mirror as visible variants |
| Container policy | `digitalxn-aem-templates-apps/.../policies/.content.xml` → `digitalxn-content-container-policy` → `Container Layout` + `Background Colours` style groups | All layout × background combinations |

## Use-Case Derivation Process

1. **Extract fields** from dialog: each `name="./fieldName"` maps to a JCR property.
2. **Classify** required vs optional from dialog `required="{Boolean}true"` and model.
3. **For each field**, identify 2–3 representative values: default, minimal (empty/null), custom.
4. **Map test scenarios** from `*ImplTest.java`: each `@Test void testX()` that exercises a distinct config → consider a reference variant.
5. **Map scenarios for variants** (use one source, not both):
   - **When testcases.csv exists**: Use test case titles directly — each title maps to a variant (e.g. "Component | Teaser with CTA shows correct layout" → teaser variant with CTA).
   - **When testcases.csv is absent**: Derive from `spec.md` (ACs, user story, edge cases) and unit tests.
6. **Combine** into coherent variants (e.g. default, minimal, teaser, custom-labels, past-event).
7. **Prioritize** author-visible scenarios; skip purely technical edge cases (e.g. invalid timezone) unless they demonstrate error handling.
8. **Container/background decision** — Resolve per Critical Constraint #4 before finishing.

## Test-Case Alignment

For each meaningful, author-relevant scenario (from `testcases.csv` when present, otherwise from `spec.md` and `*ImplTest.java`), add a matching reference variant. Test case titles like "Component | [Scenario]" map directly to variants — create one reference instance per distinct scenario so authors can validate against visible content. Examples: `testCustomLabels` → custom-labels variant; `testButtonAndTeaserFlags` → teaser variant with CTA; `testMinimalConfig` → minimal variant.

## Edge Cases to Cover (When Relevant)

| Edge case | Example | Include when |
|-----------|---------|--------------|
| Empty/optional fields | No pretitle, no milestones | Component supports optional content |
| Past event / expired state | Timer at zero | Useful to show fallback/empty state |
| Many items | 4–5 milestones | Multifield behavior |
| Custom ID | `id="my-component"` | Anchor linking is supported |
| Different timezones | America/New_York, Europe/Berlin | Event has timezone |
| Long text | Long labels | RTE or long labels supported |
| Responsive assets | Desktop + tablet + mobile | Background/images per breakpoint |
| Style variants | Teaser, layout | Style System supports |
| Container backgrounds | Primary light, primary dark | Component adapts to container (e.g. accordion) |

## Property Mapping

### Use only component-defined properties

**Only add properties that exist in the target component's dialog.** Do not copy properties from other components. Each component has its own schema.

| Component | Has `textIsRich` | Notes |
|-----------|------------------|-------|
| dxn-text | Yes | Use `textIsRich="true"` for rich text content |
| dxn-teaser | No | Uses pretitle, description, etc. without textIsRich |

When in doubt, read the component's `_cq_dialog/.content.xml` and only use `name="./..."` fields defined there.

### Dialog → JCR

- Dialog `name="./eventDateTime"` → JCR property `eventDateTime`
- JCR date format: `eventDateTime="{Date}2027-01-01T00:00:00.000+01:00"`
- Remove `./` prefix from dialog names when writing content.

### JCR DocView: escaping values with `{placeholder}` patterns

In JCR Document View XML, `{TypeName}value` is reserved for typed values (e.g. `{Date}...`, `{Boolean}true`). The FileVault parser treats any `{word}` as a type prefix. If a property value contains literal placeholders like `{days}` or `{hours}` (e.g. for ARIA announcements), the parser will fail with "unknown type: days".

**Fix**: Prefix the value with `{String}` so the entire value is parsed as a String. The stored value will be correct.

| Wrong | Correct |
|-------|---------|
| `hourBoundaryAriaAnnouncement="{days} days {hours} hours remaining"` | `hourBoundaryAriaAnnouncement="{String}{days} days {hours} hours remaining"` |

The parser reads `{String}` as the type, then stores everything after it as the value. The component receives `{days} days {hours} hours remaining` and can replace placeholders at runtime. Apply this to any property whose value contains `{placeholder}` patterns.

### Multifield structure

```xml
<milestones jcr:primaryType="nt:unstructured">
    <item0 jcr:primaryType="nt:unstructured" title="..." text1="..." text2="..."/>
    <item1 jcr:primaryType="nt:unstructured" title="..." text1="..." text2="..."/>
</milestones>
```

### RTE fields (text alignment)

When a component has RTE fields (e.g. pretitle, title, text) and you need center/left/right alignment:

- **Use block elements** — The AEM RTE justify plugin applies `text-align` to block elements (`p`, `h1`–`h6`, `blockquote`), not to `span`.
- **Format**: `&lt;p style=&quot;text-align: center&quot;&gt;{text}&lt;/p&gt;&#xd;&#xa;` (XML-escaped).
- **Span** is used for other inline styling (e.g. `class="small"`), not for alignment.
- Prefer alignment via RTE markup over Style System when the field is RTE — authors use the justify toolbar.

## Adding a New Component Page

### 1. Register the child in components index

Edit `content/netcentric-digitalxn-reference/de/en/components/.content.xml` and add the child node (alphabetically):

```xml
<accordion/>
```

### 2. Create the page folder and .content.xml

Create `content/netcentric-digitalxn-reference/de/en/components/{component-name}/.content.xml`.

**Critical**: Use the correct Sling namespace. Wrong namespace causes "No renderer for extension html, superType=null":

```xml
xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
```

**Do NOT use**: `http://www.jcp.org/jcr/sling/1.0` (legacy JCP namespace — Sling ignores `sling:resourceType` stored under it).

### 3. Page structure template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:mix="http://www.jcp.org/jcr/mix/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="cq:Page">
    <jcr:content
        cq:template="/conf/digitalxn/settings/wcm/templates/contentpage-template"
        jcr:primaryType="cq:PageContent"
        jcr:title="{Page Title}"
        sling:resourceType="digitalxn/base/components/pagetypes/dxn-contentpage/v1/dxn-contentpage">
        <root jcr:primaryType="nt:unstructured" sling:resourceType="digitalxn/base/components/dxn-container/v1/dxn-container">
            <container jcr:primaryType="nt:unstructured" sling:resourceType="digitalxn/base/components/dxn-container/v1/dxn-container">
                <title jcr:primaryType="nt:unstructured" sling:resourceType="digitalxn/base/components/dxn-title/v1/dxn-title"/>
                <dxn_text-page-purpose jcr:primaryType="nt:unstructured" sling:resourceType="digitalxn/base/components/dxn-text/v1/dxn-text" text="..." textIsRich="true"/>
                <dxn_text-{section} jcr:primaryType="nt:unstructured" sling:resourceType="digitalxn/base/components/dxn-text/v1/dxn-text" text="..." textIsRich="true"/>
                <dxn_separator-{section} jcr:primaryType="nt:unstructured" sling:resourceType="digitalxn/base/components/dxn-separator/v1/dxn-separator"/>
                <!-- Component instance(s) here -->
            </container>
        </root>
    </jcr:content>
</jcr:root>
```

## Creating Multiple Use Cases

### Section pattern per variant

```
dxn_text-{variant}     → Explains what this variant demonstrates
dxn_separator-{variant} → Visual separator
dxn_{component}-{variant} → Component instance with specific config
```

### Section intro text (dxn-text)

For `dxn_text-{variant}` components that have a heading (h2/h3) followed by a description paragraph, add a non-breaking space paragraph between them for visual spacing. Matches accordion, teaser, and other reference pages.

**Format**: `&lt;h2>{Title}&lt;/h2>&#xd;&#xa;&lt;p>&amp;nbsp;&lt;/p&gt;&#xd;&#xa;&lt;p>{Description}&lt;/p&gt;&#xd;&#xa;`

Example:
```xml
text="&lt;h2>Default&lt;/h2>&#xd;&#xa;&lt;p>&amp;nbsp;&lt;/p&gt;&#xd;&#xa;&lt;p>Standard component with default configuration.&lt;/p&gt;&#xd;&#xa;"
```

Omit the nbsp for `dxn_text-page-purpose` when it has only a single paragraph (no section heading).

### Node naming

- Use descriptive suffixes: `-default`, `-minimal`, `-teaser`, `-custom-labels`, `-anchor`, `-past-event`.
- Component nodes: `dxn_{component}-{variant}` (e.g. `dxn_accordion-teaser`).

## Spacing Between Variants

Components get bottom spacing in three ways: (1) built-in CSS margin, (2) container wrapper, (3) Style System spacing classes.

**Check before adding component instances**: Read `digitalxn-aem-base-clientlibs-apps/frontend/digitalxn/base/clientlibs/publish/theme/globalstyles/global-spacing-styles.scss`. The first rule block lists selectors that already have `margin-bottom`. **Always read the current file** — the list may change when new components are added; do not rely on a static list in this skill.

**Rule**: If the component's root CSS class (e.g. `.dxn-accordion`) is **not** in that list, and the component's policy **already** includes `dxn-space--largeBottom`, apply it to add breathing room between variants. Do not modify policies or other code outside the reference content — if the style is missing from the policy, skip adding spacing.

**Exclusions**: Do not add spacing to `dxn_text-*`, `dxn_separator-*`, or `title` — they either have built-in margin or are structural. Apply spacing only to the main component instances (`dxn_{component}-{variant}`).

**Do not create dedicated spacing variants**: Most components have spacing-bottom options in their policy. Do not add variants that only demonstrate spacing (e.g. `-spacing-small`, `-spacing-large`); spacing is applied for breathing room between variants, not as a use case to test.

## Container and Background Styles

When a component's appearance changes based on container background (e.g. text colour, contrast), add a **"Container layout and background styles"** section. Reference: accordion.

### Discovering layout × background combinations

1. Read the **Container policy** (see Inputs table).
2. **Layout options**: Find `cq:styleGroupLabel="Container Layout"`. Extract all `cq:styleId` values. Add a default option (no layout style) for default width.
3. **Background options**: Find `cq:styleGroupLabel="Background Colours"`. Extract all `cq:styleId` values.
4. Create one container per combination. Node name: `dxn_container-{layout}-{bg}`. For default layout use `default-width`. Set `layout="responsiveGrid"` on each container.

### Structure

```
dxn_text-background-section     → Explains that component adapts to container layout and background
dxn_separator-background-section
dxn_container-{layout}-{bg}      → One per (layout × background) combination
  ├── dxn_text-{layout}-{bg}   → h6 label combining layout + background labels
  └── dxn_{component}-{layout}-{bg} → Component instance (simplified config)
```

### Example (layout × background matrix)

```xml
<!-- full-page-width × primary-light -->
<dxn_container-full-page-width-primary-light cq:styleIds="[dxn-container--full-page-width,dxn-container--primary-light]" layout="responsiveGrid">
    <dxn_text-full-page-width-primary-light ... text="&lt;h6>Container with full page width and primary light background&lt;/h6>..."/>
    <dxn_accordion-full-page-width-primary-light ...><!-- simplified --></dxn_accordion-full-page-width-primary-light>
</dxn_container-full-page-width-primary-light>
<!-- background-full-page-width × primary-dark -->
<dxn_container-background-full-page-width-primary-dark cq:styleIds="[dxn-container--background-full-page-width,dxn-container--primary-dark]" layout="responsiveGrid">
    <dxn_text-background-full-page-width-primary-dark ... text="&lt;h6>Container with background full page width and primary dark background&lt;/h6>..."/>
    <dxn_accordion-background-full-page-width-primary-dark ...><!-- simplified --></dxn_accordion-background-full-page-width-primary-dark>
</dxn_container-background-full-page-width-primary-dark>
<!-- default-width × secondary-light -->
<dxn_container-default-width-secondary-light cq:styleIds="[dxn-container--secondary-light]" layout="responsiveGrid">
    <dxn_text-default-width-secondary-light ... text="&lt;h6>Container with default width and secondary light background&lt;/h6>..."/>
    <dxn_accordion-default-width-secondary-light ...><!-- simplified --></dxn_accordion-default-width-secondary-light>
</dxn_container-default-width-secondary-light>
```

## Style System Integration

When a component supports styles (e.g. teaser, layout variants): check the component policy (see Inputs table) and apply only existing `cq:styleId` values. For nested components, use the child's built-in styles from its policy.

## DAM Assets

Reference content uses existing DAM paths under `/content/dam/netcentric-digitalxn-reference/`:

- `nc-brand-images.jpg` — generic brand image
- `what-we-do-careers.jpg`
- `carousel-images/at-netcentric-image*.jpeg`
- `youtube-thumbnails/{videoId}.jpg`

Use these paths for `fileReference`, `backgroundDesktop`, etc. Do not invent new DAM paths unless the asset exists.

## Child Components (nested components)

Reference pages are created **only for the parent/base component**. Do not create separate reference pages for nested components.

When a parent component embeds a child (e.g. teaser CTA button):

1. **Child node name** must match what the parent HTL expects (e.g. `button` for teaser).
2. **Child must have proper content** — read the child's dialog and model to determine required/optional properties. Do not leave empty placeholders.
3. **Apply child's property mapping** — same Dialog → JCR, DAM paths, validation rules as standalone.
4. **Child variants** — use base/default unless the user specifies (e.g. "use secondary button" → `cq:styleIds="[dxn-button--secondary]"`). Use child's built-in styles for alignment (e.g. `dxn-button--center`).

Common child types and key properties:

| Child type | Key properties |
|------------|----------------|
| dxn-button | `link` (URL), `jcr:title` (label). Use `jcr:title`, not `text`. |
| dxn-teaser | `linkURL`, `jcr:title`, `fileReference`, `pretitle`, `description`, etc. |

Example (teaser CTA button, secondary + centered):
```xml
<button jcr:primaryType="nt:unstructured" jcr:title="CTA" sling:resourceType="digitalxn/base/components/dxn-button/v1/dxn-button" cq:styleIds="[dxn-button--secondary,dxn-button--center]" link="/content/..."/>
```

## Workflow Steps (when invoked as `/speckit-testcontent`)

**Best run after** `/speckit-testcases`: when `testcases.csv` exists, it drives variant mapping directly.

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root. Parse `FEATURE_DIR`.
2. **Resolve component name**: From `FEATURE_DIR/plan.md` or spec folder name. If FEATURE_DIR cannot be determined, infer from `$ARGUMENTS` if possible, otherwise report clearly and stop.
3. **Execute**: Follow all rules in this skill to generate content.
4. **Deploy**: `mvn clean install -pl digitalxn-aem-nc-sites/digitalxn-aem-nc-sites-reference-content -am -q -PautoInstallPackage`. If build fails, report error and skip the test page link.
5. **Report**: Output paths and summary. Include test page link: `http://localhost:5502/content/netcentric-digitalxn-reference/de/en/components/{component-name}.html`
   - **Recommended next step**: Run `/speckit-document` to generate component documentation.

## Validation Checklist

**Stop**: Before sending your response, run this checklist. Do not consider the task complete until every item is resolved. Unresolved items = incomplete task.

- [ ] **No codebase modifications** — only `digitalxn-aem-nc-sites-reference-content` was edited
- [ ] **Only existing styles used** — no new policy or SCSS styles added
- [ ] Component registered in `components/.content.xml`
- [ ] **Container/background decision resolved** (Critical Constraint #4)
- [ ] Sling namespace is `http://sling.apache.org/jcr/sling/1.0`
- [ ] Page uses `dxn-contentpage` and `contentpage-template`
- [ ] Structure: root → container → title, text, separator, component(s)
- [ ] Variants align with unit test scenarios where author-visible
- [ ] Variants align with testcases.csv when that file exists; otherwise align with spec.md (ACs, user story)
- [ ] Spacing: components without built-in margin (see global-spacing-styles.scss) have `dxn-space--largeBottom` applied
- [ ] `cq:styleIds` match policy (style IDs exist in component policy)
- [ ] DAM paths reference existing assets
- [ ] Required dialog fields present on each instance
- [ ] No properties from other components (e.g. do not add `textIsRich` to dxn-teaser; it belongs to dxn-text only)
- [ ] Child resource names match parent HTL expectations
- [ ] Nested components have proper content (read child's dialog/model; no empty placeholders)
- [ ] Date format: `{Date}YYYY-MM-DDTHH:mm:ss.SSS+01:00`
- [ ] Values with `{placeholder}` patterns use `{String}` prefix (e.g. `{String}{days} days {hours} hours remaining`)
