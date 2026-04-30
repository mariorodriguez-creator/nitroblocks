# Design Report Card — https://www.zonnic.ca/ca/en

**Grade C** · 71/100 · _2026-04-29_

## Dimensions

| Dimension | Score | Verdict |
|---|---|---|
| Color Discipline | 80/100 | Strong |
| Typography | 35/100 | Needs work |
| Spacing System | 85/100 | Strong |
| Elevation | 78/100 | Adequate |
| Border Radii | 90/100 | Exemplary |
| Accessibility | 88/100 | Strong |
| Tokenization | 75/100 | Adequate |
| CSS Health | 35/100 | Needs work |

## Strengths

- Well-defined spacing scale
- Consistent border radii
- Good CSS variable tokenization

## What to fix

- 5 font families — consider limiting to 2 (heading + body)
- 8 font weights in use — consider standardizing to 3 (regular, medium, bold)
- 2 WCAG contrast failures
- 179 !important rules — prefer specificity over overrides
- 92% of CSS is unused — consider purging
- 11611 duplicate CSS declarations

---
_Audited by [designlang](https://designlang.dev) · `npx designlang grade https://www.zonnic.ca/ca/en`_