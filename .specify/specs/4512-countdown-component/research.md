# Research: Countdown Component

**Branch**: `feature/4512-countdown-component` | **Date**: 2026-03-12

## R-001: Timezone Persistence in JCR

**Question**: How should the event date/time be stored in JCR given the requirement to replace the date-time picker's timezone with the author-selected IANA timezone?

**Decision**: Store as two separate JCR properties:
- `eventDateTime` (String): ISO 8601 date-time without timezone offset, e.g. `2025-12-25T12:00:00`
- `eventTimeZone` (String): IANA timezone ID, e.g. `Europe/London`

The Sling Model combines them to produce a UTC epoch timestamp (milliseconds) as a `data-` attribute for the client-side JS.

**Rationale**: AEM's `@TypeHint=Date` stores Calendar objects in UTC, which loses the author's intended timezone. Two separate string properties preserve the exact date-time + timezone pairing. The Sling Model performs the conversion to UTC epoch using `java.time.ZonedDateTime.of(localDateTime, zoneId).toInstant().toEpochMilli()`.

**Alternatives rejected**:
- Single Calendar property with timezone baked in: AEM's JCR Date type normalizes to UTC, losing the original timezone context
- Storing as a formatted string with timezone suffix (e.g., "2025-12-25T12:00:00 Europe/London"): Non-standard, requires custom parsing, breaks if format changes

## R-002: IANA Timezone List Source for Dialog Dropdown

**Question**: Where does the comprehensive timezone list come from for the author dialog?

**Decision**: Use a Sling DataSource backed by `java.time.ZoneId.getAvailableZoneIds()`. The datasource servlet returns timezone IDs grouped by region (e.g., "Europe/London", "America/New_York"), sorted alphabetically. The dropdown value is the IANA ID; the display text is a formatted label (e.g., "Europe/London (GMT+0)").

**Rationale**: Java's built-in timezone database (TZDB) is comprehensive and updated with JVM patches. A datasource servlet avoids hardcoding hundreds of timezone entries in the dialog XML and keeps the list current.

**Alternatives rejected**:
- Hardcoded dropdown options in dialog XML: Unmaintainable (500+ timezones), out of date when DST rules change
- External API: Adds runtime dependency for an authoring feature; Java's ZoneId is sufficient

## R-003: Multifield Maximum Items Enforcement

**Question**: How to disable the "add" button after 2 milestones are added?

**Decision**: Use `granite:data` with `maxitems="2"` on the Granite UI multifield widget. AEM's built-in multifield natively supports `maxitems` — it disables the add button when the limit is reached and re-enables it when items are removed.

**Rationale**: Native Granite UI feature — no custom JavaScript or dialog listener needed.

**Alternatives rejected**:
- Custom dialog validation JavaScript: Unnecessary complexity for a built-in feature
- Server-side validation only: Would not prevent the author from adding items in the UI, leading to a confusing experience

## R-004: Client-Side Countdown Implementation

**Question**: How should the countdown timer be implemented in the browser?

**Decision**: Use `setInterval(fn, 1000)` to update every second. The Sling Model outputs the target UTC epoch as a `data-nc-params` attribute (e.g., `data-nc-params='{"targetEpoch": 1735128000000}'`). JavaScript calculates remaining time as `targetEpoch - Date.now()`, splits into days/hours/minutes/seconds, and updates DOM text content.

**Rationale**: `setInterval` at 1000ms is the simplest, most readable approach for a 1-second tick. `Date.now()` is always UTC, so comparing against a UTC epoch avoids all client timezone issues. Updating only text content (no DOM structure changes) avoids layout shifts per NFR-002.

**Alternatives rejected**:
- `requestAnimationFrame`: Fires at 60fps — wasteful for a 1-second update; would need throttling which adds complexity
- Server-side time calculation: Depends on server time being in sync; client-side is authoritative for "time remaining" since the visitor's clock determines their experience

## R-005: Background Image Rendering Approach

**Question**: Should background images use `<picture>` with `<source>` or CSS `background-image` with media queries?

**Decision**: Use a `<picture>` element with `<source media="...">` for each breakpoint, positioned absolutely behind content. The `<img>` fallback uses the mobile image. All images get `alt=""` and `role="presentation"` (decorative per spec AC3.3).

**Rationale**: `<picture>` with `<source>` leverages native browser responsive loading (only the matching source is fetched). CSS background-image doesn't participate in the resource loading pipeline as efficiently and lacks the semantic alt-text hook for accessibility tools.

**Alternatives rejected**:
- CSS `background-image` with media queries: Less control over lazy loading, no semantic alt attribute, not as efficient for resource loading priority
- Single image with CSS object-fit: Doesn't support per-breakpoint art direction (different crops/compositions per viewport)

## R-006: RTE Fields for Pretitle and Title

**Question**: Should pretitle and title use full RTE or simplified text fields?

**Decision**: Use the standard Granite UI `richtext` widget (Coral RTE) with a restricted toolbar. Allow basic inline formatting (bold, italic, superscript, subscript) but no block-level elements (headings, lists, tables). This is consistent with how other DXn components handle RTE fields for short text.

**Rationale**: RTE allows minor formatting (e.g., a superscript "TM" in an event name, or a bold word) while keeping output predictable. Restricting the toolbar prevents authors from inserting block elements that would break the compact layout.

**Alternatives rejected**:
- Plain textfield: Too restrictive — authors occasionally need inline formatting
- Full RTE with all plugins: Risk of authors inserting block elements (paragraphs, lists) that break the visual layout
