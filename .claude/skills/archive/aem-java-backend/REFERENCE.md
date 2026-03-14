# AEM Java Backend — Reference

## Interface / Implementation Boilerplate

### Interface (`models/` package)

```java
package biz.netcentric.digitalxn.aem.models;

import com.adobe.cq.export.json.ComponentExporter;

/** Defines the DXN Component Sling Model */
public interface DxnComponent extends ComponentExporter {

    /** Returns the component title */
    String getTitle();

    /** Returns whether the component is enabled */
    default boolean isEnabled() { return true; }

    /** Returns the component's unique ID */
    String getId();
}
```

### Implementation (`internal/models/v1/<component>/` package)

```java
package biz.netcentric.digitalxn.aem.internal.models.v1.component;

import biz.netcentric.digitalxn.aem.models.DxnComponent;
import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.via.ResourceSuperType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.util.Optional;

@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = { DxnComponent.class, ComponentExporter.class },
    resourceType = DxnComponentImpl.RESOURCE_TYPE,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
          extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class DxnComponentImpl implements DxnComponent {

    public static final String RESOURCE_TYPE =
        "digitalxn/base/components/dxn-component/v1/dxn-component";

    private static final Logger log = LoggerFactory.getLogger(DxnComponentImpl.class);

    @ValueMapValue
    @org.apache.sling.models.annotations.Default(values = "")
    private String title;

    @ValueMapValue
    private String id;

    @OSGiService
    private ContentService contentService;

    @PostConstruct
    protected void init() {
        log.debug("Initializing DxnComponentImpl for resource: {}", id);
        // initialization logic
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}
```

## Delegation Pattern (extending Core Components)

```java
@Self
@Via(type = ResourceSuperType.class)
private Teaser teaser;

@Override
public String getTitle() {
    return Optional.ofNullable(title).filter(s -> !s.isEmpty())
        .orElseGet(teaser::getTitle);
}
```

## Annotations Quick Reference

| Annotation | Purpose |
|-----------|---------|
| `@ValueMapValue` | JCR property from resource ValueMap |
| `@Default(values = "x")` | Default string value |
| `@Default(booleanValues = false)` | Default boolean |
| `@ChildResource` | Child resource (list of items) |
| `@OSGiService` | OSGi service injection |
| `@Self` | Self-injection or delegation |
| `@ScriptVariable` | Sling script variable (e.g., WCMMode) |
| `@Inject` | General injection (avoid — prefer specific) |

## isEmpty() Pattern

```java
public boolean isEmpty() {
    return title == null || title.isEmpty();
}

public boolean isHasContent() {
    return !isEmpty();
}
```

Use `data-sly-test="${component.hasContent}"` in HTL to hide component in edit mode when empty.

## Java Time API (mandatory)

```java
// CORRECT
ZonedDateTime now = ZonedDateTime.now(ZoneId.of("UTC"));
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ENGLISH);
String formatted = now.format(formatter);

// WRONG — never use
Calendar.getInstance()
new Date()
new SimpleDateFormat("...")
```

## Package Naming

| Type | Package |
|------|---------|
| Interface | `biz.netcentric.digitalxn.aem.models` |
| Implementation | `biz.netcentric.digitalxn.aem.internal.models.v1.<component>` |
| OSGi Service interface | `biz.netcentric.digitalxn.aem.services` |
| OSGi Service impl | `biz.netcentric.digitalxn.aem.services.impl` or `.internal` |
| Utils | `biz.netcentric.digitalxn.aem.utils` |
