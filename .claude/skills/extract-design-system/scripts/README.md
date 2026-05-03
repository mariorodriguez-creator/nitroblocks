# scripts/capture.js

Playwright-based design system capture for the [extract-design-system](../SKILL.md) skill. Drives a headless Chromium across one or more URLs and writes structured artifacts to disk that the skill's later steps read with any standard file tool.

This script is **agent-agnostic**. It depends only on Node, Playwright, and curl — no MCP servers, no agent-specific tools.

## Install (one-time)

```bash
npm i -D playwright
npx playwright install chromium
```

The `chromium install` step downloads ~300 MB of browser binary into `~/Library/Caches/ms-playwright/` (macOS) or `~/.cache/ms-playwright/` (Linux). Skip if already present.

## Usage

```bash
node .claude/skills/extract-design-system/scripts/capture.js <url> [<url>...] [options]
```

### Options

| Flag | Default | Purpose |
|---|---|---|
| `--out <dir>` | `.capture` | Output directory. |
| `--interactions` | off | Also capture hover/focus states for buttons, nav links, and inputs. Adds an `interactions/` subfolder per page. |
| `--no-dismiss-overlays` | off | Disable the default pass that clicks or removes common cookie banners, consent managers, age/region interstitials, newsletter popups, surveys, and onload modals. |
| `--timeout <ms>` | `30000` | Per-page navigation timeout. |
| `--cookie name=val` | none | Pre-seed a cookie on the URL's domain. Repeatable. Use when a site needs a specific consent, age-gate, or region cookie to reveal page content. |
| `--help`, `-h` | — | Print help. |

### Example

```bash
node .claude/skills/extract-design-system/scripts/capture.js \
  https://www.example.com/ \
  https://www.example.com/blog/post-1 \
  https://www.example.com/products \
  https://www.example.com/contact \
  --out .capture \
  --interactions
```

Overlay dismissal is enabled by default. For a site that needs a known consent or age-gate cookie, add repeatable `--cookie` flags:

```bash
node .claude/skills/extract-design-system/scripts/capture.js \
  https://www.example.com/ \
  --out .capture \
  --interactions \
  --cookie OptanonConsent=accepted
```

## Output structure

```text
.capture/
├── manifest.json              # every page captured: url, slug, status, dir
└── <page-slug>/
    ├── desktop.png            # full-page screenshot at 1440×900
    ├── mobile.png             # full-page screenshot at 390×844
    ├── dom.html               # post-JS rendered HTML
    ├── computed-styles.desktop.json   # resolved CSS for canonical selectors
    ├── computed-styles.mobile.json    # same at mobile viewport
    ├── custom-properties.json # every --css-var on :root and body
    ├── network.json           # every response (URL, status, content-type)
    ├── console.txt            # console messages and pageerrors
    └── interactions/          # only if --interactions
        ├── interactive-states.json   # base/hover/focus computed styles
        ├── nav-link-hover.png
        ├── nav-link-focus.png
        ├── button-hover.png
        ├── button-focus.png
        └── …
```

## What it captures

### `computed-styles.{desktop,mobile}.json`

Resolved CSS values for the first 3 matches of these selectors (after the cascade and `:root` variables have been applied — no need to parse CSS files yourself):

```text
html, body
h1, h2, h3, h4, h5, h6
p, a, small, strong, em, blockquote, code, pre
ul li, ol li
button, [role="button"]
input[type="text"|"email"|"search"|"password"|"tel"|"url"], textarea, select, label
header, nav, main, footer, aside
[class*="btn"|"button"|"card"|"chip"|"input"|"field"|"badge"|"tag"|"pill"]
```

For each match it records the rendered values of: `color`, `background-color`, `background-image`, `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `font-style`, `text-transform`, `text-decoration`, `font-feature-settings`, `font-variation-settings`, `border-radius`, `border-width`, `border-color`, `border-style`, `padding(-*)`, `margin-top`, `margin-bottom`, `gap`, `box-shadow`, `opacity`, `width`, `height`, `min-height`, `max-width`. Each entry also includes a short `_text` excerpt and the element's `_classes` for disambiguation.

### `custom-properties.json`

Every CSS custom property (`--color-primary`, `--font-display`, `--radius-sm`, `--space-md`, …) defined on `:root` or `body`. Usually maps almost 1:1 to DESIGN.md tokens — this is the **first** thing to read in step 2.

### `network.json`

Every HTTP response the page made, with URL, status, content-type, and Playwright's resource-type label (`stylesheet`, `font`, `image`, `script`, …). Filter by resource-type to get the deduplicated list of CSS / font / image URLs the asset-download step needs.

### `interactions/interactive-states.json` (optional)

For nav links, buttons, and text inputs: `base`, `hover`, and `focus` computed-style snapshots side-by-side. Surfaces the `-hover` / `-focus` / `-active` component variants without needing to script the interaction yourself.

## Performance notes

- Each page takes roughly 5–15 seconds depending on network and JS-heaviness. A 6-URL run finishes in well under a minute on a warm browser.
- Stylesheets and fonts are fetched by the browser, not by this script — no extra HTTP traffic from the capture itself.
- Screenshots are full-page; for 10000 px tall pages they can reach a few MB. The `.capture/` directory is intended to be ephemeral; delete after the DESIGN.md is finalized unless you explicitly want to keep it.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module 'playwright'` | Not installed | `npm i -D playwright` |
| `Executable doesn't exist` from chromium.launch() | Browser binary missing | `npx playwright install chromium` |
| `Timeout 30000ms exceeded` | Slow page or `networkidle` never reached (long-poll, infinite scripts) | `--timeout 60000` |
| Capture run shows `status: error` for one URL but others succeed | Per-page failure isolated; manifest records the error | Inspect `manifest.json` → `error`; re-run just that URL |
| Cookie banner or modal covers the screenshot | Site forces a consent UI before content and the generic overlay pass did not match it | Re-run with the required `--cookie name=val`, or choose a cleaner representative page. Do not use overlay-obscured screenshots as design-system evidence unless the overlay itself is being documented |
| Some `computed-styles` values are `rgba(0,0,0,0)` | Element exists but isn't visible (e.g. mobile-only nav) | Cross-check the desktop vs mobile JSON; the visible viewport's value is the canonical one |

## Why this exists (vs invoking browser tools directly)

| Concern | Direct agent-tool calls (e.g. cursor's `browser_*`) | This script |
|---|---|---|
| **Portability across coding agents** | ❌ Tied to one agent's MCP set | ✅ Pure Node/Playwright |
| **Computed CSS values** | ❌ DOM only | ✅ `getComputedStyle()` per selector |
| **Looping over 3–6 pages** | Many tool calls per page, chatty, costs context | One process, in-memory loop |
| **Reproducibility** | Different runs may diverge | Deterministic |
| **Interactive states at scale** | Manual selector picking each time | Iterates over a known target list |

The skill ships this script so the capture step is a stable, auditable unit instead of a procedure the agent has to re-improvise on every run.
