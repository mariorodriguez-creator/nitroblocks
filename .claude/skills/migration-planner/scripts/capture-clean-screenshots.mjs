#!/usr/bin/env node
/**
 * Clean per-template full-page screenshots with cookie bypass + widget hiding.
 *
 * Based on the proven approach from zonnic-ds/scripts/capture-screenshots.mjs:
 *   - Inject bypass cookies so age gates / consent modals never render
 *   - Inject CSS to hide third-party widgets (OneTrust, Qualtrics, etc.)
 *   - Use domcontentloaded + explicit waits (NOT networkidle — long-poll
 *     trackers prevent it from ever firing)
 *   - Scroll to trigger lazy loaders, then scroll back to top
 *   - Capture at 3 viewports with retina scale
 *
 * This complements designlang's `--screenshots` flag:
 *   - designlang writes component-level crops + one homepage `full-page.png`
 *     to `design-extract/screenshots/` (its native location)
 *   - this script writes per-template × per-viewport full-page captures
 *     to `design-extract/screenshots/templates/` (kept separate so
 *     designlang's internal manifest paths in `*-screenshots.json` remain
 *     valid and the two sources never collide on filenames)
 *
 * Usage:
 *   node capture-clean-screenshots.mjs <url> \
 *     --bypass-file ./migration-work/bypass-result.json \
 *     --pages-file ./migration-work/sitemap-result.json \
 *     --output-dir ./migration-work/design-extract/screenshots/templates
 *
 * Or with explicit cookies/selectors:
 *   node capture-clean-screenshots.mjs <url> \
 *     --cookie "age_verify=confirmed" \
 *     --hide "#onetrust-banner-sdk" \
 *     --output-dir ./migration-work/design-extract/screenshots/templates
 */

import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const BASE_URL_ARG = args.find((a) => !a.startsWith('--'));

function getFlag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}

function getAllFlags(name) {
  const values = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === name && args[i + 1]) values.push(args[i + 1]);
  }
  return values;
}

if (!BASE_URL_ARG) {
  console.error(
    'Usage: node capture-clean-screenshots.mjs <url> [--bypass-file <path>] [--pages-file <path>] [--output-dir <dir>]',
  );
  process.exit(1);
}

const BYPASS_FILE = getFlag('--bypass-file');
const PAGES_FILE = getFlag('--pages-file');
const OUTPUT_DIR =
  getFlag('--output-dir') || './migration-work/design-extract/screenshots/templates';
const EXPLICIT_COOKIES = getAllFlags('--cookie');
const EXPLICIT_HIDE = getAllFlags('--hide');

// ---------------------------------------------------------------------------
// Viewports — mobile-first + 3 breakpoints
// ---------------------------------------------------------------------------

const VIEWPORTS = [
  { label: 'mobile', width: 375, height: 812 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1440, height: 900 },
];

// Filename traceability: suffix each screenshot with the actual pixel width
// so humans and downstream scripts don't need to guess what "mobile" means.
function filenameFor(slug, viewport) {
  return `${slug}-${viewport.label}-${viewport.width}.png`;
}

// ---------------------------------------------------------------------------
// Load config from bypass-result.json and sitemap-result.json
// ---------------------------------------------------------------------------

async function loadBypassConfig() {
  const cookies = [];
  const hideSelectors = [];

  if (BYPASS_FILE) {
    try {
      const raw = await readFile(BYPASS_FILE, 'utf-8');
      const data = JSON.parse(raw);

      // Prefer the storageState JSON (bypass_cookies_full has the correct
      // domain per cookie — host-only vs subdomain-wildcard — which matters
      // for sites like zonnic.ca that set age_verify on www.zonnic.ca
      // (host-only) rather than .zonnic.ca.
      for (const c of data.bypass_cookies_full || []) {
        cookies.push({
          name: c.name,
          value: c.value,
          domain: c.domain || new URL(BASE_URL_ARG).hostname,
          path: c.path || '/',
          expires: c.expires ?? -1,
          httpOnly: c.httpOnly ?? false,
          secure: c.secure ?? false,
          sameSite: c.sameSite || 'Lax',
        });
      }
      hideSelectors.push(...(data.hide_css_selectors || []));
    } catch (err) {
      process.stderr.write(
        `[capture] Warning: could not read bypass file: ${err.message}\n`,
      );
    }
  }

  for (const c of EXPLICIT_COOKIES) {
    const [name, ...rest] = c.split('=');
    cookies.push({
      name,
      value: rest.join('='),
      domain: new URL(BASE_URL_ARG).hostname,
      path: '/',
    });
  }

  hideSelectors.push(...EXPLICIT_HIDE);
  return { cookies, hideSelectors: [...new Set(hideSelectors)] };
}

async function loadPages() {
  const pages = [];
  const parsedBase = new URL(BASE_URL_ARG);

  // Always include the base URL as "homepage"
  pages.push({ slug: 'homepage', url: BASE_URL_ARG });

  if (PAGES_FILE) {
    try {
      const raw = await readFile(PAGES_FILE, 'utf-8');
      const data = JSON.parse(raw);
      for (const url of data.representative_urls || []) {
        const p = new URL(url);
        const relative = p.pathname
          .slice((data.base_path || '').length)
          .replace(/^\//, '');
        if (!relative) continue; // skip homepage duplicate
        const slug = relative.replace(/\//g, '-') || 'page';
        pages.push({ slug, url });
      }
    } catch (err) {
      process.stderr.write(
        `[capture] Warning: could not read pages file: ${err.message}\n`,
      );
    }
  }

  return pages;
}

// ---------------------------------------------------------------------------
// Capture
// ---------------------------------------------------------------------------

async function capturePage(context, hideCSS, { slug, url }) {
  for (const viewport of VIEWPORTS) {
    const page = await context.newPage();
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    process.stderr.write(
      `  ${slug} @ ${viewport.label.padEnd(7)} (${viewport.width}x${viewport.height}) ... `,
    );

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (err) {
      process.stderr.write(`skip (${err.message.split('\n')[0]})\n`);
      await page.close();
      continue;
    }

    // Apply hide CSS after navigation
    await page.addStyleTag({ content: hideCSS }).catch(() => {});

    // Wait for page to settle (images, stylesheets, component hydration)
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);

    // Scroll to trigger lazy loaders
    await page.evaluate(async () => {
      const distance = 400;
      for (let y = 0; y <= document.body.scrollHeight; y += distance) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    const filename = filenameFor(slug, viewport);
    const filepath = resolve(OUTPUT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });

    process.stderr.write(`${filename}\n`);
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const { cookies, hideSelectors } = await loadBypassConfig();
  const pages = await loadPages();

  const hideCSS =
    hideSelectors.length > 0
      ? `${hideSelectors.join(', ')} { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }`
      : '';

  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    deviceScaleFactor: 2, // retina for review
  });

  if (cookies.length > 0) {
    await context.addCookies(cookies);
    process.stderr.write(
      `[capture] Cookies applied: ${cookies.map((c) => c.name).join(', ')}\n`,
    );
  }

  process.stderr.write(`[capture] Output: ${OUTPUT_DIR}\n`);
  process.stderr.write(
    `[capture] ${pages.length} pages x ${VIEWPORTS.length} viewports\n\n`,
  );

  for (const pg of pages) {
    process.stderr.write(`[${pg.slug}] ${pg.url}\n`);
    await capturePage(context, hideCSS, pg);
    process.stderr.write('\n');
  }

  await browser.close();
  process.stderr.write(
    `[capture] Done. ${pages.length} pages x ${VIEWPORTS.length} viewports.\n`,
  );
}

main().catch((err) => {
  console.error('[capture] Failed:', err);
  process.exit(1);
});
