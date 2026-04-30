# Agent instructions — design system

This project follows the design system extracted from https://www.zonnic.ca/ca/en.
Any coding agent working here must use the tokens below and avoid inventing new ones.
Source: https://www.zonnic.ca/ca/en
Extracted by designlang v7.0.0 on 2026-04-29T19:53:03.108Z

## Semantic tokens (use these)
- color.action.primary: #182465
- color.surface.default: #ffffff
- color.text.body: #000000
- radius.control: 1px
- typography.body.fontFamily: Santral

## Regions
- nav
- nav
- footer
- footer
- footer

## How to use
- Prefer `semantic.*` tokens over `primitive.*`.
- Never invent new tokens or hex values; reuse the ones above.
- When a value is missing, pick the closest existing semantic token and flag the gap.
- Reference tokens by their dotted path (e.g. `semantic.color.action.primary`).
