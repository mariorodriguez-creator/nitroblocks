---
name: aem-naming
description: AEM label naming conventions and design compliance testing. Trigger when naming label/ARIA identifiers in Java/XML/JS, creating design-expectations.json, or running assert-design-compliance.js CSS checks.
---

# AEM Naming Conventions

## Label Identifier Convention

All label identifiers follow: `{purpose}{Type}`

- `{purpose}` = semantic meaning (e.g., `days`, `timer`, `submit`)
- `{Type}` = suffix (`Label`, `AriaLabel`, `AriaAnnouncement`)

### Correct

```java
// Java
private String daysLabel;
String getDaysLabel();
String getTimerAriaLabel();
String getHourBoundaryAriaAnnouncement();
```

```xml
<!-- Dialog XML -->
<timerDaysLabel name="./timerDaysLabel" />
<timerAriaLabel name="./timerAriaLabel" />
```

```javascript
// JavaScript
this.daysLabel = this.params.daysLabel;
this.submitAriaLabel = element.dataset.submitAriaLabel;
```

### Incorrect

```java
private String labelDays;           // Label as prefix — WRONG
private String ariaLabelTimer;      // AriaLabel as prefix — WRONG
private String daysText;            // Missing "Label" suffix — WRONG
```

**Rule**: Purpose first, type suffix. `daysLabel` reads naturally as "days label". Groups by purpose in autocomplete (`days*` shows all days-related identifiers). Consistent across Java, XML, and JS.

---

# Design Compliance Testing

## When to Use

After `design.md` exists for a component and CSS has been built. Verifies implemented CSS stays aligned with Figma-derived spacing, typography, and layout specs.

## Artifacts

- **`design-expectations.json`** — machine-readable expectations: selectors, breakpoints, expected CSS values
- **`.specify/scripts/assert-design-compliance.js`** — Node script that parses compiled CSS and asserts expectations

## Running the Check

```bash
node .specify/scripts/assert-design-compliance.js \
  .specify/specs/<feature-dir>/design-expectations.json \
  [path/to/bundle.css]
```

Exit code 0 = pass; 1 = failures reported on stderr.

## design-expectations.json Format

```json
{
  "component": "dxn-teaser",
  "cssPath": "digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/target/jcr_root/apps/digitalxn/base/clientlibs/publish/components/dxn-teaser/dxn-teaser.bundle.css",
  "expectations": [
    {
      "id": "content-gap-mobile",
      "selector": ".dxn-teaser__content",
      "media": null,
      "properties": {
        "gap": { "value": "8px", "tolerancePx": 0, "acceptVar": true }
      }
    },
    {
      "id": "title-font-desktop",
      "selector": ".dxn-teaser__title",
      "media": "1024px",
      "properties": {
        "font-size": { "value": "48px", "acceptVar": true }
      }
    }
  ]
}
```

**Fields:**
- `media`: `null` for base/mobile, min-width string for breakpoints (e.g. `"1024px"`)
- `acceptVar: true`: allows `var(--token, 24px)` to satisfy `"24px"`
- `tolerancePx`: pixel tolerance for dimension values

## What to Check vs. Skip

**Include:**
- Typography: `font-size`, `line-height`, `font-weight`, `letter-spacing`
- Dimensions: `padding`, `margin`, `gap`, `width`, `height` for **fixed** design elements
- Colors: `color`, `background-color`, `border-color`
- Borders: `border-width`, `border-style`, `border-radius`
- Shadows: `box-shadow`, `text-shadow`

**Skip:**
- Child/embedded components (e.g. `dxn-button`, `dxn-image`) — they have their own tests
- Dynamic Content Elements (variable sizing) unless spec explicitly states a fixed size
- Use component-specific bundle, NOT the page-level `publish.bundle.css`

## cssPath: Component-Specific Bundle

```
digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/target/jcr_root/apps/digitalxn/base/clientlibs/publish/components/<component-name>/<component-name>.bundle.css
```

Build CSS first: `npm run build:css` in `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/`
