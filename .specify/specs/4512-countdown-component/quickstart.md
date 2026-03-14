# Quickstart: Countdown Component

**Branch**: `feature/4512-countdown-component` | **Date**: 2026-03-12

## HTML Scaffold (from design.md)

```html
<div class="dxn-countdown">
  <div class="dxn-countdown__base"
       data-nc="dxn-countdown"
       data-nc-params='{"targetEpoch": ${model.targetEpoch}}'>

    <!-- Background images (decorative) -->
    <picture class="dxn-countdown__background" role="presentation">
      <source media="(min-width: 1024px)" srcset="${model.desktopImage}">
      <source media="(min-width: 768px)" srcset="${model.tabletImage}">
      <img src="${model.mobileImage}" alt="" class="dxn-countdown__background-img">
    </picture>

    <!-- Header: Pretitle + Title -->
    <div class="dxn-countdown__header">
      <p class="dxn-countdown__pretitle">${model.pretitle}</p>
      <h2 class="dxn-countdown__title">${model.title}</h2>
    </div>

    <!-- Timer -->
    <div class="dxn-countdown__timer" role="timer" aria-live="polite" aria-atomic="true">
      <div class="dxn-countdown__timer-unit">
        <span class="dxn-countdown__timer-value" data-unit="days">00</span>
        <span class="dxn-countdown__timer-label">${model.labelDays}</span>
      </div>
      <span class="dxn-countdown__timer-divider" aria-hidden="true"></span>
      <div class="dxn-countdown__timer-unit">
        <span class="dxn-countdown__timer-value" data-unit="hours">00</span>
        <span class="dxn-countdown__timer-label">${model.labelHours}</span>
      </div>
      <span class="dxn-countdown__timer-divider" aria-hidden="true"></span>
      <div class="dxn-countdown__timer-unit">
        <span class="dxn-countdown__timer-value" data-unit="minutes">00</span>
        <span class="dxn-countdown__timer-label">${model.labelMinutes}</span>
      </div>
      <span class="dxn-countdown__timer-divider" aria-hidden="true"></span>
      <div class="dxn-countdown__timer-unit">
        <span class="dxn-countdown__timer-value" data-unit="seconds">00</span>
        <span class="dxn-countdown__timer-label">${model.labelSeconds}</span>
      </div>
    </div>

    <!-- Milestones (0-2) -->
    <div class="dxn-countdown__milestones">
      <!-- Repeat per milestone -->
      <div class="dxn-countdown__milestone">
        <span class="dxn-countdown__milestone-title">${milestone.title}</span>
        <div class="dxn-countdown__milestone-details">
          <span class="dxn-countdown__milestone-text">${milestone.text1}</span>
          <span class="dxn-countdown__milestone-separator" aria-hidden="true"></span>
          <span class="dxn-countdown__milestone-text dxn-countdown__milestone-text--secondary">${milestone.text2}</span>
        </div>
      </div>
    </div>

    <!-- CTA Button (optional, below milestones) -->
    <a class="dxn-button dxn-countdown__button" href="${model.buttonPage}">
      ${model.buttonLabel}
    </a>

  </div>
</div>
```

## SCSS Skeleton (from design.md)

```scss
@import '../../../commons/sass/abstracts';

.dxn-countdown {
  &__base {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 140px 24px;
    gap: 40px;
    overflow: hidden;

    @include tablet-up {
      padding: 140px 150px;
      gap: 64px;
    }

    @include desktop-up {
      padding: 140px 172px;
    }
  }

  &__background {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  &__background-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__header {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    text-transform: uppercase;
    width: 100%;

    @include desktop-up {
      max-width: 1092px;
    }
  }

  &__pretitle {
    font-family: var(--dxn-typography-heading-family);
    font-weight: var(--dxn-typography-heading-weight-black);
    font-size: 16px;
    line-height: 20px;
    color: var(--dxn-color-countdown-pretitle);
    letter-spacing: 0;
    width: 100%;

    @include tablet-up {
      font-size: var(--dxn-typography-size-headings-xs, 20px);
      line-height: var(--dxn-typography-line-height-headings-xs, 24px);
    }
  }

  &__title {
    font-family: var(--dxn-typography-heading-family);
    font-weight: var(--dxn-typography-heading-weight-black);
    font-size: 32px;
    line-height: 36px;
    color: var(--dxn-color-text-on-secondary);
    letter-spacing: 0;
    width: 100%;

    @include desktop-up {
      font-size: 40px;
      line-height: 44px;
    }
  }

  &__timer {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    width: 100%;
    gap: 12px;

    @include tablet-up {
      width: 468px;
    }

    @include desktop-up {
      width: 100%;
      gap: 0;
    }
  }

  &__timer-unit {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
    min-width: 0;
  }

  &__timer-value {
    font-family: var(--dxn-typography-heading-family);
    font-weight: var(--dxn-typography-heading-weight-black);
    font-size: 40px;
    line-height: 1;
    color: var(--dxn-color-text-on-secondary);
    text-shadow: 0 4px 36px rgba(0, 0, 0, 0.5);
    letter-spacing: 0;

    @include desktop-up {
      font-size: 140px;
    }
  }

  &__timer-label {
    font-family: var(--dxn-typography-body-family);
    font-weight: var(--dxn-typography-body-weight-medium);
    font-size: 12px;
    line-height: 16px;
    color: var(--dxn-color-text-on-secondary);
    text-shadow: 0 4px 36px rgba(0, 0, 0, 0.5);
    letter-spacing: 0;
    text-transform: uppercase;

    @include tablet-up {
      font-size: 16px;
      line-height: 20px;
    }

    @include desktop-up {
      font-size: 20px;
      line-height: 24px;
    }
  }

  &__timer-divider {
    width: 1px;
    height: 20px;
    background-color: var(--dxn-color-text-on-secondary);
    flex-shrink: 0;

    @include desktop-up {
      height: 32px;
    }
  }

  &__milestones {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    width: 100%;

    @include tablet-up {
      width: 468px;
      gap: 17px;
    }

    @include desktop-up {
      width: 422px;
      gap: 24px;
    }
  }

  &__milestone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 148px;
    padding: 12px;
    background: var(--dxn-color-countdown-milestone-bg, rgba(255, 255, 255, 0.1));
    backdrop-filter: blur(12px);
    border: 1px solid var(--dxn-color-countdown-milestone-border, #282828);
    border-radius: var(--dxn-radius-l, 8px);

    @include tablet-up {
      width: 226px;
      padding: 16px 32px;
    }

    @include desktop-up {
      width: 199px;
    }
  }

  &__milestone-title {
    font-family: var(--dxn-typography-heading-family);
    font-weight: var(--dxn-typography-heading-weight-black);
    font-size: 18px;
    line-height: 24px;
    color: var(--dxn-color-text-on-secondary);
    text-transform: uppercase;
    text-align: center;
    width: 100%;

    @include tablet-up {
      font-size: 20px;
    }
  }

  &__milestone-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;

    @include tablet-up {
      flex-direction: row;
      gap: var(--dxn-spacing-s, 12px);
    }
  }

  &__milestone-text {
    font-family: var(--dxn-typography-body-family);
    font-weight: var(--dxn-typography-body-weight-regular);
    font-size: 12px;
    line-height: 20px;
    color: var(--dxn-color-text-on-secondary);
    white-space: nowrap;

    &--secondary {
      @include tablet-up {
        display: none;
      }
    }
  }

  &__milestone-separator {
    width: 20px;
    height: 1px;
    background-color: var(--dxn-color-text-on-secondary);

    @include tablet-up {
      display: none;
    }
  }

  &__button {
    position: relative;
    z-index: 1;
  }
}
```

## Integration Scenarios

### IS-001: Full Configuration (All Fields Populated)

**Setup**: Author configures pretitle, title, event date/time (future), timezone, custom labels, button, 2 milestones, all 3 background images, spacing "Medium".

**Expected**:
- All sections render (header, timer, milestones, button)
- Timer counts down from current remaining time, updating each second
- Background image matches viewport breakpoint
- Bottom spacing applied via DXn theming variable

### IS-002: Minimal Configuration (Required Fields Only)

**Setup**: Author configures only event date/time and timezone. All optional fields left empty.

**Expected**:
- Header section not rendered (no pretitle/title)
- Timer renders and counts down
- Milestones section not rendered (no empty container)
- Button not rendered
- No background image (no broken image indicator)

### IS-003: Expired Event

**Setup**: Event date/time is in the past.

**Expected**:
- Server renders 00 for all units
- JS initializes and confirms expiration (targetEpoch < Date.now())
- Timer shows 00 / 00 / 00 / 00 and does not start interval
- All other sections render normally

### IS-004: Milestone Variants

**Setup A**: 1 milestone configured.
**Setup B**: 2 milestones configured.
**Setup C**: 0 milestones.

**Expected**:
- A: Single badge centered in milestones container
- B: Two badges side by side
- C: Milestones container not rendered

### IS-005: Responsive Milestone Text Visibility

**Setup**: 2 milestones with Title, Text1, and Text2 all populated.

**Expected**:
- Mobile (< 768px): Title + Text1 + separator + Text2 visible, stacked vertically
- Tablet (>= 768px): Title + Text1 visible; separator + Text2 hidden via CSS
- Desktop (>= 1024px): Title + Text1 visible; separator + Text2 hidden via CSS

### IS-006: Timezone Persistence Verification

**Setup**: Author selects date "2025-10-27 14:00" in the picker (browser sends CET), and selects "Europe/London" as timezone.

**Expected**:
- JCR stores `eventDateTime = "2025-10-27T14:00:00"` and `eventTimeZone = "Europe/London"`
- Sling Model computes targetEpoch = ZonedDateTime.of(2025-10-27T14:00, Europe/London).toInstant().toEpochMilli()
- Client-side JS uses targetEpoch directly — no timezone parsing on the client

### IS-007: Very Long Countdown

**Setup**: Event date/time is 1000+ days in the future.

**Expected**:
- Days unit displays "1000" (or more) without truncation or layout breakage
- All other units display normally (00-23 for hours, 00-59 for minutes/seconds)

## Test Scenarios

### TS-001: Sling Model — Target Epoch Calculation

**Given**: eventDateTime = "2025-12-25T12:00:00", eventTimeZone = "Europe/London"
**When**: getTargetEpoch() is called
**Then**: Returns the UTC epoch for 2025-12-25T12:00:00 in Europe/London timezone

### TS-002: Sling Model — Label Defaults

**Given**: No label properties set in JCR
**When**: getLabelDays/Hours/Minutes/Seconds() called
**Then**: Returns "DAYS", "HOURS", "MINUTES", "SECONDS" respectively

### TS-003: Sling Model — Custom Labels

**Given**: labelDays = "DIAS", labelHours = "HORAS"
**When**: getLabelDays(), getLabelHours() called
**Then**: Returns "DIAS", "HORAS"

### TS-004: Sling Model — Empty Milestones

**Given**: No milestone child nodes
**When**: getMilestones() and hasMilestones() called
**Then**: Returns empty list and false

### TS-005: Sling Model — Has Button

**Given**: buttonPage = "/content/site/events", buttonLabel = "Buy Tickets"
**When**: hasButton() called
**Then**: Returns true

### TS-006: Sling Model — Has Button Incomplete

**Given**: buttonPage is set but buttonLabel is empty
**When**: hasButton() called
**Then**: Returns false (both must be non-empty)

### TS-007: Sling Model — Conditional Rendering Helpers

**Given**: pretitle is empty, title = "GP"
**When**: hasHeader() called
**Then**: Returns true (at least one is non-empty)

### TS-008: Client-Side — Countdown Tick

**Given**: targetEpoch is 90061000ms in the future (1 day, 1 hour, 1 minute, 1 second)
**When**: Timer initializes
**Then**: Displays 01 / 01 / 01 / 01 and updates each second

### TS-009: Client-Side — Countdown Reaches Zero

**Given**: targetEpoch is 2000ms in the future
**When**: 2 seconds elapse
**Then**: Displays 00 / 00 / 00 / 00 and stops updating (interval cleared)

### TS-010: Client-Side — Already Expired at Load

**Given**: targetEpoch is in the past
**When**: JS initializes
**Then**: Displays 00 / 00 / 00 / 00, does not start interval

### TS-011: Dialog — Multifield Limit

**Given**: Author has added 2 milestones
**When**: Author views the multifield
**Then**: "Add" button is disabled; remove and reorder still functional

### TS-012: Accessibility — Timer Semantics

**Given**: Component rendered with active countdown
**When**: Screen reader reads the timer
**Then**: Timer region is identified (role="timer"), values are conveyed via aria-live="polite"
