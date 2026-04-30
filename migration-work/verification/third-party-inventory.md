# Third-Party Integration Inventory

Built from HAR traces across 10 representative templates. Classification by origin and suggested migration strategy.

| Origin | Requests | Pages | Service | Category | Strategy |
|---|---:|---:|---|---|---|
| `www.zonnic.ca` | 1054 | 10 | Primary host (first-party CDN / AEM authoring) | self | keep |
| `siteintercept.qualtrics.com` + `zn1i…siteintercept.qualtrics.com` | 180 | 10 | Qualtrics Site Intercept (feedback button) | survey-widget | preserve — load via `delayed.js` |
| `cdn.cookielaw.org` + `geolocation.onetrust.com` | 140 | 10 | OneTrust consent management | consent | preserve — load via `delayed.js` with blocking gate |
| `bat-sea.my.site.com` (+ salesforce-scrt / sandbox variants) | ~150 | 7–10 | Salesforce Experience Cloud + embedded chat | auth / chat / forms | **requires-solution** — identify which flows (login, signup, chat); replace or embed behind delayed.js |
| `rum.hlx.page` | 62 | 10 | AEM.live RUM beacon | analytics | preserve — built into aem.js |
| `ssapi.vuse.com` | 32 | 10 | BAT shared subscription/auth API | auth / newsletter | **requires-solution** — confirm purpose; likely cross-brand login |
| `c.az.contentsquare.net` + `t.contentsquare.net` + `k-us1.az.contentsquare.net` | 47 | 10 | ContentSquare UX analytics | analytics | preserve — load via `delayed.js` |
| `assets.adobedtm.com` | 30 | 10 | Adobe Dynamic Tag Management | tag-manager | preserve — load via `delayed.js` (entry point for other tags) |
| `dpm.demdex.net` + `batgsd.demdex.net` | 40 | 10 | Adobe Audience Manager (DMP) | personalization / advertising | preserve — loaded by Adobe DTM |
| `www.googletagmanager.com` | 20 | 10 | Google Tag Manager | tag-manager | preserve — load via `delayed.js` |
| `connect.facebook.net` | 20 | 10 | Meta Pixel | advertising | preserve — load via `delayed.js` |
| `cm.g.doubleclick.net` | 20 | 10 | Google DoubleClick | advertising | preserve — loaded by GTM |
| `batgsdzoonicprodcanada.112.2o7.net` | 12 | 10 | Adobe Analytics (Omniture) | analytics | preserve — loaded by Adobe DTM |
| `britishamericanshare.tt.omtrdc.net` | 10 | 10 | Adobe Target | experimentation / personalization | preserve — load via `delayed.js` (flash-of-content risk in eager path) |
| `cm.everesttech.net` | 10 | 10 | Adobe Advertising Cloud (Everest) | advertising | preserve — loaded by DTM |
| `ib.adnxs.com` | 10 | 10 | Xandr / AppNexus | advertising | preserve — loaded by DTM/GTM |
| `match.adsrvr.org` | 10 | 10 | The Trade Desk | advertising | preserve — loaded by DTM/GTM |
| `ads.avocet.io` | 10 | 10 | Avocet ad exchange | advertising | preserve — loaded by DTM/GTM |
| `api.mapbox.com` | 4 | 1 | Mapbox maps | maps | replace — embed block in `store-locator`, load on scroll via `IntersectionObserver` |
| `cdn.pricespider.com` + `wtbevents.pricespider.com` | 4 | 1 | PriceSpider where-to-buy | commerce-widget | **requires-solution** — confirm use in product page buy buttons; keep or swap with direct retailer links |
| `unpkg.com` + `npmcdn.com` | 3 | 1 | Public CDN for JS libs (likely Mapbox helpers) | dependency | replace — self-host critical deps or inline |

## Summary

- **25 unique third-party origins** observed in the browser during representative navigation.
- **Advertising/marketing cluster (10 origins)** is all downstream of Adobe DTM + Google Tag Manager; a single `delayed.js` injection of DTM + GTM chains the rest. Adobe Target is the only one with eager-path risk due to flicker.
- **3 origins require architecture decisions:** Salesforce Experience Cloud (embedded login/signup/chat), `ssapi.vuse.com` (shared subscription API), PriceSpider (where-to-buy widget).
- **AEM.live RUM (`rum.hlx.page`)** is already native to the target stack — no migration needed.
- **Site is currently on `www.zonnic.ca` with RUM pinging `rum.hlx.page`** — suggesting the content is already served through Edge Delivery Services' CDN (likely Fastly/Cloudfront), though the HTML is heavily decorated by BAT's "bat-*" Web Components layer.

## Backend dependencies inferred

| Feature | Current backend | EDS Alternative |
|---|---|---|
| Login / signup | Salesforce Experience Cloud (`bat-sea.my.site.com`) | **requires-solution** — embed as iframe in a block, OR SSO redirect, OR custom edge worker |
| Subscription API | `ssapi.vuse.com` (shared BAT service) | **requires-solution** — call from client with token; confirm CORS + rate limits |
| Newsletter form | Salesforce (form endpoint) | preserve — point form submission to the same endpoint |
| Store locator search | Likely client-side filter of static JSON + Mapbox rendering | keep — build block that fetches `stores.json` index + renders Mapbox |
| Product / buy-online | PriceSpider widget OR direct retailer links | **requires-solution** — confirm business requirement (widget vs static links) |
| Live chat | Salesforce embedded messaging (`bat-sea.my.site.com`) | preserve — inject via `delayed.js` |
| Personalization / experimentation | Adobe Target + AAM | preserve — load via `delayed.js` (accept some flicker risk on visible bands) |
