#!/usr/bin/env node

/**
 * Mirror Validation
 *
 * Compares a locally mirrored site against the live site page by page:
 *   1. Starts a local HTTP server serving the mirror
 *   2. Takes full-page screenshots of both live and local versions
 *   3. Runs pixel-level diff to detect visual differences
 *   4. Detects broken resources (missing images, CSS, fonts, etc.)
 *   5. Compares text content
 *   6. Generates an HTML report with side-by-side screenshots and diffs
 *
 * Usage:
 *   node validate-mirror.js <url> [options]
 *
 * Requirements:
 *   Same as mirror-site.js (npm install + playwright install chromium)
 */

import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIEWPORT = { width: 1280, height: 900 };

// ---------------------------------------------------------------------------
// CMP domain blocklist — kept in sync with mirror-site.js
// Aborted on both the live and local pages so screenshots are comparable.
// ---------------------------------------------------------------------------
const CMP_BLOCK_DOMAINS = [
  'cookiereports.com',
  'cdn.cookielaw.org',
  'optanon.blob.core.windows',
  'geolocation.onetrust.com',
  'consent.cookiebot.com',
  'consentcdn.cookiebot.com',
  'cookie-cdn.cookiepro.com',
  'cdn.cookie-script.com',
  'cdn.trustarc.com',
  'consent.trustarc.com',
  'sourcepoint.com',
  'quantcast.mgr.consensu',
  'cmpv2.quantcast.com',
  'evidon.com',
  'cookiehub.net',
  'app.termly.io',
  'cdn.iubenda.com',
  'privacymanager.io',
  'app.usercentrics.eu',
  'cdn.privacy-mgmt.com',
  'consentframework.com',
  'cookieconsent.insites.com',
  'cdn.osano.com',
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
    target: null,
    output: './scrape',
    limit: 0,
    threshold: 5,   // % pixel diff to flag as "different"
    port: 4042,
    concurrency: 2, // pages validated in parallel
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') { printHelp(); process.exit(0); }
    else if (!arg.startsWith('--')) { opts.target = arg; }
    else if (arg === '--output' && args[i + 1]) { opts.output = args[++i]; }
    else if (arg === '--limit' && args[i + 1]) { opts.limit = parseInt(args[++i], 10); }
    else if (arg === '--threshold' && args[i + 1]) { opts.threshold = parseFloat(args[++i]); }
    else if (arg === '--port' && args[i + 1]) { opts.port = parseInt(args[++i], 10); }
    else if (arg === '--concurrency' && args[i + 1]) { opts.concurrency = parseInt(args[++i], 10); }
  }
  return opts;
}

function printHelp() {
  process.stdout.write(`
Usage: node validate-mirror.js <url> [options]

Compares a local mirror against the live site using screenshot diffs,
broken resource detection, and text content comparison.

Arguments:
  <url>              Original site URL (e.g. https://example.com)

Options:
  --output <dir>     Where the scrape/ folder lives (default: ./scrape)
  --limit <n>        Validate only first n pages (default: all)
  --threshold <pct>  Pixel diff % to flag as "different" (default: 5)
  --port <n>         Local server port (default: 4042)
  --concurrency <n>  Pages validated in parallel (default: 2)

Output:
  <output>/<hostname>/validation/
    report.html        Visual diff report — open in browser
    report.json        Machine-readable results
    screenshots/       Per-page live / local / diff images

Examples:
  node validate-mirror.js "https://example.com"
  node validate-mirror.js "https://example.com" --limit 20 --threshold 2
  node validate-mirror.js "https://example.com" --output ./scrape --port 4043
`);
}

// ---------------------------------------------------------------------------
// Local HTTP server
// ---------------------------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
};

function startLocalServer(siteDir, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      if (!urlPath || urlPath === '/') urlPath = '/index.html';

      const candidates = [
        path.join(siteDir, urlPath),
        path.join(siteDir, urlPath.replace(/\/+$/, ''), 'index.html'),
        path.join(siteDir, urlPath + '/index.html'),
      ];

      const filePath = candidates.find((c) => {
        try { return fs.statSync(c).isFile(); } catch { return false; }
      });

      if (!filePath) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404: ${urlPath}`);
        return;
      }

      const mimeType = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mimeType });
      fs.createReadStream(filePath).pipe(res);
    });

    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

// ---------------------------------------------------------------------------
// Screenshot capture
// ---------------------------------------------------------------------------

/**
 * Block CMP domains and remove any residual banner elements.
 * Called before navigation so route interception is active from the first request.
 */
async function blockCmpOnPage(page) {
  await page.route(
    (url) => CMP_BLOCK_RE.test(url),
    (route) => route.abort(),
  );
}

/**
 * Remove any cookie banner that slipped through (e.g. self-hosted CMP).
 * Mirrors the heuristic fallback in mirror-site.js.
 */
async function dismissResidualBanner(page) {
  try {
    await page.evaluate(() => {
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
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    });
  } catch { /* ignore */ }
}

async function capturePageData(page, url, isLocal) {
  const failedResources = [];
  const pageBase = url.split('#')[0];

  // Block CMP domains before navigation — prevents banners from loading
  // on both live and local pages so screenshots are directly comparable.
  await blockCmpOnPage(page);

  page.on('requestfailed', (req) => {
    if (req.url().split('#')[0] !== pageBase) {
      failedResources.push({ url: req.url(), reason: req.failure()?.errorText || 'failed' });
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400 && res.url().split('#')[0] !== pageBase) {
      failedResources.push({ url: res.url(), reason: `HTTP ${res.status()}` });
    }
  });

  let navResponse;
  try {
    navResponse = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    try {
      navResponse = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      return { screenshot: null, text: '', failedResources, error: e.message };
    }
  }

  const navStatus = navResponse?.status();
  if (navStatus && navStatus >= 400) {
    return { screenshot: null, text: '', failedResources, error: `HTTP ${navStatus}` };
  }

  // Dismiss any residual banner (self-hosted CMP not caught by network block)
  await dismissResidualBanner(page);

  // Scroll to trigger lazy loading
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 500);
        total += 500;
        if (total >= document.body.scrollHeight) { clearInterval(timer); resolve(); }
      }, 40);
    });
  });
  await page.waitForTimeout(400);

  const [screenshot, text] = await Promise.all([
    page.screenshot({ fullPage: true }),
    page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim()),
  ]);

  return { screenshot, text, failedResources };
}

// ---------------------------------------------------------------------------
// Image comparison
// ---------------------------------------------------------------------------

function cropToHeight(png, targetHeight) {
  if (targetHeight >= png.height) return png;
  const out = new PNG({ width: png.width, height: targetHeight });
  png.data.copy(out.data, 0, 0, png.width * targetHeight * 4);
  return out;
}

function compareImages(bufA, bufB) {
  const a = PNG.sync.read(bufA);
  const b = PNG.sync.read(bufB);
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);

  const ca = cropToHeight(a, height);
  const cb = cropToHeight(b, height);
  const diff = new PNG({ width, height });

  const diffCount = pixelmatch(ca.data, cb.data, diff.data, width, height, {
    threshold: 0.1,
    alpha: 0.3,
    diffColor: [255, 50, 50],
    diffColorAlt: [0, 200, 50],
  });

  const total = width * height;
  return {
    matchPercent: Math.round(((total - diffCount) / total) * 1000) / 10,
    diffPixels: diffCount,
    sizeA: { width: a.width, height: a.height },
    sizeB: { width: b.width, height: b.height },
    diffBuffer: PNG.sync.write(diff),
  };
}

// ---------------------------------------------------------------------------
// Text similarity (Jaccard on word sets)
// ---------------------------------------------------------------------------

function textSimilarity(a, b) {
  const words = (s) => new Set(s.toLowerCase().split(/\W+/).filter((w) => w.length > 2));
  const wa = words(a);
  const wb = words(b);
  if (wa.size === 0 && wb.size === 0) return 100;
  const intersection = [...wa].filter((w) => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return Math.round((intersection / union) * 1000) / 10;
}

// ---------------------------------------------------------------------------
// HTML report
// ---------------------------------------------------------------------------

function buildHtmlReport(results, threshold) {
  const total = results.length;
  const ok = results.filter((r) => r.status === 'ok').length;
  const diff = results.filter((r) => r.status === 'different').length;
  const missing = results.filter((r) => r.status === 'missing').length;
  const errors = results.filter((r) => r.status === 'error').length;
  const score = total > 0 ? Math.round((ok / total) * 100) : 0;
  const scoreColor = score === 100 ? '#22c55e' : score >= 90 ? '#84cc16' : score >= 70 ? '#f59e0b' : '#ef4444';

  const STATUS_COLOR = { ok: '#22c55e', different: '#f59e0b', missing: '#ef4444', error: '#8b5cf6' };

  const rows = results.map((r, i) => {
    const color = STATUS_COLOR[r.status] || '#666';
    const diffPct = r.matchPercent !== null ? (100 - r.matchPercent).toFixed(1) : null;

    const brokenHtml = r.failedResources?.length
      ? `<details><summary style="color:#ef4444;cursor:pointer;font-size:.85em">${r.failedResources.length} broken resource(s)</summary>
          <ul style="font-size:.8em;margin:.25em 0 0 1em">${r.failedResources.slice(0, 10).map((f) => `<li>${f.url} — ${f.reason}</li>`).join('')}${r.failedResources.length > 10 ? `<li>…and ${r.failedResources.length - 10} more</li>` : ''}</ul></details>`
      : '';

    const issuesHtml = r.issues?.length
      ? r.issues.map((iss) => `<div style="color:#94a3b8;font-size:.8em">⚠ ${iss}</div>`).join('')
      : '';

    const thumbStyle = 'max-width:180px;max-height:120px;cursor:pointer;border-radius:4px;border:1px solid #334155;display:block';
    const thumb = r.liveSS
      ? `<img src="${r.liveSS}" style="${thumbStyle}" onclick="openModal('${r.liveSS}','${r.localSS || ''}','${r.diffSS || ''}')" title="Click to compare">`
      : '';
    const dthumb = r.diffSS
      ? `<img src="${r.diffSS}" style="${thumbStyle}" onclick="openModal('${r.liveSS || ''}','${r.localSS || ''}','${r.diffSS}')" title="Click to compare">`
      : '';

    return `<tr>
      <td style="color:#64748b">${i + 1}</td>
      <td><a href="${r.url}" target="_blank" rel="noopener">${r.url}</a></td>
      <td><span style="color:${color};font-weight:700;font-size:.8em;text-transform:uppercase;letter-spacing:.05em">${r.status}</span></td>
      <td style="font-variant-numeric:tabular-nums">${r.matchPercent !== null ? `<span style="color:${r.matchPercent >= 95 ? '#22c55e' : r.matchPercent >= 80 ? '#f59e0b' : '#ef4444'}">${r.matchPercent}%</span>` : '—'}</td>
      <td style="font-variant-numeric:tabular-nums">${r.textSimilarity !== null ? `${r.textSimilarity}%` : '—'}</td>
      <td>
        ${brokenHtml}${issuesHtml}
        ${r.sizeA && r.sizeB && (r.sizeA.height !== r.sizeB.height) ? `<div style="color:#f59e0b;font-size:.8em">📏 live ${r.sizeA.height}px / local ${r.sizeB.height}px</div>` : ''}
      </td>
      <td>${thumb}</td>
      <td>${dthumb}</td>
    </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Mirror Validation Report</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;min-height:100vh}
    h1{font-size:1.4rem;font-weight:700;margin-bottom:6px}
    .meta{color:#64748b;font-size:.85rem;margin-bottom:24px}
    .stats{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:32px}
    .stat{background:#1e293b;border-radius:10px;padding:14px 20px;text-align:center;min-width:100px}
    .stat .n{font-size:2rem;font-weight:800;line-height:1}
    .stat .l{font-size:.75rem;color:#64748b;margin-top:4px;text-transform:uppercase;letter-spacing:.08em}
    .score-box{background:#1e293b;border-radius:10px;padding:14px 28px;text-align:center;border:2px solid ${scoreColor}}
    .score-box .n{font-size:2.8rem;font-weight:900;color:${scoreColor};line-height:1}
    table{width:100%;border-collapse:collapse;font-size:.82rem}
    thead tr{background:#1e293b}
    th{padding:10px 12px;text-align:left;position:sticky;top:0;z-index:1;background:#1e293b;color:#94a3b8;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em}
    td{padding:9px 12px;border-bottom:1px solid #1e293b22;vertical-align:top}
    tr:hover td{background:#1e293b44}
    a{color:#60a5fa;text-decoration:none}
    a:hover{text-decoration:underline}
    details{margin-top:4px}
    #overlay{display:none;position:fixed;inset:0;background:#000000cc;z-index:100;padding:20px;overflow:auto;cursor:zoom-out}
    .cmp{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:1800px;margin:40px auto 0}
    .cmp-col{display:flex;flex-direction:column;gap:6px}
    .cmp-label{color:#94a3b8;font-size:.8rem;text-align:center;font-weight:600}
    .cmp-col img{width:100%;border-radius:6px;border:1px solid #334155;display:block}
    #close-btn{position:fixed;top:12px;right:20px;font-size:1.8rem;color:#fff;cursor:pointer;background:#1e293b;border:none;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;z-index:101}
  </style>
</head>
<body>
  <h1>Mirror Validation Report</h1>
  <div class="meta">Generated ${new Date().toISOString()} · Threshold: ${threshold}% pixel diff · ${total} pages</div>

  <div class="stats">
    <div class="score-box">
      <div class="n">${score}%</div>
      <div class="l">Score</div>
    </div>
    <div class="stat"><div class="n">${total}</div><div class="l">Total</div></div>
    <div class="stat"><div class="n" style="color:#22c55e">${ok}</div><div class="l">Matching ✅</div></div>
    <div class="stat"><div class="n" style="color:#f59e0b">${diff}</div><div class="l">Different ⚠️</div></div>
    <div class="stat"><div class="n" style="color:#ef4444">${missing}</div><div class="l">Missing ❌</div></div>
    <div class="stat"><div class="n" style="color:#8b5cf6">${errors}</div><div class="l">Errors 💥</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th><th>URL</th><th>Status</th>
        <th>Visual Match</th><th>Text Match</th>
        <th>Issues</th><th>Live Screenshot</th><th>Diff</th>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>

  <div id="overlay" onclick="if(event.target===this)closeModal()">
    <button id="close-btn" onclick="closeModal()">✕</button>
    <div class="cmp">
      <div class="cmp-col"><div class="cmp-label">Live</div><img id="m-live" src=""></div>
      <div class="cmp-col"><div class="cmp-label">Local Mirror</div><img id="m-local" src=""></div>
      <div class="cmp-col"><div class="cmp-label">Diff (red = different, green = added)</div><img id="m-diff" src=""></div>
    </div>
  </div>

  <script>
    function openModal(live, local, diff) {
      document.getElementById('m-live').src = live;
      document.getElementById('m-local').src = local || '';
      document.getElementById('m-diff').src = diff || '';
      document.getElementById('overlay').style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      document.getElementById('overlay').style.display = 'none';
      document.body.style.overflow = '';
    }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.target) { printHelp(); process.exit(1); }

  let hostname;
  try {
    hostname = opts.target.startsWith('http') ? new URL(opts.target).hostname : opts.target;
  } catch {
    process.stderr.write(`Invalid URL: ${opts.target}\n`);
    process.exit(1);
  }

  const siteDir = path.resolve(opts.output, hostname);
  const indexPath = path.join(siteDir, 'mirror-index.json');

  if (!fs.existsSync(indexPath)) {
    process.stderr.write(`Not found: ${indexPath}\n`);
    process.stderr.write(`Run mirror-site.js first to create the local mirror.\n`);
    process.exit(1);
  }

  const mirrorIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  let pages = [...new Set(mirrorIndex.pages)];
  if (opts.limit > 0) pages = pages.slice(0, opts.limit);

  const validationDir = path.join(siteDir, 'validation');
  const screenshotsDir = path.join(validationDir, 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  process.stdout.write(`🔍 Validating: ${hostname}\n`);
  process.stdout.write(`📄 Pages:      ${pages.length}${opts.limit ? ` (capped at ${opts.limit})` : ''}\n`);
  process.stdout.write(`⚠️  Threshold:  ${opts.threshold}% pixel diff\n\n`);

  // Start local server
  let server;
  try {
    server = await startLocalServer(siteDir, opts.port);
    process.stdout.write(`🌐 Local server: http://localhost:${opts.port}\n\n`);
  } catch (e) {
    process.stderr.write(`Failed to start server on port ${opts.port}: ${e.message}\n`);
    process.stderr.write(`Try a different port: --port 4043\n`);
    process.exit(1);
  }

  // Recycle the browser every N pages to prevent GPU memory exhaustion
  const BROWSER_RECYCLE_INTERVAL = 40;
  const LAUNCH_ARGS = ['--disable-gpu', '--disable-dev-shm-usage'];

  let browser = await chromium.launch({ args: LAUNCH_ARGS });
  const results = [];

  // Process pages in batches for controlled concurrency
  for (let i = 0; i < pages.length; i += opts.concurrency) {
    // Recycle the browser periodically to free GPU memory
    if (i > 0 && i % BROWSER_RECYCLE_INTERVAL === 0) {
      await browser.close();
      browser = await chromium.launch({ args: LAUNCH_ARGS });
    }

    const batch = pages.slice(i, i + opts.concurrency);

    const batchResults = await Promise.all(batch.map(async (liveUrl, bi) => {
      const idx = i + bi + 1;
      const urlObj = new URL(liveUrl);
      // Mirror saves HTML pages as <path>/index.html (e.g. /publication.html → /publication/index.html).
      // Strip known HTML extensions so the static server resolves the folder's index.html correctly.
      const localPathname = urlObj.pathname.replace(/\.(html?|php|aspx?|jsp|cfm)$/i, '');
      const localUrl = `http://localhost:${opts.port}${localPathname}`;

      const safeName = (urlObj.pathname.replace(/^\/+|\/+$/g, '') || 'index').replace(/[/\\?:*"<>|#]/g, '--');
      const liveSS = `screenshots/${safeName}--live.png`;
      const localSS = `screenshots/${safeName}--local.png`;
      const diffSS = `screenshots/${safeName}--diff.png`;

      process.stdout.write(`[${idx}/${pages.length}] ${liveUrl}\n`);

      const result = {
        url: liveUrl,
        status: 'ok',
        matchPercent: null,
        textSimilarity: null,
        failedResources: [],
        sizeA: null,
        sizeB: null,
        issues: [],
        liveSS,
        localSS,
        diffSS,
      };

      try {
        const liveCtx = await browser.newContext({ viewport: VIEWPORT });
        const localCtx = await browser.newContext({ viewport: VIEWPORT });
        const livePg = await liveCtx.newPage();
        const localPg = await localCtx.newPage();

        const [liveData, localData] = await Promise.all([
          capturePageData(livePg, liveUrl, false),
          capturePageData(localPg, localUrl, true),
        ]);

        await liveCtx.close();
        await localCtx.close();

        if (localData.error) {
          result.status = localData.error.startsWith('HTTP 4') ? 'missing' : 'error';
          result.issues.push(`Local: ${localData.error}`);
        } else if (liveData.error) {
          result.status = 'error';
          result.issues.push(`Live: ${liveData.error}`);
        } else {
          // Save screenshots
          fs.writeFileSync(path.join(validationDir, liveSS), liveData.screenshot);
          fs.writeFileSync(path.join(validationDir, localSS), localData.screenshot);

          // Visual diff
          const cmp = compareImages(liveData.screenshot, localData.screenshot);
          result.matchPercent = cmp.matchPercent;
          result.sizeA = cmp.sizeA;
          result.sizeB = cmp.sizeB;
          fs.writeFileSync(path.join(validationDir, diffSS), cmp.diffBuffer);

          if (cmp.sizeA.height !== cmp.sizeB.height) {
            result.issues.push(`Height mismatch — live: ${cmp.sizeA.height}px / local: ${cmp.sizeB.height}px`);
          }

          // Text similarity
          result.textSimilarity = textSimilarity(liveData.text, localData.text);

          // Broken local resources (filter to localhost only)
          // Exclude legacy/non-rendering formats: EOT (IE-only), ICO favicons,
          // and duplicate entries (same URL reported by both requestfailed + response events).
          const IGNORE_EXTS = new Set(['.eot', '.ico']);
          const seenBroken = new Set();
          result.failedResources = localData.failedResources.filter((r) => {
            if (!r.url.includes(`localhost:${opts.port}`)) return false;
            const ext = r.url.split('?')[0].split('.').pop().toLowerCase();
            if (IGNORE_EXTS.has(`.${ext}`)) return false;
            if (seenBroken.has(r.url)) return false; // deduplicate
            seenBroken.add(r.url);
            return true;
          });
          if (result.failedResources.length > 0) {
            result.issues.push(`${result.failedResources.length} broken resource(s)`);
          }

          // Final status: a page is "different" only if the pixel diff exceeds the
          // threshold OR there are broken resources that likely caused visual impact.
          // Broken resources alone (with no visual diff) are noted as warnings, not failures.
          const diffPct = 100 - cmp.matchPercent;
          const hasVisualDiff = diffPct > opts.threshold;
          const hasBrokenResources = result.failedResources.length > 0;

          if (hasVisualDiff) {
            result.status = 'different';
            result.issues.push(`Pixel diff: ${diffPct.toFixed(1)}% (threshold: ${opts.threshold}%)`);
          } else if (hasBrokenResources) {
            // Broken resources with no visual impact — flag for review but don't fail
            result.status = 'different';
          } else {
            result.status = 'ok';
          }
        }
      } catch (e) {
        result.status = 'error';
        result.issues.push(e.message);
      }

      const icon = { ok: '✅', different: '⚠️ ', missing: '❌', error: '💥' }[result.status] || '  ';
      const matchStr = result.matchPercent !== null ? ` ${result.matchPercent}% visual` : '';
      const textStr = result.textSimilarity !== null ? ` · ${result.textSimilarity}% text` : '';
      const resStr = result.failedResources.length ? ` · ${result.failedResources.length} broken` : '';
      process.stdout.write(`   ${icon} ${result.status.toUpperCase()}${matchStr}${textStr}${resStr}\n`);
      result.issues.forEach((iss) => process.stdout.write(`      ↳ ${iss}\n`));

      return result;
    }));

    results.push(...batchResults);
  }

  await browser.close();
  server.close();

  // -------------------------------------------------------------------------
  // Reports
  // -------------------------------------------------------------------------
  const ok = results.filter((r) => r.status === 'ok').length;
  const score = Math.round((ok / results.length) * 100);

  const jsonReport = {
    hostname,
    validatedAt: new Date().toISOString(),
    threshold: opts.threshold,
    summary: {
      total: results.length,
      ok,
      different: results.filter((r) => r.status === 'different').length,
      missing: results.filter((r) => r.status === 'missing').length,
      errors: results.filter((r) => r.status === 'error').length,
      score,
    },
    results: results.map((r) => ({
      url: r.url,
      status: r.status,
      matchPercent: r.matchPercent,
      textSimilarity: r.textSimilarity,
      failedResources: r.failedResources,
      issues: r.issues,
      sizeA: r.sizeA,
      sizeB: r.sizeB,
    })),
  };

  fs.writeFileSync(path.join(validationDir, 'report.json'), JSON.stringify(jsonReport, null, 2), 'utf-8');

  const htmlPath = path.join(validationDir, 'report.html');
  fs.writeFileSync(htmlPath, buildHtmlReport(results, opts.threshold), 'utf-8');

  const scoreIcon = score === 100 ? '🎉' : score >= 95 ? '✅' : score >= 80 ? '⚠️ ' : '❌';
  process.stdout.write(`\n${scoreIcon} Score: ${score}% — ${ok} of ${results.length} pages fully match\n`);
  process.stdout.write(`\n📊 Report: ${htmlPath}\n`);
  process.stdout.write(`   Open:   open "${htmlPath}"\n`);

  if (score < 100) {
    const problems = results.filter((r) => r.status !== 'ok');
    process.stdout.write(`\n🔧 Issues to fix (${problems.length} pages):\n`);
    problems.forEach((r) => {
      process.stdout.write(`   ${r.url}\n`);
      r.issues.forEach((iss) => process.stdout.write(`     • ${iss}\n`));
    });
  }

  process.exit(score === 100 ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`\n❌ ${err.message}\n${err.stack}\n`);
  process.exit(1);
});
