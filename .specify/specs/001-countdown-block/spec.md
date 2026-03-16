# Feature Specification: Countdown Block

**Feature Branch**: `feature/001-countdown-block`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Countdown block displaying time remaining until a specific event"  
**Reference**: specify-prompt.txt

New Countdown block that allows authors to display a live countdown to a specific event (e.g., race start, product launch). Visitors see days, hours, minutes, and seconds remaining, with optional event metadata and call-to-action. The block updates every second until the target time, then displays zeros and stops.

## Project Context *(mandatory)*

**Scope**: New block

**Affected Pages/Sections**: Event pages, landing pages, promotional sections where time-sensitive events are promoted (e.g., race weekends, launches, registrations).

**Content Approach**:
- Authors create the block using a labeled table "Countdown" in the document-based authoring environment (Word, Google Docs, or da.live).
- Table structure: Row 1 (optional pretitle), Row 2 (optional title), Row 3 (required: datetime and timezone), Row 4 (optional button link), Rows 5–6 (optional milestones, up to two).
- Authors specify the target datetime in ISO 8601 or "YYYY-MM-DD HH:mm" format and an IANA timezone (e.g., "Europe/London", "America/New_York").
- Block variants (spacing-small, spacing-medium, spacing-large) are selectable via parenthetical notation in the block name.
- Draft content location: `/drafts/{developer}/` folder

**Existing Blocks/Patterns**:
- Follows standard EDS block architecture (blocks/countdown/countdown.js, countdown.css).
- Reference Block Collection and Block Party for embed and timer patterns if applicable.

## User Story & Testing *(mandatory)*

### User Story - Event Countdown

As a site owner or content author,
I want to display a countdown to a specific event (e.g., race start, launch date),
so that visitors know exactly how much time remains and can plan accordingly.

As a visitor,
I want to see the time remaining until the event in days, hours, minutes, and seconds,
so that I can decide when to return or take action (e.g., watch live, register).

**Context**:
Event-driven sites (e.g., motorsport, product launches, registrations) need to surface time-sensitive information prominently. A countdown creates urgency and clarity.

**User journey**:
1. Author adds a Countdown block to a page with event datetime and timezone.
2. Author optionally adds pretitle, title, milestones (e.g., "OCTOBER 10-12 2025", "QUALIFYING 14:00 GMT 27th OCT"), and a CTA link.
3. Visitor views the page and sees the countdown updating in real time.
4. Visitor may click the CTA (if present) to navigate to event details.
5. When the event time passes, the countdown shows zeros and stops updating.

**Acceptance Criteria**:

AC1. **Block MUST support authoring via labeled table**
1. Authors MUST create the block using a table labeled "Countdown" in the document-based authoring environment.
2. Row 3 (event datetime and timezone) MUST be required; all other rows MAY be optional.
3. Block variants (spacing-small, spacing-medium, spacing-large) MUST be selectable via parenthetical notation in the block name.
4. Block MUST render correctly after Sidekick preview and publish.

AC2. **Countdown MUST display and update time remaining correctly**
1. Block MUST display days, hours, minutes, and seconds remaining until the target datetime.
2. Display MUST respect the author-specified IANA timezone.
3. Countdown MUST update at least every second while time remains.
4. When the target time is reached or passed, block MUST show 00, 00, 00, 00 and stop updating.

AC3. **Optional content MUST render when provided**
1. Pretitle and title MUST display when authors provide them.
2. Up to two milestones MUST display when authors provide them (each with title and two text values).
3. CTA button MUST display when authors provide a link URL; link text MAY be authored or default to a standard label.
4. When optional rows are empty, they MUST NOT render or occupy space.

AC4. **Block MUST be responsive and support spacing variants**
1. Block MUST render correctly at standard breakpoints (600px, 900px, 1200px) mobile-first.
2. Spacing variants MUST affect bottom spacing (small, medium, large) as intended for layout integration.

### Edge Cases

- What happens when the author provides an invalid datetime or timezone? (Block MUST degrade gracefully—e.g., show placeholder or hide countdown; MUST NOT break page rendering.)
- What happens when the target datetime is in the past at page load? (Block MUST show zeros and not update.)
- What happens when the author leaves row 3 (datetime/timezone) empty? (Block MUST not render countdown units; optional content MAY still display.)
- How does the block handle timezone changes (e.g., daylight saving) for long-running countdowns? (Display MUST remain correct for the specified IANA timezone.)

## Regression risks *(include only if feature includes breaking changes on existing functionalities)*

- Not applicable. New block; no modifications to existing blocks or content.

## Requirements *(mandatory)*

### Functional Requirements *(mandatory)*

- **FR-001**: System MUST parse datetime and timezone from the author-provided table row and interpret the datetime in the specified IANA timezone.
- **FR-002**: System MUST display days, hours, minutes, and seconds remaining until the target datetime, updating at least every second.
- **FR-003**: System MUST stop updating and display 00, 00, 00, 00 when the target time is reached or has passed.
- **FR-004**: System MUST render optional pretitle, title, milestones (up to two), and CTA when authors provide them.
- **FR-005**: System MUST support block variants spacing-small, spacing-medium, spacing-large via parenthetical notation.
- **FR-006**: System MUST handle invalid or missing datetime/timezone without breaking page rendering (graceful degradation).

### Non-Functional Requirements *(include only if feature specifically mentions requirements related to any core principle of the constitution)*

- **NFR-001**: System MUST meet WCAG 2.2 AA for the countdown block, including ARIA live region for time-remaining announcements, appropriate aria-labels, and keyboard accessibility (Principle IV: Accessibility).
- **NFR-002**: System MUST maintain Lighthouse score of 100 on mobile and desktop (Principle II: Performance).
- **NFR-003**: System MUST scope all CSS selectors to the block class to prevent style leakage (Principle I: Code Quality).
- **NFR-004**: System MUST preserve backward compatibility with existing authored content; new block does not affect existing pages (Principle V: Maintainability).
- **NFR-005**: User-facing strings (e.g., "View event", "DAYS", "HOURS", countdown announcements) MUST be defaulted in code; project MAY use Placeholders for translation (Principle V: Maintainability).
