# Pattern Inventory

**Source site:** https://www.astrazeneca.com/
**Date:** 2026-04-09
**Templates analyzed:** 19 (full site — all 1,162 pages fingerprinted, 1,083 analyzed)
**Total content sequences found:** 32
**Unique patterns after deduplication:** 26

---

## Templates Analyzed

| # | Template Name | Representative Section | Pages |
|---|--------------|----------------------|-------|
| T1 | Homepage | root (/) | 1 |
| T2 | Hub Page | our-company, r-d, sustainability, our-therapy-areas, partnering, careers | ~200 |
| T3 | Article Detail | what-science-can-do (detail), media-centre articles, r-d detail | ~350 |
| T4 | Filtered Listing | what-science-can-do (index), media-centre press-releases, media-centre articles | ~10 |
| T5 | Press Release Detail | media-centre/press-releases | ~100 |
| T6 | Investor Relations Hub | investor-relations | 45 |
| T7 | Sustainability Dashboard | sustainability (data pages) | ~5 |
| T8 | Media Library | media-centre/image-and-broadcast-library | ~3 |
| T9 | Simple Text / Legal | legal-notice-and-terms-of-use, az-suppliers FAQ | ~10 |

---

## Pattern 1: Full-width hero banner

**Description:** Viewport-width section with a full-bleed background image (desktop-specific), overlaid headline text in white, optional strapline paragraph, and 1–2 CTA buttons. The image is lazy-swapped for mobile via a responsive image pattern. Some variants have no image (flat background colour). A "rich header" pattern that appears universally as the first section on every non-homepage page.
**Frequency:** 8 templates (T2–T9)
**Locations:** Every section of the site except the Homepage
**Variations:**
- With hero image vs. with no image (flat colour)
- With CTA button(s) vs. without
- With strapline paragraph vs. heading only
- Inverted text (dark on light) vs. white on dark

---

## Pattern 2: Featured story + trending articles editorial section

**Description:** A two-zone editorial section. Left/top zone: one large "featured" article with a background image, heading (article title), topic tag, and link. Right/bottom zone: a vertical list of 2–3 "trending" article teasers, each with a thumbnail image, title, topic tag, and link. A "keep up to date" CTA link appears at the bottom.
**Frequency:** 4 templates (T1, T2 — Our Company, R&D, What Science Can Do listing)
**Locations:** Homepage §hero-editorial, Our Company §news, R&D §featured-science, What Science Can Do §featured-story
**Variations:**
- 1 featured + 2 trending (most common)
- No featured image (title-only featured card)
- Dark vs. light background treatment

---

## Pattern 3: Filterable content list (search + tag filters + results grid)

**Description:** A full-page content discovery pattern. A persistent search bar (keyword search) + tag filter chips (topic/category, year) that dynamically filter a results area. Results display as a date-sorted list of articles with title, date, and topic tag. A "Load more" button provides pagination. Count of results shown. Filter state reflected in URL query params.
**Frequency:** 4 templates (T4, country-sites press releases, media-centre articles, what-science-can-do index)
**Locations:** What Science Can Do index, Media Centre/Press Releases, Media Centre/Articles, Country Sites press releases
**Variations:**
- Global search + tag filters (What Science Can Do, Media Centre)
- Year filter only (Press Release archive)
- Different tag vocabularies (topics vs. categories)

---

## Pattern 4: Image panel feature (split band with background image)

**Description:** Full-width band with a large image filling one half (left or right), and a content column on the other half with heading, paragraph, and CTA link(s). Image is applied as a CSS background with the `object-fit: cover` pattern, enabling responsive cropping. Appears in alternating left/right orientation to create visual rhythm down the page.
**Frequency:** 6 templates (T1, T2 — multiple, T5, T6)
**Locations:** Homepage §CEO-quote, Our Company §our-strategy, R&D §technologies, Sustainability §pillars, Partnering §why-partner
**Variations:**
- Text left / image right
- Text right / image left
- With blockquote (CEO statement variant with gold quote marks)
- With multiple CTAs vs. single CTA
- Dark background vs. light background

---

## Pattern 5: Statistics / KPI strip

**Description:** A compact horizontal row of 3–4 key metrics. Each metric has a large numeric value (e.g., "$58.7bn") and a label below it (e.g., "Total Revenue"). Appears on a light background below the hero to establish corporate scale.
**Frequency:** 2 templates (T1, T2 — Our Company)
**Locations:** Homepage §at-a-glance, Our Company §at-a-glance
**Variations:**
- 3 metrics vs. 4 metrics
- With asterisk/footnote reference vs. without

---

## Pattern 6: Cards / content collection grid

**Description:** A grid of 3–6 equal-width content cards. Each card contains: image or icon (optional), heading, short description (1–2 sentences), and a "Learn more" / CTA link. Used for therapy areas, sustainability pillars, capabilities, and related content.
**Frequency:** 7 templates (T1, T2, T4, T5, T6, T7, T8)
**Locations:** Therapy Areas §therapy-cards (6-up), Sustainability §pillars (3-up), Homepage §content-set (4-up), R&D §capabilities (varies), Partnering §why-partner, Our Company §strategy
**Variations:**
- 3, 4, or 6 cards per row
- With image vs. with icon
- With/without category tag above heading
- Dark vs. light background
- All same size vs. one large + smaller cards

---

## Pattern 7: Carousel of content cards

**Description:** A horizontal carousel/slider of content items, each with an image, heading, description, and link. Navigation with previous/next arrows and/or dot indicators. Items are fully navigable by keyboard.
**Frequency:** 2 templates (T2 — Our Company Values, R&D)
**Locations:** Our Company §values-carousel, R&D §pipeline-carousel
**Variations:**
- Auto-advancing vs. manual only
- 1-up (mobile) → 3-up (desktop)

---

## Pattern 8: In-page jump navigation (anchor links)

**Description:** A horizontal bar of anchor links that scroll the user to named sections further down the page. Sticky or fixed on scroll. Appears just below the hero on long hub pages.
**Frequency:** 2 templates (T2 — Our Company, Our Therapy Areas)
**Locations:** Our Company §jump-nav, Our Therapy Areas §jump-nav
**Variations:**
- Plain text links vs. button-styled tabs

---

## Pattern 9: People profile grid

**Description:** A grid of person cards. Each card shows a cropped headshot photo, full name, job title/role, and links to a bio page. Used for both leadership pages (6–12 cards) and broader "Our People" category listings (50+ profiles organised by department).
**Frequency:** 2 templates (T2 — Our Company/People, R&D/People)
**Locations:** Our Company/Our People, Our Company/Leadership, R&D/Our People
**Variations:**
- With department grouping headers
- Without department grouping (leadership flat grid)
- With "social" links (LinkedIn)

---

## Pattern 10: Long-form rich text article body

**Description:** The main content column of an article or detail page. Heading, date/attribution, flowing paragraphs, inline images (with captions), callout links, numbered footnotes, and optional pull-quote. Content is entirely text-driven with no custom layout components.
**Frequency:** 6 templates (T3, T5, T2 sub-pages, T9)
**Locations:** What Science Can Do articles, Press Release details, R&D detail pages, Legal/Terms
**Variations:**
- With hero image at top vs. text-only header
- With footnotes/references section at end vs. without
- With embedded video vs. without

---

## Pattern 11: Section / page header with supporting text

**Description:** A centered or left-aligned `h2` heading with an optional short paragraph below it. Used to introduce thematic sections within a page (not a page hero). Often paired with a horizontal rule above.
**Frequency:** 9 templates (all)
**Locations:** Ubiquitous throughout all templates
**Variations:**
- Centered vs. left-aligned
- With subtext paragraph vs. heading only
- Over light vs. dark background

---

## Pattern 12: Accordion / FAQ list

**Description:** A numbered or lettered list of questions with expandable answers. Each item has a question as the visible heading and a paragraph (or list) as the hidden body, toggled by click/keyboard.
**Frequency:** 2 templates (T9 — AZ Suppliers, Investor Relations FAQs)
**Locations:** AZ Suppliers/Coupa Hub §FAQ, Investor Relations/Shareholder FAQs
**Variations:**
- Numbered questions vs. Q: labeled
- Single-open vs. multi-open

---

## Pattern 13: Document download list

**Description:** A list of downloadable files (typically PDFs). Each entry shows: year/date, document title, file format badge, file size, and a download link. Grouped by year with year as a heading.
**Frequency:** 2 templates (T6 — Investor Relations annual reports, press release archive)
**Locations:** Investor Relations/Annual Reports, Media Centre/Press Release Archive
**Variations:**
- With year grouping
- Without year grouping (flat list)
- With online summary link vs. PDF-only

---

## Pattern 14: Events calendar list

**Description:** A chronological list of upcoming events (conferences, earnings calls, AGM). Each item shows: date, event name, type label (e.g., "Management"), and a CTA ("Add to Calendar" + event URL). A "View all events" link follows.
**Frequency:** 1 template (T6 — Investor Relations)
**Locations:** Investor Relations §upcoming-events
**Variations:**
- Compact (3–5 items visible) vs. full calendar view

---

## Pattern 15: Live stock price ticker

**Description:** A live-updating panel showing AstraZeneca's stock price across multiple exchanges (London LSE, NASDAQ, NYSE, Stockholm OMX). Each exchange row shows: exchange name, currency, current price, percentage change (colour coded), high/low, and timestamp. Requires real-time data integration.
**Frequency:** 1 template (T6 — Investor Relations)
**Locations:** Investor Relations §stock-price
**Variations:**
- 4-exchange display (standard)
- Share calculator tool (separate component on same page)

---

## Pattern 16: Interactive data map

**Description:** A full-page interactive OpenLayers map showing geospatial pharmaceutical/environmental data. Includes layer controls, zoom, search by region, and a data overlay with tooltip/popup on hover. Built with Vue.js + Vuetify + OpenLayers on the source site.
**Frequency:** 1 template (T7 — Sustainability dashboard)
**Locations:** Sustainability/Nature/Pharmaceuticals in Environment/Dashboard
**Variations:**
- Current dashboard vs. archive dashboard (archived version is read-only)

---

## Pattern 17: Data visualization dashboard

**Description:** An interactive data table and chart driven by structured data. Includes filtering by substance/region, sortable columns, a risk-quotient chart, and export capability. Uses Vue.js/Vuetify `v-data-table` + Chart.js on source site.
**Frequency:** 1 template (T7 — Sustainability dashboard)
**Locations:** Sustainability/EcoPharmacoVigilance Dashboard
**Variations:**
- Current vs. archived (same structure, different data)

---

## Pattern 18: Media image library / gallery

**Description:** A searchable, filterable image/media library. Images displayed in a responsive masonry-style grid ("Salvatorre" layout). Click opens a lightbox with larger image + caption + download button. Tag-based filtering.
**Frequency:** 1 template (T8 — Media Centre)
**Locations:** Media Centre/Image and Broadcast Library
**Variations:**
- Images only vs. images + video thumbnails

---

## Pattern 19: Breadcrumb navigation

**Description:** A compact "Home / Section / Subsection / Page" text trail above the page title. Provides context and back-navigation. Standard HTML `<nav aria-label="breadcrumb">` pattern.
**Frequency:** 8 templates (all detail and sub-pages)
**Locations:** Appears on all pages below hub level
**Variations:**
- Truncated on mobile (show last 2 segments only)
- Light vs. dark text depending on hero background

---

## Pattern 20: Email signup / alert subscription

**Description:** A small inline form: a label ("Sign up to receive our news alerts"), an email text field, and a submit button. Privacy notice linked below. Appears as a secondary call-to-action section on listing pages.
**Frequency:** 1 template (T4 — Media Centre listing pages)
**Locations:** Media Centre/Press Releases §subscribe
**Variations:**
- With explicit privacy notice vs. without

---

## Pattern 21: External link interstitial modal

**Description:** A full-page overlay modal that fires when a user clicks a link to an external domain. Shows a notice ("You are now leaving AstraZeneca.com"), brief disclaimer, and two CTAs: "Continue" and "Cancel". Global behaviour on all pages.
**Frequency:** All templates (global)
**Locations:** Triggered by any external link across the site
**Variations:**
- Standard text (no variation)

---

## Pattern 22: Country / language selector

**Description:** A grid of flag/language buttons allowing the user to choose the training/resource language. Selected language reveals matching content section. Used on the AZ Suppliers portal landing page.
**Frequency:** 1 template (T9 — AZ Suppliers/Coupa Hub)
**Locations:** AZ Suppliers/Coupa Supplier Hub §language-selector
**Variations:**
- 9 languages with flag icons

---

## Pattern 23: Social sharing strip

**Description:** A horizontal row of share icons/buttons (LinkedIn, Twitter/X, Facebook, Email) that share the current page URL. Appears at the bottom of article and press release detail pages.
**Frequency:** 3 templates (T3, T5, sub-pages of T2)
**Locations:** Bottom of What Science Can Do articles, Press Release details, Our Company sub-pages
**Variations:**
- Icon-only vs. icon + label
- Floating sidebar variant vs. inline footer variant

---

## Pattern 24: Mega navigation with search

**Description:** The primary site navigation. A sticky top bar with logo, multi-tier dropdown mega-menu (6 top-level items, each expanding to a 4–8 link deep sub-navigation with optional featured content spotlight), a global search (type-ahead), a "global sites" switcher, and a mobile hamburger menu. Extremely complex interactive component.
**Frequency:** All templates (global)
**Locations:** Header of every page
**Variations:**
- Transparent over hero image vs. opaque on scroll (sticky)
- Mobile collapsed vs. desktop expanded
- Featured website spotlight in some mega-menu panels

---

## Pattern 25: Site footer with link groups

**Description:** Full-width footer with the AstraZeneca logo, multiple columns of quick-link groups (Resources, Quick Links, Social Media), country/website selector, legal copy (Veeva ID, review date), and utility links (privacy, site map, cookie preferences, copyright). Consistent across all templates.
**Frequency:** All templates (global)
**Locations:** Footer of every page
**Variations:**
- Standard (all pages)

---

## Pattern 26: Tabbed panel (regional / multi-section tabs)

**Description:** A horizontal tab bar that switches between named content panels. Each tab label corresponds to a distinct panel (e.g., North America, Latin America). The active tab is visually highlighted; inactive panels are hidden. Fully keyboard navigable with `role="tablist"`, `role="tab"`, `aria-controls`, and `aria-selected` ARIA attributes. Used to organise regional legal/terms content and global website listings.
**Frequency:** 2 templates (Terms & Conditions, Global)
**Locations:** Terms & Conditions §regional-terms, Global §website-listing
**Variations:**
- Horizontal tab bar (standard)
- Mobile: collapses to a dropdown selector (`generic-tabs__current-selection`)
