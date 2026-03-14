#!/usr/bin/env python3
"""
AEM Component Scaffolding Script

Creates the full folder structure for a new AEM component including:
- Component apps structure (XML definitions, HTL, dialog, template, editConfig)
- Clientlibs structure (CSS bundle, optional JS bundle)

Usage:
    python3 create_component.py <component-name> [options]

Example:
    python3 create_component.py product-card --title "Product Card" --description "Displays a product card" --with-js
"""

import argparse
import os
import re
import sys
import textwrap

# Common JCR namespace tuples
NS_CQ = ("cq", "http://www.day.com/jcr/cq/1.0")
NS_JCR = ("jcr", "http://www.jcp.org/jcr/1.0")
NS_NT = ("nt", "http://www.jcp.org/jcr/nt/1.0")
NS_SLING = ("sling", "http://sling.apache.org/jcr/sling/1.0")


def build_jcr_xml(namespaces, attributes):
    """Build a JCR docview XML string with proper formatting.

    Args:
        namespaces: list of (prefix, uri) tuples for xmlns declarations.
        attributes: list of (name, value) tuples for jcr:root attributes.

    Returns a string with XML declaration, jcr:root with namespace
    declarations, and each attribute on its own line indented 4 spaces.
    """
    ns_decls = " ".join(f'xmlns:{prefix}="{uri}"' for prefix, uri in namespaces)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<jcr:root {ns_decls}',
    ]
    for i, (name, value) in enumerate(attributes):
        suffix = "/>" if i == len(attributes) - 1 else ""
        lines.append(f'    {name}="{value}"{suffix}')
    return "\n".join(lines) + "\n"


# Project-relative base paths
APPS_BASE = os.path.join(
    "digitalxn-aem-base", "digitalxn-aem-base-apps", "src", "main", "jcr_root",
    "apps", "digitalxn", "base", "components"
)
CLIENTLIBS_BASE = os.path.join(
    "digitalxn-aem-base", "digitalxn-aem-base-clientlibs-apps", "src", "main",
    "jcr_root", "apps", "digitalxn", "base", "clientlibs", "publish", "components"
)


def validate_component_name(name):
    """Validate that the component name is kebab-case without dxn- prefix."""
    if name.startswith("dxn-"):
        print(f"Error: Do not include the 'dxn-' prefix. Use '{name[4:]}' instead.", file=sys.stderr)
        sys.exit(1)
    if not re.match(r'^[a-z][a-z0-9]*(-[a-z0-9]+)*$', name):
        print(f"Error: Component name must be kebab-case (e.g., 'my-component'). Got: '{name}'", file=sys.stderr)
        sys.exit(1)
    return name


def derive_title(name):
    """Convert kebab-case name to Title Case."""
    return " ".join(word.capitalize() for word in name.split("-"))


def find_project_root():
    """Find the project root by looking for the digitalxn-aem-base directory."""
    current = os.getcwd()
    while current != os.path.dirname(current):
        if os.path.isdir(os.path.join(current, "digitalxn-aem-base")):
            return current
        current = os.path.dirname(current)
    print("Error: Cannot find project root (directory containing 'digitalxn-aem-base').", file=sys.stderr)
    print("Run this script from the project root directory.", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------------------
# XML Template Functions
# ---------------------------------------------------------------------------

def xml_folder_content():
    """sling:Folder .content.xml for the component root folder."""
    return build_jcr_xml(
        [NS_JCR, NS_NT],
        [("jcr:primaryType", "sling:Folder")],
    )


def xml_version_content():
    """nt:unstructured .content.xml for the version folder."""
    return build_jcr_xml(
        [NS_JCR, NS_NT],
        [("jcr:primaryType", "nt:unstructured")],
    )


def xml_component_content(title, description, group, super_type, is_container):
    """cq:Component .content.xml for the component definition."""
    title = title.replace('"', '&quot;').replace('&', '&amp;').replace('<', '&lt;')
    attrs = []
    if is_container:
        attrs.append(("cq:isContainer", "{Boolean}true"))
    if description:
        description = description.replace('"', '&quot;').replace('&', '&amp;').replace('<', '&lt;')
        attrs.append(("jcr:description", description))
    attrs.append(("jcr:primaryType", "cq:Component"))
    attrs.append(("jcr:title", title))
    attrs.append(("sling:resourceSuperType", super_type))
    attrs.append(("componentGroup", group))
    return build_jcr_xml([NS_SLING, NS_CQ, NS_JCR], attrs)


def xml_dialog_content(title):
    """_cq_dialog/.content.xml with Settings and Accessibility tabs."""
    title = title.replace('"', '&quot;').replace('&', '&amp;').replace('<', '&lt;')

    return textwrap.dedent(f'''\
        <?xml version="1.0" encoding="UTF-8"?>
        <jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:granite="http://www.adobe.com/jcr/granite/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
            jcr:primaryType="nt:unstructured"
            jcr:title="{title}"
            sling:resourceType="cq/gui/components/authoring/dialog">
            <content
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/container">
                <items jcr:primaryType="nt:unstructured">
                    <tabs
                        jcr:primaryType="nt:unstructured"
                        sling:resourceType="granite/ui/components/coral/foundation/tabs"
                        maximized="{{Boolean}}true">
                        <items jcr:primaryType="nt:unstructured">
                            <!-- Settings Tab -->
                            <settings
                                jcr:primaryType="nt:unstructured"
                                jcr:title="Settings"
                                sling:resourceType="granite/ui/components/coral/foundation/container"
                                margin="{{Boolean}}true">
                                <items jcr:primaryType="nt:unstructured">
                                    <columns
                                        jcr:primaryType="nt:unstructured"
                                        sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                                        margin="{{Boolean}}true">
                                        <items jcr:primaryType="nt:unstructured">
                                            <column
                                                jcr:primaryType="nt:unstructured"
                                                sling:resourceType="granite/ui/components/coral/foundation/container">
                                                <items jcr:primaryType="nt:unstructured">
                                                    <!-- REPLACE: Add your dialog fields here -->
                                                    <title
                                                        jcr:primaryType="nt:unstructured"
                                                        sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                                                        fieldLabel="Title"
                                                        name="./title"/>
                                                    <description
                                                        jcr:primaryType="nt:unstructured"
                                                        sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
                                                        fieldLabel="Description"
                                                        name="./description"/>
                                                </items>
                                            </column>
                                        </items>
                                    </columns>
                                </items>
                            </settings>
                            <!-- Accessibility Tab -->
                            <accessibility
                                jcr:primaryType="nt:unstructured"
                                jcr:title="Accessibility"
                                sling:resourceType="granite/ui/components/coral/foundation/container"
                                margin="{{Boolean}}true">
                                <items jcr:primaryType="nt:unstructured">
                                    <columns
                                        jcr:primaryType="nt:unstructured"
                                        sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                                        margin="{{Boolean}}true">
                                        <items jcr:primaryType="nt:unstructured">
                                            <column
                                                jcr:primaryType="nt:unstructured"
                                                sling:resourceType="granite/ui/components/coral/foundation/container">
                                                <items jcr:primaryType="nt:unstructured">
                                                    <!-- REPLACE: Add your accessibility fields here -->
                                                    <accessibilityLabel
                                                        jcr:primaryType="nt:unstructured"
                                                        sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                                                        fieldLabel="Accessibility Label"
                                                        name="./accessibilityLabel"/>
                                                </items>
                                            </column>
                                        </items>
                                    </columns>
                                </items>
                            </accessibility>
                        </items>
                    </tabs>
                </items>
            </content>
        </jcr:root>
    ''')


def xml_template_content(component_full_name, version):
    """_cq_template/.content.xml with resourceType."""
    resource_type = f"digitalxn/base/components/{component_full_name}/{version}/{component_full_name}"
    return build_jcr_xml(
        [NS_SLING, NS_CQ, NS_JCR, NS_NT],
        [
            ("jcr:primaryType", "nt:unstructured"),
            ("sling:resourceType", resource_type),
        ],
    )


def xml_edit_config():
    """_cq_editConfig.xml with inherit."""
    return build_jcr_xml(
        [NS_CQ, NS_JCR],
        [
            ("cq:inherit", "{Boolean}true"),
            ("jcr:primaryType", "cq:EditConfig"),
        ],
    )


def xml_clientlib_content(component_full_name, with_js):
    """Clientlib .content.xml."""
    attrs = [
        ("jcr:primaryType", "cq:ClientLibraryFolder"),
        ("allowProxy", "{Boolean}true"),
        ("categories", f"[digitalxn.components.{component_full_name}]"),
        ("cssProcessor", "[default:none,min:none]"),
    ]
    if with_js:
        attrs.append(("dependencies", "[@netcentric/component-loader]"))
        attrs.append(("jsProcessor", "[default:none,min:none]"))
    return build_jcr_xml([NS_CQ, NS_JCR], attrs)


def htl_content(component_full_name):
    """Minimal HTL placeholder with BEM root element."""
    return "\n".join([
        f"<!--/* Component: {component_full_name} */-->",
        f'<div class="cmp-{component_full_name}">',
        "    <!--/* TODO: Implement HTL rendering */-->",
        "</div>",
        "",
    ])


# ---------------------------------------------------------------------------
# File Creation
# ---------------------------------------------------------------------------

def collect_files(component_full_name, version, title, description, group, super_type, is_container, with_js):
    """Collect all files to be created as (relative_path, content) tuples."""
    files = []

    # --- Apps structure ---
    comp_root = os.path.join(APPS_BASE, component_full_name)
    version_dir = os.path.join(comp_root, version)
    comp_dir = os.path.join(version_dir, component_full_name)

    # Root folder .content.xml
    files.append((os.path.join(comp_root, ".content.xml"), xml_folder_content()))

    # Version folder .content.xml
    files.append((os.path.join(version_dir, ".content.xml"), xml_version_content()))

    # Component definition .content.xml
    files.append((os.path.join(comp_dir, ".content.xml"),
                  xml_component_content(title, description, group, super_type, is_container)))

    # HTL file
    files.append((os.path.join(comp_dir, f"{component_full_name}.html"),
                  htl_content(component_full_name)))

    # Dialog
    dialog_dir = os.path.join(comp_dir, "_cq_dialog")
    files.append((os.path.join(dialog_dir, ".content.xml"), xml_dialog_content(title)))

    # Template
    template_dir = os.path.join(comp_dir, "_cq_template")
    files.append((os.path.join(template_dir, ".content.xml"),
                  xml_template_content(component_full_name, version)))

    # Edit config
    files.append((os.path.join(comp_dir, "_cq_editConfig.xml"), xml_edit_config()))

    # --- Clientlibs structure ---
    cl_dir = os.path.join(CLIENTLIBS_BASE, component_full_name)

    # Clientlib .content.xml
    files.append((os.path.join(cl_dir, ".content.xml"),
                  xml_clientlib_content(component_full_name, with_js)))

    # CSS bundle
    files.append((os.path.join(cl_dir, f"{component_full_name}.bundle.css"), ""))

    # css.txt
    files.append((os.path.join(cl_dir, "css.txt"), f"{component_full_name}.bundle.css\n"))

    # JS (optional)
    if with_js:
        files.append((os.path.join(cl_dir, f"{component_full_name}.bundle.js"), ""))
        files.append((os.path.join(cl_dir, "js.txt"), f"{component_full_name}.bundle.js\n"))

    return files


def print_tree(files):
    """Print a tree view of files to be created."""
    print("\nFiles to create:")
    print("=" * 60)
    for path, _ in files:
        print(f"  {path}")
    print(f"\nTotal: {len(files)} files")


def create_files(files, project_root):
    """Create all files on disk."""
    created = []
    for rel_path, content in files:
        full_path = os.path.join(project_root, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        created.append(rel_path)
    return created


def check_exists(component_full_name, project_root):
    """Check if the component already exists."""
    apps_path = os.path.join(project_root, APPS_BASE, component_full_name)
    cl_path = os.path.join(project_root, CLIENTLIBS_BASE, component_full_name)

    if os.path.exists(apps_path):
        print(f"Error: Component already exists at {apps_path}", file=sys.stderr)
        sys.exit(1)
    if os.path.exists(cl_path):
        print(f"Error: Clientlib already exists at {cl_path}", file=sys.stderr)
        sys.exit(1)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Scaffold a new AEM component with all required files.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""\
            Examples:
              %(prog)s product-card --title "Product Card" --description "Displays a product" --with-js
              %(prog)s my-widget --title "My Widget" --dry-run
              %(prog)s hero-banner --title "Hero Banner"
        """)
    )
    parser.add_argument("component_name", metavar="component-name",
                        help="Kebab-case name without 'dxn-' prefix (e.g., 'product-card')")
    parser.add_argument("--title", default=None,
                        help="jcr:title for the component (default: derived from name)")
    parser.add_argument("--description", default="",
                        help="jcr:description for the component")
    parser.add_argument("--group", default="DigitalXn General",
                        help="componentGroup value (default: 'DigitalXn General')")
    parser.add_argument("--super-type", default="core/wcm/components/component/v1/component",
                        help="sling:resourceSuperType (default: core/wcm/components/component/v1/component)")
    parser.add_argument("--is-container", action="store_true",
                        help="Set cq:isContainer to true")
    parser.add_argument("--version", default="v1",
                        help="Version folder name (default: v1)")
    parser.add_argument("--with-js", action="store_true",
                        help="Include JS bundle file and js.txt in clientlibs")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print file tree without creating files")

    args = parser.parse_args()

    # Validate and prepare
    name = validate_component_name(args.component_name)
    component_full_name = f"dxn-{name}"
    title = args.title if args.title else derive_title(name)

    project_root = find_project_root()

    # Check for existing component
    if not args.dry_run:
        check_exists(component_full_name, project_root)

    # Collect files
    files = collect_files(
        component_full_name=component_full_name,
        version=args.version,
        title=title,
        description=args.description,
        group=args.group,
        super_type=args.super_type,
        is_container=args.is_container,
        with_js=args.with_js,
    )

    if args.dry_run:
        print(f"[DRY RUN] Component: {component_full_name}")
        print(f"  Title: {title}")
        print(f"  Group: {args.group}")
        print(f"  Super Type: {args.super_type}")
        print(f"  Container: {args.is_container}")
        print(f"  Version: {args.version}")
        print(f"  With JS: {args.with_js}")
        print_tree(files)
        return

    # Create files
    created = create_files(files, project_root)

    print(f"Component '{component_full_name}' created successfully!")
    print(f"\n  Title: {title}")
    print(f"  Group: {args.group}")
    print(f"  Super Type: {args.super_type}")
    print(f"  Version: {args.version}")
    print_tree(files)

    print("\nNext steps:")
    print(f"  1. Edit dialog fields:  .../{component_full_name}/{args.version}/{component_full_name}/_cq_dialog/.content.xml")
    print(f"  2. Implement HTL:       .../{component_full_name}/{args.version}/{component_full_name}/{component_full_name}.html")
    print(f"  3. Add CSS styles:      .../clientlibs/publish/components/{component_full_name}/{component_full_name}.bundle.css")
    if args.with_js:
        print(f"  4. Add JS logic:        .../clientlibs/publish/components/{component_full_name}/{component_full_name}.bundle.js")


if __name__ == "__main__":
    main()
