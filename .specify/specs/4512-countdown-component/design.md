# Design Reference: Countdown Component

## Code Scaffold

### HTML Structure

```html
<div class="dxn-countdown">                           <!-- AEM wrapper (block class) -->
  <div class="dxn-countdown__base">                    <!-- HTL root — Figma root frame styles -->
    <div class="dxn-countdown__header">                <!-- Caption + Title -->
      <p class="dxn-countdown__pretitle">...</p>       <!-- RTE pretitle (yellow) -->
      <h2 class="dxn-countdown__title">...</h2>        <!-- RTE title -->
    </div>
    <div class="dxn-countdown__timer">                 <!-- Countdown Inputs row -->
      <div class="dxn-countdown__timer-unit">          <!-- Repeats ×4 (days/hours/min/sec) -->
        <span class="dxn-countdown__timer-value">12</span>
        <span class="dxn-countdown__timer-label">DAYS</span>
      </div>
      <span class="dxn-countdown__timer-divider"></span>
      <!-- ... hours, divider, minutes, divider, seconds -->
    </div>
    <div class="dxn-countdown__milestones">            <!-- Events container (0-2 badges) -->
      <div class="dxn-countdown__milestone">           <!-- Badge -->
        <span class="dxn-countdown__milestone-title">QUALIFYING</span>
        <div class="dxn-countdown__milestone-details"> <!-- Time & Date -->
          <span class="dxn-countdown__milestone-text">14:00 GMT</span>
          <span class="dxn-countdown__milestone-separator"></span>
          <span class="dxn-countdown__milestone-text">27th OCT</span>
        </div>
      </div>
      <!-- second milestone badge (same structure) -->
    </div>
  </div>
</div>
```

### SCSS Skeleton

```scss
@import '../../../commons/sass/abstracts';

.dxn-countdown {
  &__base {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 140px var(--dxn-layout-countdown-padding-x);
    gap: var(--dxn-layout-countdown-section-gap);
    overflow: hidden;

    // Background image layer (via <picture> or CSS background)
    // positioned absolutely behind content
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    text-transform: uppercase;
    width: 100%;
  }

  &__pretitle {
    font-family: var(--dxn-typography-heading-family);
    font-weight: var(--dxn-typography-heading-weight-black);
    font-size: var(--dxn-typography-countdown-pretitle-size);
    line-height: var(--dxn-typography-countdown-pretitle-line-height);
    color: var(--dxn-color-countdown-pretitle);
    letter-spacing: 0;
  }

  &__title {
    font-family: var(--dxn-typography-heading-family);
    font-weight: var(--dxn-typography-heading-weight-black);
    font-size: var(--dxn-typography-countdown-title-size);
    line-height: var(--dxn-typography-countdown-title-line-height);
    color: var(--dxn-color-text-on-secondary);
    letter-spacing: 0;
  }

  &__timer {
    display: flex;
    align-items: center;
    width: 100%;
    gap: var(--dxn-layout-countdown-timer-gap);
  }

  &__timer-unit {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }

  &__timer-value {
    font-family: var(--dxn-typography-heading-family);
    font-weight: var(--dxn-typography-heading-weight-black);
    font-size: var(--dxn-typography-countdown-value-size);
    line-height: 1;
    color: var(--dxn-color-text-on-secondary);
    text-shadow: 0 4px 36px rgba(0, 0, 0, 0.5);
    letter-spacing: 0;
  }

  &__timer-label {
    font-family: var(--dxn-typography-body-family);
    font-weight: var(--dxn-typography-body-weight-medium);
    font-size: var(--dxn-typography-countdown-label-size);
    line-height: var(--dxn-typography-countdown-label-line-height);
    color: var(--dxn-color-text-on-secondary);
    text-shadow: 0 4px 36px rgba(0, 0, 0, 0.5);
    letter-spacing: 0;
  }

  &__timer-divider {
    width: 1px;
    height: var(--dxn-layout-countdown-divider-height);
    background-color: var(--dxn-color-text-on-secondary);
    flex-shrink: 0;
  }

  &__milestones {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--dxn-layout-countdown-milestone-gap);
    width: var(--dxn-layout-countdown-milestones-width);
  }

  &__milestone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: var(--dxn-layout-countdown-milestone-width);
    padding: var(--dxn-layout-countdown-milestone-padding);
    background: var(--dxn-color-countdown-milestone-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--dxn-color-countdown-milestone-border);
    border-radius: var(--dxn-radius-l);
  }

  &__milestone-title {
    font-family: var(--dxn-typography-heading-family);
    font-weight: var(--dxn-typography-heading-weight-black);
    font-size: var(--dxn-typography-countdown-milestone-title-size);
    line-height: 24px;
    color: var(--dxn-color-text-on-secondary);
    text-transform: uppercase;
    text-align: center;
    width: 100%;
  }

  &__milestone-details {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--dxn-spacing-s);
    width: 100%;

    @include mobile-only {
      flex-direction: column;
      gap: 4px;
    }
  }

  &__milestone-text {
    font-family: var(--dxn-typography-body-family);
    font-weight: var(--dxn-typography-body-weight-regular);
    font-size: 12px;
    line-height: 20px;
    color: var(--dxn-color-text-on-secondary);
    white-space: nowrap;
  }

  &__milestone-separator {
    width: 1px;
    height: 20px;
    background-color: var(--dxn-color-text-on-secondary);

    @include mobile-only {
      width: 20px;
      height: 1px;
    }
  }
}
```

## Design Token Mapping

| Element | CSS Property | --dxn- variable | Figma Token | Fallback |
|---------|-------------|-----------------|-------------|----------|
| Pretitle | color | --dxn-color-countdown-pretitle | Extra / Yellow | #FAB401 |
| Title, timer, labels | color | --dxn-color-text-on-secondary | Colours/Text/On Secondary | #ffffff |
| Pretitle, title, timer value, milestone title | font-family | --dxn-typography-heading-family | Typography/Font-family/Heading | 'Helvetica Neue', sans-serif |
| Pretitle, title, timer value, milestone title | font-weight | --dxn-typography-heading-weight-black | Typography/Font-weight/Black | bold |
| Timer label, milestone text | font-family | --dxn-typography-body-family | Typography/Font-family/Body | 'Helvetica Neue', sans-serif |
| Timer label | font-weight | --dxn-typography-body-weight-medium | (Medium) | 500 |
| Milestone text | font-weight | --dxn-typography-body-weight-regular | Typography/Font-weight/Regular | normal |
| Milestone | background | --dxn-color-countdown-milestone-bg | — | rgba(255,255,255,0.1) |
| Milestone | border-color | --dxn-color-countdown-milestone-border | — | #282828 |
| Milestone | border-radius | --dxn-radius-l | Radius/L | 8px |
| Milestone details | gap | --dxn-spacing-s | Spacing/S | 12px |
| All text | letter-spacing | — | Letter Spacing/none | 0 |

## Breakpoints & Per-Breakpoint CSS Overrides

### Mobile base (< 768px)

| Property | Element | Value |
|----------|---------|-------|
| padding (horizontal) | `__base` | 24px |
| section gap | `__base` | 40px |
| pretitle font-size | `__pretitle` | 16px |
| pretitle line-height | `__pretitle` | 20px |
| title font-size | `__title` | 32px |
| title line-height | `__title` | 36px |
| timer gap | `__timer` | 12px |
| timer value font-size | `__timer-value` | 40px |
| timer label font-size | `__timer-label` | 12px |
| timer label line-height | `__timer-label` | 16px |
| divider height | `__timer-divider` | 20px |
| milestones width | `__milestones` | 100% (full width) |
| milestones gap | `__milestones` | 15px |
| milestone width | `__milestone` | 148px |
| milestone padding | `__milestone` | 12px |
| milestone title font-size | `__milestone-title` | 18px |
| milestone details layout | `__milestone-details` | flex-direction: column; gap: 4px |
| milestone separator | `__milestone-separator` | width: 20px; height: 1px (horizontal) |

### Tablet (>= 768px) — `@include tablet-up`

| Property | Element | Value |
|----------|---------|-------|
| padding (horizontal) | `__base` | 150px |
| section gap | `__base` | 64px |
| pretitle font-size | `__pretitle` | 20px (var --dxn-typography-size-headings-xs) |
| pretitle line-height | `__pretitle` | 24px (var --dxn-typography-line-height-headings-xs) |
| title font-size | `__title` | 32px |
| title line-height | `__title` | 36px |
| header width | `__header` | 100% |
| timer width | `__timer` | 468px |
| timer gap | `__timer` | 12px |
| timer value font-size | `__timer-value` | 40px |
| timer label font-size | `__timer-label` | 16px |
| timer label line-height | `__timer-label` | 20px |
| divider height | `__timer-divider` | 20px |
| milestones width | `__milestones` | 468px |
| milestones gap | `__milestones` | 17px |
| milestone width | `__milestone` | 226px |
| milestone padding | `__milestone` | 32px 16px |
| milestone title font-size | `__milestone-title` | 20px |
| milestone details layout | `__milestone-details` | flex-direction: row; gap: 12px |
| milestone separator | `__milestone-separator` | hidden (Text2 not shown on tablet) |

### Desktop (>= 1024px) — `@include desktop-up`

| Property | Element | Value |
|----------|---------|-------|
| padding (horizontal) | `__base` | 172px |
| section gap | `__base` | 64px |
| pretitle font-size | `__pretitle` | 20px |
| pretitle line-height | `__pretitle` | 24px |
| title font-size | `__title` | 40px |
| title line-height | `__title` | 44px |
| header width | `__header` | 1092px (max-width) |
| timer width | `__timer` | 100% (fills available space) |
| timer gap | `__timer` | 0 (flex: 1 distributes evenly) |
| timer value font-size | `__timer-value` | 140px |
| timer label font-size | `__timer-label` | 20px |
| timer label line-height | `__timer-label` | 24px |
| divider height | `__timer-divider` | 32px |
| milestones width | `__milestones` | 422px |
| milestones gap | `__milestones` | 24px |
| milestone width | `__milestone` | 199px |
| milestone padding | `__milestone` | 32px 16px |
| milestone title font-size | `__milestone-title` | 20px |
| milestone details layout | `__milestone-details` | flex-direction: row; gap: 12px |
| milestone separator | `__milestone-separator` | hidden (Text2 not shown on desktop) |

## Dynamic Content Elements

| Element | Reason | Sizing |
|---------|--------|--------|
| `__timer-value` | Content updates every second (00–99+ for days) | ≈ width auto, font-size fixed per breakpoint |
| `__pretitle` | Author-configurable RTE text | ≈ width 100%, height auto |
| `__title` | Author-configurable RTE text | ≈ width 100%, height auto |
| `__milestone-title` | Author-configurable text | ≈ width 100% of badge |
| `__milestone-text` | Author-configurable text | ≈ auto, white-space: nowrap |

These elements MUST NOT get fixed dimension expectations in design-expectations.json.

## Interactive States

| Element | State | Appearance |
|---------|-------|------------|
| `__milestone` | hover | No hover state defined in Figma — none required |
| `__milestone` | focus | No focus state defined — milestones are not interactive |
| Timer digits | updating | Values change every second; no visual transition defined |

No interactive states (hover, focus, active) are defined in the Figma design for this component. The countdown is display-only with no clickable elements apart from the optional CTA button (which is a separate `dxn-button` child component and follows its own interactive states).

## Visual Acceptance Checklist

- [ ] Pretitle text renders in #FAB401 (yellow), uppercase, heading font
- [ ] Title renders in white, uppercase, heading font — 40px desktop, 32px tablet/mobile
- [ ] Timer values are 140px on desktop, 40px on tablet/mobile — white, heading font bold
- [ ] Timer labels sit below values with 8px gap — body font medium weight
- [ ] Vertical dividers appear between each timer unit (1px wide, white)
- [ ] Divider height: 32px desktop, 20px tablet/mobile
- [ ] Milestone badges have glassmorphic background (rgba white 10%, blur 12px, 1px #282828 border, 8px radius)
- [ ] Mobile milestones stack Text1 / separator / Text2 vertically; tablet/desktop show Text1 only in a single row
- [ ] Component padding: 24px mobile, 150px tablet, 172px desktop (horizontal)
- [ ] Section gap: 40px mobile, 64px tablet/desktop
- [ ] All text uses uppercase and letter-spacing 0
- [ ] Text shadow on timer values: 0 4px 36px rgba(0,0,0,0.5)
- [ ] Background image fills the component area behind all content

## Embedded Components

- **dxn-button** — Optional CTA button below milestones. Not visible in the Figma screenshots provided, but described in spec.md. Follow existing `dxn-button` styles when rendering.

## AEM HTL Integration

- AEM provides the block class `.dxn-countdown` on the wrapper div
- HTL root element gets `__base` class: `<div class="dxn-countdown__base">`
- `data-nc` and `data-nc-params` attributes go on `__base` for component-loader initialization
- ARIA attributes: `aria-label` on `__timer` for accessibility, `role="timer"` or `aria-live="polite"` as needed
- Background images rendered via `<picture>` element with `<source>` per breakpoint inside `__base`, positioned absolutely behind content
