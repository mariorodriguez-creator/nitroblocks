# Design Report Card — https://www.zonnic.ca/ca/en/contact-us/testimonials

**Grade C** · 78/100 · _2026-04-30_

## Dimensions

| Dimension | Score | Verdict |
|---|---|---|
| Color Discipline | 92/100 | Exemplary |
| Typography | 50/100 | Needs work |
| Spacing System | 85/100 | Strong |
| Elevation | 78/100 | Adequate |
| Border Radii | 90/100 | Exemplary |
| Accessibility | 100/100 | Exemplary |
| Tokenization | 75/100 | Adequate |
| CSS Health | 35/100 | Needs work |

## Strengths

- Tight, disciplined color palette
- Well-defined spacing scale
- Consistent border radii
- Strong accessibility compliance
- Good CSS variable tokenization

## What to fix

- 4 font families — consider limiting to 2 (heading + body)
- 179 !important rules — prefer specificity over overrides
- 93% of CSS is unused — consider purging
- 11611 duplicate CSS declarations

---
_Audited by [designlang](https://designlang.dev) · `npx designlang grade https://www.zonnic.ca/ca/en/contact-us/testimonials`_