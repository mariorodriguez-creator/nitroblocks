#!/usr/bin/env node

/**
 * Full Site Offline Mirror
 *
 * Creates a fully functional offline copy of a website: crawls all pages,
 * captures every asset (CSS, JS, images, fonts, media, etc.) via Playwright
 * network interception, mirrors the directory structure, and rewrites all
 * internal URLs to relative paths so the site works without a server.
 *
 * Usage:
 *   node mirror-site.js <url> [options]
 *
 * Requirements:
 *   cd .claude/skills/scrape-site/scripts && npm install
 *   npx playwright install chromium
 */

import { PlaywrightCrawler, Configuration } from 'crawlee';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resource types to capture.
// fetch/xhr are included so JSON API responses (e.g. content lists, filters) are saved
// locally — the page's own JS then fetches them from the local server unchanged.
const CAPTURE_TYPES = new Set([
  'document', 'stylesheet', 'script', 'image', 'media',
  'font', 'manifest', 'other', 'texttrack', 'eventsource',
  'fetch', 'xhr',
]);

// ---------------------------------------------------------------------------
// Cookie consent management (CMP) domain blocklist
//
// Requests to these domains are aborted before they load. This prevents the
// CMP JavaScript from executing entirely, so no cookie banner is ever injected
// into the DOM — no click-to-dismiss or post-processing needed.
//
// Self-hosted CMPs (rare) are caught by the heuristic DOM removal fallback.
// ---------------------------------------------------------------------------
const CMP_BLOCK_DOMAINS = [
  'cookiereports.com',           // CookieReports
  'cdn.cookielaw.org',           // OneTrust
  'optanon.blob.core.windows',   // OneTrust (CDN variant)
  'geolocation.onetrust.com',    // OneTrust geolocation
  'consent.cookiebot.com',       // Cookiebot
  'consentcdn.cookiebot.com',    // Cookiebot CDN
  'cookie-cdn.cookiepro.com',    // CookiePro
  'cdn.cookie-script.com',       // Cookie-Script
  'cdn.trustarc.com',            // TrustArc
  'consent.trustarc.com',        // TrustArc consent
  'sourcepoint.com',             // SourcePoint
  'quantcast.mgr.consensu',      // Quantcast
  'cmpv2.quantcast.com',         // Quantcast v2
  'evidon.com',                  // Evidon
  'cookiehub.net',               // CookieHub
  'app.termly.io',               // Termly
  'cdn.iubenda.com',             // Iubenda
  'privacymanager.io',           // Usercentrics
  'app.usercentrics.eu',         // Usercentrics EU
  'cdn.privacy-mgmt.com',        // SourcePoint CDN
  'consentframework.com',        // Generic
  'cookieconsent.insites.com',   // Cookie Consent (osano)
  'cdn.osano.com',               // Osano
];

const CMP_BLOCK_RE = new RegExp(
  CMP_BLOCK_DOMAINS.map((d) => d.replace(/\./g, '\\.').replace(/\//g, '\\/')).join('|'),
  'i',
);

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    url: null,
    output: './scrape',
    maxPages: 0,
    excludePatterns: [],
    excludeExts: [],     // file extensions to skip (e.g. 'pdf', 'zip')
    concurrency: 3,
    externalAssets: false,
    sitemap: null,       // explicit sitemap URL to seed from
    scroll: true,        // scroll to bottom to trigger lazy-loaded content
    loadMore: true,      // click "load more" / pagination buttons
    scrollDelay: 400,    // ms to wait between scroll steps
    loadMoreLimit: 20,   // max "load more" clicks per page
    navigationTimeout: 120, // seconds to wait for page navigation
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') { printHelp(); process.exit(0); }
    else if (!arg.startsWith('--')) { opts.url = arg; }
    else if (arg === '--output' && args[i + 1]) { opts.output = args[++i]; }
    else if (arg === '--max-pages' && args[i + 1]) { opts.maxPages = parseInt(args[++i], 10); }
    else if (arg === '--exclude' && args[i + 1]) { opts.excludePatterns.push(args[++i]); }
    else if (arg === '--exclude-ext' && args[i + 1]) { opts.excludeExts.push(...args[++i].split(',').map((e) => e.trim().replace(/^\./, ''))); }
    else if (arg === '--concurrency' && args[i + 1]) { opts.concurrency = parseInt(args[++i], 10); }
    else if (arg === '--external-assets') { opts.externalAssets = true; }
    else if (arg === '--sitemap' && args[i + 1]) { opts.sitemap = args[++i]; }
    else if (arg === '--no-scroll') { opts.scroll = false; }
    else if (arg === '--no-load-more') { opts.loadMore = false; }
    else if (arg === '--scroll-delay' && args[i + 1]) { opts.scrollDelay = parseInt(args[++i], 10); }
    else if (arg === '--load-more-limit' && args[i + 1]) { opts.loadMoreLimit = parseInt(args[++i], 10); }
    else if (arg === '--navigation-timeout' && args[i + 1]) { opts.navigationTimeout = parseInt(args[++i], 10); }
  }

  return opts;
}

function printHelp() {
  process.stdout.write(`
Usage: node mirror-site.js <url> [options]

Creates a fully functional offline copy of a website.
All pages are crawled, all assets are downloaded, and internal URLs are
rewritten to relative paths so the site works without a server.

Link discovery:
  --sitemap <url>       Seed the crawl from a sitemap URL (or auto-detected via robots.txt)
  --no-scroll           Disable scroll-to-bottom for lazy-loaded content
  --no-load-more        Disable auto-clicking "Load More" / pagination buttons
  --scroll-delay <ms>        Delay between scroll steps (default: 400ms)
  --load-more-limit <n>      Max "load more" clicks per page (default: 20)
  --navigation-timeout <sec> Seconds to wait for page load (default: 120)

General:
  --output <dir>        Output directory (default: ./scrape)
  --max-pages <n>       Stop after n HTML pages (default: unlimited)
  --exclude <pattern>   Skip URLs matching this regex pattern (repeatable)
  --exclude-ext <exts>  Skip URLs ending in these file extensions (comma-separated, e.g. "pdf,zip,xlsx")
  --concurrency <n>     Parallel browser pages (default: 3)
  --external-assets     Also download CSS/JS/images from external domains

Output:
  <output>/<hostname>/
    mirror-index.json   Summary of all crawled pages and resources
    index.html          Homepage
    about/index.html    /about page
    styles/main.css     Stylesheet (URL references rewritten)
    images/logo.png     Image
    ...

To browse offline:
  npx serve <output>/<hostname>    (recommended — proper MIME types)
  open <output>/<hostname>/index.html

Examples:
  node mirror-site.js "https://example.com"
  node mirror-site.js "https://example.com" --output ./scrape --max-pages 200
  node mirror-site.js "https://example.com" --exclude "/blog" --concurrency 5
  node mirror-site.js "https://example.com" --exclude-ext "pdf,zip,xlsx"
  node mirror-site.js "https://example.com" --external-assets
  node mirror-site.js "https://example.com" --sitemap "https://example.com/sitemap.xml"
`);
}

// ---------------------------------------------------------------------------
// Exclude helpers
// ---------------------------------------------------------------------------

/**
 * Build the combined list of RegExps used to skip URLs during crawling.
 * Merges --exclude regex patterns with --exclude-ext extension patterns.
 */
function buildExcludeRegexps(opts) {
  const regexps = opts.excludePatterns.map((p) => new RegExp(p));
  if (opts.excludeExts.length > 0) {
    const extPattern = `\\.(${opts.excludeExts.map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(\\?|#|$)`;
    regexps.push(new RegExp(extPattern, 'i'));
  }
  return regexps;
}

// ---------------------------------------------------------------------------
// Sitemap helpers
// ---------------------------------------------------------------------------

/**
 * Fetch and parse a sitemap XML (including sitemap index files that
 * reference child sitemaps). Returns a flat array of page URLs.
 */
async function fetchSitemapUrls(sitemapUrl, visited = new Set()) {
  if (visited.has(sitemapUrl)) return [];
  visited.add(sitemapUrl);

  let xml;
  try {
    const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  const urls = [];

  // Sitemap index — recurse into child sitemaps
  const childSitemaps = [...xml.matchAll(/<sitemap>[\s\S]*?<loc>\s*([^<]+)\s*<\/loc>/gi)]
    .map((m) => m[1].trim());

  if (childSitemaps.length > 0) {
    for (const child of childSitemaps) {
      const childUrls = await fetchSitemapUrls(child, visited);
      urls.push(...childUrls);
    }
    return urls;
  }

  // Regular sitemap — collect <loc> entries
  const locs = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
    .map((m) => m[1].trim());
  urls.push(...locs);

  return urls;
}

/**
 * Try to discover a sitemap URL from robots.txt. Returns null if not found.
 */
async function discoverSitemapFromRobots(baseUrl) {
  const robotsUrl = new URL('/robots.txt', baseUrl).href;
  try {
    const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const text = await res.text();
    const match = text.match(/^Sitemap:\s*(.+)$/mi);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// URL → local path mapping
// ---------------------------------------------------------------------------

/**
 * Convert an absolute URL to a local filesystem path relative to siteDir.
 *
 * Rules:
 *   HTML documents  → <pathname>/index.html  (normalizes /about, /about/, /about.html → about/index.html)
 *   All other files → mirror the URL path exactly (strip query string if present)
 */
function urlToLocalPath(absoluteUrl, contentType = '') {
  const u = new URL(absoluteUrl);
  let p = decodeURIComponent(u.pathname);

  const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml');
  const ext = path.posix.extname(p).toLowerCase();
  const isHtmlExt = ['.html', '.htm', '.php', '.asp', '.aspx', '.jsp', '.cfm'].includes(ext);

  if (isHtml || isHtmlExt || ext === '') {
    // Normalize to <path>/index.html
    p = p.replace(/\.(html?|php|aspx?|jsp|cfm)$/i, '');
    p = (p.replace(/\/+$/, '') || '') + '/index.html';
  } else if (u.search) {
    // Non-HTML asset with query string: embed a short hash to keep path unique
    const hash = Buffer.from(u.search).toString('base64url').substring(0, 8);
    const fileExt = path.posix.extname(p);
    const base = p.slice(0, p.length - fileExt.length);
    p = `${base}__${hash}${fileExt}`;
  }

  // Strip leading slash and collapse double slashes
  return p.replace(/^\/+/, '').replace(/\/{2,}/g, '/');
}

// ---------------------------------------------------------------------------
// URL rewriting helpers
// ---------------------------------------------------------------------------

/**
 * Given a raw URL found in content, resolve it to a local relative path.
 * Returns null if the URL isn't in the resourceMap (not downloaded).
 */
function resolveToRelative(rawUrl, fromLocalPath, fromOriginalUrl, resourceMap) {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();

  // Skip non-resolvable values
  if (
    trimmed.startsWith('data:')
    || trimmed.startsWith('#')
    || trimmed.startsWith('mailto:')
    || trimmed.startsWith('tel:')
    || trimmed.startsWith('javascript:')
    || trimmed === ''
  ) return null;

  let absoluteUrl;
  try { absoluteUrl = new URL(trimmed, fromOriginalUrl).href; } catch { return null; }

  const fragment = absoluteUrl.includes('#') ? `#${absoluteUrl.split('#')[1]}` : '';
  const withoutFragment = absoluteUrl.split('#')[0];

  const localTarget = resourceMap.get(withoutFragment);
  if (!localTarget) return null;

  const rel = path.posix.relative(path.posix.dirname(fromLocalPath), localTarget);
  const relUrl = rel.startsWith('.') ? rel : `./${rel}`;
  return relUrl + fragment;
}

/**
 * Rewrite all URL attributes in an HTML string.
 */
function rewriteHtml(content, fromLocalPath, fromOriginalUrl, resourceMap) {
  // Standard URL attributes
  content = content.replace(
    /\b(href|src|action|data-src|data-href|poster|srcset|data-srcset|content)\s*=\s*(["'])([^"']*)\2/gi,
    (match, attr, quote, urlVal) => {
      const a = attr.toLowerCase();

      if (a === 'srcset' || a === 'data-srcset') {
        // "img.jpg 320w, img2.jpg 640w" format
        const rewritten = urlVal.split(',').map((part) => {
          const pieces = part.trim().split(/\s+/);
          const srcUrl = pieces[0];
          const descriptor = pieces.slice(1).join(' ');
          const local = resolveToRelative(srcUrl, fromLocalPath, fromOriginalUrl, resourceMap);
          return (local || srcUrl) + (descriptor ? ` ${descriptor}` : '');
        }).join(', ');
        return `${attr}=${quote}${rewritten}${quote}`;
      }

      // <meta property="og:image" content="..."> — only rewrite if it's a URL
      if (a === 'content' && !urlVal.startsWith('http') && !urlVal.startsWith('/')) {
        return match;
      }

      const local = resolveToRelative(urlVal, fromLocalPath, fromOriginalUrl, resourceMap);
      return local ? `${attr}=${quote}${local}${quote}` : match;
    },
  );

  // Inline <style> blocks
  content = content.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match, open, css, close) => open + rewriteCss(css, fromLocalPath, fromOriginalUrl, resourceMap) + close,
  );

  return content;
}

/**
 * Rewrite url() references in a CSS string.
 */
function rewriteCss(content, fromLocalPath, fromOriginalUrl, resourceMap) {
  return content.replace(
    /url\(\s*(["']?)([^"')]+)\1\s*\)/gi,
    (match, quote, urlVal) => {
      const local = resolveToRelative(urlVal.trim(), fromLocalPath, fromOriginalUrl, resourceMap);
      return local ? `url(${quote}${local}${quote})` : match;
    },
  );
}

// ---------------------------------------------------------------------------
// Page interaction helpers
// ---------------------------------------------------------------------------

/**
 * Scroll the page to the bottom in steps, waiting between each step to
 * trigger IntersectionObserver-based lazy loading and infinite scroll.
 * Returns once the page height stops growing.
 */
async function scrollToBottom(page, stepPx = 600, delayMs = 400, maxSecs = 30) {
  await page.evaluate(async (params) => {
    const { stepPx: step, delayMs: delay, maxMs } = params;
    await new Promise((resolve) => {
      let lastHeight = 0;
      let stalledCount = 0;
      const MAX_STALLED = 3;
      const deadline = Date.now() + maxMs;

      const tick = () => {
        // Hard time cap — prevents infinite scroll pages from looping forever
        if (Date.now() >= deadline) { resolve(); return; }

        window.scrollBy(0, step);
        const newHeight = document.documentElement.scrollHeight;

        if (newHeight === lastHeight) {
          stalledCount++;
          if (stalledCount >= MAX_STALLED) { resolve(); return; }
        } else {
          stalledCount = 0;
          lastHeight = newHeight;
        }

        setTimeout(tick, delay);
      };

      setTimeout(tick, delay);
    });
  }, { stepPx, delayMs, maxMs: maxSecs * 1000 });

  // Scroll back to top so the final captured HTML is in a natural state
  await page.evaluate(() => window.scrollTo(0, 0));
}

/**
 * Fallback cookie banner cleanup — runs after the page is loaded.
 *
 * Most CMPs are handled by network blocking (CMP_BLOCK_RE) so their scripts
 * never execute and no banner appears. This fallback catches the rare case of
 * a self-hosted CMP or one not yet in the blocklist.
 *
 * Strategy: find fixed-position, high-z-index elements that contain
 * cookie/consent keywords and remove them from the DOM.
 */
async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    // Heuristic removal: fixed/sticky position + z-index ≥ 999 + cookie keywords
    const vw = window.innerWidth || 1280;
    const vh = window.innerHeight || 800;
    const viewportArea = vw * vh;

    for (const el of [...document.querySelectorAll('body *')]) {
      try {
        const style = window.getComputedStyle(el);
        if (style.position !== 'fixed' && style.position !== 'sticky') continue;
        if (isNaN(parseInt(style.zIndex, 10)) || parseInt(style.zIndex, 10) < 999) continue;
        const rect = el.getBoundingClientRect();
        if ((rect.width * rect.height) / viewportArea < 0.1) continue;
        const sig = `${el.id} ${el.className} ${(el.textContent || '').slice(0, 300)}`.toLowerCase();
        if (/cookie|consent|gdpr|ccpa|privacy notice|we use/.test(sig)) el.remove();
      } catch { /* ignore */ }
    }

    // Unlock body scroll that some CMPs apply
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });
}

/**
 * Click "Load More" / "Next page" style buttons/links repeatedly until
 * none are left or the limit is reached.
 *
 * Looks for common patterns:
 *   - Buttons/links whose visible text matches load-more keywords
 *   - Elements with data-* attributes indicating pagination
 *   - <a rel="next"> links
 */
async function clickLoadMore(page, limitClicks = 20, delayMs = 1200) {
  const LOAD_MORE_SELECTORS = [
    // rel="next" pagination links
    'a[rel="next"]',
    // Common "load more" button patterns (case-insensitive text match handled in JS below)
    '[data-load-more]',
    '[data-action="load-more"]',
    '[data-testid*="load-more"]',
    '[class*="load-more"]',
    '[class*="loadmore"]',
    '[class*="show-more"]',
    '[aria-label*="load more" i]',
    '[aria-label*="show more" i]',
  ];

  // Text-based fallback — match button/link text
  const LOAD_MORE_TEXT_RE = /^\s*(load\s+more|show\s+more|view\s+more|next\s+page|next|more\s+results?|see\s+more)\s*$/i;

  let clicks = 0;

  for (let attempt = 0; attempt < limitClicks; attempt++) {
    // Wait for potential dynamic rendering after last click
    await page.waitForTimeout(delayMs);

    // Try selector-based matches first
    let clicked = false;
    for (const sel of LOAD_MORE_SELECTORS) {
      try {
        const el = await page.$(sel);
        if (el && await el.isVisible()) {
          await el.scrollIntoViewIfNeeded();
          await el.click();
          clicks++;
          clicked = true;
          break;
        }
      } catch { /* element may have disappeared */ }
    }

    if (!clicked) {
      // Text-based fallback
      try {
        const found = await page.evaluate((textRe) => {
          const re = new RegExp(textRe, 'i');
          const candidates = [...document.querySelectorAll('button, a, [role="button"]')];
          for (const el of candidates) {
            const text = el.textContent?.trim() || '';
            const visible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
            if (visible && re.test(text)) {
              el.scrollIntoView({ behavior: 'instant', block: 'center' });
              el.click();
              return true;
            }
          }
          return false;
        }, LOAD_MORE_TEXT_RE.source);

        if (found) {
          clicks++;
          clicked = true;
        }
      } catch { /* ignore */ }
    }

    if (!clicked) break; // No more load-more buttons found
  }

  return clicks;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv);

  if (!opts.url) { printHelp(); process.exit(1); }

  let startUrl;
  try { startUrl = new URL(opts.url); } catch {
    process.stderr.write(`Invalid URL: ${opts.url}\n`);
    process.exit(1);
  }

  const hostname = startUrl.hostname;
  const siteDir = path.resolve(opts.output, hostname);
  const crawleeStorageDir = path.join(siteDir, '.crawlee');
  fs.mkdirSync(siteDir, { recursive: true });

  const config = new Configuration({ storageDir: crawleeStorageDir });

  // resourceMap: absolute URL (no fragment) → local path relative to siteDir
  const resourceMap = new Map();
  // htmlFiles / cssFiles: local path → original absolute URL (for rewriting pass)
  const htmlFiles = new Map();
  const cssFiles = new Map();
  // savedUrls: normalized URLs already queued for saving (prevents duplicates)
  const savedUrls = new Set();
  const crawledPages = [];
  const startTime = Date.now();

  process.stdout.write(`🌐 Mirroring: ${opts.url}\n`);
  process.stdout.write(`📁 Output:   ${siteDir}\n`);
  process.stdout.write(`⚙️  Concurrency: ${opts.concurrency}${opts.externalAssets ? ' · including external assets' : ''}\n`);
  if (opts.scroll) process.stdout.write(`📜 Scroll-to-bottom: enabled (delay: ${opts.scrollDelay}ms)\n`);
  if (opts.loadMore) process.stdout.write(`🔁 Load-more clicking: enabled (limit: ${opts.loadMoreLimit} clicks/page)\n`);
  if (opts.maxPages > 0) process.stdout.write(`🔢 Max pages: ${opts.maxPages}\n`);
  process.stdout.write('\n');

  // -------------------------------------------------------------------------
  // Sitemap seed discovery
  // -------------------------------------------------------------------------
  let seedUrls = [opts.url];
  let sitemapSource = null;
  let sitemapPageCount = 0; // total pages from sitemap (used for ETA progress)

  if (opts.sitemap) {
    sitemapSource = opts.sitemap;
  } else {
    // Auto-detect from robots.txt
    const discovered = await discoverSitemapFromRobots(opts.url);
    if (discovered) sitemapSource = discovered;
  }

  if (sitemapSource) {
    process.stdout.write(`🗺️  Loading sitemap: ${sitemapSource}\n`);
    const sitemapUrls = await fetchSitemapUrls(sitemapSource);

    const excludeRegexps = buildExcludeRegexps(opts);
    const filtered = sitemapUrls.filter((u) => {
      try {
        const parsed = new URL(u);
        if (parsed.hostname !== hostname) return false;
        return !excludeRegexps.some((re) => re.test(u));
      } catch { return false; }
    });

    sitemapPageCount = filtered.length;
    process.stdout.write(`   Found ${sitemapUrls.length} sitemap URLs → ${filtered.length} on this domain (after exclusions)\n\n`);

    if (filtered.length > 0) {
      // Deduplicate, keeping the start URL at the front
      seedUrls = [opts.url, ...filtered.filter((u) => u !== opts.url)];
    }
  }

  const excludeRegexps = buildExcludeRegexps(opts);

  /**
   * Save a captured resource to disk and register it in the resourceMap.
   * Marks the normalized URL immediately to prevent concurrent duplicate saves.
   */
  async function saveResource(url, contentType, getBody) {
    const normalized = url.split('#')[0];
    if (savedUrls.has(normalized)) return;
    savedUrls.add(normalized); // claim immediately — prevents races

    const localPath = urlToLocalPath(normalized, contentType);
    resourceMap.set(normalized, localPath);

    let body;
    try { body = await getBody(); } catch { return; }

    const fullPath = path.join(siteDir, localPath);
    try {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, body);
    } catch (e) {
      process.stderr.write(`  ⚠️  Save failed: ${url} — ${e.message}\n`);
      return;
    }

    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      htmlFiles.set(localPath, normalized);
    } else if (contentType.includes('text/css')) {
      cssFiles.set(localPath, normalized);
    }
  }

  const crawler = new PlaywrightCrawler({
    maxConcurrency: opts.concurrency,
    navigationTimeoutSecs: opts.navigationTimeout,
    requestHandlerTimeoutSecs: opts.navigationTimeout + 120, // handler needs extra time beyond nav
    ...(opts.maxPages > 0 ? { maxRequestsPerCrawl: opts.maxPages } : {}),

    // Set up response interception BEFORE each page navigation
    preNavigationHooks: [
      async ({ page }, gotoOptions) => {
        // Use domcontentloaded so heavy pages with slow third-party scripts don't time out.
        // Content loaded by the page's own JS still runs — we wait for it explicitly
        // during the scroll/load-more phase below.
        gotoOptions.waitUntil = 'domcontentloaded';

        // Block requests to known CMP (cookie consent) domains.
        // Aborting these before they load prevents cookie banners from ever
        // being injected into the DOM — cleaner and faster than dismissing them.
        await page.route(
          (url) => CMP_BLOCK_RE.test(url),
          (route) => route.abort(),
        );

        page.on('response', async (response) => {
          try {
            const resUrl = response.url();
            const resHostname = new URL(resUrl).hostname;

            // Always capture same-domain; optionally capture external assets
            const isSameDomain = resHostname === hostname;
            const isExternalAsset = opts.externalAssets && !isSameDomain;
            if (!isSameDomain && !isExternalAsset) return;

            // Only capture supported resource types
            const resourceType = response.request().resourceType();
            if (!CAPTURE_TYPES.has(resourceType)) return;

            // Skip POST responses — they can't be served from static files
            if (response.request().method() !== 'GET') return;

            const status = response.status();
            if (status < 200 || status >= 400) return;

            const contentType = response.headers()['content-type'] || '';
            // External domains: only capture non-HTML (don't mirror full external sites)
            if (isExternalAsset && (contentType.includes('text/html') || contentType.includes('application/xhtml'))) return;

            await saveResource(resUrl, contentType, () => response.body());
          } catch { /* ignore errors in response handler */ }
        });
      },
    ],

    async requestHandler({ request, page, enqueueLinks, log }) {
      const pageUrl = request.loadedUrl || request.url;
      log.info(`[${crawledPages.length + 1}] ${pageUrl}`);
      crawledPages.push(pageUrl);

      // Brief pause after domcontentloaded so the page's initial JS and data
      // fetches (XHR/fetch) have time to fire and be intercepted before we capture.
      await page.waitForTimeout(2000);

      // Dismiss cookie consent banners before interacting with the page.
      // This prevents the banner from blocking scroll/load-more interactions
      // and ensures it is not baked into the saved DOM snapshot.
      try { await dismissCookieBanner(page); } catch { /* ignore */ }

      // Wrap scroll/load-more in a Node-level timeout so a hung page.evaluate()
      // or unresponsive page JS can never stall the whole crawl indefinitely.
      const INTERACTION_TIMEOUT_MS = (opts.navigationTimeout * 1000) / 2;

      await Promise.race([
        (async () => {
          // --- Scroll to bottom to trigger lazy-loaded content ---
          if (opts.scroll) {
            try {
              await scrollToBottom(page, 600, opts.scrollDelay);
            } catch { /* ignore scroll errors */ }
          }

          // --- Click "Load More" buttons to expose paginated content ---
          if (opts.loadMore) {
            try {
              const clicks = await clickLoadMore(page, opts.loadMoreLimit, 1200);
              if (clicks > 0) {
                log.info(`  ↳ Clicked "load more" ${clicks}× — re-scrolling to capture new content`);
                if (opts.scroll) {
                  await scrollToBottom(page, 600, opts.scrollDelay);
                }
              }
            } catch { /* ignore load-more errors */ }
          }
        })(),
        new Promise((resolve) => setTimeout(resolve, INTERACTION_TIMEOUT_MS)),
      ]);

      // --- Save the rendered DOM ---
      // Overrides the raw HTTP response HTML captured by the response interceptor.
      // This bakes in any content injected by client-side JS (AJAX lists, lazy
      // components, load-more results, etc.) so it's present in the static mirror.
      //
      // Before capturing, remove any <script>/<link> tags pointing to blocked CMP
      // domains. Even though those requests were aborted (so the JS never ran),
      // the tags themselves are still in the server-rendered HTML. Leaving them in
      // the saved file would cause the banner to load when the offline mirror is
      // opened in a browser.
      try {
        await page.evaluate((cmpPattern) => {
          const re = new RegExp(cmpPattern, 'i');
          document.querySelectorAll('script[src], link[href]').forEach((el) => {
            const url = el.getAttribute('src') || el.getAttribute('href') || '';
            if (re.test(url)) el.remove();
          });
        }, CMP_BLOCK_RE.source);
      } catch { /* ignore */ }

      try {
        const renderedHtml = await page.content();
        const normalizedUrl = pageUrl.split('#')[0];
        const localPath = urlToLocalPath(normalizedUrl, 'text/html');
        const fullPath = path.join(siteDir, localPath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, Buffer.from(renderedHtml, 'utf-8'));
        resourceMap.set(normalizedUrl, localPath);
        htmlFiles.set(localPath, normalizedUrl);
      } catch (e) {
        process.stderr.write(`  ⚠️  DOM capture failed: ${pageUrl} — ${e.message}\n`);
      }

      // Enqueue all internal links discovered in the (now fully-rendered) DOM.
      // Exclude the current page URL so fragment-only skip-nav links (e.g. href="#main"
      // which normalise to the current page after fragment-stripping) don't waste slots
      // in the maxRequestsPerCrawl budget and block real new pages from being queued.
      const currentPageUrl = (request.loadedUrl || request.url).split('#')[0].replace(/\/$/, '');
      const currentPageExclude = new RegExp(`^${currentPageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/?|#.*)$`);
      await enqueueLinks({
        strategy: 'same-hostname',
        exclude: [currentPageExclude, ...(excludeRegexps.length > 0 ? excludeRegexps : [])],
      });
    },

    failedRequestHandler({ request, log }) {
      log.warning(`Failed: ${request.url}`);
    },
  }, config);

  // -------------------------------------------------------------------------
  // Progress reporter — prints a one-line summary every 60 seconds
  // -------------------------------------------------------------------------
  const progressInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const elapsedStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    const done = crawledPages.length;
    const rate = elapsed > 0 ? (done / elapsed * 60).toFixed(1) : '?';
    let eta = '';
    if (sitemapPageCount > 0 && done > 0 && elapsed > 0) {
      const remaining = sitemapPageCount - done;
      const secsLeft = Math.round(remaining / (done / elapsed));
      const etaMins = Math.floor(secsLeft / 60);
      const etaSecs = secsLeft % 60;
      eta = ` · ETA ~${etaMins}m ${etaSecs}s`;
    }
    const pct = sitemapPageCount > 0 ? ` (${Math.round(done / sitemapPageCount * 100)}%)` : '';
    process.stdout.write(`⏱  [${elapsedStr}] ${done}${sitemapPageCount > 0 ? `/${sitemapPageCount}` : ''} pages${pct} · ${rate} pages/min${eta}\n`);
  }, 60_000);

  await crawler.run(seedUrls);
  clearInterval(progressInterval);

  // -------------------------------------------------------------------------
  // Post-processing: rewrite internal URLs to relative paths
  // -------------------------------------------------------------------------
  process.stdout.write(`\n📝 Rewriting URLs in ${htmlFiles.size} HTML + ${cssFiles.size} CSS files...\n`);

  let rewriteCount = 0;

  for (const [localPath, originalUrl] of htmlFiles) {
    try {
      const fullPath = path.join(siteDir, localPath);
      const before = fs.readFileSync(fullPath, 'utf-8');
      const after = rewriteHtml(before, localPath, originalUrl, resourceMap);
      if (after !== before) { fs.writeFileSync(fullPath, after, 'utf-8'); rewriteCount++; }
    } catch { /* ignore */ }
  }

  for (const [localPath, originalUrl] of cssFiles) {
    try {
      const fullPath = path.join(siteDir, localPath);
      const before = fs.readFileSync(fullPath, 'utf-8');
      const after = rewriteCss(before, localPath, originalUrl, resourceMap);
      if (after !== before) { fs.writeFileSync(fullPath, after, 'utf-8'); rewriteCount++; }
    } catch { /* ignore */ }
  }

  // -------------------------------------------------------------------------
  // Write summary index
  // -------------------------------------------------------------------------
  const duration = Math.round((Date.now() - startTime) / 1000);
  const index = {
    startUrl: opts.url,
    hostname,
    mirroredAt: new Date().toISOString(),
    duration: `${duration}s`,
    pageCount: crawledPages.length,
    resourceCount: resourceMap.size,
    pages: [...new Set(crawledPages)].sort(),
  };

  fs.writeFileSync(
    path.join(siteDir, 'mirror-index.json'),
    JSON.stringify(index, null, 2),
    'utf-8',
  );

  // Clean up Crawlee internal storage
  try { fs.rmSync(crawleeStorageDir, { recursive: true, force: true }); } catch { /* ignore */ }

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const elapsed = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  process.stdout.write('\n');
  process.stdout.write(`✅ Done in ${elapsed}\n`);
  process.stdout.write(`   Pages:     ${crawledPages.length}\n`);
  process.stdout.write(`   Resources: ${resourceMap.size}\n`);
  process.stdout.write(`   Rewritten: ${rewriteCount} files\n`);
  process.stdout.write(`   Output:    ${siteDir}\n`);
  process.stdout.write(`\n💡 Open offline: npx serve "${siteDir}"\n`);
}

main().catch((err) => {
  process.stderr.write(`\n❌ ${err.message}\n${err.stack}\n`);
  process.exit(1);
});
