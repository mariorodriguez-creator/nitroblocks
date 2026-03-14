---
name: eds-naming
description: EDS label naming conventions and design compliance testing. Trigger when naming label/ARIA identifiers in HTML/JS, creating design-expectations.json, or running assert-design-compliance.js CSS checks.
---

# EDS Naming Conventions

## Label Identifier Convention

All label identifiers follow: `{purpose}{Type}`

- `{purpose}` = semantic meaning (e.g., `days`, `timer`, `submit`)
- `{Type}` = suffix (`Label`, `AriaLabel`, `AriaAnnouncement`)

### Correct

```javascript
// JavaScript
this.daysLabel = element.dataset.daysLabel;
this.submitAriaLabel = element.dataset.submitAriaLabel;
this.timerAriaLabel = element.dataset.timerAriaLabel;
```

```html
<!-- HTML data attributes -->
<div data-days-label="Days" data-timer-aria-label="Countdown timer">
```

### Incorrect

```javascript
this.labelDays;           // Label as prefix — WRONG
this.ariaLabelTimer;      // AriaLabel as prefix — WRONG
this.daysText;            // Missing "Label" suffix — WRONG
```

**Rule**: Purpose first, type suffix. `daysLabel` reads naturally as "days label". Groups by purpose in autocomplete (`days*` shows all days-related identifiers).

---

# Design Compliance Testing

## When to Use

After `design.md` exists for a block and CSS has been written. Verifies implemented CSS stays aligned with Figma-derived spacing, typography, and layout specs.

## Artifacts

- **`design-expectations.json`** — machine-readable expectations: selectors, breakpoints, expected CSS values
- **`.specify/scripts/bash/assert-design-compliance.js`** — Node script that parses CSS and asserts expectations

## Running the Check

```bash
node .specify/scripts/bash/assert-design-compliance.js \
  .specify/specs/<feature-dir>/design-expectations.json \
  [path/to/block.css]
```

Exit code 0 = pass; 1 = failures reported on stderr.

For EDS blocks, the CSS path is typically `blocks/{block-name}/{block-name}.css`.

## design-expectations.json Format (EDS)

```json
{
  "component": "countdown",
  "cssPath": "blocks/countdown/countdown.css",
  "expectations": [
    {
      "id": "content-gap-mobile",
      "selector": ".countdown__content",
      "media": null,
      "properties": {
        "gap": { "value": "8px", "tolerancePx": 0, "acceptVar": true }
      }
    },
    {
      "id": "title-font-desktop",
      "selector": ".countdown__title",
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
- Child/embedded blocks — they have their own tests
- Dynamic Content Elements (variable sizing) unless spec explicitly states a fixed size
- Use block-specific CSS file, NOT the page-level `styles.css`

## cssPath: EDS Block CSS

For EDS projects, `cssPath` points to the block's CSS file:

```
blocks/{block-name}/{block-name}.css
```
