# Design Reference: Countdown Block

## Code Scaffold

### HTML Structure

The block wrapper receives `class="countdown"` from EDS. Authored content (pretitle, title, datetime, CTA, milestones) arrives as nested `<div>` rows/columns from the block table. The `decorate(block)` function reshapes this into the final semantic structure:

```html
<div class="countdown">
  <!-- Caption + Title (from rows 1–2) -->
  <div class="countdown-header">
    <p class="countdown-pretitle">Alpe d'Huez, France</p>
    <h2 class="countdown-title">Tomorrowland Winter</h2>
  </div>

  <!-- Countdown units (from row 3 datetime, JS-populated) -->
  <div class="countdown-timer">
    <div class="countdown-unit">
      <span class="countdown-value" aria-live="polite" aria-atomic="true">12</span>
      <span class="countdown-label">DAYS</span>
    </div>
    <div class="countdown-divider" aria-hidden="true"></div>
    <div class="countdown-unit">
      <span class="countdown-value" aria-live="polite" aria-atomic="true">17</span>
      <span class="countdown-label">HOURS</span>
    </div>
    <div class="countdown-divider" aria-hidden="true"></div>
    <div class="countdown-unit">
      <span class="countdown-value" aria-live="polite" aria-atomic="true">18</span>
      <span class="countdown-label">MINUTES</span>
    </div>
    <div class="countdown-divider" aria-hidden="true"></div>
    <div class="countdown-unit">
      <span class="countdown-value" aria-live="polite" aria-atomic="true">14</span>
      <span class="countdown-label">SECONDS</span>
    </div>
  </div>

  <!-- Milestones (from rows 5–6, optional, max 2) -->
  <div class="countdown-events">
    <div class="countdown-badge">
      <span class="countdown-badge-title">Qualifying</span>
      <div class="countdown-badge-datetime">
        <span>14:00 GMT</span>
        <span class="countdown-badge-sep" aria-hidden="true"></span>
        <span>27th OCT</span>
      </div>
    </div>
    <div class="countdown-badge">
      <span class="countdown-badge-title">RACE</span>
      <div class="countdown-badge-datetime">
        <span>14:00 GMT</span>
        <span class="countdown-badge-sep" aria-hidden="true"></span>
        <span>27th OCT</span>
      </div>
    </div>
  </div>

  <!-- CTA (from row 4, optional) -->
  <div class="countdown-cta">
    <a href="..." class="button accent">View event</a>
  </div>
</div>
```

Block-scoped class names: `.countdown`, `.countdown-header`, `.countdown-pretitle`, `.countdown-title`, `.countdown-timer`, `.countdown-unit`, `.countdown-value`, `.countdown-label`, `.countdown-divider`, `.countdown-events`, `.countdown-badge`, `.countdown-badge-title`, `.countdown-badge-datetime`, `.countdown-badge-sep`, `.countdown-cta`.

### CSS Skeleton

Mobile-first vanilla CSS with block-scoped selectors. All selectors scoped to `main .countdown`:

```css
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

main .countdown .countdown-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0;
}

main .countdown .countdown-pretitle {
  margin: 0;
  font-family: var(--heading-font-family);
  font-weight: 700;
  font-size: 16px;
  line-height: 20px;
  color: var(--countdown-accent);
}

main .countdown .countdown-title {
  margin: 0;
  font-family: var(--heading-font-family);
  font-weight: 700;
  font-size: 32px;
  line-height: 36px;
  color: var(--countdown-text);
}

main .countdown .countdown-timer {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 312px;
}

main .countdown .countdown-unit {
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  text-shadow: var(--countdown-text-shadow);
}

main .countdown .countdown-value {
  font-family: var(--heading-font-family);
  font-weight: 700;
  font-size: 40px;
  line-height: 40px;
}

main .countdown .countdown-label {
  font-family: var(--body-font-family);
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
}

main .countdown .countdown-divider {
  position: relative;
  width: 1px;
  height: 20px;
  flex-shrink: 0;
  background: linear-gradient(to bottom, transparent, var(--countdown-text) 20%, var(--countdown-text) 80%, transparent);
  opacity: 0.5;
}

main .countdown .countdown-events {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

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

main .countdown .countdown-badge-title {
  font-family: var(--heading-font-family);
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  text-transform: uppercase;
}

main .countdown .countdown-badge-datetime {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

main .countdown .countdown-badge-datetime span:first-child:not(:only-child) {
  font-family: var(--body-font-family);
  font-size: 12px;
  line-height: 20px;
}

main .countdown .countdown-badge-sep {
  width: 20px;
  height: 1px;
  background: var(--countdown-text);
  opacity: 0.5;
}

/* Tablet: 600px */
@media (width >= 600px) {
  main .countdown {
    gap: 64px;
    padding-left: 150px;
    padding-right: 150px;
  }

  main .countdown .countdown-pretitle {
    font-size: 20px;
    line-height: 24px;
  }

  main .countdown .countdown-timer {
    max-width: 478px;
    gap: 12px;
  }

  main .countdown .countdown-value {
    font-size: 40px;
    line-height: 40px;
  }

  main .countdown .countdown-label {
    font-size: 16px;
    line-height: 20px;
  }

  main .countdown .countdown-badge {
    width: 220px;
    padding: 32px 16px;
  }

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

/* Desktop: 900px */
@media (width >= 900px) {
  main .countdown {
    padding-left: 174px;
    padding-right: 174px;
  }

  main .countdown .countdown-title {
    font-size: 40px;
    line-height: 44px;
  }

  main .countdown .countdown-timer {
    max-width: 1090px;
    gap: 0;
  }

  main .countdown .countdown-value {
    font-size: 140px;
    line-height: 140px;
  }

  main .countdown .countdown-label {
    font-size: 20px;
    line-height: 24px;
  }

  main .countdown .countdown-divider {
    height: 32px;
  }

  main .countdown .countdown-events {
    max-width: 422px;
    gap: 24px;
  }

  main .countdown .countdown-badge {
    width: 199px;
    padding: 32px 16px;
  }
}

/* Block variants: spacing-small, spacing-medium, spacing-large */
main .countdown.spacing-small { margin-bottom: var(--spacing-small, 24px); }
main .countdown.spacing-medium { margin-bottom: var(--spacing-medium, 40px); }
main .countdown.spacing-large { margin-bottom: var(--spacing-large, 64px); }
```

## Design Token Mapping

| Element | CSS Property | Project variable / Fallback |
|---------|--------------|-----------------------------|
| Block background | background-color | `--countdown-bg` = #6e6e6e |
| Pretitle / accent | color | `--countdown-accent` = #fab401 |
| Text on dark | color | `--countdown-text` = white |
| Badge border | border-color | `--countdown-border` = #282828 |
| Badge background | background | `--countdown-badge-bg` = rgba(255,255,255,0.1) |
| Heading font | font-family | `--heading-font-family` |
| Body font | font-family | `--body-font-family` |
| Badge radius | border-radius | 8px |
| Text shadow (countdown values) | text-shadow | 0 4px 36px rgba(0,0,0,0.5) |

Figma-specific tokens used in design: `--colours/text/on-secondary` (white), `--typography/font-family/heading` (Helvetica Neue Bold), `--radius/l` (8px). Mapped to project equivalents above.

## Breakpoints & Per-Breakpoint CSS Overrides

| Breakpoint | Key Overrides |
|------------|----------------|
| Mobile (base) | gap 40px, padding 24px, pretitle 16px, title 32px, timer value 40px, label 12px, badge 148px, badges stacked vertically |
| 600px (Tablet) | gap 64px, padding 150px, pretitle 20px, timer max-width 478px, label 16px, badge 220px, badge datetime row layout |
| 900px (Desktop) | padding 174px, title 40px, timer max-width 1090px, value 140px, label 20px, divider 32px, badge 199px, events gap 24px |

## Dynamic Content Elements

- **`.countdown-value`** (days, hours, minutes, seconds): Content is JS-populated. Width ≈ varies by digit count. Do NOT set fixed dimensions in design-expectations. Use `min-width` only if needed for alignment.
- **`.countdown-pretitle`**, **`.countdown-title`**: Authored text length varies.
- **`.countdown-badge-title`**, **`.countdown-badge-datetime`**: Milestone content varies.

## Interactive States

- **CTA button**: Use standard `.button.accent` from `styles.css`. Hover/focus per existing button styles.
- **ARIA live region**: `.countdown-value` elements use `aria-live="polite"` and `aria-atomic="true"` for screen reader announcements.
- Focus: CTA and any focusable elements receive standard focus ring (no custom design override).

## Visual Acceptance Checklist

- [ ] Mobile: Block background #6e6e6e; pretitle #fab401 16px; title white 32px; countdown values 40px with 12px labels; dividers 20px tall; badges 148px wide, stacked vertically; padding 24px horizontal, 140px vertical
- [ ] Tablet (600px): pretitle 20px; badges 220px, datetime row layout; padding 150px horizontal
- [ ] Desktop (900px): title 40px; countdown values 140px with 20px labels; dividers 32px; badges 199px; events gap 24px; padding 174px horizontal
- [ ] Text shadow on countdown values: 0 4px 36px rgba(0,0,0,0.5)
- [ ] Badge: backdrop-blur 12px, semi-transparent white bg, #282828 border, 8px radius
- [ ] Spacing variants (spacing-small, spacing-medium, spacing-large) affect bottom margin as intended

## Embedded Blocks

None. Countdown is a standalone block. CTA uses standard `.button` from global styles.

## EDS Block Integration

- Block wrapper provides `.countdown` class on outer `<div>`.
- `decorate(block)` reshapes authored table rows into the structure above.
- Block options (spacing-small, spacing-medium, spacing-large) add classes via parenthetical notation: `Countdown (spacing-large)`.
- ARIA: `aria-live`, `aria-atomic` on countdown values; `aria-hidden` on decorative dividers.
- Divider between countdown units: use CSS gradient or SVG (Figma assets: line SVG, rotated 90° for vertical separator). Asset URLs from Figma plugin are localhost; production should use embedded SVG or project asset path.
