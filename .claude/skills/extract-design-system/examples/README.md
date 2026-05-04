# Reference examples

These three `DESIGN.md` files are **byte-for-byte mirrors** of the official examples published by Google Labs in the `@google/design.md` repository. They are bundled with the skill as calibration references — concrete, authoritative demonstrations of the format applied to three distinctly different aesthetics.

## How to use them

When generating a new `DESIGN.md`, consult these to calibrate **shape, tone, length, and structure** — for example:

- How many color tokens is "enough"?
- How long should the Overview prose be?
- How are component variants named and grouped?
- What does good Do's and Don'ts copy sound like?
- How are token references woven into component definitions?

**Do NOT** copy values, token names, or prose verbatim into the output for an unrelated site. Every token in your output must be backed by evidence from the live URL you are analyzing.

## What's in each file

| File | Aesthetic | Notes |
|---|---|---|
| `atmospheric-glass.md` | Glass / blur / depth | Heavy use of translucent surfaces and elevation. |
| `paws-and-paths.md` | Organic / friendly / approachable | Warmer palette, softer rhythm. |
| `totality-festival.md` | Bold / event / high-contrast | Festival-style bold typography and accents. |

Each file passes `npx -y @google/design.md lint` with **0 errors** and a number of `orphaned-tokens` warnings (large color palettes whose every shade isn't referenced from a component). That is informative, not a defect — it shows that warnings are guideposts, not blockers.

## Provenance & refresh

Source: <https://github.com/google-labs-code/design.md/tree/main/examples>

To refresh from upstream:

```bash
cd .claude/skills/extract-design-system/examples
curl -sSL -o atmospheric-glass.md https://raw.githubusercontent.com/google-labs-code/design.md/main/examples/atmospheric-glass/DESIGN.md
curl -sSL -o paws-and-paths.md   https://raw.githubusercontent.com/google-labs-code/design.md/main/examples/paws-and-paths/DESIGN.md
curl -sSL -o totality-festival.md https://raw.githubusercontent.com/google-labs-code/design.md/main/examples/totality-festival/DESIGN.md

for f in *.md; do [ "$f" = "README.md" ] && continue; echo "=== $f ==="; npx -y @google/design.md lint "$f" | tail -10; done
```

Confirm each file lints with `errors: 0` after refreshing.
