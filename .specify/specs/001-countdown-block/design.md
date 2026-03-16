# Design Reference: Countdown Block

## Code Scaffold

### HTML Structure

The block wrapper receives `class="countdown"` from EDS. Authored content (pretitle, title, datetime, CTA, milestones) arrives as nested `<div>` rows/columns from the block table. The `decorate(block)` function reshapes this into the final semantic structure.

Structure derived from Figma nodes 1:22670 (root), 1:23434 (mobile), 1:22744 (tablet):

```html
<div class="countdown">
  <div class="countdown-header">
    <p class="countdown-pretitle">Alpe d'Huez, France</p>
    <h2 class="countdown-title">Tomorrowland Winter</h2>
  </div>
  <div class="countdown-timer">
    <div class="countdown-unit">
      <span class="countdown-value">12</span>
      <span class="countdown-label">DAYS</span>
    </div>
    <div class="countdown-divider"></div>
    <div class="countdown-unit">
      <span class="countdown-value">17</span>
      <span class="countdown-label">HOURS</span>
    </div>
    <div class="countdown-divider"></div>
    <div class="countdown-unit">
      <span class="countdown-value">18</span>
      <span class="countdown-label">MINUTES</span>
    </div>
    <div class="countdown-divider"></div>
    <div class="countdown-unit">
      <span class="countdown-value">14</span>
      <span class="countdown-label">SECONDS</span>
    </div>
  </div>
  <div class="countdown-events">
    <div class="countdown-badge">
      <span class="countdown-badge-title">Qualifying</span>
      <div class="countdown-badge-datetime">
        <span>14:00 GMT</span>
        <span class="countdown-badge-sep"></span>
        <span>27th OCT</span>
      </div>
    </div>
    <div class="countdown-badge">
      <span class="countdown-badge-title">RACE</span>
      <div class="countdown-badge-datetime">
        <span>14:00 GMT</span>
        <span class="countdown-badge-sep"></span>
        <span>27th OCT</span>
      </div>
    </div>
  </div>
  <div class="countdown-cta">
    <a href="..." class="button accent">View event</a>
  </div>
</div>
```

Block-scoped class names: `.countdown`, `.countdown-header`, `.countdown-pretitle`, `.countdown-title`, `.countdown-timer`, `.countdown-unit`, `.countdown-value`, `.countdown-label`, `.countdown-divider`, `.countdown-events`, `.countdown-badge`, `.countdown-badge-title`, `.countdown-badge-datetime`, `.countdown-badge-sep`, `.countdown-cta`.

**Spec requirements (do not implement here):**
- Per NFR-001: implementation must add live region for time-remaining announcements, appropriate aria-labels, and keyboard accessibility.

### CSS Skeleton

Mobile-first vanilla CSS. All selectors scoped to `main .countdown`. Figma node IDs cited per rule.

```css
/* Figma node 1:23434 (mobile root), 1:22744 (tablet), 1:22670 (desktop) */
main .countdown {
  --countdown-bg: #6e6e6e;
  --countdown-accent: #fab401;
  --countdown-text: white;
  --countdown-border: #282828;
  --countdown-badge-bg: rgba(255, 255, 255, 0.1);
  --countdown-text-shadow: 0 4px 36px rgba(0, 0, 0, 0.5);

  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 140px 24px;
  background-color: var(--countdown-bg);
  color: var(--countdown-text);
}

/* Figma I1:23434;1:22835 (Caption + Title) */
main .countdown .countdown-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0;
}

/* Figma I1:23434;1:22836 (pretitle) */
main .countdown .countdown-pretitle {
  margin: 0;
  font-family: var(--heading-font-family);
  font-weight: 700;
  font-size: 16px;
  line-height: 20px;
  color: var(--countdown-accent);
}

/* Figma I1:23434;1:22837 (title) */
main .countdown .countdown-title {
  margin: 0;
  font-family: var(--heading-font-family);
  font-weight: 700;
  font-size: 32px;
  line-height: 36px;
  color: var(--countdown-text);
}

/* Figma node 1:21771 (mobile timer) */
main .countdown .countdown-timer {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 312px;
}

/* Figma node 1:21772 (mobile unit) */
main .countdown .countdown-unit {
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  text-shadow: var(--countdown-text-shadow);
}

/* Figma I1:21772;1:21948 (value) */
main .countdown .countdown-value {
  font-family: var(--heading-font-family);
  font-weight: 700;
  font-size: 40px;
  line-height: 40px;
}

/* Figma I1:21772;1:21949 (label) */
main .countdown .countdown-label {
  font-family: var(--body-font-family);
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
}

/* Figma node 1:21749 (divider, tablet/mobile variant) */
main .countdown .countdown-divider {
  position: relative;
  width: 1px;
  height: 20px;
  flex-shrink: 0;
  background: linear-gradient(to bottom, transparent, var(--countdown-text) 20%, var(--countdown-text) 80%, transparent);
  opacity: 0.5;
}

/* Figma I1:23434;1:22839 (events) */
main .countdown .countdown-events {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Figma I1:23434;1:22840 (badge) */
main .countdown .countdown-badge {
  backdrop-filter: blur(12px);
  background: var(--countdown-badge-bg);
  border: 1px solid var(--countdown-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px;
  flex-shrink: 0;
  width: 148px;
}

/* Figma 1:23434;1:22840;1:22906 (badge title) */
main .countdown .countdown-badge-title {
  font-family: var(--heading-font-family);
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  text-transform: uppercase;
}

/* Figma 1:23434;1:22840;1:22907 (Time & Date) */
main .countdown .countdown-badge-datetime {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* Figma nodes 1:22422, 1:22424 (both same typography) */
main .countdown .countdown-badge-datetime > span:not(.countdown-badge-sep) {
  font-family: var(--body-font-family);
  font-size: 12px;
  line-height: 20px;
}

/* Figma: divider in badge (20px) */
main .countdown .countdown-badge-sep {
  width: 20px;
  height: 1px;
  background: var(--countdown-text);
  opacity: 0.5;
}

/* Tablet: Figma 1:22744 viewport 768px */
@media (width >= 768px) {
  /* node 1:22744 */
  main .countdown {
    gap: 64px;
    padding-left: 150px;
    padding-right: 150px;
  }

  /* node I1:22744;1:22782 */
  main .countdown .countdown-pretitle {
    font-size: 20px;
    line-height: 24px;
  }

  /* node 1:21768 */
  main .countdown .countdown-timer {
    max-width: 478px;
    gap: 12px;
  }

  /* node I1:21605;1:21584 */
  main .countdown .countdown-value {
    font-size: 40px;
    line-height: 40px;
  }

  /* node I1:21605;1:21585 */
  main .countdown .countdown-label {
    font-size: 16px;
    line-height: 20px;
  }

  /* node 1:22939 */
  main .countdown .countdown-badge {
    width: 220px;
    padding: 32px 16px;
  }

  /* node 1:22420 */
  main .countdown .countdown-badge-title {
    font-size: 20px;
    line-height: 24px;
  }

  main .countdown .countdown-badge-datetime {
    flex-direction: row;
    gap: 12px;
  }

  main .countdown .countdown-badge-sep {
    width: 1px;
    height: 20px;
  }
}

/* Desktop: Figma 1:22670 viewport 1440px */
@media (width >= 1440px) {
  /* node 1:22670 */
  main .countdown {
    padding-left: 174px;
    padding-right: 174px;
  }

  /* node I1:22670;1:22415 */
  main .countdown .countdown-title {
    font-size: 40px;
    line-height: 44px;
  }

  /* node 1:21769 */
  main .countdown .countdown-timer {
    max-width: 1090px;
    gap: 0;
  }

  /* node I1:21681;1:21538 */
  main .countdown .countdown-value {
    font-size: 140px;
    line-height: 140px;
  }

  /* node I1:21681;1:21539 */
  main .countdown .countdown-label {
    font-size: 20px;
    line-height: 24px;
  }

  /* node 1:21559 (Desktop divider) */
  main .countdown .countdown-divider {
    height: 32px;
  }

  /* node I1:22670;1:22460 */
  main .countdown .countdown-events {
    max-width: 422px;
    gap: 24px;
  }

  /* node 1:22431 */
  main .countdown .countdown-badge {
    width: 199px;
    padding: 32px 16px;
  }
}

/* Block variants from spec: spacing-small, spacing-medium, spacing-large */
main .countdown.spacing-small { margin-bottom: var(--spacing-small, 24px); }
main .countdown.spacing-medium { margin-bottom: var(--spacing-medium, 40px); }
main .countdown.spacing-large { margin-bottom: var(--spacing-large, 64px); }
```

## Design Token Mapping

| Element | CSS Property | Project variable / Fallback | Figma node |
|---------|--------------|-----------------------------|------------|
| Block background | background-color | `--countdown-bg` = #6e6e6e | 1:22670, 1:22744, 1:23434 |
| Pretitle / accent | color | `--countdown-accent` = #fab401 | 1:22414, 1:22782, 1:22836 |
| Text on dark | color | `--countdown-text` = white | — |
| Badge border | border-color | `--countdown-border` = #282828 | 1:22431 |
| Badge background | background | `--countdown-badge-bg` = rgba(255,255,255,0.1) | 1:22431 |
| Heading font | font-family | `--heading-font-family` | — |
| Body font | font-family | `--body-font-family` | — |
| Badge radius | border-radius | 8px | var(--radius/l, 8px) |
| Text shadow | text-shadow | 0 4px 36px rgba(0,0,0,0.5) | countdown units |

## Breakpoints & Per-Breakpoint CSS Overrides

Figma viewport widths: 360px (mobile), 768px (tablet), 1440px (desktop). Breakpoints used: **768px**, **1440px**.

| Breakpoint | Key Overrides |
|------------|---------------|
| Mobile (base < 768px) | gap 40px, padding 24px, pretitle 16px, title 32px, value 40px, label 12px, timer max 312px, badge 148px, badge datetime column |
| 768px (Tablet) | gap 64px, padding 150px, pretitle 20px, timer max 478px, label 16px, badge 220px, badge datetime row |
| 1440px (Desktop) | padding 174px, title 40px, timer max 1090px, value 140px, label 20px, divider 32px, badge 199px, events gap 24px |

## Dynamic Content Elements

- **`.countdown-value`** (days, hours, minutes, seconds): JS-populated. Content-dependent sizing. Do NOT set fixed dimensions in design-expectations.json.
- **`.countdown-pretitle`**, **`.countdown-title`**: Authored text length varies.
- **`.countdown-badge-title`**, **`.countdown-badge-datetime`**: Milestone content varies.

## Interactive States

No hover, focus, or active states defined in Figma for this component. CTA button uses standard `.button.accent` from `styles.css`.

## Visual Acceptance Checklist

- [ ] Mobile (< 768px): Background #6e6e6e; pretitle #fab401 16px; title 32px; values 40px, labels 12px; dividers 20px; badges 148px, datetime column; padding 24px, 140px vertical
- [ ] Tablet (768px): pretitle 20px; timer max 478px; labels 16px; badges 220px, datetime row; padding 150px horizontal
- [ ] Desktop (1440px): title 40px; values 140px, labels 20px; dividers 32px; badges 199px; events gap 24px; padding 174px horizontal
- [ ] Text shadow on values: 0 4px 36px rgba(0,0,0,0.5)
- [ ] Badge: backdrop-blur 12px, rgba(255,255,255,0.1), border #282828, radius 8px
- [ ] Spacing variants affect bottom margin per spec

## Embedded Blocks

None. CTA uses standard `.button` from global styles.

## EDS Block Integration

- Block wrapper provides `.countdown` class on outer `<div>`.
- `decorate(block)` reshapes authored table rows into the structure above.
- Block options: `Countdown (spacing-small)`, `Countdown (spacing-medium)`, `Countdown (spacing-large)`.
- Accessibility: Per NFR-001. Implementation must add live region, aria-labels, keyboard support—do not prescribe markup in design.md.
- Divider: CSS gradient fallback. Figma uses SVG (line assets); implementation may embed SVG or use project asset path.
