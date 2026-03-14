---
name: aem-frontend-testing
description: AEM frontend Jest unit testing rules for component JS. Use when writing Jest tests for .clientlibs.js components, setting up fixtures, loadFixture, or deciding whether to add frontend unit tests.
---

# AEM Frontend Unit Testing (Jest)

## Unit Tests Are Optional for Frontend

**Do NOT** automatically create unit tests for every JS component. Frontend unit tests are **optional** and should only be added when the component contains isolatable pure logic worth testing.

**Skip entirely** for:
- Decorative or presentational components (e.g. hero, teaser with only styling)
- Wiring-only code (event delegation, `init()`, `setRefs()`, param passing)
- Components with no calculations, validation, or state transitions
- Thin wrappers around third-party libraries

## Testing Principle

Component unit tests are useful when the logic is **isolated and testable**; otherwise, they add complexity and fragility.

**Test when:** Logic is self-contained, has clear inputs/outputs, and assertions provide confidence without brittle setup or frequent breakage on refactors.

**Skip when:** Logic is tightly coupled to DOM structure, external services, or implementation details that change often. Do not test every function—test logic that delivers value.

**Good test candidates:** Extracted pure functions, calculations, business logic methods, state transitions, validation rules, timer/interval behavior, analytics payload building.

**Poor test candidates:** `init()`, `setRefs()`, component load, param passing, thin wrappers, pure DOM structure assumptions.

## Apply Intelligently

- **Default: Do NOT add unit tests** unless the spec explicitly requests them or the component has isolatable logic.
- Apply **only** when creating or modifying JavaScript component classes (`*.clientlibs.js`) **that contain isolatable logic**
- Prefer: extracted pure functions, calculations, state transitions, validation rules, analytics payload building
- Skip for: decorative components, trivial config, pure CSS changes, glue/wiring, event delegation setup, init/setRefs
- Skip entirely if the component has no meaningful isolatable logic—many components are purely decorative.

## Do Not Test

- **init()** – setup orchestration, not business logic
- **setRefs()** – DOM element caching, trivial selector lookups
- Simple property assignments or getter passthroughs
- Internal method calls via `jest.spyOn` — test outcomes, not how the code achieves them

Focus on event handlers, state changes, calculations, and user-facing behavior.

## Assert All Outcomes of an Event Handler

When an event handler produces multiple changes, assert **all of them**. Asserting only one output gives false confidence and misses real bugs.

**Common outputs to assert after an event:**
- CSS class changes (`classList.contains`)
- ARIA attribute changes (`getAttribute('aria-checked')`, `getAttribute('aria-disabled')`)
- Button state changes (`button.disabled`)
- State object values (`component.state.score`)

```javascript
// ❌ Incomplete — CSS class checked, ARIA and button state ignored
option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
expect(option.classList.contains('option--active')).toBe(true);

// ✅ Complete — all observable outcomes from the same handler
option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
expect(option.classList.contains('option--active')).toBe(true);
expect(option.getAttribute('aria-checked')).toBe('true');
expect(confirmButton.disabled).toBe(false);
```

## Match Test Name to Actual Coverage

A test description should exactly match what is asserted. If the name implies multiple keys or directions, the test must cover them — or use a narrower name.

```javascript
// ❌ Name promises "arrow keys" (plural) but only tests one
it('should navigate between options with arrow keys', () => { ... });

// ✅ One test per case, names match exactly what is verified
it('should move selection to next option with ArrowRight', () => { ... });
it('should wrap to last option with ArrowLeft from first option', () => { ... });
```

Cover boundary/wrap-around cases when modulo or index arithmetic is involved — that is where bugs hide.

## Scope DOM Queries to Match Component Behaviour

Query selectors in tests must mirror the scope the component uses at runtime. Using a broad selector (e.g. on the whole `container`) when the component narrows to a sub-scope (e.g. the active question) will silently return the wrong elements and produce false-passing or incorrectly-failing tests.

```javascript
// ❌ Queries all options across all questions — wrong scope
const options = container.querySelectorAll('.dxn-quiz__option-item');
const lastOption = options[options.length - 1]; // picks last option of question 2, not question 1

// ✅ Scope to the active question, matching how the handler works
const activeQuestion = container.querySelector('.dxn-quiz__question-item--active');
const activeOptions = activeQuestion.querySelectorAll('.dxn-quiz__option-item');
const lastOption = activeOptions[activeOptions.length - 1];
```

Before writing a DOM query in a test, check which root element the handler uses — and use the same root in the test.

## Test Framework

- **Jest** with **jsdom** for DOM simulation
- **Babel** for ES module transpilation
- Location: `digitalxn-aem-base-clientlibs-apps/frontend/`

## Standard Test Structure

```javascript
jest.mock('@netcentric/component-loader', () => ({
  register: jest.fn(),
}));

import ComponentName from './component-name.clientlibs';
import { loadFixture } from '../__test-utils__/loadFixture';

describe('ComponentName', () => {
  let component;
  let container;

  beforeEach(() => {
    container = loadFixture('component-name', 'fixture-name');
    document.body.appendChild(container);
    component = new ComponentName(container, { /* params */ });
  });

  afterEach(() => {
    if (container?.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe('interaction', () => {
    it('should handle user action correctly', () => {
      // Test event handlers, state changes, DOM updates
    });
  });
});
```

## HTML Fixtures

Use real component HTML from AEM templates to ensure tests match production markup.

### Fixture Location

```
digitalxn/base/clientlibs/publish/components/{component-name}/__fixtures__/
└── {fixture-name}.html
```

### Fixture Content

- Match output structure of HTL template (dxn-{component}.html)
- Replace HTL expressions with static test values
- Include all classes and data attributes the JS relies on

### Loading Fixtures

```javascript
import { loadFixture } from '../__test-utils__/loadFixture';

const container = loadFixture('component-name', 'fixture-name');
document.body.appendChild(container);
```

## Mocks

### Component Loader

```javascript
jest.mock('@netcentric/component-loader', () => ({
  register: jest.fn(),
}));
```

### Commons Utils (fillPlaceholders, etc.)

```javascript
jest.mock('commons/utils', () => ({
  ...jest.requireActual('commons/utils'),
  fillPlaceholders: jest.fn((template, data) => {
    if (template == null || typeof template !== 'string') return template ?? '';
    let result = template;
    Object.entries(data || {}).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    });
    return result;
  }),
}));
```

## Timers and Date

Use Jest fake timers for time-based logic:

```javascript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('should update after delay', () => {
  component.startTimer();
  jest.advanceTimersByTime(1000);
  expect(component.someElement.textContent).toBe('expected');
});
```

## Test Naming

Use descriptive `it()` descriptions:

```javascript
it('should enable submit button when input is valid', () => { });
it('should stop timer when end condition is reached', () => { });
it('should reset state when user retries', () => { });
```

## Running Tests

```bash
cd digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend
npm test                                    # All tests
npm test -- --testPathPattern=component-name   # Specific component
npm run test:watch                          # Watch mode
```

## Dependencies

- Jest test runs after FJ001 (JavaScript module) is complete
- Fixtures should match HTL structure from BH001
- Depends on: FJ001, BH001
