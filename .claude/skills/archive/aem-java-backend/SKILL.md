---
name: aem-java-backend
description: AEM Java Sling Models, OSGi services, and backend Java classes. Trigger when writing Java Sling Models, OSGi services, @Model/@PostConstruct annotations, or AEM backend Java classes.
---

# AEM Java Backend Rules

## Package Structure
```
biz.netcentric.digitalxn.aem
├── models/          # Sling Model interfaces
├── internal/
│   └── models/
│       └── v1/      # Sling Model implementations (versioned)
├── services/        # OSGi Service interfaces
└── utils/           # Utility classes
```

## Sling Model: Interface/Implementation Pattern

### Interface (in `models/` package)
```java
package biz.netcentric.digitalxn.aem.models;

import com.adobe.cq.wcm.core.components.models.Teaser;
import com.adobe.cq.export.json.ComponentExporter;

/** Defines the DigitalXn Component Sling Model */
public interface DxnComponent extends Teaser {  // extend Core if applicable
    default boolean getCustomFlag() { return false; }
    String getCustomProperty();
}
```

### Implementation (in `internal/models/v1/<component>/` package)
```java
@Model(
    adaptables = SlingHttpServletRequest.class,
    adapters = { DxnComponent.class, ComponentExporter.class },
    resourceType = DxnComponentImpl.RESOURCE_TYPE,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)
public class DxnComponentImpl implements DxnComponent {

    public static final String RESOURCE_TYPE = "digitalxn/base/components/dxn-component/v1/dxn-component";

    @Self
    private Teaser teaser;  // delegate Core Component calls

    @ValueMapValue
    @Default(values = "")
    private String customProperty;

    @OSGiService
    private ContentService contentService;

    private static final Logger log = LoggerFactory.getLogger(DxnComponentImpl.class);

    @PostConstruct
    protected void init() {
        // validation and initialization
    }
}
```

## Critical Rules

### NEVER use WCMUse
```java
// ❌ WRONG
public class MyModel extends WCMUsePojo { ... }

// ✅ CORRECT
@Model(adaptables = Resource.class)
public class MyModel { @PostConstruct protected void init() { ... } }
```

### Use java.time API (not Calendar/Date/SimpleDateFormat)
```java
// ❌ WRONG
Calendar now = Calendar.getInstance();
SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");

// ✅ CORRECT
ZonedDateTime now = ZonedDateTime.now(ZoneId.of("UTC"));
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ENGLISH);
```

### Always explicit timezone/locale
```java
// ❌ WRONG: Calendar.getInstance() — uses system default
// ✅ CORRECT:
Calendar utcNow = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
SimpleDateFormat fmt = new SimpleDateFormat("MMMM dd, yyyy", Locale.ENGLISH);
```

### Headless framework: No business logic validation in Sling Model
Since this is a headless framework, do NOT validate business logic (e.g., expired dates). Frontend JavaScript handles this.

## Field Injection
```java
@ValueMapValue               // JCR property
@Default(values = "default")
private String title;

@ChildResource               // child resource
private List<Resource> items;

@OSGiService                 // OSGi service
private MyService myService;

@Self                        // self-injection / delegation
private Teaser teaser;

@ScriptVariable              // Sling script variable
private WCMMode wcmmode;
```

## OSGi Service
```java
@Component(service = ContentService.class, immediate = true)
@Designate(ocd = ContentServiceImpl.Config.class)
public class ContentServiceImpl implements ContentService {

    @ObjectClassDefinition(name = "Content Service Configuration")
    public @interface Config {
        @AttributeDefinition(name = "Service Timeout")
        int serviceTimeout() default 30;
    }

    @Reference
    private ResourceResolverFactory resourceResolverFactory;
}
```

## Resource Management (Always try-with-resources)
```java
Map<String, Object> authInfo = Collections.singletonMap(
    ResourceResolverFactory.SUBSERVICE, "my-service");
try (ResourceResolver resolver = resourceResolverFactory.getServiceResourceResolver(authInfo)) {
    // work
} catch (LoginException e) {
    log.error("Failed to get resource resolver", e);
}
```

## Logging
```java
private static final Logger log = LoggerFactory.getLogger(MyClass.class);
// Structured parameterized messages:
log.info("User {} accessed path {} with result {}", userId, path, result);
```
Levels: ERROR (prevents function), WARN (recoverable), INFO (important events), DEBUG (flow details).

## Code Quality Gates
- 80% instruction coverage (JaCoCo enforced — build fails below threshold)
- SonarQube A ratings (maintainability, reliability, security)
- Max 3% duplicated code
- Import optimization after every change (no unused imports, no star imports)
- Max 20 lines per method, max 300 lines per class

## Servlet
```java
@Component(service = Servlet.class)
@SlingServletResourceTypes(resourceTypes = "my/resource", methods = HttpConstants.METHOD_POST)
public class MyServlet extends SlingAllMethodsServlet {
    @Override
    protected void doPost(SlingHttpServletRequest req, SlingHttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        // process
    }
}
```

See REFERENCE.md for interface/implementation boilerplate and annotations reference.
