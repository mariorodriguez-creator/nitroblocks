# Asset Download Guide

Deep how-to for **step 3** of the [extract-design-system](SKILL.md) skill. Use this to download fonts, logos, and icons from a live site into `<output-dir>/assets/` so the resulting `DESIGN.md` is fully reproducible offline.

## Output structure (recap)

```text
<output-dir>/assets/
├── fonts/         # woff2 / woff / ttf — every font face actually used
├── logos/         # logo-primary.svg, logo-light.svg, logo-dark.svg, wordmark.svg, …
├── icons/         # favicon.ico, apple-touch-icon-*.png, icon-*.svg, sprite.svg, …
└── MANIFEST.md    # source URL → local path, size, sha256, per file
```

## URL resolution rules (apply everywhere)

When you find an asset URL, normalize it before downloading:

| URL form | Resolution |
|---|---|
| `https://cdn.example.com/x.woff2` | Use as-is. |
| `//cdn.example.com/x.woff2` | Prefix with `https:`. |
| `/static/x.woff2` | Resolve against the **page origin** (`https://www.site.com/static/x.woff2`). |
| `../fonts/x.woff2` (in CSS) | Resolve against the **stylesheet's URL**, not the page URL. This is the most common mistake. |
| `data:font/woff2;base64,…` | Decode and write the bytes; name the file from `font-family` + `font-weight`. |

For `curl`, default to `-sSL` (silent, show errors, follow redirects) and `-A "Mozilla/5.0"` to avoid bot blocks. For binary downloads, include `-o <path>`.

## 1. Fonts

### 1a. Self-hosted `@font-face` rules

Scan every harvested CSS file for `@font-face` blocks. Each block looks like:

```css
@font-face {
  font-family: "Public Sans";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/public-sans-v15-latin-regular.woff2") format("woff2"),
       url("/fonts/public-sans-v15-latin-regular.woff") format("woff");
}
```

For each block:

1. Extract `font-family`, `font-weight`, `font-style`.
2. Extract every `url(...)` entry. Prefer woff2 if multiple formats are listed (drop woff/ttf fallbacks once woff2 is downloaded — saves bytes).
3. Resolve each URL against the **stylesheet's** URL (see resolution table).
4. Download with `curl -sSL -A "Mozilla/5.0" -o assets/fonts/<filename> <url>`.
5. Preserve the original filename when possible. If the URL ends in a hash (`abc123.woff2`), rename to something readable: `<family-slug>-<weight>[-<style>].woff2`, e.g. `public-sans-400.woff2`, `public-sans-700-italic.woff2`.

Skip:

- System font stacks: `-apple-system`, `BlinkMacSystemFont`, `system-ui`, `Segoe UI`, `Roboto` (when bare, not under `@font-face`), `Helvetica`, `Arial`, `sans-serif`, `serif`, `monospace`.
- `font-family` declarations whose value never appears in any `@font-face` rule (likely a system-stack reference).
- Duplicate weights/styles.

### 1b. Google Fonts

Detect by either:

- A `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?…">` in the page HTML, **or**
- An `@import url("https://fonts.googleapis.com/css2?…")` inside any harvested CSS.

Two-step download:

1. Fetch the Google CSS URL with a real browser User-Agent so Google returns woff2 (without a UA it returns ttf):

   ```bash
   curl -sSL -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36" \
     "https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&display=swap" \
     > /tmp/google-font-resolved.css
   ```

2. Parse `@font-face` blocks from `/tmp/google-font-resolved.css` (each one points at a `https://fonts.gstatic.com/s/...woff2`) and download each woff2 to `assets/fonts/`.

   The filenames Google generates are content-hashed and unfriendly. Rename to `<family-slug>-<weight>[-<style>][-<unicode-range>].woff2`. Drop unicode-range subsets the site doesn't actually use (Latin Extended, Cyrillic, Vietnamese) unless the site is multi-language — keep only `latin` for English-only sites.

### 1c. Adobe Fonts (Typekit), Hatch, Monotype, other DRM-backed services

**Do not scrape.** These services obfuscate URLs, rotate them, and license per domain.

Record what you found in `MANIFEST.md` under `## Skipped` like:

```markdown
## Skipped

- **Adobe Fonts (Typekit) — kit `abc1def`**: licensed font service, files cannot be redistributed. Families used: Sofia Pro, Source Serif Pro. Replacement strategy: subscribe via Adobe Fonts, or substitute open alternatives (e.g. Sora, Source Serif 4).
```

Mention the constraint in the Typography prose of `DESIGN.md`.

### 1d. After downloading

Verify each font file is non-empty and the right magic bytes:

```bash
for f in assets/fonts/*.woff2; do printf "%s: " "$f"; head -c4 "$f" | xxd -p; done
# Expect: "wOF2" hex prefix = 774f4632
```

## 2. Logos

### 2a. Detection

Pull from `.capture/<page>/dom.html` (post-JS rendered HTML written by `scripts/capture.js`) and, if needed, the raw HTML via `curl -sSL <url>`:

- `<header>`, `<nav>`, or any element with class containing `logo`, `brand`, `wordmark`, `mark`, `site-title`.
- Inside those, look for: `<img src=…>`, inline `<svg>…</svg>`, `<picture>` with multiple `<source>` for theme variants, CSS `background-image` on a known logo container.
- `<link rel="apple-touch-icon">` and `<link rel="mask-icon">` in `<head>`.

### 2b. Theme variants

Many sites swap logos for dark mode. Check:

- `<picture><source media="(prefers-color-scheme: dark)" …></picture>`.
- CSS rules under `@media (prefers-color-scheme: dark) { .logo { background-image: url(…) } }`.
- Class-driven swaps: `.theme-dark .logo`, `[data-theme="dark"] .logo`.

If a dark variant exists, download it too.

### 2c. Filenames

Use descriptive, predictable names:

| File | What |
|---|---|
| `logo-primary.svg` | The default brand mark used in the header. |
| `logo-light.svg` | Light-on-dark variant (for dark backgrounds). |
| `logo-dark.svg` | Dark-on-light variant (for light backgrounds). |
| `wordmark.svg` | Text-only brand mark. |
| `monogram.svg` | Square / icon-only brand mark. |
| `apple-touch-icon.png` | iOS home-screen icon. |

Prefer SVG when available. If the original is an inline `<svg>…</svg>`, write the SVG markup verbatim to a `.svg` file (preserve `viewBox`, `width`, `height`).

## 3. Icons

### 3a. Favicon family

From the page `<head>`:

- `<link rel="icon" href="…">` (often `/favicon.ico`)
- `<link rel="icon" type="image/png" sizes="32x32" href="…">`
- `<link rel="apple-touch-icon" sizes="180x180" href="…">`
- `<link rel="manifest" href="…manifest.json">` — fetch the manifest, then download each entry from its `icons` array.

Save each with its size in the filename: `favicon-32.png`, `apple-touch-icon-180.png`, `android-chrome-192.png`, `android-chrome-512.png`, `favicon.ico`.

### 3b. SVG sprites

Look for `<use href="/path/sprite.svg#icon-name">` or `<use xlink:href="…#…">`. If found, download the sprite once to `assets/icons/sprite.svg` and list every `id` referenced from the page in `MANIFEST.md`.

### 3c. Inline SVG icon set

When the same `<svg>` icon recurs across the page (search/menu/close/chevron buttons, social links), it is part of the design system. Save each unique inline SVG to `assets/icons/icon-<name>.svg`. Names: derive from `aria-label`, surrounding `alt` text, or the closest descriptive class. Examples: `icon-search.svg`, `icon-menu.svg`, `icon-chevron-right.svg`, `icon-x.svg`, `icon-instagram.svg`.

Deduplicate by SVG content hash, not by filename.

### 3d. Icon fonts (Font Awesome, Material Icons, Bootstrap Icons)

If the site uses an icon font (you'll see CSS classes like `.fa-search`, `.material-icons`, plus a font file under `@font-face` you already downloaded in section 1), no extra work is needed — the font file is already in `assets/fonts/`. Note in `MANIFEST.md` which icon font is in use and the URL of any matching CSS (Font Awesome ships its own stylesheet).

## 4. MANIFEST.md format

Generate `assets/MANIFEST.md` after every download. Use this template:

```markdown
# Asset Manifest

Source: <https://www.site.com/>
Generated: <ISO-8601 timestamp>

## Fonts

| Local path | Source URL | Size | sha256 |
|---|---|---|---|
| assets/fonts/public-sans-400.woff2 | https://fonts.gstatic.com/s/publicsans/v15/…woff2 | 18432 | a1b2c3… |
| assets/fonts/public-sans-700.woff2 | https://fonts.gstatic.com/s/publicsans/v15/…woff2 | 18712 | d4e5f6… |

## Logos

| Local path | Source URL | Size | sha256 |
|---|---|---|---|
| assets/logos/logo-primary.svg | https://www.site.com/static/logo.svg | 4221 | … |

## Icons

| Local path | Source URL | Size | sha256 |
|---|---|---|---|
| assets/icons/favicon.ico | https://www.site.com/favicon.ico | 15086 | … |
| assets/icons/apple-touch-icon-180.png | https://www.site.com/apple-touch-icon.png | 11240 | … |
| assets/icons/icon-search.svg | inline (DOM #site-header svg.icon-search) | 318 | … |

## Skipped

- **Adobe Fonts (Typekit) — kit abc1def**: licensed; cannot be redistributed. Families: Sofia Pro, Source Serif Pro.
```

Quick way to compute size + sha256 in one shot:

```bash
for f in assets/fonts/* assets/logos/* assets/icons/*; do
  [ -f "$f" ] || continue
  printf "%-60s %10s  %s\n" "$f" "$(wc -c <"$f")" "$(shasum -a 256 "$f" | cut -d' ' -f1)"
done
```

## 5. Common edge cases

| Symptom | Likely cause | Fix |
|---|---|---|
| `403` from `curl` | Origin blocks non-browser UAs | Add `-A "Mozilla/5.0 …"` |
| Empty woff2 / 0 bytes | Followed an HTML redirect to a login page | Add `-L` (already in `-sSL`); inspect with `curl -I` to see the chain |
| Google CSS returns `format("truetype")` instead of woff2 | Default `curl` UA looks like a legacy browser | Use a Chrome UA string |
| Inline `<svg>` has no `xmlns` when written to file | Inline SVGs inherit the namespace from the HTML document | Add `xmlns="http://www.w3.org/2000/svg"` to the root `<svg>` before writing |
| Logo only appears via CSS pseudo-element | Look for `::before { background-image: url(…) }` on the logo class | |
| The site uses `<picture><source srcset="… 1x, … 2x">` | Take the highest-DPR variant | |
| Asset URL contains query string for cache-busting (`?v=hash`) | Strip the query in the local filename, keep it in the source URL column of MANIFEST | |

## 6. What NOT to download

- Hero / marketing photos.
- Article thumbnails, product photos, press images.
- Background videos (`<video>` sources).
- Tracking pixels, analytics beacons, ads.
- Fonts the site loads but never uses (some templates ship 6 weights and use 2 — only download the 2 actually applied to a token).

When in doubt, ask: *"would a developer rebuilding the site from this DESIGN.md need this file to match the visual identity?"* If no, skip.
