---
name: aem-testing
description: AEM Java unit testing with AemContext, Mockito, and JSON test data. Trigger when writing JUnit tests for Sling Models, OSGi services, or API-backed components, or when setting up test resources and AemContext.
---

# AEM Unit Testing Rules

Apply to new Sling Models, services, and components with complex logic. Skip for simple getters/setters.

## MANDATORY: JSON Test Data for Sling Models

**Always use JSON files** for Sling Model test setup. Never use programmatic `context.create().resource()` as the primary setup.

- **JSON location**: `src/test/resources/biz/netcentric/digitalxn/aem/internal/models/v1/<component>/<component>-example.json`
- **Load in @BeforeEach**: `context.load().json(JSON_PATH, "/content")`
- **Override per test**: Use `ModifiableValueMap` for test-specific variants
- **Component-in-Container structure**: `root` and `container` must use `sling:resourceType="digitalxn/base/components/dxn-container/v1/dxn-container"`. Components go as children of `container`, NOT `root`.

## Standard Sling Model Test Structure

```java
@ExtendWith({ AemContextExtension.class, MockitoExtension.class })
class DxnComponentImplTest {

    private static final String RESOURCE_PATH = "/content/page/jcr:content/root/container/component";
    private static final String JSON_PATH = "/biz/netcentric/digitalxn/aem/internal/models/v1/component/component-example.json";

    private final AemContext context = new AemContext(ResourceResolverType.JCR_MOCK);

    @BeforeEach
    void setUp() {
        context.load().json(JSON_PATH, "/content");
        context.currentResource(RESOURCE_PATH);
    }

    @Test
    void shouldAdaptFromRequestWithDefaultValues() {
        var underTest = context.request().adaptTo(DxnComponent.class);
        assertThat(underTest.getTitle()).isEqualTo("Default Title");
    }
}
```

## API / Service Test Structure (programmatic setup)

```java
@ExtendWith({ AemContextExtension.class, MockitoExtension.class })
class DxnApiComponentImplTest {

    private final AemContext aemContext = new AemContext();

    @Mock
    private RequiredService requiredService;

    @BeforeEach
    void setUp() {
        aemContext.registerService(RequiredService.class, requiredService);
    }
}
```

## BDD Naming Convention

```java
// Pattern: should{ExpectedBehavior}When{Condition}
void shouldReturnTitleWhenPropertyIsSet()
void shouldReturnNullWhenTitleNotConfigured()
void shouldHandleServiceFailureGracefully()
```

## Test Method Structure (Given-When-Then)

```java
@Test
void shouldReturnExpectedResultWhenConditionIsMet() {
    // Given
    given(someService.getData()).willReturn("expected-data");

    // When
    var underTest = context.request().adaptTo(DxnComponent.class);
    String result = underTest.processData();

    // Then
    assertThat(result).isEqualTo("expected-data");
    verify(someService).getData();
}
```

## Mockito Patterns

```java
// Setup
given(mockService.findById(any(String.class))).willReturn(expectedResult);
given(mockService.isAvailable()).willReturn(true);
given(mockService.call()).willThrow(new RuntimeException("Service error"));

// Verification
verify(mockService).findById("expectedValue");
verify(mockService, times(2)).processData(any());
verify(mockService, never()).deleteData(any());
verifyNoInteractions(mockService);
```

## Coverage Targets

- **Line coverage**: Minimum 80% per class (JaCoCo enforced — build fails below threshold)
- **Branch coverage**: Minimum 70% per class
- **Method coverage**: 100% of public methods
- **Edge cases**: Handle nulls, empty values, service failures

## OSGi Service Injection (CAC and Reflection)

For OSGi services injected via `@OSGiService` that aren't registered in AemContext:
```java
// Use reflection for private field injection if needed in tests
Field field = DxnComponentImpl.class.getDeclaredField("contentService");
field.setAccessible(true);
field.set(underTest, mockContentService);
```

## Rules

- Always use both `AemContextExtension` and `MockitoExtension`
- Test class naming: `{ComponentName}ImplTest` or `{ComponentName}Test`
- Use `@ExtendWith` not deprecated `@RunWith`
- Do NOT test component exporter JSON properties
- Do NOT test default configurations in components — test business logic
- Use `given().willReturn()` (BDD style) over `when().thenReturn()`
- Use constants for resource types and paths

## Error Handling Tests

```java
@Test
void shouldHandleServiceFailureGracefully() {
    given(someService.getData()).willThrow(new RuntimeException("Service error"));

    var underTest = context.request().adaptTo(ComponentImpl.class);
    String result = underTest.processData();

    assertThat(result).isEmpty(); // verify graceful fallback
}
```
