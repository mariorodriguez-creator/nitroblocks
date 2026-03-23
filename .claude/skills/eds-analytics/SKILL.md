---
name: eds-analytics
description: EDS analytics data layer integration. Trigger when implementing analytics events, Google Analytics/Adobe Data Layer tracking, or creating analytics for AEM Edge Delivery blocks.
---

# EDS Analytics Data Layer Pattern

Apply to blocks that track user interactions. Skip for utility functions or non-interactive blocks.

## EDS Integration

EDS supports two analytics integrations. Link to both:

- **[Configuring Google Analytics & Tag Manager Integration](https://aem.live/developer/gtm-martech-integration)** — Google Data Layer, GA4, GTM, phased loading (eager/lazy/delayed)
- **[Adobe Experience Cloud Integration](https://www.aem.live/developer/martech-integration)** — Adobe Data Layer, Adobe Analytics/Target

Analytics loading follows the three-phase page loading: eager, lazy, delayed. Martech typically loads in the **delayed** phase (see `delayed.js`).

## Block-Level Event Push

Push events from block decoration or event handlers:

```javascript
// Google Data Layer / gtag
function pushAnalytics(eventObject) {
  if (window.gtag) {
    window.gtag('event', eventObject.event, eventObject);
  } else if (window.dataLayer) {
    window.dataLayer.push(eventObject);
  }
}

// Adobe Data Layer (optional)
function push2AdobeDataLayer(eventObject) {
  if (window.adobeDataLayer) {
    window.adobeDataLayer.push(eventObject);
  }
}
```

## Standard Event Structure

```javascript
const event = {
  event: 'event_name',        // main event identifier
  eventAction: 'action_type', // specific action
  eventLabel: 'block_id',     // block or component identifier
  pageType: document.body.dataset.pageTitle || '',
  // ...additional block-specific data
};
```

Only specify the event name that needs to be tracked. Do NOT add other events or field interactions beyond what's required.

## Block Integration Example

```javascript
export default async function decorate(block) {
  const cta = block.querySelector('a[href]');
  if (cta) {
    cta.addEventListener('click', () => {
      pushAnalytics({
        event: 'cta_click',
        eventAction: 'click',
        eventLabel: block.dataset.blockName || 'block',
      });
    });
  }
}
```

## Performance

- Avoid analytics on high-frequency events (use debouncing)
- Never let analytics errors break block functionality
- Minimize analytics payload size
- Martech loads in delayed phase — ensure `dataLayer`/`adobeDataLayer` exist before pushing, or push to array that gets processed when martech loads
