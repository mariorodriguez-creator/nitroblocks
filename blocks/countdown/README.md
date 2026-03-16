# Countdown Block

Displays the time remaining until a specific event. Authors create a table labeled "Countdown" with event datetime, timezone, optional pretitle/title, and up to two milestone badges.

## Content Model

| Countdown |
|-----------|
| [Pretitle] |
| [Title] |
| [Datetime] | [Timezone] |
| [Milestone 1 Title] | [Text1] | [Text2] |
| [Milestone 2 Title] | [Text1] | [Text2] |

- **Row 1 (optional)**: Pretitle text
- **Row 2 (optional)**: Main event title
- **Row 3 (required)**: Datetime (ISO 8601 or `YYYY-MM-DD HH:mm`) and timezone (IANA, e.g. `Europe/London`)
- **Rows 4–5 (optional)**: Up to two milestones; each row: Title, Text1, Text2

## Variants

- `Countdown (spacing-small)` — small bottom margin
- `Countdown (spacing-medium)` — default
- `Countdown (spacing-large)` — large bottom margin

## Test Content

`drafts/countdown.plain.html` — preview at `http://localhost:3000/drafts/countdown` with `aem up --html-folder drafts`.
