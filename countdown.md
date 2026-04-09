
# Overview

This document describes the "countdown" block, whose role is to display the time left to a specific event.

# Content Model

The block must be based on the following properties:
* Pretittle: optional. Text above the title (e.g. "PARQUE MAEDA - SAO PAULO").
* Title: optional. Main event title (e.g. "BELGIAN GP").
* Event date: composed of
   * Datetime: required. ISO 8601 or "YYYY-MM-DD HH:mm"
   * Timezone: required. (IANA, e.g. "Europe/London", "America/New_York")
* Milestones: collection composed of 0 to 2 instances of the following properties:
   * Title: Title (e.g. "OCTOBER", "QUALIFYING")
   * Txt1: before separator, e.g. "10-12", "14:00 GMT"
   * Txt2: after separator, e.g. "2025", "27th OCT"

# Block variants (parenthetical notation)

- `Countdown (spacing-small)` — small bottom spacing
- `Countdown (spacing-medium)` — medium bottom spacing (default)
- `Countdown (spacing-large)` — large bottom spacing

# Countdown labels

Defaults in code: DAYS, HOURS, MINUTES, SECONDS, using placeholders for translation.

# Countdown Logic

* The block interprets the datetime in the author's local context and applies the selected timezone for display.
* The block displays the time remaining until the event, updating each second.
* When the countdown reaches zero, it shows 00, 00, 00, 00 and stops updating.
