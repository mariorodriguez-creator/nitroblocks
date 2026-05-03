#!/usr/bin/env node
// Playwright-based design system capture for the extract-design-system skill.
// Captures full-page screenshots, post-JS DOM, computed styles, CSS custom
// properties, and a network log for one or more URLs. Writes structured
// artifacts to <out>/<page-slug>/ that subsequent skill steps can read with
// any standard file-reading tool.

'use strict';

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (err) {
  console.error('extract-design-system/scripts/capture.js: Playwright is not installed.');
  console.error('Install with: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

const fs = require('fs').promises;
const path = require('path');

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Selectors whose computed styles ground the design tokens.
// First 3 matches per selector are captured.
const SELECTORS_OF_INTEREST = [
  'html', 'body',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'a', 'small', 'strong', 'em', 'blockquote', 'code', 'pre',
  'ul li', 'ol li',
  'button', '[role="button"]',
  'input[type="text"]', 'input[type="email"]', 'input[type="search"]',
  'input[type="password"]', 'input[type="tel"]', 'input[type="url"]',
  'textarea', 'select', 'label',
  'header', 'nav', 'main', 'footer', 'aside',
  '[class*="btn" i]', '[class*="button" i]', '[class*="card" i]',
  '[class*="chip" i]', '[class*="input" i]', '[class*="field" i]',
  '[class*="badge" i]', '[class*="tag" i]', '[class*="pill" i]',
];

const PROPS_OF_INTEREST = [
  'color', 'background-color', 'background-image',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
  'font-style', 'text-transform', 'text-decoration',
  'font-feature-settings', 'font-variation-settings',
  'border-radius', 'border-width', 'border-color', 'border-style',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-bottom', 'gap',
  'box-shadow', 'opacity',
  'width', 'height', 'min-height', 'max-width',
];

function slugify(url) {
  const u = new URL(url);
  let body = `${u.hostname}${u.pathname}`.replace(/\/+$/, '');
  let slug = body.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  if (!slug) slug = 'home';
  return slug;
}

async function captureViewport(page, viewport, outDir, name) {
  await page.setViewportSize(viewport);
  await page.evaluate(() => window.scrollTo(0, 0));
  // Wait for any responsive layout shifts and webfont swaps to settle.
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(300);

  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    fullPage: true,
  });

  const styles = await page.evaluate(
    ({ selectors, props }) => {
      const out = {};
      for (const selector of selectors) {
        let matches;
        try {
          matches = Array.from(document.querySelectorAll(selector));
        } catch {
          continue;
        }
        if (matches.length === 0) continue;
        out[selector] = matches.slice(0, 3).map((el) => {
          const cs = getComputedStyle(el);
          const result = {
            _text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
            _classes: el.className && typeof el.className === 'string'
              ? el.className.trim().slice(0, 120)
              : '',
          };
          for (const p of props) result[p] = cs.getPropertyValue(p).trim();
          return result;
        });
      }
      return out;
    },
    { selectors: SELECTORS_OF_INTEREST, props: PROPS_OF_INTEREST }
  );

  await fs.writeFile(
    path.join(outDir, `computed-styles.${name}.json`),
    JSON.stringify(styles, null, 2)
  );
}

async function captureCustomProperties(page, outDir) {
  const props = await page.evaluate(() => {
    function readVars(el) {
      const cs = getComputedStyle(el);
      const out = {};
      for (let i = 0; i < cs.length; i += 1) {
        const name = cs[i];
        if (name.startsWith('--')) out[name] = cs.getPropertyValue(name).trim();
      }
      return out;
    }
    const root = readVars(document.documentElement);
    const body = readVars(document.body);
    const merged = { ...root };
    for (const k of Object.keys(body)) if (!(k in merged)) merged[k] = body[k];
    return merged;
  });
  await fs.writeFile(
    path.join(outDir, 'custom-properties.json'),
    JSON.stringify(props, null, 2)
  );
}

async function captureInteractions(page, outDir) {
  const intDir = path.join(outDir, 'interactions');
  await fs.mkdir(intDir, { recursive: true });
  await page.setViewportSize(DESKTOP);

  const targets = [
    { selector: 'header nav a, nav a', name: 'nav-link' },
    { selector: 'button:not([disabled])', name: 'button' },
    { selector: '[class*="btn" i]:not([disabled])', name: 'btn-class' },
    { selector: 'a[class*="button" i]:not([disabled])', name: 'a-button-class' },
    { selector: 'input[type="text"], input[type="email"]', name: 'input-text' },
  ];

  const states = {};
  for (const { selector, name } of targets) {
    let el;
    try { el = await page.$(selector); } catch { continue; }
    if (!el) continue;
    const entry = {};
    try {
      const baseStyle = await el.evaluate((node, props) => {
        const cs = getComputedStyle(node);
        const o = {};
        for (const p of props) o[p] = cs.getPropertyValue(p).trim();
        return o;
      }, PROPS_OF_INTEREST);
      entry.base = baseStyle;

      await el.hover({ timeout: 2000 });
      await page.waitForTimeout(150);
      entry.hover = await el.evaluate((node, props) => {
        const cs = getComputedStyle(node);
        const o = {};
        for (const p of props) o[p] = cs.getPropertyValue(p).trim();
        return o;
      }, PROPS_OF_INTEREST);
      try {
        await el.screenshot({ path: path.join(intDir, `${name}-hover.png`) });
      } catch {}

      await el.focus({ timeout: 2000 });
      await page.waitForTimeout(150);
      entry.focus = await el.evaluate((node, props) => {
        const cs = getComputedStyle(node);
        const o = {};
        for (const p of props) o[p] = cs.getPropertyValue(p).trim();
        return o;
      }, PROPS_OF_INTEREST);
      try {
        await el.screenshot({ path: path.join(intDir, `${name}-focus.png`) });
      } catch {}

      await page.evaluate(() => document.body && document.body.focus && document.body.focus());
      await page.mouse.move(0, 0);
    } catch (err) {
      entry.error = err.message;
    }
    states[name] = entry;
  }
  await fs.writeFile(
    path.join(intDir, 'interactive-states.json'),
    JSON.stringify(states, null, 2)
  );
}

async function capturePage(browser, url, outRoot, opts) {
  const slug = slugify(url);
  const outDir = path.join(outRoot, slug);
  await fs.mkdir(outDir, { recursive: true });

  const context = await browser.newContext({
    viewport: DESKTOP,
    userAgent: UA,
    deviceScaleFactor: 1,
  });

  // Pre-seed cookies (e.g. age-gate dismissal) so the captured page renders
  // real content instead of a consent / age-gate modal.
  if (opts.cookies && opts.cookies.length) {
    const u = new URL(url);
    const domain = `.${u.hostname.replace(/^www\./, '')}`;
    const cookieJar = opts.cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain,
      path: '/',
    }));
    await context.addCookies(cookieJar);
  }

  const page = await context.newPage();

  const network = [];
  const consoleMessages = [];
  page.on('response', (res) => {
    network.push({
      url: res.url(),
      status: res.status(),
      contentType: (res.headers() && res.headers()['content-type']) || null,
      resourceType: res.request().resourceType(),
    });
  });
  page.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleMessages.push(`[pageerror] ${err.message}`));

  const result = { url, slug, dir: outDir, status: 'ok' };
  try {
    let resp;
    try {
      resp = await page.goto(url, { waitUntil: 'networkidle', timeout: opts.timeout });
    } catch (gotoErr) {
      // Some sites never reach networkidle (long-poll beacons, chat widgets,
      // analytics pings). Fall back to 'load' and let webfont/layout settle.
      if (/Timeout|networkidle/i.test(gotoErr.message)) {
        result.waitFallback = 'load';
        resp = await page.goto(url, { waitUntil: 'load', timeout: opts.timeout });
        // Give late JS a moment to render content.
        await page.waitForTimeout(2000);
      } else {
        throw gotoErr;
      }
    }
    if (resp && !resp.ok()) {
      result.httpStatus = resp.status();
    }

    await captureViewport(page, DESKTOP, outDir, 'desktop');
    await captureViewport(page, MOBILE, outDir, 'mobile');
    await page.setViewportSize(DESKTOP);
    await captureCustomProperties(page, outDir);

    const dom = await page.content();
    await fs.writeFile(path.join(outDir, 'dom.html'), dom);
    await fs.writeFile(
      path.join(outDir, 'network.json'),
      JSON.stringify(network, null, 2)
    );
    await fs.writeFile(path.join(outDir, 'console.txt'), consoleMessages.join('\n'));

    if (opts.interactions) {
      await captureInteractions(page, outDir);
    }
  } catch (err) {
    result.status = 'error';
    result.error = err.message;
  } finally {
    await context.close();
  }
  return result;
}

function printHelp() {
  console.log(`
Usage: node capture.js <url> [<url>...] [options]

Options:
  --out <dir>        Output directory (default: .capture)
  --interactions     Also capture hover/focus states for buttons, nav links,
                     and inputs (writes interactions/ subfolder per page).
  --timeout <ms>     Per-page navigation timeout (default: 30000).
  --cookie name=val  Pre-seed a cookie on the URL's domain. Repeatable.
                     Use to dismiss age gates, region pickers, or consent
                     banners that hide real content (e.g. tobacco/alcohol/
                     pharma sites). Domain is auto-set to .<hostname>.
  --help, -h         Show this help.

Per page output (.capture/<slug>/):
  desktop.png                    full-page screenshot at 1440x900
  mobile.png                     full-page screenshot at 390x844
  dom.html                       post-JS rendered HTML
  computed-styles.desktop.json   resolved CSS for canonical selectors at desktop
  computed-styles.mobile.json    same at mobile viewport
  custom-properties.json         every --css-var defined on :root and body
  network.json                   every response (URL, status, content-type, type)
  console.txt                    console messages and pageerrors

Top-level (.capture/manifest.json):
  Lists every page captured with status (ok|error) and output dir.
`);
}

async function main() {
  const args = process.argv.slice(2);
  const urls = [];
  let outRoot = '.capture';
  let interactions = false;
  let timeout = 30000;
  const cookies = [];

  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--out') { outRoot = args[++i]; continue; }
    if (a === '--interactions') { interactions = true; continue; }
    if (a === '--timeout') { timeout = parseInt(args[++i], 10) || 30000; continue; }
    if (a === '--cookie') {
      const raw = args[++i] || '';
      const eq = raw.indexOf('=');
      if (eq > 0) cookies.push({ name: raw.slice(0, eq), value: raw.slice(eq + 1) });
      continue;
    }
    if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
    if (/^https?:\/\//i.test(a)) { urls.push(a); continue; }
    console.error(`Unknown argument: ${a}`);
    printHelp();
    process.exit(1);
  }

  if (urls.length === 0) {
    printHelp();
    process.exit(1);
  }

  await fs.mkdir(outRoot, { recursive: true });
  const browser = await chromium.launch();
  const manifest = {
    capturedAt: new Date().toISOString(),
    options: { interactions, timeout, viewport: { desktop: DESKTOP, mobile: MOBILE } },
    pages: [],
  };

  for (const url of urls) {
    process.stderr.write(`capture: ${url} ... `);
    const result = await capturePage(browser, url, outRoot, { interactions, timeout, cookies });
    process.stderr.write(`${result.status}${result.error ? ` (${result.error})` : ''}\n`);
    manifest.pages.push(result);
  }

  await browser.close();
  await fs.writeFile(
    path.join(outRoot, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
