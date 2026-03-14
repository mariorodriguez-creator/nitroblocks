# AEM Dialog — Reference

## Full Dialog Skeleton (Simple Tab)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          xmlns:granite="http://www.adobe.com/jcr/granite/1.0"
          xmlns:cq="http://www.day.com/jcr/cq/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="DXN Component"
    sling:resourceType="cq/gui/components/authoring/dialog"
    extraClientlibs="[digitalxn.author.components.dxn-component]">
    <content
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <tabs
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/tabs"
                maximized="{Boolean}true">
                <items jcr:primaryType="nt:unstructured">
                    <text
                        jcr:primaryType="nt:unstructured"
                        jcr:title="Text"
                        sling:resourceType="granite/ui/components/coral/foundation/container"
                        margin="{Boolean}true">
                        <items jcr:primaryType="nt:unstructured">
                            <titleGroup
                                jcr:primaryType="nt:unstructured"
                                sling:resourceType="granite/ui/components/coral/foundation/well">
                                <items jcr:primaryType="nt:unstructured">
                                    <title
                                        jcr:primaryType="nt:unstructured"
                                        sling:resourceType="cq/gui/components/authoring/dialog/richtext"
                                        externalStyleSheets="[/bin/digitalxn/theme/variables.css,/apps/digitalxn/base/clientlibs/author/rte/rte.bundle.css]"
                                        fieldLabel="Title"
                                        name="./title"
                                        removeSingleParagraphContainer="{Boolean}true"
                                        useFixedInlineToolbar="{Boolean}true">
                                        <rtePlugins jcr:primaryType="nt:unstructured"
                                            sling:resourceSuperType="digitalxn/base/components/shared/rteConfigs/basic/rtePlugins"/>
                                        <uiSettings jcr:primaryType="nt:unstructured"
                                            sling:resourceSuperType="digitalxn/base/components/shared/rteConfigs/basic/uiSettings"/>
                                    </title>
                                </items>
                            </titleGroup>
                        </items>
                    </text>
                    <settings
                        jcr:primaryType="nt:unstructured"
                        jcr:title="Settings"
                        sling:resourceType="granite/ui/components/coral/foundation/container"
                        margin="{Boolean}true">
                        <items jcr:primaryType="nt:unstructured">
                            <settingsGroup
                                jcr:primaryType="nt:unstructured"
                                sling:resourceType="granite/ui/components/coral/foundation/well">
                                <items jcr:primaryType="nt:unstructured">
                                    <enabled
                                        jcr:primaryType="nt:unstructured"
                                        sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
                                        fieldDescription="Enable the component"
                                        name="./enabled"
                                        text="Enabled"
                                        value="{Boolean}true"
                                        uncheckedValue="false"/>
                                </items>
                            </settingsGroup>
                        </items>
                    </settings>
                    <extraStyles
                        jcr:primaryType="nt:unstructured"
                        sling:resourceType="granite/ui/components/coral/foundation/include"
                        path="/apps/digitalxn/base/components/shared/authoring/dialog/extra_style/tab_edit/extrastyletab"/>
                </items>
            </tabs>
        </items>
    </content>
</jcr:root>
```

## Image Tab Pattern (Desktop + Mobile)

```xml
<image
    jcr:primaryType="nt:unstructured"
    jcr:title="Asset"
    sling:resourceType="granite/ui/components/coral/foundation/container">
    <items jcr:primaryType="nt:unstructured">
        <columns
            jcr:primaryType="nt:unstructured"
            sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns">
            <items jcr:primaryType="nt:unstructured">
                <column
                    jcr:primaryType="nt:unstructured"
                    sling:resourceType="granite/ui/components/coral/foundation/container">
                    <items jcr:primaryType="nt:unstructured">
                        <!-- Desktop Image -->
                        <desktopAssetNote
                            jcr:primaryType="nt:unstructured"
                            sling:resourceType="granite/ui/components/coral/foundation/text"
                            text="Desktop Image"/>
                        <file
                            jcr:primaryType="nt:unstructured"
                            sling:resourceType="cq/gui/components/authoring/dialog/fileupload"
                            allowUpload="{Boolean}false"
                            class="cq-droptarget"
                            fileNameParameter="./fileName"
                            fileReferenceParameter="./fileReference"
                            mimeTypes="[image/gif,image/jpeg,image/png,image/tiff,image/svg+xml]"
                            name="./file"
                            required="true"/>
                        <alternativeGroup
                            jcr:primaryType="nt:unstructured"
                            sling:resourceType="granite/ui/components/coral/foundation/well">
                            <items jcr:primaryType="nt:unstructured">
                                <alt
                                    jcr:primaryType="nt:unstructured"
                                    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                                    fieldLabel="Alternative text for accessibility"
                                    name="./alt"/>
                                <altValueFromDAM
                                    jcr:primaryType="nt:unstructured"
                                    sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
                                    name="./altValueFromDAM"
                                    text="Inherit from description of asset"
                                    value="{Boolean}true"
                                    uncheckedValue="false"/>
                            </items>
                        </alternativeGroup>
                        <decorative
                            jcr:primaryType="nt:unstructured"
                            sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
                            name="./isDecorative"
                            text="Don't provide an alternative text"
                            value="{Boolean}true"
                            uncheckedValue="false"/>

                        <!-- Mobile Image -->
                        <mobileImg
                            jcr:primaryType="nt:unstructured"
                            sling:resourceType="granite/ui/components/coral/foundation/well">
                            <items jcr:primaryType="nt:unstructured">
                                <mobileAssetNote
                                    jcr:primaryType="nt:unstructured"
                                    sling:resourceType="granite/ui/components/coral/foundation/text"
                                    text="Mobile Image"/>
                                <file
                                    jcr:primaryType="nt:unstructured"
                                    sling:resourceType="cq/gui/components/authoring/dialog/fileupload"
                                    allowUpload="{Boolean}false"
                                    class="cq-droptarget"
                                    fileNameParameter="./fileNameMobile"
                                    fileReferenceParameter="./fileReferenceMobile"
                                    mimeTypes="[image/gif,image/jpeg,image/png,image/tiff,image/svg+xml]"
                                    name="./fileMobile"
                                    required="true"/>
                            </items>
                        </mobileImg>
                    </items>
                </column>
            </items>
        </columns>
    </items>
</image>
```

## Actions Tab Pattern (Multifield)

```xml
<actions
    jcr:primaryType="nt:unstructured"
    jcr:title="Links"
    sling:resourceType="granite/ui/components/coral/foundation/container"
    margin="{Boolean}true">
    <items jcr:primaryType="nt:unstructured">
        <actionsMultifield
            jcr:primaryType="nt:unstructured"
            sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
            composite="{Boolean}true"
            fieldLabel="Call-to-actions">
            <field
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/container"
                layout="fixed"
                name="./actions">
                <items jcr:primaryType="nt:unstructured">
                    <link
                        jcr:primaryType="nt:unstructured"
                        sling:resourceType="cq/gui/components/coral/common/form/pagefield"
                        emptyText="Link"
                        name="link"
                        required="{Boolean}true"
                        rootPath="/content"/>
                    <text
                        jcr:primaryType="nt:unstructured"
                        sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                        emptyText="Text"
                        name="text"
                        required="{Boolean}true"/>
                    <target
                        jcr:primaryType="nt:unstructured"
                        sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
                        fieldDescription="Open link in new tab"
                        name="linkTarget"
                        text="Open in new tab"
                        value="_blank"
                        uncheckedValue="_self"/>
                </items>
            </field>
        </actionsMultifield>
    </items>
</actions>
```

## Design-Aware Fields

```xml
<titleGroup
    granite:hide="${cqDesign.titleHidden}"
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/well">
    <!-- Content -->
</titleGroup>
```
