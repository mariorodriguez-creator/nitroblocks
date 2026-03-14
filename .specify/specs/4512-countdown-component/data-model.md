# Data Model: Countdown Component

**Branch**: `feature/4512-countdown-component` | **Date**: 2026-03-12

## Entities

### DxnCountdown (Component Content Node)

**JCR Path**: `/content/.../jcr:content/.../dxn-countdown`
**Resource Type**: `digitalxn/base/components/dxn-countdown/v1/dxn-countdown`

| Property | JCR Type | Required | Default | Description |
|----------|----------|----------|---------|-------------|
| `pretitle` | String | No | — | RTE markup for the pretitle (yellow text above title) |
| `jcr:title` | String | No | — | RTE markup for the main title |
| `eventDateTime` | String | Yes | — | ISO 8601 local date-time without offset, e.g. `2025-12-25T12:00:00` |
| `eventTimeZone` | String | Yes | — | IANA timezone ID, e.g. `Europe/London` |
| `labelDays` | String | Yes | `DAYS` | Display label for the days unit |
| `labelHours` | String | Yes | `HOURS` | Display label for the hours unit |
| `labelMinutes` | String | Yes | `MINUTES` | Display label for the minutes unit |
| `labelSeconds` | String | Yes | `SECONDS` | Display label for the seconds unit |
| `buttonPage` | String | No | — | Content path for the CTA button link |
| `buttonLabel` | String | No | — | Display text for the CTA button |
| `desktopImage` | String | No | — | DAM path for the desktop background image |
| `tabletImage` | String | No | — | DAM path for the tablet background image |
| `mobileImage` | String | No | — | DAM path for the mobile background image |

### Milestone (Multifield Child Node)

**JCR Path**: `/content/.../dxn-countdown/milestones/item0`, `item1`
**Max Items**: 2

| Property | JCR Type | Required | Default | Description |
|----------|----------|----------|---------|-------------|
| `title` | String | No | — | Milestone heading (e.g., "QUALIFYING", "RACE") |
| `text1` | String | No | — | Text before separator (e.g., "14:00 GMT", "10-12") |
| `text2` | String | No | — | Text after separator (e.g., "27th OCT", "2025") |

## Sling Model Interface

**Class**: `biz.netcentric.digitalxn.aem.models.DxnCountdown`

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getPretitle()` | `String` | RTE pretitle markup, or null if not configured |
| `getTitle()` | `String` | RTE title markup, or null if not configured |
| `getTargetEpoch()` | `long` | UTC epoch in milliseconds computed from eventDateTime + eventTimeZone |
| `getLabelDays()` | `String` | Days label (never null — defaults to "DAYS") |
| `getLabelHours()` | `String` | Hours label (never null — defaults to "HOURS") |
| `getLabelMinutes()` | `String` | Minutes label (never null — defaults to "MINUTES") |
| `getLabelSeconds()` | `String` | Seconds label (never null — defaults to "SECONDS") |
| `getButtonPage()` | `String` | Resolved URL for the CTA button, or null |
| `getButtonLabel()` | `String` | CTA button text, or null |
| `getMilestones()` | `List<Milestone>` | 0–2 milestone items |
| `getDesktopImage()` | `String` | DAM path for desktop background, or null |
| `getTabletImage()` | `String` | DAM path for tablet background, or null |
| `getMobileImage()` | `String` | DAM path for mobile background, or null |
| `hasButton()` | `boolean` | True if both buttonPage and buttonLabel are non-empty |
| `hasMilestones()` | `boolean` | True if milestones list is non-empty |
| `hasBackgroundImages()` | `boolean` | True if at least one background image is configured |
| `hasHeader()` | `boolean` | True if pretitle or title is non-empty |

### Milestone (Inner Model / POJO)

| Method | Return Type | Description |
|--------|-------------|-------------|
| `getTitle()` | `String` | Milestone title text |
| `getText1()` | `String` | Text before separator |
| `getText2()` | `String` | Text after separator |

## Relationships

```
DxnCountdown (1) ──contains──> (0..2) Milestone
DxnCountdown (1) ──links-to──> (0..1) Page (via buttonPage)
DxnCountdown (1) ──references──> (0..3) DAM Asset (desktop/tablet/mobile images)
```

## Validation Rules

| Rule | Enforced By | Description |
|------|-------------|-------------|
| eventDateTime is required | Dialog (required=true) | Date-time picker must have a value |
| eventTimeZone is required | Dialog (required=true) | Timezone dropdown must have a selection |
| Labels default to uppercase English | Sling Model @Default | If empty/missing, fall back to DAYS/HOURS/MINUTES/SECONDS |
| Max 2 milestones | Dialog (maxitems=2) | Multifield add button disabled at limit |
| buttonPage must be valid content path | Dialog (pathfield rootPath) | Constrained to /content tree |

## State Transitions

```
                    ┌──────────────────────┐
                    │   Component Placed    │
                    │   (no configuration)  │
                    └──────────┬───────────┘
                               │ Author opens dialog
                               ▼
                    ┌──────────────────────┐
                    │    Configured         │
                    │  (eventDateTime +     │
                    │   eventTimeZone set)  │
                    └──────────┬───────────┘
                               │ Page published
                               ▼
              ┌────────────────┴────────────────┐
              ▼                                 ▼
   ┌─────────────────┐              ┌─────────────────┐
   │  Counting Down   │              │    Expired       │
   │  (event future)  │──time───────▶│  (event past)    │
   │  Updates /sec    │              │  Shows 00:00:00  │
   │                  │              │  Stops updating  │
   └─────────────────┘              └─────────────────┘
```

The transition from "Counting Down" to "Expired" happens client-side when `Date.now() >= targetEpoch`. The "Expired" state is terminal — the timer displays 00 for all units and the `setInterval` is cleared.
