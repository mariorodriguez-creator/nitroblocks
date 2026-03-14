---
name: aem-analytics
description: AEM analytics data layer integration. Trigger when implementing analytics events, Google Analytics/Adobe Data Layer tracking, or creating analytics classes for AEM components.
---

# AEM Analytics Data Layer Pattern

Apply to components that track user interactions. Skip for utility functions or non-interactive components.

## Base Analytics Class

```javascript
// commons/libs/analytics/analytics.js
export default class Analytics {
  constructor(componentContainer) {
    this.el = componentContainer;
    window.dataLayer = window.dataLayer || [];
    if (this.el) {
      this.setCookieValue();
      this.init();
    }
  }

  init() {} // Override in child classes

  // Google Analytics / fallback to dataLayer
  pushAnalytics(eventObject) {
    if (window.gtag) {
      window.gtag('event', eventObject.event, eventObject);
    } else {
      window.dataLayer.push(eventObject);
    }
  }

  // Adobe Data Layer
  push2AdobeDataLayer(eventObject) {
    if (window.adobeDataLayer) {
      window.adobeDataLayer.push(eventObject);
    }
  }
}
```

## Component-Specific Analytics Class

```javascript
// commons/libs/analytics/analytics.video.js
import Analytics from './analytics.js';
import { video } from './analytics.config.js';

export default class VideoAnalytics extends Analytics {
  trackVideoEvent(eventType) {
    const event = {
      event: video.events.video,
      eventAction: `${video.events.video} ${eventType}`,
      eventLabel: this.el.id,
      url: this.el.querySelector(video.selectors.media).getAttribute('src'),
      pageType: document.body.dataset.pageTitle,
      UserID: null,
    };
    this.pushAnalytics(event);
  }
}
```

## Analytics Config

```javascript
// commons/libs/analytics/analytics.config.js
export const registration = {
  events: {
    registration: 'registration',
    formSubmission: 'form_submission',
    validationError: 'validation_error',
  },
};

export const video = {
  events: { video: 'video', audio: 'audio' },
  selectors: { media: 'video, audio' },
  classes: { audio: 'dxn-video--audio' },
};
```

## Standard Event Structure

```javascript
const event = {
  event: 'event_name',        // main event identifier
  eventAction: 'action_type', // specific action
  eventLabel: 'component_id', // component identifier
  pageType: document.body.dataset.pageTitle,
  UserID: null,               // user id if available
  // ...additional component-specific data
};
```

Only specify the event name that needs to be tracked. Do NOT add other events or field interactions beyond what's required.

## Component Integration

```javascript
import { register } from '@netcentric/component-loader';
import VideoAnalytics from 'commons/libs/analytics/analytics.video';

class Video {
  constructor(el, params) {
    this.el = el;
    this.config = { ...config, ...params };
    this.videoAnalytics = new VideoAnalytics(this.el);
    this.init();
  }

  trackEvent(eventType) {
    this.videoAnalytics.trackVideoEvent(eventType);
  }
}

register({ Video });
```

## File Structure

```
commons/libs/analytics/
├── analytics.js               # Base Analytics class
├── analytics.config.js        # All component event configs
├── analytics.video.js         # Video-specific analytics
├── analytics.registration.js  # Registration-specific analytics
└── analytics.[component].js   # Other component analytics
```

## Naming Conventions

- Analytics classes: `ComponentNameAnalytics` (e.g. `VideoAnalytics`)
- Event methods: `trackComponentEvent()` (e.g. `trackVideoEvent()`)
- Config objects: lowercase component name (e.g. `video`, `registration`)

## Performance

- Avoid analytics on high-frequency events (use debouncing)
- Never let analytics errors break component functionality
- Minimize analytics payload size
