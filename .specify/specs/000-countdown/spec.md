# Feature Specification: Countdown Block

**Feature Branch**: `f/000-countdown`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Countdown component that displays time remaining until a specific event, with configurable labels, milestones, responsive background images, and CTA button."

New Countdown block that displays a live countdown timer to a scheduled event. Authors configure the target date/time with an explicit timezone, optional pretitle and title text, a call-to-action button, up to two event milestones, and responsive background images. The timer updates every second and freezes at zero when the event arrives.

## Project Context *(mandatory)*

**Scope**: New block

**Affected Pages/Sections**: Event landing pages, promotional sections, and any page where a time-sensitive call-to-action is needed (e.g., race weekends, product launches, webinar registrations).

**Content Approach**:
- Authors create a Countdown block using a labeled table in the document-based authoring environment (Word, Google Docs, or da.live)
- The block uses a key-value configuration model: each row has a field name in the left cell and the corresponding value in the right cell(s)
- Only `Date` and `Timezone` rows are required; all other rows are optional
- Draft content location: `/drafts/dev/countdown`

**Existing Blocks/Patterns**:
- No existing countdown block in the project; this is a net-new block
- The project already has Hero, Cards, Columns, Header, Footer, and Fragment blocks
- No direct reference in the AEM Block Collection or Block Party; the countdown timer pattern is custom

## User Story & Testing *(mandatory)*

### User Story - Event Countdown Timer

As a content author,
I want to create a countdown timer pointing to a specific event date and time,
so that visitors see urgency and are motivated to take action before the event begins.

As a site visitor,
I want to see a live countdown showing days, hours, minutes, and seconds remaining until an event,
so that I understand exactly how much time I have left and can plan accordingly.

**Context**:

Event-driven pages (motorsport race weekends, product launches, webinar registrations, etc.) need a prominent countdown element to create urgency. The countdown sits within a visually rich section with background imagery, event branding (pretitle/title), milestone schedule highlights, and a CTA button. Authors need full control over the display language (countdown labels), background imagery per breakpoint, and up to two milestone callouts that surface key schedule details.

**User journey**:

*Primary — Visitor views a countdown page:*

1. Visitor lands on an event page containing a Countdown block
2. The block displays a live timer (DD : HH : MM : SS) counting down to the event
3. Visitor sees the pretitle, title, and optional milestone panels providing schedule context
4. Visitor clicks the CTA button to navigate to a ticketing or registration page
5. When the event time arrives, the timer freezes at 00 : 00 : 00 : 00

*Secondary — Author creates or updates a countdown:*

1. Author opens the page document in the CMS
2. Author creates a Countdown block table and fills in the target date, timezone, and any optional fields (pretitle, title, labels, button, milestones, backgrounds)
3. Author previews via Sidekick and verifies the countdown is ticking toward the correct time
4. Author publishes the page; visitors see the live countdown

**Acceptance Criteria**:

AC1. **Block MUST be authorable via a key-value table in the document-based CMS**
1. Authors MUST be able to create the block using a table headed "Countdown" (or with a variant, e.g., "Countdown (spacing-large)")
2. Only `Date` and `Timezone` rows MUST be required; all other rows MUST be optional
3. Block MUST render correctly after Sidekick preview and publish

AC2. **Countdown timer MUST display and update in real time**
1. Block MUST display the remaining time split into days, hours, minutes, and seconds
2. Timer MUST update every second
3. When the countdown reaches zero, the display MUST show `00` for all four units and stop updating
4. The countdown calculation MUST combine the authored date/time value with the authored timezone to determine the correct target instant regardless of the visitor's local timezone
5. A vertical divider line MUST appear between each pair of adjacent countdown units. The divider MUST be vertically centered on the digit area (not on the full unit including the label). Divider height: 20px on mobile/tablet, 32px on desktop

AC3. **Countdown labels MUST be customizable with sensible defaults**
1. Default labels MUST be DAYS, HOURS, MINUTES, SECONDS
2. Authors MUST be able to override any individual label via dedicated key-value rows

AC4. **Block MUST support 0, 1, or 2 milestones**
1. Each milestone MUST display a title, a text line above a separator, and a text line below the separator
2. When no milestone rows are authored, the milestone area MUST not render
3. Authors MUST be limited to a maximum of 2 milestones (decoration code processes only the first two Milestone rows)

AC5. **Block MUST support responsive background images**
1. Authors MUST be able to provide up to three images in a single Background row (desktop, tablet, mobile — in that order)
2. If only one image is provided, it MUST be used across all viewports
3. If two images are provided, the first MUST be used for desktop/tablet and the second for mobile
4. If three images are provided, each MUST apply to its respective breakpoint

AC6. **Block MUST support optional pretitle, title, and CTA button**
1. Pretitle MUST render as visually distinct text above the title (styled by CSS)
2. Title MUST render as the main heading of the block
3. Button MUST render as a navigable link styled as a CTA when a Button row is authored, positioned between the timer and the milestones in the content flow
4. When any of these rows is omitted, the corresponding element MUST not render

AC7. **Block MUST support a spacing-bottom variant via block options**
1. `Countdown (spacing-small)` MUST apply the small spacing-bottom token
2. `Countdown (spacing-medium)` MUST apply the medium spacing-bottom token
3. `Countdown (spacing-large)` MUST apply the large spacing-bottom token
4. When no spacing variant is specified, no additional bottom padding MUST be applied

### Edge Cases

- **Event date in the past**: If the target date/time is already past when the page loads, the timer MUST immediately display `00 : 00 : 00 : 00` and not update.
- **Missing or invalid date/timezone**: If the Date or Timezone value is unparseable, the block MUST render gracefully without a timer (static content only — pretitle, title, button, milestones, and background still display).
- **Very long countdown**: Countdowns spanning months or years MUST display correctly (e.g., 365+ days).
- **Daylight Saving Time transitions**: The countdown MUST remain accurate across DST changes because it targets an absolute instant derived from the authored timezone.
- **Minimal configuration**: A block with only Date and Timezone rows MUST render a countdown with default labels and no pretitle, title, button, milestones, or background. When no Background row is authored, the block MUST display a solid `#020202` dark background (the gradient and image layers simply do not render); white-on-dark text remains the default color scheme.
- **Page hidden/minimized**: The timer SHOULD use an approach resilient to tab throttling (e.g., recalculating from wall-clock time on each tick rather than decrementing a counter).

## Content Model *(mandatory for block features)*

**Canonical Model Type**: Configuration

The Countdown block uses a Configuration model because its primary behavior — computing and displaying a live countdown — is driven by authored settings (date, timezone, labels). Although it also contains content elements (pretitle, title, button, milestones, images), the key-value structure provides the clearest authoring experience given the number and variety of fields.

**Block Table Structure**:

*Full example (all optional fields included):*

| Countdown (spacing-large) |  |  |  |
|---|---|---|---|
| Pretitle | PARQUE MAEDA - SAO PAULO |  |  |
| Title | BELGIAN GP |  |  |
| Date | 2025-10-12T14:00:00 |  |  |
| Timezone | Europe/London |  |  |
| Days Label | JOURS |  |  |
| Hours Label | HEURES |  |  |
| Minutes Label | MIN |  |  |
| Seconds Label | SEC |  |  |
| Button | [Buy Tickets](/events/tickets) |  |  |
| Background | ![desktop bg](desktop.jpg) | ![tablet bg](tablet.jpg) | ![mobile bg](mobile.jpg) |
| Milestone | OCTOBER | 10-12 | 2025 |
| Milestone | QUALIFYING | 14:00 GMT | 27th OCT |

*Minimal example (required fields only):*

| Countdown |  |
|---|---|
| Date | 2025-10-12T14:00:00 |
| Timezone | Europe/London |

**Row Reference**:

| Key | Required | Cells | Description |
|---|---|---|---|
| Pretitle | No | 2 | Accented text displayed above the title |
| Title | No | 2 | Main event heading |
| Date | **Yes** | 2 | Target date/time in ISO-like format (YYYY-MM-DDTHH:MM:SS) |
| Timezone | **Yes** | 2 | IANA timezone identifier (e.g., `Europe/London`, `America/Sao_Paulo`) |
| Days Label | No | 2 | Override for the "DAYS" label (default: DAYS) |
| Hours Label | No | 2 | Override for the "HOURS" label (default: HOURS) |
| Minutes Label | No | 2 | Override for the "MINUTES" label (default: MINUTES) |
| Seconds Label | No | 2 | Override for the "SECONDS" label (default: SECONDS) |
| Button | No | 2 | CTA link; value is a link element with label and URL |
| Background | No | 2–4 | 1–3 images for responsive backgrounds (desktop, tablet, mobile) |
| Milestone | No | 4 | Event milestone: title, text before separator, text after separator |

**Semantic Formatting**:
- Link → CTA button (in the Button row's value cell)
- Images → responsive background (in the Background row's value cells)
- Bold text in milestone title cells provides visual emphasis (optional)

**Block Options (Variants)**: `Countdown (spacing-small)`, `Countdown (spacing-medium)`, `Countdown (spacing-large)` — adds the corresponding spacing-bottom class to the block wrapper. Concrete values: `spacing-small` = `32px`, `spacing-medium` = `64px`, `spacing-large` = `96px` bottom padding.

**Section Metadata**: None required. The block is self-contained and achieves full-bleed layout via block-level CSS (`width: 100vw; margin-inline: calc(50% - 50vw)`) — no Section Metadata needed from authors.

## Requirements *(mandatory)*

### Functional Requirements *(mandatory)*

- **FR-001**: Block MUST compute the remaining time by combining the authored Date value with the authored Timezone value to derive an absolute target instant, then comparing it to the current time.
- **FR-002**: Block MUST update the displayed countdown (days, hours, minutes, seconds) every second.
- **FR-003**: Block MUST display `00` for all four countdown units and cease updating when the target instant is reached or has already passed.
- **FR-004**: Block MUST use default labels (DAYS, HOURS, MINUTES, SECONDS) when label-override rows are not authored.
- **FR-005**: Block MUST render a CTA button that navigates to the authored page path when a Button row is present.
- **FR-006**: Block MUST render 0, 1, or 2 milestone panels based on the number of Milestone rows authored, processing only the first two.
- **FR-007**: Block MUST apply the correct background image per viewport breakpoint according to the number of images in the Background row (1 image = all viewports, 2 images = desktop-tablet / mobile, 3 images = desktop / tablet / mobile).
- **FR-008**: Block MUST apply a bottom spacing value when a spacing variant is selected: `spacing-small` = `32px`, `spacing-medium` = `64px`, `spacing-large` = `96px` bottom padding on the block wrapper.

### Non-Functional Requirements

- **NFR-001**: Block MUST NOT cause Cumulative Layout Shift (CLS) when the timer updates; the countdown digits area MUST maintain a stable size (Principle II: Performance).
- **NFR-002**: Block MUST expose countdown values to assistive technologies using a dual-region ARIA pattern: (a) the visible timer container MUST use `role="timer"` (no `aria-live`) so screen readers recognize the element semantically, and (b) a separate visually-hidden `aria-live="polite"` region MUST provide a human-readable text summary (e.g., "12 days, 17 hours remaining") that updates every 30 seconds — the visible digits still update every second but do not trigger screen-reader announcements (Principle IV: Accessibility).
- **NFR-003**: Timer implementation MUST be resilient to browser tab throttling by recalculating from wall-clock time on each tick rather than decrementing a stored value (Principle II: Performance).

## Clarifications

### Session 2026-04-10

1. **CTA Button placement**: Button appears between the timer and the milestones in the content flow (timer → button → milestones). This follows a natural urgency funnel. *(Updated AC6.3)*
2. **Screen reader update strategy**: Dual-region ARIA — `role="timer"` on the visible timer (no `aria-live`), plus a separate visually-hidden `aria-live="polite"` region with a human-readable summary updating every 30 seconds. Prevents noisy per-second announcements. *(Updated NFR-002)*
3. **Spacing variant values**: `spacing-small` = 32px, `spacing-medium` = 64px, `spacing-large` = 96px bottom padding. *(Updated FR-008, Block Options)*
4. **Full-bleed layout**: Block-level CSS breakout (`width: 100vw; margin-inline: calc(50% - 50vw)`) — no Section Metadata required from authors. *(Updated Section Metadata)*
5. **No-background fallback**: Solid `#020202` dark background; gradient and image layers simply don't render. White-on-dark text is the natural fallback. *(Updated Minimal configuration edge case)*
6. **Invalid Date and `NaN` (implementation guardrail)**: In JavaScript, `new Date(string)` with an unparseable string does **not** throw; it produces an **Invalid Date** object whose time value is **`NaN`**. Relying only on `try/catch` around date parsing is therefore **not** sufficient to detect bad authored dates. Implementations MUST explicitly verify that the target instant (and any intermediate numeric results from offset math) are **finite**—for example with `Number.isFinite(...)` on `Date.prototype.getTime()` and on the final epoch-milliseconds value used for the countdown. If any value is non-finite, treat the configuration as **unparseable**: do not render the timer (per the “Missing or invalid date/timezone” edge case). **Do not** gate the timer on checks such as `value !== null` alone, because `NaN !== null` is true and would incorrectly enable the timer and surface `NaN` in the UI.
