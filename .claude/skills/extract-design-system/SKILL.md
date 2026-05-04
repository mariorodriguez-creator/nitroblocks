---
name: extract-design-system
description: Reverse-engineer the design system of a live website and produce a DESIGN.md file that strictly conforms to Google Labs' DESIGN.md format spec (https://github.com/google-labs-code/design.md). Use when the user provides a live URL and asks to extract a design system, generate a DESIGN.md, capture a visual identity as tokens, or produce a Google-spec design.md from a website.
---

# Extract Design System (Google DESIGN.md format)

Reverse-engineer the design system of a live website and emit a `DESIGN.md` file that conforms to the **Google Labs DESIGN.md spec** at <https://github.com/google-labs-code/design.md>.

The full normative spec is mirrored locally in [spec-reference.md](spec-reference.md) — read it before generating output. A fillable skeleton is in [template.md](template.md).

## Hard rules

1. The output file MUST validate against `npx -y @google/design.md lint <file>` with **zero errors**. Warnings (e.g. `orphaned-tokens`, `contrast-ratio`) are guideposts — review each, fix when fixing improves fidelity, suppress in prose otherwise. Google's own reference examples ship with warnings.
2. This skill is bound to **Google's DESIGN.md spec only**. Do **not** import conventions, token names, or section structures from any other DESIGN.md file in this repository or elsewhere. If something is not described in `spec-reference.md`, do not invent it.
3. Every token written MUST be backed by evidence from the live site — a CSS variable, a computed style, a CSS declaration, or a color picked from a screenshot. No invented values.
4. Prose describes *why* the tokens exist and how to apply them. Tokens are the normative values.
5. Reference examples in [examples/](examples/) calibrate **shape, tone, length, and structure** only. Never copy their token values, token names, or prose into output for an unrelated site.
6. **Agent-portable**: this skill must run in any coding agent environment. External dependencies are limited to **Node + Playwright + curl**. Do **not** introduce dependencies on agent-specific tools or MCP servers (no `cursor-ide-browser` / `browser_*`, no `WebFetch`, no `WebSearch`). Where you'd reach for an agent-specific web-fetching tool, use `curl -sSL` instead — every coding agent can shell out.

## Inputs

- **URL** (required). A single starting URL is sufficient — typically the homepage. The skill will **discover and visit a small set of additional representative pages** (long-form content, a listing, a form, a published style guide if one exists) to get coverage of body typography, inputs, cards, and other components a homepage usually doesn't expose. The user may also pass multiple URLs explicitly to skip the discovery step.
- **Output directory** (optional). Default to the repo root. The skill writes `DESIGN.md` here and a sibling `assets/` directory.

## Output

A `DESIGN.md` file plus an `assets/` directory at the same level so the design system is fully reproducible offline:

```text
<output-dir>/
├── DESIGN.md
└── assets/
    ├── fonts/         (woff2/woff/ttf — every face referenced from typography tokens)
    ├── logos/         (brand marks: primary, light, dark, wordmark, square)
    ├── icons/         (favicon family, app icons, in-DOM SVG icons / sprites)
    └── MANIFEST.md    (auto-generated: source URL → local path, size, sha256 per file)
```

`DESIGN.md` requirements:

- A YAML front matter block fenced by lines containing exactly `---`.
- A markdown body using `##` section headings in the canonical order.
- Prose references assets via relative paths (e.g. `assets/fonts/`) so a reader can locate them.

## Workflow

Copy this checklist into the conversation and tick items off:

```
- [ ] 1. Capture the live site
       a. Discover 3–6 representative pages (home + long-form + listing + form + style guide if any)
       b. Run scripts/capture.js with all discovered URLs (--interactions for hover/focus) → .capture/
       c. Confirm screenshots show actual page content, not overlays
       d. Skim .capture/manifest.json to confirm every page captured ok
- [ ] 2. Harvest raw style sources from .capture/ (custom-properties → computed-styles → CSS files via curl)
- [ ] 3. Download brand assets (fonts, logos, icons) → assets/ + MANIFEST.md
- [ ] 4. Distill into the Google token schema
- [ ] 5. Write the prose, grounded in observed evidence
- [ ] 6. Assemble DESIGN.md from the template
- [ ] 7. Validate with the official linter; report errors (must be 0) and warnings
```

### 1. Capture the live site

Treat the input URL as a **starting point, not the only page**. Single pages rarely expose a complete design system: a homepage shows hero typography, primary CTAs, and chrome — but not body-text variants, lists, blockquotes, form inputs, error states, cards, or pagination. Without those, your tokens and components will be partial guesses.

#### 1a. Discover a representative page set (3–6 URLs)

Build a shortlist that covers these archetypes. Skip any that don't exist on the site; never pad the list to hit a number.

| Archetype | Why you need it | How to find it |
|---|---|---|
| Home / landing | Hero typography, primary CTA, brand voice | The input URL |
| Long-form content | `body-lg`/`body-md`/`body-sm`, links, blockquotes, headings in flow | Blog index → first post; "About"; news / press release |
| Listing / catalog | card, chip, grid, pagination, filter components | "Shop", "Products", "All articles" |
| Detail page | image gallery, badges, breadcrumbs, structured metadata, primary CTA in context | Click into one item from the listing |
| Form | input, label, helper text, error/success states, secondary buttons | "Contact", "Sign up", "Newsletter" |
| Plain chrome | minimal page that exposes header/footer cleanly | "Privacy", "Terms", "Cookie policy" |
| **Published style guide** | usually shows every component on one page | `/style-guide`, `/styleguide`, `/design-system`, `/components`, `/ui`, `/patterns`, `/storybook` — **always include if it exists** |

Cheap ways to find candidates fast (try in order):

1. `curl -sSL <input-url>/sitemap.xml` (or `/sitemap_index.xml`) and skim entries — pick one URL per archetype.
2. If no sitemap, fetch the homepage with `curl -sSL` and grep `<a href>` from the `<nav>` and `<footer>`.
3. Probe the published-style-guide URLs above directly with `curl -sSL -o /dev/null -w "%{http_code}\n"`. A `200` means open it.

Respect `/robots.txt` `Disallow` rules. Skip auth-walled pages, in-site search results, infinite-scroll feeds, and localized duplicates of pages you already have.

#### 1b. Capture all pages with `scripts/capture.js`

The skill ships a Playwright-based batch capturer at [scripts/capture.js](scripts/capture.js) (full docs in [scripts/README.md](scripts/README.md)). It is the **only** capture path — no agent-specific browser tools.

One-time install:

```bash
npm i -D playwright && npx playwright install chromium
```

Then capture every URL on your shortlist in a single run:

```bash
node .claude/skills/extract-design-system/scripts/capture.js \
  https://www.example.com/ \
  https://www.example.com/blog/post-1 \
  https://www.example.com/products \
  https://www.example.com/contact \
  --out .capture \
  --interactions
```

The capturer dismisses common overlays by default before screenshots and style reads: cookie banners, consent managers, age/region interstitials, newsletter popups, surveys, and generic onload modals. It first tries visible buttons/links such as "Accept all", "I agree", "Continue", "Close", "No thanks", and "Skip"; then removes blocking fixed/modal layers whose ids, classes, roles, or labels identify them as overlays. Keep this enabled unless the overlay itself is part of the site's design system.

If a site requires a specific cookie to unlock content, pre-seed it with repeatable `--cookie name=value` flags:

```bash
node .claude/skills/extract-design-system/scripts/capture.js \
  https://www.example.com/ \
  --out .capture \
  --interactions \
  --cookie OptanonConsent=accepted
```

If the overlay is itself the subject of analysis, disable bypassing with `--no-dismiss-overlays`.

For each URL the script writes:

```text
.capture/<page-slug>/
├── desktop.png                    # full-page at 1440×900
├── mobile.png                     # full-page at 390×844
├── dom.html                       # post-JS rendered HTML
├── computed-styles.desktop.json   # resolved CSS for canonical selectors
├── computed-styles.mobile.json    # same at mobile viewport
├── custom-properties.json         # every --css-var on :root and body
├── network.json                   # every URL the page loaded (status, type)
├── console.txt                    # console messages
└── interactions/                  # only if --interactions was passed
    ├── interactive-states.json    # base/hover/focus computed styles
    └── *-hover.png, *-focus.png   # element screenshots in each state
```

Plus a top-level `.capture/manifest.json` listing every page with its status (`ok`|`error`).

Use `--interactions` whenever the design system has interactive variants you need to capture (`-hover`, `-focus`, `-active`) — that's almost always.

#### 1c. Confirm capture and prepare for step 2

Read `.capture/manifest.json`. If any page reports `status: error`, decide whether to fix (longer `--timeout`, different URL, or a site-specific `--cookie`) or proceed without it. Open `desktop.png` and `mobile.png` for at least the homepage and the style guide (if any). If a cookie banner, modal, survey, age gate, newsletter prompt, or other overlay still covers the real page, re-run that URL with the correct `--cookie` values or a cleaner representative page; do not use overlay-obscured screenshots as design-system evidence unless the overlay is the design subject.

You now have the full raw material for steps 2 and 3. The browser is no longer needed — every subsequent step works against the JSON, HTML, and PNG files in `.capture/`.

### 2. Harvest raw style sources

The capture script has done most of this work. For each captured page, read artifacts in this priority order:

1. **`.capture/<page>/custom-properties.json`** — every `--*` var defined on `:root` or `body`. Tokens like `--color-primary`, `--font-display`, `--radius-sm`, `--space-md` map almost 1:1 to DESIGN.md tokens. **Start here.**
2. **`.capture/<page>/computed-styles.desktop.json`** and **`computed-styles.mobile.json`** — resolved CSS values for canonical selectors (`h1`–`h6`, `p`, `a`, `button`, `input`, `[class*=card]`, etc.) at each viewport. These are post-cascade, post-variable-resolution — no need to parse CSS files manually for typography, color, spacing, or radius. Cross-reference desktop vs mobile to detect responsive type-scale changes.
3. **`.capture/<page>/interactions/interactive-states.json`** — `base` / `hover` / `focus` computed styles for buttons and nav links. This is where component variants come from.
4. **Stylesheet URLs from `.capture/<page>/network.json`** (filter `resourceType: "stylesheet"`) — when you need values not exposed by getComputedStyle (e.g. raw `box-shadow` strings, `linear-gradient()` declarations, `@font-face` rules for the asset step). Collect URLs across all pages, dedupe, then `curl -sSL <url>` each unique stylesheet **once**.
5. **`.capture/<page>/desktop.png`** / **`mobile.png`** — color-pick when CSS values are obscured by build pipelines or use color-mix functions you can't compute by hand. Also your primary visual reference for prose grounding.

Convert all colors to `#`-prefixed sRGB hex (DESIGN.md spec requirement). Record `box-shadow` values in prose for the Elevation & Depth section — the spec has no shadow token.

### 3. Download brand assets

The DESIGN.md should be reproducible without the original site online. Download every asset that's needed to render the visual identity faithfully, into `<output-dir>/assets/` with the structure shown in **Output** above. The deep how-to (URL resolution, Google Fonts handling, edge cases) lives in [asset-download-guide.md](asset-download-guide.md) — open it before downloading.

What to download, in priority order:

1. **Fonts** — for every distinct `font-family` referenced by your typography tokens, download every weight/style actually used. Sources: `@font-face { src: url(...) }` in harvested CSS, Google Fonts (`fonts.googleapis.com` link → expand to `gstatic.com` woff2s), self-hosted font directories. Save under `assets/fonts/` with original filenames preserved when possible. Skip system stacks (`-apple-system`, `system-ui`, `serif`, etc.).
2. **Logos** — primary brand mark and any variants exposed in the markup (light/dark theme swap, square avatar, wordmark only). Sources: `<img>` and inline `<svg>` in `<header>` / `<nav>`, CSS `background-image` on logo containers, `<link rel="apple-touch-icon">`. Save under `assets/logos/` with descriptive names (`logo-primary.svg`, `logo-light.svg`, `wordmark.svg`).
3. **Icons** — the favicon family and any reusable iconography that is part of the design system. Sources: `<link rel="icon">`, `<link rel="apple-touch-icon-*">`, `manifest.json` icon array, SVG sprite sheets referenced by `<use href="…#id">`, inline `<svg>` icons that recur across components. Save under `assets/icons/`.

Do **not** download general content imagery (article photos, product photos, marketing heroes). Those are content, not design system. When in doubt, ask: *would a developer rebuilding the site from this DESIGN.md need this file?* If no, skip it.

After downloading, write `assets/MANIFEST.md` with one row per file: source URL, local path, size in bytes, sha256. This makes the asset bundle auditable and refreshable.

If a font is on a service that requires JavaScript or auth (Adobe Fonts / Typekit obfuscated URLs, Hatch, Monotype), do **not** scrape it. Record the service and the family name in `MANIFEST.md` under a `## Skipped` section with a one-line reason. The Typography prose should mention the licensing constraint.

### 4. Distill into the Google token schema

Map raw findings into the schema in [spec-reference.md](spec-reference.md). Key constraints:

- **`colors`** — at minimum define `primary`. Add `secondary`, `tertiary`, `neutral`, plus role-specific tokens (`surface`, `on-surface`, `error`) only when the site clearly uses them. Values are sRGB hex strings (e.g. `"#1A1C1E"`).
- **`typography`** — define 9–15 levels with semantic names. The recommended (non-normative) names from the spec are: `headline-display`, `headline-lg`, `headline-md`, `body-lg`, `body-md`, `body-sm`, `label-lg`, `label-md`, `label-sm`. Each entry uses the typed object shape (see spec-reference).
- **`rounded`** — use scale levels (`none`, `sm`, `md`, `lg`, `xl`, `full`). Values are Dimensions (`px` / `em` / `rem`).
- **`spacing`** — use the site's actual rhythm (commonly 4/8 or 8/16). `xs`, `sm`, `md`, `lg`, `xl`; add `gutter` / `margin` if the layout system uses them. Values are Dimensions or unitless numbers (e.g. column counts).
- **`components`** — define core atoms you observed (`button-primary`, `button-primary-hover`, `button-secondary`, `input`, `card`, `chip`, etc.). Use **token references** (`"{colors.primary}"`, `"{rounded.md}"`) instead of restating literals. Express variants as separate entries with related names (`-hover`, `-active`, `-pressed`, `-disabled`). Allowed properties per the spec: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`.

When uncertain, prefer **fewer, well-supported tokens** over a long invented list.

### 5. Write the prose

For each section you include, write 2–6 sentences of design rationale grounded in what you actually observed on the site. Prose may use descriptive color names (e.g. "Boston Clay") that map to systematic token names (e.g. `tertiary`). Avoid generic AI-flavored copy — name the brand feel, the typographic character, the density, the shape language.

When relevant, reference downloaded assets by relative path so the document is self-contained: e.g. *"Brand mark variants are stored in `assets/logos/`"* or *"All weights of Public Sans are bundled under `assets/fonts/` for offline use."*

### 6. Assemble the file

Start from [template.md](template.md). Strict requirements drawn from the spec:

- Front matter is fenced by `---` lines and is valid YAML.
- Sections use `##` headings. A single `#` heading is allowed for document titling but is not a parsed section.
- Sections appear in this canonical order, omitting any that don't apply:
  1. **Overview** (alias: "Brand & Style")
  2. **Colors**
  3. **Typography**
  4. **Layout** (alias: "Layout & Spacing")
  5. **Elevation & Depth** (alias: "Elevation")
  6. **Shapes**
  7. **Components**
  8. **Do's and Don'ts**
- No duplicate section headings (the linter rejects the file).
- Token references use `{path.to.token}` syntax and resolve to defined tokens.
- Color values are `#`-prefixed sRGB hex strings.
- Dimensions use `px`, `em`, or `rem`.
- `version: alpha` in the front matter is recommended but optional.

### 7. Validate

Run the official linter and treat its output as authoritative:

```bash
npx -y @google/design.md lint <output-file>
```

**Bar to clear: `errors: 0`** (exit code `0`). Warnings are guideposts — review each and decide:

| Finding | Severity | What to do |
|---|---|---|
| `broken-ref` | **error — must fix** | A `{...}` reference doesn't resolve. Fix the path or define the missing token. |
| `section-order` | warning — fix | Reorder `##` headings to match the canonical order above. |
| `missing-primary` | warning — fix | Add a `primary` color. |
| `missing-typography` | warning — usually fix | Add typography tokens. Suppress only if the site genuinely has no typographic identity. |
| `contrast-ratio` | warning — judgement | Below WCAG AA on a component pair. If the site really uses that contrast, leave it and call it out in Do's and Don'ts. Otherwise pick a different pair. |
| `orphaned-tokens` | warning — judgement | A defined color is never referenced from a component. Acceptable when the color is part of the documented palette but not used in any of the components you defined. Google's reference examples ship with many of these. |
| `missing-sections` | info | Add the optional section if it applies. |
| `token-summary` | info | Informational only. |

Report the linter's final summary back to the user, alongside:

- Path to `DESIGN.md`.
- Path to `assets/` and a one-line tally (`N fonts, M logos, K icons` plus any skipped families).
- Lint **errors** explicitly (must be 0), then warnings with a brief rationale for any you knowingly accepted.

## What this skill does NOT do

- Does not invent tokens that aren't observable on the live site.
- Does not import conventions from other DESIGN.md files (in this repo or elsewhere). The output is bound to the Google spec.
- Does not generate code (Tailwind config, CSS, component implementations). If the user wants those, run `npx -y @google/design.md export --format <css-tailwind|json-tailwind|dtcg> <file>` as a follow-up step.

## Reference files

- [spec-reference.md](spec-reference.md) — full Google DESIGN.md format spec, mirrored locally so the agent can consult it without a network call.
- [template.md](template.md) — empty DESIGN.md skeleton with sections in canonical order and front matter scaffolding.
- [scripts/capture.js](scripts/capture.js) + [scripts/README.md](scripts/README.md) — Playwright-based batch capturer used by step 1b. Agent-portable; depends only on Node + Playwright.
- [asset-download-guide.md](asset-download-guide.md) — deep how-to for step 3: detecting fonts (incl. Google Fonts expansion), logos, and icons; resolving relative URLs; writing `assets/MANIFEST.md`; common edge cases.
- [examples/](examples/) — three official Google Labs reference examples (`atmospheric-glass.md`, `paws-and-paths.md`, `totality-festival.md`), bundled byte-for-byte from upstream. Open one before assembling output to calibrate prose tone, section length, token-naming density, and component grouping. Provenance and refresh instructions are in [examples/README.md](examples/README.md). **Calibration only — never copy values, names, or prose into output for an unrelated site.**
