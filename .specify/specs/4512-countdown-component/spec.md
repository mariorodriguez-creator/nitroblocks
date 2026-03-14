# Feature Specification: Countdown Component

**Feature Branch**: `feature/4512-countdown-component`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Countdown component to display time remaining until a specific event"  
**Reference**: `.specify/specs/countdown.md`

New AEM component that displays a live countdown timer to a scheduled event. The component includes configurable titles, event milestones, a call-to-action button, and responsive background imagery. Authors configure the target date/time with explicit timezone selection, and visitors see the remaining time updating in real time.

## Project Context *(mandatory)*

**Applicable Project(s)**: ALL

**Project-Specific Adaptations**:
- Countdown labels (Days, Hours, Minutes, Seconds) are author-configurable to support localization across all projects
- Background images are provided per breakpoint (desktop, tablet, mobile) for brand-specific visual treatment
- Milestones provide flexible event-schedule context (e.g., race weekends, conference agendas, product launches)

**Configuration Approach**:
- All visual and textual content is authored per component instance via the edit dialog — no hardcoded strings
- Spacing follows the existing DXn theming system via CAC variables (Layout: Spacing)
- Timezone list is comprehensive and reusable across projects

## User Story & Testing *(mandatory)*

### User Story - Event Countdown Display

As a content author,
I want to configure a countdown timer targeting a specific event date and time,
so that visitors can see how much time remains until the event.

As a content author,
I want to add up to two event milestones with titles and supporting text,
so that visitors understand the key moments of the event schedule.

As a site visitor,
I want to see a live countdown that updates every second,
so that I have a clear sense of urgency and anticipation for the upcoming event.

**Context**:

Event-driven pages (e.g., race weekends, product launches, conference schedules) need a prominent, visually engaging countdown to build anticipation. The component sits within a page alongside other content and provides at-a-glance timing information plus optional schedule milestones.

**User journey**:

*Primary journey — Author configures the countdown:*

1. Author drags the Countdown component onto a page
2. Author opens the edit dialog and fills in the pretitle (e.g., "PARQUE MAEDA - SAO PAULO") and title (e.g., "BELGIAN GP")
3. Author sets the event date and time via the date-time picker
4. Author selects the event's timezone from a comprehensive dropdown (e.g., "Europe/London")
5. Author optionally customizes the countdown labels (defaults: DAYS, HOURS, MINUTES, SECONDS)
6. Author optionally adds a call-to-action button with a target page and label
7. Author switches to the Milestones tab and adds up to 2 milestones (e.g., "OCTOBER | 10-12 | 2025" and "RACE | 14:00 GMT | 27th OCT")
8. Author switches to the Background tab and uploads responsive background images
9. Author sets the bottom spacing on the Styles tab
10. Author saves and previews the page

*Primary journey — Visitor views the countdown:*

1. Visitor loads the page containing the countdown component
2. Visitor sees the pretitle, title, live countdown digits (days, hours, minutes, seconds), labels, milestones, and optional CTA button over the background image
3. The countdown updates every second in real time
4. When the event time is reached, the countdown displays 00 for all units and stops updating

**Acceptance Criteria**:

AC1. **Component MUST provide a complete authoring dialog with all required configuration fields**
1. Settings tab MUST include a Pretitle RTE field (optional)
2. Settings tab MUST include a Title RTE field (optional)
3. Settings tab MUST include an Event fieldset with a Date Time picker (required) and a Time Zone dropdown (required)
4. The Time Zone dropdown MUST contain a comprehensive list of time zones (e.g., IANA timezone identifiers)
5. Settings tab MUST include a Countdown Labels fieldset with four string fields: Days (default: "DAYS"), Hours (default: "HOURS"), Minutes (default: "MINUTES"), Seconds (default: "SECONDS") — all required
6. Settings tab MUST include a Button fieldset with a Page content path picker (optional) and a Label textbox (optional)

AC2. **Component MUST support configurable milestones**
1. Milestones tab MUST provide a multifield for adding milestone entries
2. Each milestone entry MUST contain three fields: Title, Text1 (text before separator line), and Text2 (text after separator line)
3. Authors MUST be able to add between 0 and 2 milestones
4. The multifield "add" button MUST be disabled after the 2nd milestone is added
5. Authors MUST be able to remove and reorder milestones
6. All three milestone fields (Title, Text1, Text2) MUST always be present in the rendered HTML
7. On tablet and desktop viewports, Text2 and the separator MUST be visually hidden via CSS (display: none or equivalent) — only Text1 is visible alongside the Title
8. On mobile viewports, Text1, separator, and Text2 MUST all be visible, stacked vertically within the badge

AC3. **Component MUST support responsive background images**
1. Background tab MUST provide three DAM path pickers: Desktop image, Tablet image, and Mobile image — all optional
2. The appropriate image MUST be served based on the visitor's viewport
3. Background images are decorative and MUST be marked as such (empty alt attribute or `role="presentation"`) — no alt text field is required in the dialog

AC4. **Component MUST support bottom spacing configuration**
1. Styles tab MUST include a Spacing Bottom dropdown with values: None, Small, Medium, Large
2. Selected spacing MUST apply padding-bottom using the DXn theming variables (Layout: Spacing > bottom-small-{viewport-size}, bottom-medium-{viewport-size}, bottom-large-{viewport-size})

AC5. **Event date/time MUST be stored with the author-selected timezone**
1. The persisted date/time value MUST replace the timezone from the date-time picker with the timezone selected in the Time Zone dropdown
2. For example, if the picker holds "2025-12-25 12:00:00 CET" and the author selected "Europe/London", the stored value MUST be "2025-12-25 12:00:00 GMT"

AC6. **Countdown MUST display live time remaining and update every second**
1. The component MUST calculate the difference between the current time and the stored event date/time, accounting for the configured timezone
2. The countdown MUST display four units: days, hours, minutes, and seconds
3. The countdown MUST update every second on the visitor's browser
4. Each unit MUST display with at least two digits (zero-padded)
5. The server-rendered HTML MUST output 00 for all countdown units as the initial state; client-side JavaScript MUST replace these with calculated values on initialization

AC7. **Countdown MUST handle event expiration correctly**
1. When the event date/time is reached or has passed, the component MUST display 00 for days, hours, minutes, and seconds
2. The countdown MUST stop updating once the event has passed
3. The countdown MUST never display negative values

### Edge Cases

- **Event already in the past at page load**: The countdown MUST display 00 for all units immediately and not attempt to update
- **No milestones configured**: The milestones section MUST not render; no empty container or placeholder should be visible
- **No background images configured**: The component MUST render without a background image, falling back gracefully (no broken image indicators)
- **No pretitle or title configured**: The component MUST render without the pretitle/title area; the countdown and milestones remain visible
- **No button configured**: The CTA button area MUST not render if both Page and Label are empty
- **Button placement**: The CTA button MUST render below the milestones section as the last content element inside the component (visual order: header → timer → milestones → button)
- **Timezone with daylight saving transitions**: The countdown calculation MUST correctly handle DST boundaries using the IANA timezone rules
- **Very long countdown (e.g., 999+ days)**: The days unit MUST accommodate more than two digits without layout breakage
- **Author removes a milestone and re-adds**: The multifield "add" button MUST re-enable when the count drops below 2

## Requirements *(mandatory)*

### Functional Requirements *(mandatory)*

- **FR-001**: Component MUST provide a Settings tab with Pretitle (RTE, optional), Title (RTE, optional), Event Date Time (required), Event Time Zone dropdown (required), countdown label fields (Days, Hours, Minutes, Seconds — all required with defaults), and Button fields (Page path picker and Label — both optional)
- **FR-002**: Component MUST provide a Milestones tab with a multifield accepting 0 to 2 entries, each containing Title, Text1, and Text2 string fields
- **FR-003**: The milestones multifield MUST disable the "add" button when 2 entries exist and MUST allow removal and reordering
- **FR-004**: Component MUST provide a Background tab with three optional DAM path pickers for Desktop, Tablet, and Mobile images
- **FR-005**: Component MUST provide a Styles tab with a Spacing Bottom dropdown (None, Small, Medium, Large) applying DXn theming spacing variables
- **FR-006**: The event date/time MUST be persisted with the timezone selected in the Time Zone dropdown, replacing any timezone from the date-time picker widget
- **FR-007**: Component MUST display a live countdown (days, hours, minutes, seconds) that updates every second on the client side
- **FR-008**: Component MUST display 00 for all countdown units and stop updating when the event date/time has been reached or passed
- **FR-009**: Component MUST render the appropriate background image based on the visitor's viewport breakpoint
- **FR-010**: Component MUST conditionally render pretitle, title, milestones, and button sections — omitting each when not configured by the author

## Clarifications

### Session 2026-03-12

1. **Milestone Text2 responsive visibility**: Text2 and the separator are always present in the rendered HTML but visually hidden via CSS on tablet and desktop. On mobile, all three elements (Text1, separator, Text2) are visible and stacked vertically. *(Updated AC2, items 6–8)*
2. **CTA button visual placement**: The button renders below the milestones section as the last content element (order: header → timer → milestones → button). *(Added to Edge Cases)*
3. **Background image accessibility**: Background images are decorative and marked as such (`alt=""` or `role="presentation"`). No alt text field in the dialog. *(Updated AC3, item 3)*
4. **Countdown pre-JS render state**: Server renders 00 for all countdown units; client-side JS replaces with calculated values on initialization. *(Updated AC6, item 5)*

### Non-Functional Requirements

- **NFR-001**: Countdown timer MUST be accessible, with countdown values conveyed to assistive technologies appropriately (Principle V: Accessibility)
- **NFR-002**: Client-side countdown update MUST NOT cause layout shifts or excessive repaints (Principle VI: Performance)
- **NFR-003**: All author-facing label strings MUST be externalized and configurable — no hardcoded display text (Principle VII: Maintainability)
