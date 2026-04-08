---
name: design-token-extraction
description: Extract design tokens (colors, typography, spacing, component styles) from a source website and map them into EDS CSS custom properties. Produces updated styles/styles.css, styles/fonts.css, and self-hosted font files. Use this skill when migrating a website to AEM Edge Delivery Services and you need to match the source site's visual identity, when the user mentions "design tokens", "extract styles", "match the look", "brand colors", or wants to populate CSS custom properties from a source site. Also use after running the site-audit skill when Global Style Observations need to be turned into actual CSS values.
---

# Design Token Extraction

Extract the visual DNA from a source website and map it into EDS CSS custom properties. This skill bridges the gap between the site-audit's qualitative "Global Style Observations" and production-ready CSS tokens in `styles/styles.css`.

## When to Use This Skill

Use this skill when:
- Migrating a website to EDS and need to match the source site's colors, typography, and spacing
- The site-audit skill has been run and you need to turn Global Style Observations into CSS custom properties
- The user wants to populate `styles/styles.css` with values from an existing site

**Do NOT use this skill for:**
- Building new blocks (use **building-blocks** skill)
- Auditing a site's UI patterns (use **site-audit** skill)
- Creating block-specific CSS (block CSS belongs in `blocks/{name}/{name}.css`, not global tokens)

## Prerequisites

- Node.js available
- Playwright and Chromium installed (`npx playwright install chromium`)
- The source website must be publicly accessible (or accessible from the dev machine)

## Related Skills

**Upstream:**
- **site-audit** — Produces `gap-analysis.md` with Global Style Observations that inform token mapping

**Downstream:**
- **building-blocks** — Block CSS references global tokens via `var(--token-name)`
- **page-import** — Imported pages render correctly only after tokens match the source

## Philosophy

Design tokens are the lowest layer of visual fidelity. Getting them right early means every block you build afterward already looks close to the source — headings are the right size, colors match, buttons feel right. Getting them wrong means every block needs per-block color overrides and font-size hacks.

The extraction script captures *precise computed values* — not approximations from screenshots. The LLM's job is to map those values to the EDS token schema intelligently, making decisions about which palette color becomes `--light-color` vs `--dark-color`, and which font becomes the heading vs body family.

## Workflow

### Step 0: Determine Source

The skill accepts input from three sources — use whichever is available:

**(A) Source URL** — Best option. The extraction script runs against the live site and captures exact computed values.

**(B) Already-scraped page from site-audit** — If `.specify/migration/pages/` exists with scraped data, use the homepage URL from the site-audit for extraction. The scraped screenshots and cleaned HTML provide supplementary visual context.

**(C) Gap-analysis Global Style Observations** — If no live URL is accessible, the Global Style Observations section from `gap-analysis.md` can serve as a starting reference. In this mode, the LLM maps the qualitative descriptions to token values manually (less precise, use only as fallback).

**If coming from a site-audit:** Check `.specify/migration/gap-analysis.md` for the Global Style Observations section. Read it for context, then use the homepage URL for script extraction.

**Ask the user:** Which source URL to extract from. If the site-audit has already been run, suggest the homepage URL.

---

### Step 1: Run Extraction Script

Run the bundled Playwright extraction script:

```bash
node .claude/skills/design-token-extraction/scripts/extract-tokens.mjs "{url}" --output .specify/migration/tokens
```

**What the script extracts:**
- Computed styles from `body`, `h1`-`h6`, links, buttons
- Background colors from `html`, `body`, and `main` (picks the most meaningful)
- Color palette from all loaded stylesheets, sorted by frequency
- `@font-face` declarations with font file URLs
- Font file downloads (woff2 preferred)
- Section padding, max-width, nav height
- CSS custom properties from `:root`
- Media query breakpoints
- Link hover color from stylesheet `:hover` rules

**Verify output:**
```bash
ls -la .specify/migration/tokens/tokens.json
ls -la .specify/migration/tokens/fonts/
```

The script produces `tokens.json` and a `fonts/` directory with downloaded font files.

**If the script fails:** Check that Chromium is installed (`npx playwright install chromium`). If the site requires authentication or blocks headless browsers, fall back to Source option (C) using the gap-analysis observations.

---

### Step 2: Map Tokens to EDS Custom Properties

Read `tokens.json` and map extracted values to the EDS token schema. This is where the LLM applies judgment — raw extracted values don't always map 1:1 to EDS tokens.

**The EDS token schema** (defined in `styles/styles.css` `:root`):

```
/* colors */
--background-color    ← tokens.colors.body_bg
--light-color         ← tokens.colors.light (light neutral from palette)
--dark-color          ← tokens.colors.dark (mid-tone neutral from palette)
--text-color          ← tokens.colors.body_text
--link-color          ← tokens.colors.link
--link-hover-color    ← tokens.colors.link_hover

/* fonts */
--body-font-family    ← tokens.typography.body.family (cleaned, with fallback)
--heading-font-family ← tokens.typography.headings.h1.fontFamily (cleaned, with fallback)

/* body sizes (mobile-first, overridden at 900px for desktop) */
--body-font-size-m    ← tokens.typography.body.size
--body-font-size-s    ← derive from body.size (-2px or -3px)
--body-font-size-xs   ← derive from body.size (-4px or -5px)

/* heading sizes (mobile-first, overridden at 900px for desktop) */
--heading-font-size-xxl  ← tokens.typography.headings.h1.fontSize
--heading-font-size-xl   ← tokens.typography.headings.h2.fontSize
--heading-font-size-l    ← tokens.typography.headings.h3.fontSize
--heading-font-size-m    ← tokens.typography.headings.h4.fontSize
--heading-font-size-s    ← tokens.typography.headings.h5.fontSize (or derive)
--heading-font-size-xs   ← tokens.typography.headings.h6.fontSize (or derive)

/* nav height */
--nav-height          ← tokens.spacing.navHeight
```

**Mapping rules:**

1. **Colors:** If `body_bg` is `#ffffff` or `#000000`, it's likely correct (most sites use white or black body). If the site uses a non-standard body background, verify against the screenshot. For `--light-color`, pick the most frequent light neutral (luminance > 0.85) from the palette. For `--dark-color`, pick the most frequent mid-tone (luminance 0.1–0.45). The script's `colors.light` and `colors.dark` are good defaults.

2. **Brand colors:** If the source site has brand colors beyond the 6 boilerplate slots (e.g., a brand purple, an accent gold), add semantic custom properties:
   ```
   --brand-primary: #830051;
   --brand-accent: #f0ab00;
   ```
   Only add these if they appear frequently (>30 occurrences in palette) and serve a clear semantic role. Don't add every color from the palette.

3. **Typography:** The extracted `fontFamily` values include the full stack (e.g., `"lexia, Times, \"Times New Roman\", serif"`). For EDS, clean this to just the primary font name plus a generic fallback, adding a `-fallback` font reference for the CLS fallback:
   ```
   --body-font-family: az-sans, az-sans-fallback, sans-serif;
   --heading-font-family: lexia, lexia-fallback, serif;
   ```

4. **Font sizes:** The script captures sizes at the viewport width it loaded (1440px — desktop). These become the *desktop* values in the `@media (width >= 900px)` block. For mobile (the `:root` block), scale them up slightly (EDS convention: mobile heading sizes are ~20% larger than desktop because mobile viewports are narrower and need more visual weight per the boilerplate pattern).

5. **Missing heading levels:** If the source site doesn't use all 6 heading levels (common — many sites only have h1-h4), derive the missing sizes by interpolating between the nearest extracted values. Use ~2px decrements.

6. **Spacing:** Map section padding to the section margin/padding values in the CSS. Map content max-width to `main > .section > div { max-width }`.

---

### Step 3: Handle Fonts

Font handling follows the EDS font-fallback pattern documented at https://www.aem.live/developer/font-fallback.

**3a. Copy font files:**
```bash
cp .specify/migration/tokens/fonts/*.woff2 fonts/
```

Only copy woff2 files. If only woff or ttf were downloaded, note this as a follow-up (convert to woff2 or find woff2 source).

**3b. Generate `styles/fonts.css`:**

For each downloaded font, create a `@font-face` declaration:

```css
@font-face {
  font-family: {family-name};
  font-style: {style};
  font-weight: {weight};
  font-display: swap;
  src: url('../fonts/{filename}') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

Use `font-display: swap` always (EDS requirement — fonts load after LCP).

**3c. Generate fallback fonts in `styles/styles.css`:**

For each web font, add a fallback `@font-face` using a local system font with `size-adjust`:

```css
@font-face {
  font-family: {family-name}-fallback;
  size-adjust: {calculated-percentage}%;
  src: local('Arial');  /* or local('Georgia') for serif */
}
```

The `size-adjust` percentage compensates for the metric differences between the web font and the fallback, preventing CLS when fonts swap. If the exact `size-adjust` is unknown, use `100%` as a starting point and note it as a follow-up for manual tuning.

**Serif fallback:** Use `local('Georgia')` or `local('Times New Roman')`.
**Sans-serif fallback:** Use `local('Arial')` or `local('Helvetica')`.

**3d. Flag licensing:**

If the font files were downloaded from a commercial CDN (not Google Fonts, not an open-source repository), add a warning to the report:

> **Font licensing warning:** The following fonts were downloaded from the source site's CDN. Verify that your project has a valid license to self-host these fonts before deploying to production. If not licensed, find equivalent open-source alternatives or purchase a web font license.

---

### Step 4: Update Style Files

Apply the mapped tokens to the actual CSS files. This step modifies real project files.

**4a. Update `styles/styles.css` `:root` block:**

Replace the values (not the structure) of the `:root` CSS custom properties with the mapped values from Step 2. Keep the boilerplate's comment structure and property names intact.

**4b. Update responsive overrides:**

Replace the values in the `@media (width >= 900px)` block with the desktop-specific sizes.

**4c. Update fallback fonts:**

Replace the `@font-face` declarations for fallback fonts (the ones using `size-adjust` and `src: local(...)`) with the new fallback definitions from Step 3c.

**4d. Update component styles if needed:**

If the source site's button border-radius, link decoration, or body line-height differ significantly from the boilerplate defaults, update those in `styles/styles.css` too. These are not token properties but component-level styles that should match the source.

**What NOT to change:**
- Do not modify `scripts/aem.js`
- Do not modify block-specific CSS files
- Do not change the CSS selector structure or class names
- Do not add marketing scripts or inline styles to `head.html`
- Preserve the `body { display: none }` / `body.appear` pattern

---

### Step 5: Generate Report

Save a human-readable report to `.specify/migration/design-tokens.md`:

```markdown
# Design Tokens Report

**Source site:** {URL}
**Date:** {ISO date}
**Extraction method:** Script (extract-tokens.mjs)

## Token Mapping

| EDS Property | Source Value | Notes |
|---|---|---|
| --background-color | {value} | {origin or decision} |
| --light-color | {value} | Palette rank #{N}, luminance {L} |
| --dark-color | {value} | Palette rank #{N}, luminance {L} |
| --text-color | {value} | Body computed color |
| --link-color | {value} | Main content link color |
| --link-hover-color | {value} | From :hover stylesheet rule |
| --body-font-family | {value} | {font source} |
| --heading-font-family | {value} | {font source} |
| --body-font-size-m | {value} | Body computed size |
| ... | ... | ... |

## Color Palette

Top 15 colors from source stylesheets:

| Hex | Frequency | Role |
|---|---|---|
| {hex} | {N} | {identified role or "unused"} |

## Brand Colors (Custom Properties)

| Property | Value | Usage |
|---|---|---|
| --brand-primary | {hex} | {where it appears} |

## Font Inventory

| Family | Weights | Source | License | Local File |
|---|---|---|---|---|
| {name} | {400, 700} | {CDN URL} | {status} | fonts/{file} |

## Decisions Log

{List each non-obvious mapping decision with reasoning:}
- **--light-color**: Chose #f8f8f8 over #f5f5f5 because it has 2x frequency in the palette
- **Heading scale**: Source only uses h1-h4; derived h5 and h6 by decrementing 2px each

## Follow-Up Items

- [ ] Verify font licensing for self-hosted files
- [ ] Tune size-adjust percentages for CLS testing
- [ ] Validate contrast ratios (WCAG AA) for text/bg and link/bg
- [ ] Compare rendered output against source screenshots
```

---

### Step 6: Validate

After updating style files:

1. **Lint check:** Run `npm run lint` to verify CSS validity. Fix any Stylelint errors introduced by the token changes.

2. **Visual comparison:** If the local dev server is running (`aem up`), load a page in the browser and compare against the source site screenshot from the site-audit. If no pages have been imported yet, the tokens will take effect once content is available.

3. **Contrast check:** Verify WCAG AA contrast ratios for:
   - `--text-color` on `--background-color` (minimum 4.5:1)
   - `--link-color` on `--background-color` (minimum 4.5:1)
   - Button text on button background

   Use the formula: contrast ratio = (L1 + 0.05) / (L2 + 0.05) where L1 > L2 are relative luminances.

4. **Report any issues** to the user with specific recommendations.

---

## Output

This skill produces:

1. **`.specify/migration/tokens/tokens.json`** — Raw extraction data (reference, not consumed downstream)
2. **`.specify/migration/tokens/fonts/`** — Downloaded font files (copied to `fonts/` in Step 3)
3. **`.specify/migration/design-tokens.md`** — Human-readable report with mapping decisions
4. **Updated `styles/styles.css`** — `:root` custom properties populated with source values
5. **Updated `styles/fonts.css`** — `@font-face` declarations for source web fonts
6. **Updated `fonts/`** — Self-hosted font files (woff2)

## Key Principles

**Precision over approximation.** The extraction script captures exact computed values. When in doubt about a color or size, trust the script output over the gap-analysis observations (which are qualitative).

**Preserve the schema.** The boilerplate's CSS custom property names are a contract used by all blocks. Never rename them — only change the values. Add new properties when the source site needs them, but always keep the originals.

**Fonts load after LCP.** This is an EDS performance requirement. Web fonts are defined in `fonts.css`, loaded asynchronously via `loadFonts()` in `scripts.js`. System font fallbacks with `size-adjust` prevent CLS during the swap. Never move font loading to the eager phase.

**Conservative color mapping.** If the source site has 20 brand colors, don't create 20 custom properties. Map the core 6 EDS slots, add 2-3 semantic brand colors if clearly needed, and leave the rest for block-specific CSS.
