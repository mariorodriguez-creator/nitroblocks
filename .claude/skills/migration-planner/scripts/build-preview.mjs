#!/usr/bin/env node
/**
 * build-preview.mjs
 *
 * Generates migration-work/components/preview.html -- a single-page living
 * styleguide that showcases the forensic design system extracted from the
 * site: tokens (foundations), atoms, molecules, organisms.
 *
 * Also generates a per-component `preview.html` inside each component
 * folder (e.g. components/atoms/button/preview.html) with the live site's
 * <head> inlined so the anatomy.html fragment renders with its real styling
 * when opened from disk.
 *
 * Inputs:
 *   - migration-work/component-manifest.json
 *   - migration-work/components/{atoms,molecules,organisms}/<name>/
 *       - stats.json
 *       - anatomy.html (raw outer HTML)
 *       - computed.css (curated style snapshot)
 *       - evidence/*.png (per-variant cropped screenshots)
 *   - migration-work/design-extract/<site>-variables.css
 *       (tokens extracted by designlang)
 *   - migration-work/bypass-cookies.json (used when capturing live <head>)
 *
 * Output:
 *   - migration-work/components/preview.html (main gallery)
 *   - migration-work/components/.live-head.html (cached live <head>)
 *   - migration-work/components/<level>/<name>/preview.html (per-component)
 *
 * The preview is self-contained. Images are referenced via relative paths
 * within components/ so the file Just Works when opened from disk or served
 * alongside the rest of the components tree.
 *
 * Usage:
 *   node build-preview.mjs
 *       [--manifest ./migration-work/component-manifest.json]
 *       [--components ./migration-work/components]
 *       [--tokens ./migration-work/design-extract]
 *       [--bypass ./migration-work/bypass-cookies.json]
 *       [--out ./migration-work/components/preview.html]
 *       [--no-live]     skip live <head> capture (re-use cached copy, or
 *                       fall back to a minimal shell)
 *       [--verbose]
 */

import { mkdir, writeFile, readFile, readdir, access } from 'node:fs/promises';
import { join, resolve, relative, basename, dirname } from 'node:path';
import { chromium } from 'playwright';

// ---- argv ----------------------------------------------------------------

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    if (!k.startsWith('--')) continue;
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[k.slice(2)] = true;
    } else {
      args[k.slice(2)] = next;
      i += 1;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const MANIFEST_PATH = resolve(args.manifest ?? './migration-work/component-manifest.json');
const COMPONENTS_DIR = resolve(args.components ?? './migration-work/components');
const TOKENS_DIR = resolve(args.tokens ?? './migration-work/design-extract');
const BYPASS_PATH = resolve(args.bypass ?? './migration-work/bypass-cookies.json');
const OUT_PATH = resolve(args.out ?? join(COMPONENTS_DIR, 'preview.html'));
const VERBOSE = !!args.verbose;
const SKIP_LIVE = !!args['no-live'];
const LIVE_HEAD_CACHE = join(COMPONENTS_DIR, '.live-head.html');

function log(...a) { console.log('[preview]', ...a); }
function vlog(...a) { if (VERBOSE) console.log('[preview]', ...a); }

async function fileExists(p) { try { await access(p); return true; } catch { return false; } }
async function loadJSON(p) { return JSON.parse(await readFile(p, 'utf-8')); }
async function readText(p) { return readFile(p, 'utf-8').catch(() => ''); }

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ---- tokens --------------------------------------------------------------

/**
 * Parse a designlang variables.css file into grouped token records.
 * Returns an array of { group, items: [{ name, value }] }.
 * Groups are derived from the CSS block comments (one per logical section)
 * that designlang emits above each run of variables.
 */
function parseVariables(css) {
  if (!css) return [];
  const lines = css.split(/\r?\n/);
  const groups = [];
  let current = null;
  for (const raw of lines) {
    const line = raw.trim();
    const commentMatch = line.match(/^\/\*\s*(.+?)\s*\*\/$/);
    if (commentMatch) {
      current = { group: commentMatch[1], items: [] };
      groups.push(current);
      continue;
    }
    const varMatch = line.match(/^(--[a-z0-9-]+)\s*:\s*(.+?);$/i);
    if (varMatch) {
      if (!current) {
        current = { group: 'Tokens', items: [] };
        groups.push(current);
      }
      current.items.push({ name: varMatch[1], value: varMatch[2].trim() });
    }
  }
  return groups.filter(g => g.items.length > 0);
}

function isColorToken(value) {
  return /^#[0-9a-f]{3,8}$/i.test(value)
    || /^rgb|^hsl|^oklch/i.test(value)
    || /^(transparent|currentColor|inherit)$/i.test(value);
}
function isLengthToken(value) {
  return /^\d+(\.\d+)?(px|rem|em|%)$/i.test(value);
}
function isFontFamilyToken(value) {
  return /['"]/.test(value) && /(sans|serif|mono|display)/i.test(value);
}

function renderFoundationsSection(groups) {
  if (!groups.length) {
    return `<p class="preview-empty">No tokens extracted — run <code>run-discovery.sh</code> first to populate <code>design-extract/*-variables.css</code>.</p>`;
  }
  const blocks = [];
  for (const grp of groups) {
    const items = grp.items;
    // Bucket by rendering style.
    const colors = items.filter(t => isColorToken(t.value));
    const sizes = items.filter(t => !isColorToken(t.value) && isLengthToken(t.value));
    const fonts = items.filter(t => !isColorToken(t.value) && !isLengthToken(t.value) && isFontFamilyToken(t.value));
    const other = items.filter(t => !isColorToken(t.value) && !isLengthToken(t.value) && !isFontFamilyToken(t.value));

    const header = `<h3>${escapeHtml(grp.group)}</h3>`;
    const cards = [];
    if (colors.length) {
      cards.push(`<ul class="swatch-grid">${colors.map(t => `
        <li class="swatch">
          <span class="swatch-chip swatch-chip--bordered" style="background:${escapeHtml(t.value)}"></span>
          <code>${escapeHtml(t.name)}</code>
          <small>${escapeHtml(t.value)}</small>
        </li>`).join('')}</ul>`);
    }
    if (sizes.length) {
      const max = Math.max(...sizes.map(t => parseFloat(t.value) || 0)) || 1;
      cards.push(`<ul class="spacing-list">${sizes.map(t => {
        const px = parseFloat(t.value) || 0;
        const width = Math.min(100, (px / max) * 100);
        return `<li class="spacing">
          <code>${escapeHtml(t.name)}</code>
          <span class="spacing-bar" style="width:${width.toFixed(1)}%"></span>
          <small>${escapeHtml(t.value)}</small>
        </li>`;
      }).join('')}</ul>`);
    }
    if (fonts.length) {
      cards.push(`<ul class="type-list">${fonts.map(t => `
        <li class="type-row">
          <code>${escapeHtml(t.name)}</code>
          <span class="type-sample" style="font-family:${escapeHtml(t.value)}">
            The quick brown fox — 1234567890
          </span>
          <small>${escapeHtml(t.value)}</small>
        </li>`).join('')}</ul>`);
    }
    if (other.length) {
      cards.push(`<ul class="token-list">${other.map(t => `
        <li class="token-row">
          <code>${escapeHtml(t.name)}</code>
          <small>${escapeHtml(t.value)}</small>
        </li>`).join('')}</ul>`);
    }
    blocks.push(`<div class="foundation-group">${header}${cards.join('\n')}</div>`);
  }
  return blocks.join('\n');
}

// ---- live head capture --------------------------------------------------

/**
 * Navigate to the live URL with bypass cookies and capture the <head> so
 * we can inline it in per-component preview shells. The whole point is:
 * anatomy.html is a raw DOM fragment with site-specific class names
 * (bat-cta-style, bat-hero, ...). Without the site's stylesheets, it
 * renders as unstyled default HTML.
 *
 * Cross-origin `<link rel="stylesheet" href="https://...">` is blocked by
 * Chrome's ORB when the page is opened from a `file://` origin. To work
 * around this, we download every linked stylesheet via the same
 * Playwright session (which carries the bypass cookies / Imperva tokens)
 * and save them under `components/.live-assets/css/`. The captured head
 * is then rewritten so each `<link>` points at the absolute file:// URL
 * of the local copy, making the preview render fully offline.
 *
 * Script tags are stripped so the site's runtime doesn't re-initialise or
 * fetch data.
 */
async function captureLiveHead(url, bypassCookies) {
  log('capturing live <head> from', url);
  const assetsDir = join(COMPONENTS_DIR, '.live-assets', 'css');
  await mkdir(assetsDir, { recursive: true });

  // 3rd-party stylesheets we skip outright — they're runtime overlays
  // (chat, consent, surveys) and don't contribute to the design system.
  const skip = /embeddedMessaging|my\.site\.com|onetrust|qualtrics|grecaptcha/i;

  const browser = await chromium.launch();
  try {
    // Match extract-components.mjs: spoofed Chrome UA + full storageState
    // (cookies + origins). Imperva looks for a consistent browser
    // fingerprint, so a bare context + addCookies isn't enough -- the same
    // brand.min.css that 403's on a fresh context loads cleanly under the
    // same storageState the rest of the planner uses.
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      storageState: bypassCookies && (bypassCookies.cookies || bypassCookies.origins)
        ? bypassCookies
        : undefined,
    });
    // Lightweight stealth: hide the navigator.webdriver flag and patch a
    // few headless-Chrome tells. Bot-protected DAM endpoints (like
    // Imperva-fronted brand.min.css on zonnic.ca) 403 fresh
    // headless requests; toggling these closes most of that gap.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      try {
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      } catch { /* property may already be locked */ }
      // Override permissions so navigator.permissions.query feels normal.
      const origQuery = navigator.permissions?.query;
      if (origQuery) {
        navigator.permissions.query = (params) =>
          params?.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : origQuery.call(navigator.permissions, params);
      }
    });
    const page = await context.newPage();

    const safeNameFor = u => u
      .replace(/^https?:\/\//, '')
      .replace(/\?.*$/, '')
      .replace(/[^a-z0-9_.-]+/gi, '_')
      .slice(-180);

    // First pass: capture every stylesheet response the browser fetches
    // as it loads the page itself. Bot-protected origins frequently 200
    // these in-browser requests but 403 a fresh context.request.get().
    const localised = new Map(); // original URL -> local absolute path
    page.on('response', async (resp) => {
      try {
        const reqUrl = resp.url();
        if (localised.has(reqUrl)) return;
        const ct = (resp.headers()['content-type'] || '').toLowerCase();
        const isCss = ct.includes('text/css') || /\.css(\?|$)/i.test(reqUrl);
        if (!isCss) return;
        if (skip.test(reqUrl)) return;
        if (!resp.ok()) return;
        const body = await resp.body();
        const dest = join(assetsDir, safeNameFor(reqUrl));
        await writeFile(dest, body);
        localised.set(reqUrl, dest);
        vlog('cached (response):', reqUrl);
      } catch (err) {
        vlog('response capture error', err.message);
      }
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    // Many AEM-on-EDS sites (zonnic included) inject the bulk of their
    // design system CSS as an inline <style> element AFTER networkidle.
    // Wait long enough for that to land, then poll the head until at least
    // one large (>30KB) inline stylesheet shows up or the timeout expires.
    await page.waitForTimeout(2500);
    try {
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('style')).some(s => (s.textContent || '').length > 30000),
        { timeout: 15000 },
      );
      vlog('large inline <style> detected in document');
    } catch {
      vlog('no large inline <style> appeared within 15s -- proceeding anyway');
    }

    // Second pass: for any stylesheet referenced in the head that we
    // didn't capture (often Imperva-protected like brand.min.css), retry
    // via an in-page fetch. The page's own origin is allowed; same-origin
    // XHR from the rendered document passes the bot challenge that a
    // fresh request.get() fails.
    const declaredHrefs = await page.evaluate(() =>
      Array.from(document.head.querySelectorAll('link[rel="stylesheet"][href]'))
        .map(el => el.href)
        .filter(Boolean)
    );
    for (const href of declaredHrefs) {
      if (localised.has(href) || skip.test(href)) continue;
      try {
        const text = await page.evaluate(async (u) => {
          const r = await fetch(u, { credentials: 'include', mode: 'cors' });
          if (!r.ok) return { ok: false, status: r.status };
          return { ok: true, body: await r.text() };
        }, href);
        if (!text?.ok) {
          vlog('in-page css fetch non-ok', text?.status, href);
          continue;
        }
        const dest = join(assetsDir, safeNameFor(href));
        await writeFile(dest, text.body);
        localised.set(href, dest);
        vlog('cached (in-page fetch):', href);
      } catch (err) {
        vlog('in-page css fetch failed', href, err.message);
      }
    }

    // Build the head: clone document.head + append every inline <style>
    // we find anywhere in the document (body too) so JS-injected design
    // CSS is preserved. Rewrite <link href> to local file:// URLs.
    const head = await page.evaluate(([localiseEntries, skipPattern]) => {
      const localMap = new Map(localiseEntries);
      const clone = document.head.cloneNode(true);
      for (const el of Array.from(clone.querySelectorAll('script'))) el.remove();
      for (const el of Array.from(clone.querySelectorAll('meta[http-equiv="refresh"]'))) el.remove();
      const skipRe = new RegExp(skipPattern, 'i');
      for (const link of Array.from(clone.querySelectorAll('link[href]'))) {
        const abs = link.href;
        if (link.rel === 'stylesheet') {
          if (skipRe.test(abs)) {
            link.remove();
            continue;
          }
          if (localMap.has(abs)) {
            link.setAttribute('href', `__LOCAL_CSS__${localMap.get(abs)}__LOCAL_CSS__`);
            continue;
          }
          // Stylesheet we couldn't capture — drop it; it would 403/ORB
          // when loaded from a file:// origin.
          link.remove();
          continue;
        }
        // Absolute-ise everything else (favicons, fonts, alternates).
        if (abs) link.setAttribute('href', abs);
      }

      // Append every inline <style> found anywhere in the document that
      // isn't already inside the cloned head. Many BAT/AEM sites inject
      // the brand stylesheet as a body-level <style> after hydration.
      const headStyleTexts = new Set(Array.from(clone.querySelectorAll('style')).map(s => s.textContent || ''));
      for (const style of Array.from(document.querySelectorAll('style'))) {
        const text = style.textContent || '';
        if (!text) continue;
        if (headStyleTexts.has(text)) continue;
        if (text.length < 50) continue; // skip tiny utility blocks
        const dup = document.createElement('style');
        if (style.id) dup.setAttribute('data-source-id', style.id);
        dup.textContent = text;
        clone.appendChild(dup);
        headStyleTexts.add(text);
      }
      return clone.innerHTML;
    }, [Array.from(localised.entries()), skip.source]);

    log(`localised ${localised.size} stylesheet${localised.size === 1 ? '' : 's'} into ${assetsDir}`);
    return head;
  } finally {
    await browser.close();
  }
}

/**
 * Replace `__LOCAL_CSS__<absolutePath>__LOCAL_CSS__` placeholders in a
 * captured head with file:// URLs that resolve from `fromDir`. We use
 * absolute file:// URLs because per-component shells live at different
 * depths (atoms/<name>/, organisms/<name>/) and a single absolute URL
 * works from anywhere. The only downside is that moving the migration-
 * work folder breaks the links; that's acceptable for a working artifact.
 */
function localiseHeadFor(headHtml /*, fromDir (unused for absolute approach) */) {
  return headHtml.replace(/__LOCAL_CSS__([^]*?)__LOCAL_CSS__/g, (_, abs) => pathToFileURLString(abs));
}

function pathToFileURLString(absPath) {
  // Encode each path segment for file:// URLs. (No %2F on slashes.)
  const parts = absPath.split('/').map(seg => encodeURIComponent(seg));
  return `file://${parts.join('/')}`;
}

async function resolveLiveHead(manifest) {
  if (SKIP_LIVE) {
    if (await fileExists(LIVE_HEAD_CACHE)) {
      vlog('--no-live: reusing cached .live-head.html');
      return readText(LIVE_HEAD_CACHE);
    }
    vlog('--no-live and no cache: per-component previews will use minimal fallback');
    return '';
  }
  const url = manifest.source || manifest?.pages?.homepage || null;
  if (!url) {
    log('no site URL in manifest (source / pages.homepage); skipping live head capture');
    return (await fileExists(LIVE_HEAD_CACHE)) ? readText(LIVE_HEAD_CACHE) : '';
  }
  const bypass = (await fileExists(BYPASS_PATH)) ? await loadJSON(BYPASS_PATH) : null;
  try {
    const head = await captureLiveHead(url, bypass);
    await writeFile(LIVE_HEAD_CACHE, head);
    return head;
  } catch (err) {
    log('live head capture failed, falling back to cache/empty:', err.message);
    return (await fileExists(LIVE_HEAD_CACHE)) ? readText(LIVE_HEAD_CACHE) : '';
  }
}

// CSS applied inside every per-component preview so regulatory overlays and
// third-party chrome don't cover the element we're trying to show.
const COMPONENT_PREVIEW_OVERRIDES = `
  /* Reveal the body (the site ships it with visibility:hidden until its
     own runtime finishes booting). */
  body { display: block !important; visibility: visible !important; opacity: 1 !important; }

  /* Hide regulatory overlays and third-party widgets. */
  bat-agegate-zonnic, bat-locationselector-zonnic,
  #ageGate, #locationSelectorModal,
  #onetrust-banner-sdk, #onetrust-consent-sdk, #onetrust-pc-sdk,
  .ot-sdk-container, #ot-sdk-btn-floating,
  [id^="QSI"], [class*="QSIFeedbackButton"],
  [id*="embeddedMessaging"], [class*="embeddedService"],
  .helpButton, .grecaptcha-badge { display: none !important; }

  /* Preview chrome */
  .cmp-hud {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 2147483000;
    background: #0d1f44; color: #fff;
    padding: 10px 20px;
    font: 500 13px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex; flex-wrap: wrap; gap: 12px 18px; align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  }
  .cmp-hud strong { font-weight: 700; }
  .cmp-hud code { background: rgba(255,255,255,0.18); padding: 1px 6px; border-radius: 3px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; }
  .cmp-hud .cmp-hud-pill { background: #2dad70; padding: 2px 10px; border-radius: 999px; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; }
  .cmp-hud .cmp-hud-reg { background: #b43a3a; padding: 2px 10px; border-radius: 999px; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; }
  .cmp-hud a { color: #fff; text-decoration: underline; }
  .cmp-hud .cmp-hud-spacer { flex: 1; }
  .cmp-hud .cmp-hud-actions a { margin-left: 14px; }

  body { padding-top: 52px !important; }

  /* Sandbox around the rendered anatomy so it doesn't collide with other
     layout. We constrain width a little for small atoms; organisms still
     get the full width. */
  .cmp-sandbox {
    margin: 24px auto;
    padding: 24px;
    max-width: 1280px;
    background: #ffffff;
    border: 1px dashed #dfe2ec;
    border-radius: 8px;
  }
  .cmp-sandbox--atom { max-width: 720px; padding: 32px; text-align: center; }
  .cmp-sandbox--molecule { max-width: 880px; padding: 32px; }
  .cmp-sandbox--organism { max-width: none; margin: 0; padding: 0; border: none; border-radius: 0; }
`;

function renderComponentPreview({ liveHead, level, name, meta, stats, anatomy, folderRelFromPreview }) {
  const shellHead = liveHead
    ? localiseHeadFor(liveHead)
    : '<meta charset="utf-8"><title>Component preview</title>';
  const sandboxMod = level === 'organisms' ? 'organism'
    : level === 'molecules' ? 'molecule'
    : 'atom';
  const regPill = meta?.regulatory ? '<span class="cmp-hud-reg">regulatory</span>' : '';
  const varCount = (stats?.variants ?? []).length;
  const uses = stats?.stats?.total != null ? stats.stats.total.toLocaleString() : '?';
  const pages = stats?.stats?.pages ?? '?';

  return `<!DOCTYPE html>
<html lang="en">
<head>
${shellHead}
<style>${COMPONENT_PREVIEW_OVERRIDES}</style>
</head>
<body>
<nav class="cmp-hud" role="banner">
  <strong>${escapeHtml(name)}</strong>
  <span class="cmp-hud-pill">${escapeHtml(level.replace(/s$/, ''))}</span>
  ${regPill}
  <code>${escapeHtml(uses)} uses</code>
  <code>${escapeHtml(String(pages))} pages</code>
  <code>${varCount} variant${varCount === 1 ? '' : 's'}</code>
  <span class="cmp-hud-spacer"></span>
  <span class="cmp-hud-actions">
    <a href="../../preview.html">← styleguide</a>
    <a href="./anatomy.html">anatomy.html</a>
    <a href="./computed.css">computed.css</a>
    <a href="./README.md">README</a>
  </span>
</nav>
<div class="cmp-sandbox cmp-sandbox--${sandboxMod}">
${anatomy}
</div>
</body>
</html>`;
}

async function writeComponentPreview({ liveHead, comp, meta }) {
  const previewPath = join(comp.dir, 'preview.html');
  const folderRelFromPreview = '.';
  const html = renderComponentPreview({
    liveHead,
    level: comp.level,
    name: comp.name,
    meta,
    stats: comp.stats,
    anatomy: comp.anatomy || '<!-- anatomy.html missing -->',
    folderRelFromPreview,
  });
  await writeFile(previewPath, html);
  return previewPath;
}

// ---- components ----------------------------------------------------------

async function loadComponentData(level, name) {
  const dir = join(COMPONENTS_DIR, level, name);
  const stats = await loadJSON(join(dir, 'stats.json')).catch(() => null);
  const anatomy = await readText(join(dir, 'anatomy.html'));
  const computedCss = await readText(join(dir, 'computed.css'));
  let evidence = [];
  try {
    const entries = await readdir(join(dir, 'evidence'));
    evidence = entries.filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f)).sort();
  } catch {
    evidence = [];
  }
  return { dir, name, level, stats, anatomy, computedCss, evidence };
}

/**
 * anatomy.html is a stack of variant fragments delimited by HTML comments
 * emitted by extract-components.mjs:
 *   <!-- button — variant: primary -->
 *   <!-- sample page: homepage -->
 *   <!-- selector: .bat-cta-style.button-dark -->
 *   <a class="bat-cta-style ...">...</a>
 *
 * Returns an array of { name, samplePage, selector, html } in the order
 * they appear in the file. If no variant markers are found, returns a
 * single entry named "default" with the whole document as html.
 */
function splitAnatomyByVariant(anatomy, componentName) {
  if (!anatomy || !anatomy.trim()) return [];
  const reHeader = new RegExp(`<!--\\s*${escapeRegex(componentName)}\\s*\\u2014\\s*variant:\\s*([^\\n>]+?)\\s*-->`, 'g');
  const matches = [...anatomy.matchAll(reHeader)];
  if (!matches.length) {
    return [{ name: 'default', html: anatomy.trim() }];
  }
  const parts = [];
  for (let i = 0; i < matches.length; i += 1) {
    const m = matches[i];
    const next = matches[i + 1];
    const start = m.index + m[0].length;
    const end = next ? next.index : anatomy.length;
    const segment = anatomy.slice(start, end);
    let samplePage = '';
    let selector = '';
    const meta = [];
    let body = segment;
    body = body.replace(/<!--\s*sample page:\s*([^\n>]+?)\s*-->/i, (_, v) => { samplePage = v.trim(); return ''; });
    body = body.replace(/<!--\s*selector:\s*([^\n>]+?)\s*-->/i, (_, v) => { selector = v.trim(); return ''; });
    parts.push({
      name: m[1].trim(),
      samplePage,
      selector,
      html: body.trim(),
    });
  }
  return parts;
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function componentDescription(manifest, level, name) {
  const bucket = manifest?.[level] ?? [];
  const found = bucket.find(c => c.name === name);
  return found ? {
    description: found.description || '',
    edsMapping: found.edsMapping || {},
    regulatory: !!found.regulatory,
    variants: found.variants || [],
  } : { description: '', edsMapping: {}, regulatory: false, variants: [] };
}

function renderComponentBlock({ comp, meta }) {
  const stats = comp.stats?.stats ?? {};
  const totalUses = stats.total ?? null;
  const pages = stats.pages ?? null;
  const variantStatuses = Object.fromEntries((comp.stats?.variants ?? []).map(v => [v.name, v]));
  const folderRel = relative(dirname(OUT_PATH), comp.dir);
  const previewHref = escapeHtml(relative(dirname(OUT_PATH), join(comp.dir, 'preview.html')));

  // Variants live in two parallel sources:
  //   - anatomy.html  -> raw HTML fragments (one block per variant, with
  //                     <!-- variant: name --> markers)
  //   - evidence/<name>.png -> pixel-perfect screenshot from extract-components
  // The live site's brand.min.css is bot-blocked from headless contexts,
  // so rendering the raw HTML fragment doesn't reliably reproduce the
  // visual. We therefore use the screenshots as the primary visual inside
  // each .atom-demo cell (pixel-perfect, what authors actually see), and
  // expose the raw HTML/CSS in collapsible <details> below for inspection.
  const fragmentsByName = new Map(splitAnatomyByVariant(comp.anatomy, comp.name).map(v => [v.name, v]));
  const variantNames = comp.evidence.length
    ? comp.evidence.map(f => f.replace(/\.[^.]+$/, ''))
    : Array.from(fragmentsByName.keys());
  const variantList = variantNames.map(name => ({
    name,
    fragment: fragmentsByName.get(name),
    evidenceFile: comp.evidence.find(f => f.replace(/\.[^.]+$/, '') === name) || null,
    status: variantStatuses[name],
  }));

  const headlineNames = variantList.map(v => v.name).join(', ');

  const metaBits = [];
  if (totalUses != null) metaBits.push(`<strong>${totalUses.toLocaleString()}</strong> uses`);
  if (pages != null) metaBits.push(`<strong>${pages}</strong> page${pages === 1 ? '' : 's'}`);
  if (variantList.length) metaBits.push(`<strong>${variantList.length}</strong> variant${variantList.length === 1 ? '' : 's'}`);

  const regulatoryBadge = meta.regulatory
    ? `<span class="pill pill-reg" title="Regulatory component — typically captured with clearBypass:true during extraction.">regulatory</span>`
    : '';

  const strategy = meta.edsMapping?.strategy
    ? `<div class="comp-eds"><code>edsMapping.strategy</code> → <strong>${escapeHtml(meta.edsMapping.strategy)}</strong>${meta.edsMapping.notes ? `<div class="comp-eds-notes">${escapeHtml(meta.edsMapping.notes)}</div>` : ''}</div>`
    : '';

  const isOrganism = comp.level === 'organisms';

  let variantsHtml;
  if (variantList.length === 0) {
    variantsHtml = `<p class="preview-empty">No variants captured for this component.</p>`;
  } else if (isOrganism) {
    // Organisms: one full-width frame per variant.
    variantsHtml = variantList.map(v => {
      const hidden = v.status?.hiddenFallback;
      const fragment = v.fragment;
      const evidenceSrc = v.evidenceFile
        ? escapeHtml(relative(dirname(OUT_PATH), join(comp.dir, 'evidence', v.evidenceFile)))
        : null;
      return `<div class="variant-block">
        <div class="variant-caption">
          <code>${escapeHtml(v.name)}</code>
          ${hidden ? `<span class="variant-pill variant-pill--warn" title="DOM-present but not visible at extraction time.">hidden-fallback</span>` : ''}
          ${fragment?.samplePage ? `<small>sample: <code>${escapeHtml(fragment.samplePage)}</code></small>` : ''}
        </div>
        <div class="organism-frame">
          ${evidenceSrc
            ? `<img class="organism-evidence" src="${evidenceSrc}" alt="${escapeHtml(comp.name)} — ${escapeHtml(v.name)}" loading="lazy">`
            : `<p class="preview-empty">No screenshot evidence — see anatomy.html below for raw HTML.</p>`}
        </div>
      </div>`;
    }).join('\n');
  } else {
    // Atoms / molecules: cluster in a labelled .atom-demo container.
    const cells = variantList.map(v => {
      const hidden = v.status?.hiddenFallback;
      const evidenceSrc = v.evidenceFile
        ? escapeHtml(relative(dirname(OUT_PATH), join(comp.dir, 'evidence', v.evidenceFile)))
        : null;
      return `<div class="variant-cell" data-variant="${escapeHtml(v.name)}">
        <div class="variant-render">
          ${evidenceSrc
            ? `<img class="variant-evidence" src="${evidenceSrc}" alt="${escapeHtml(comp.name)} — ${escapeHtml(v.name)}" loading="lazy">`
            : `<span class="preview-empty">no evidence</span>`}
        </div>
        <div class="variant-caption">
          <code>${escapeHtml(v.name)}</code>
          ${hidden ? `<span class="variant-pill variant-pill--warn" title="DOM-present but not visible at extraction time.">hidden-fallback</span>` : ''}
        </div>
      </div>`;
    }).join('\n');
    variantsHtml = `<div class="atom-demo">${cells}</div>`;
  }

  const anatomyPreview = comp.anatomy
    ? `<details class="comp-details">
        <summary>anatomy.html <small>(outer HTML from live DOM, ${variantList.length} variant${variantList.length === 1 ? '' : 's'})</small></summary>
        <pre class="code-block"><code>${escapeHtml(comp.anatomy.slice(0, 4000))}${comp.anatomy.length > 4000 ? '\n…truncated…' : ''}</code></pre>
      </details>`
    : '';
  const cssPreview = comp.computedCss
    ? `<details class="comp-details">
        <summary>computed.css <small>(getComputedStyle snapshot)</small></summary>
        <pre class="code-block"><code>${escapeHtml(comp.computedCss.slice(0, 4000))}${comp.computedCss.length > 4000 ? '\n…truncated…' : ''}</code></pre>
      </details>`
    : '';

  return `<article class="comp-block" id="c-${escapeHtml(comp.level)}-${escapeHtml(comp.name)}">
    <header class="comp-block-head">
      <h3>
        <span class="comp-name">${escapeHtml(comp.name)}</span>
        ${headlineNames ? `<small class="comp-headline-variants">— ${escapeHtml(headlineNames)}</small>` : ''}
        ${regulatoryBadge}
      </h3>
      <div class="comp-actions">
        <a class="comp-action comp-action--primary" href="${previewHref}" target="_blank" rel="noopener">live preview →</a>
        <a class="comp-action" href="${escapeHtml(folderRel)}/" target="_blank" rel="noopener">folder</a>
      </div>
    </header>
    ${meta.description ? `<p class="comp-desc">${escapeHtml(meta.description)}</p>` : ''}
    ${metaBits.length ? `<p class="comp-meta">${metaBits.join(' · ')}</p>` : ''}
    ${variantsHtml}
    ${strategy}
    ${anatomyPreview}
    ${cssPreview}
  </article>`;
}

async function renderLevel(level, manifest, { liveHead }) {
  const dir = join(COMPONENTS_DIR, level);
  if (!(await fileExists(dir))) return { count: 0, html: '', items: [] };
  const entries = await readdir(dir, { withFileTypes: true });
  const names = entries.filter(e => e.isDirectory()).map(e => e.name).sort();
  const comps = [];
  for (const name of names) {
    const comp = await loadComponentData(level, name);
    const meta = componentDescription(manifest, level, name);
    const previewPath = await writeComponentPreview({ liveHead, comp, meta });
    vlog('wrote', previewPath);
    comps.push({ comp, meta });
  }
  if (!comps.length) return { count: 0, html: '', items: [] };
  return {
    count: comps.length,
    items: comps.map(({ comp }) => comp.name),
    html: `<div class="comp-stack">${comps.map(({ comp, meta }) => renderComponentBlock({ comp, meta })).join('\n')}</div>`,
  };
}

// ---- head / shell --------------------------------------------------------

const STYLES = `
:root {
  --pv-bg: #f6f7fb;
  --pv-surface: #ffffff;
  --pv-surface-soft: #eff1f8;
  --pv-border: #dfe2ec;
  --pv-text: #121629;
  --pv-muted: #5f647a;
  --pv-accent: #0d1f44;
  --pv-accent-soft: #dde2f4;
  --pv-ok: #2dad70;
  --pv-warn: #c98a1b;
  --pv-reg: #b43a3a;
  --pv-radius: 10px;
  --pv-radius-sm: 6px;
  --pv-shadow: 0 1px 2px rgba(18,22,41,.04), 0 6px 20px rgba(18,22,41,.05);
  --pv-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --pv-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: var(--pv-sans);
  background: var(--pv-bg);
  color: var(--pv-text);
  font-size: 14px;
  line-height: 1.5;
}
code { font-family: var(--pv-mono); font-size: 12.5px; background: var(--pv-surface-soft); padding: 1px 5px; border-radius: 3px; }
pre.code-block {
  background: #0f1222; color: #e9ecf5;
  font-family: var(--pv-mono); font-size: 12px;
  padding: 12px 14px; border-radius: var(--pv-radius-sm);
  overflow: auto; max-height: 380px; line-height: 1.5;
}
pre.code-block code { background: transparent; padding: 0; color: inherit; font-size: inherit; }
a { color: var(--pv-accent); }

/* Layout */
.pv-app { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
.pv-nav {
  position: sticky; top: 0; align-self: start;
  height: 100vh; overflow-y: auto;
  background: var(--pv-surface); border-right: 1px solid var(--pv-border);
  padding: 24px 20px;
}
.pv-nav h1 { font-size: 18px; margin: 0 0 6px; }
.pv-nav p.site { font-size: 12px; color: var(--pv-muted); margin: 0 0 20px; }
.pv-nav a { display: block; padding: 4px 0; text-decoration: none; color: var(--pv-text); font-size: 13px; }
.pv-nav a.sub { padding-left: 14px; color: var(--pv-muted); }
.pv-nav a:hover { color: var(--pv-accent); }
.pv-nav h2 { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--pv-muted); margin: 18px 0 6px; display: flex; justify-content: space-between; align-items: baseline; }
.pv-nav h2 .count { letter-spacing: 0; text-transform: none; font-weight: 400; color: var(--pv-muted); }

.pv-main { padding: 32px 40px 80px; max-width: 1320px; }
.pv-hero {
  background: linear-gradient(135deg, #0d1f44 0%, #1a3079 100%);
  color: #fff; border-radius: var(--pv-radius); padding: 28px 32px;
  margin-bottom: 28px;
}
.pv-hero h1 { margin: 0 0 8px; font-size: 24px; font-weight: 700; }
.pv-hero p { margin: 0; opacity: .92; font-size: 14px; }
.pv-hero .stats { display: flex; gap: 24px; margin-top: 18px; }
.pv-hero .stat { font-size: 13px; opacity: .9; }
.pv-hero .stat strong { display: block; font-size: 22px; font-weight: 700; opacity: 1; }

.pv-section { margin-bottom: 40px; }
.pv-section > h2 {
  font-size: 20px; margin: 0 0 6px;
  display: flex; align-items: baseline; gap: 10px;
}
.pv-section > h2 .count { font-size: 13px; color: var(--pv-muted); font-weight: 400; }
.pv-section > p.lede { margin: 0 0 18px; color: var(--pv-muted); font-size: 13.5px; }

/* Foundations */
.foundation-group { margin-bottom: 22px; }
.foundation-group h3 { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--pv-muted); margin: 0 0 10px; }
.swatch-grid { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.swatch { background: var(--pv-surface); border: 1px solid var(--pv-border); border-radius: var(--pv-radius-sm); padding: 10px 12px; display: grid; gap: 4px; }
.swatch-chip { display: block; width: 100%; height: 40px; border-radius: var(--pv-radius-sm); }
.swatch-chip--bordered { box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
.swatch code { font-size: 11px; }
.swatch small { color: var(--pv-muted); font-family: var(--pv-mono); font-size: 11px; }
.spacing-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.spacing { display: grid; grid-template-columns: 180px 1fr 80px; gap: 12px; align-items: center; background: var(--pv-surface); border: 1px solid var(--pv-border); border-radius: var(--pv-radius-sm); padding: 6px 12px; }
.spacing-bar { height: 10px; background: var(--pv-accent); border-radius: 999px; }
.spacing small { color: var(--pv-muted); font-family: var(--pv-mono); font-size: 11px; text-align: right; }
.type-list, .token-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.type-row, .token-row { background: var(--pv-surface); border: 1px solid var(--pv-border); border-radius: var(--pv-radius-sm); padding: 10px 14px; display: grid; grid-template-columns: 240px 1fr auto; gap: 12px; align-items: center; }
.type-sample { font-size: 17px; color: var(--pv-text); }
.type-row code, .token-row code { font-size: 12px; }
.type-row small, .token-row small { color: var(--pv-muted); font-family: var(--pv-mono); font-size: 11px; }

/* Components — flowing styleguide layout (zonnic-ds shape) */
.comp-stack { display: flex; flex-direction: column; gap: 36px; }
.comp-block {
  background: var(--pv-surface);
  border: 1px solid var(--pv-border);
  border-radius: var(--pv-radius);
  padding: 22px 26px;
  box-shadow: var(--pv-shadow);
}
.comp-block + .comp-block { margin-top: 0; }
.comp-block-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; flex-wrap: wrap; margin-bottom: 6px;
}
.comp-block-head h3 {
  margin: 0; font-size: 18px; font-weight: 700;
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
}
.comp-block-head h3 .comp-name { color: var(--pv-text); }
.comp-block-head h3 .comp-headline-variants { color: var(--pv-muted); font-weight: 400; font-size: 14px; }
.comp-actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.comp-action {
  font-size: 12px; text-decoration: none; white-space: nowrap;
  padding: 5px 10px; border-radius: var(--pv-radius-sm);
  color: var(--pv-muted); background: transparent; border: 1px solid var(--pv-border);
  transition: background .15s ease, color .15s ease;
}
.comp-action:hover { background: var(--pv-surface-soft); color: var(--pv-accent); }
.comp-action--primary { background: var(--pv-accent); color: #fff; border-color: var(--pv-accent); font-weight: 600; }
.comp-action--primary:hover { background: #091638; color: #fff; }
.comp-desc { margin: 0 0 4px; color: var(--pv-text); font-size: 13.5px; max-width: 75ch; }
.comp-meta { margin: 0 0 14px; color: var(--pv-muted); font-size: 12.5px; }
.comp-meta strong { color: var(--pv-text); font-weight: 700; }
.comp-eds { margin-top: 14px; background: var(--pv-surface-soft); border-radius: var(--pv-radius-sm); padding: 10px 12px; font-size: 12.5px; }
.comp-eds-notes { margin-top: 6px; color: var(--pv-muted); font-size: 12px; }
.comp-details { border-top: 1px solid var(--pv-border); padding-top: 12px; margin-top: 14px; font-size: 12.5px; }
.comp-details + .comp-details { margin-top: 8px; border-top: 1px dashed var(--pv-border); }
.comp-details[open] { padding-bottom: 4px; }
.comp-details summary { cursor: pointer; font-weight: 600; color: var(--pv-muted); padding: 2px 0; }
.comp-details summary small { font-weight: 400; }
.comp-details pre { margin-top: 8px; }

/*
 * Atom / molecule demo container — mirrors the .atom-demo pattern from
 * the reference DS preview. Variant cells sit on a soft raised surface
 * so each variant evidence reads as a specimen.
 *
 * Variant evidence is the screenshot extract-components.mjs captured for
 * each variant (pixel-perfect, with real site CSS). Sized to read clearly
 * without overwhelming the layout: minmax(220px) grid, ~280px tall cells.
 */
.atom-demo {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 28px;
  margin: 8px 0;
  background: #f4f5f7;
  border: 1px solid var(--pv-border);
  border-radius: var(--pv-radius-sm);
}
.atom-demo:has(.variant-cell:only-child) { grid-template-columns: minmax(220px, 480px); justify-content: start; }
.variant-cell {
  display: flex; flex-direction: column; gap: 10px;
  min-width: 0;
}
.variant-render {
  display: flex; align-items: center; justify-content: center;
  min-height: 200px;
  padding: 16px;
  background: var(--pv-surface);
  border: 1px solid var(--pv-border);
  border-radius: var(--pv-radius-sm);
  overflow: hidden;
}
.variant-evidence {
  display: block;
  max-width: 100%;
  max-height: 280px;
  width: auto; height: auto;
  object-fit: contain;
}
.variant-caption {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--pv-muted);
}
.variant-caption code {
  background: transparent; padding: 0;
  font-family: var(--pv-mono); font-size: 12px;
  color: var(--pv-text); font-weight: 600;
}
.variant-caption small { color: var(--pv-muted); font-size: 11px; }
.variant-caption small code { font-weight: 400; color: var(--pv-muted); }
.variant-pill { display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 999px; background: var(--pv-accent-soft); color: var(--pv-accent); font-weight: 600; }
.variant-pill--ok { background: #e1f4ea; color: var(--pv-ok); }
.variant-pill--warn { background: #fbf0d9; color: var(--pv-warn); }

/*
 * Organism harness — full-width frame around each variant screenshot so
 * wide compositions (header / hero / footer) read at full bleed. Image
 * is anchored top-center so the most-important framing is preserved.
 */
#organisms .comp-block { padding-left: 0; padding-right: 0; }
#organisms .comp-block-head,
#organisms .comp-desc,
#organisms .comp-meta,
#organisms .comp-eds,
#organisms .comp-details { padding-left: 26px; padding-right: 26px; }
.variant-block { display: flex; flex-direction: column; gap: 8px; margin: 8px 0 18px; }
.variant-block .variant-caption { padding: 0 26px; }
.organism-frame {
  border-block: 1px solid var(--pv-border);
  background: #0d1f44;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 200px;
  max-height: 720px;
}
.organism-evidence {
  display: block;
  width: 100%;
  height: auto;
  max-height: 720px;
  object-fit: cover;
  object-position: top center;
}

.pill-reg { background: #fae1e1; color: var(--pv-reg); display: inline-block; font-size: 10px; letter-spacing: .06em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
.preview-empty { color: var(--pv-muted); font-style: italic; font-size: 13px; margin: 6px 0; }

/*
 * Hide third-party / regulatory chrome that the inlined live <head> CSS
 * tries to render (cookie banners, chat widgets, feedback tabs, etc.).
 * These are runtime overlays, not part of the design system.
 */
bat-agegate-zonnic, bat-locationselector-zonnic,
#ageGate, #locationSelectorModal,
#onetrust-banner-sdk, #onetrust-consent-sdk, #onetrust-pc-sdk,
.ot-sdk-container, #ot-sdk-btn-floating,
[id^="QSI"], [id^="QSIWebResponseSec"], [class*="QSIFeedbackButton"],
[class*="QSIFeedback"], [class*="QualtricsFeedback"],
[id*="embeddedMessaging"], [class*="embeddedService"],
.helpButton, .grecaptcha-badge,
bat-cookie-zonnic { display: none !important; }

@media (max-width: 900px) {
  .pv-app { grid-template-columns: 1fr; }
  .pv-nav { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--pv-border); }
  .pv-main { padding: 24px 20px 60px; }
}
`;

function renderHead(title, liveHead, variablesCss) {
  // Inline the live site's <head> first so every bat-* class inside the
  // anatomy fragments inherits its real styling. Stylesheets are rewritten
  // to absolute file:// URLs of locally-cached copies so they load even
  // when the page is opened from a `file://` origin (Chrome ORB blocks
  // cross-origin https stylesheets in that case).
  const liveBlock = liveHead
    ? `<!-- live site <head> (scripts stripped, stylesheets localised) -->\n${localiseHeadFor(liveHead)}`
    : '';
  const tokenBlock = variablesCss
    ? `<!-- extracted CSS variables -->\n<style>${variablesCss}</style>`
    : '';
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
${liveBlock}
${tokenBlock}
<style>${STYLES}</style>`;
}

function renderSidebar({ site, foundationsCount, atoms, molecules, organisms }) {
  const lvlNav = (label, level, items, count) => `
  <h2>${escapeHtml(label)} <span class="count">${count}</span></h2>
  ${items.map(name => `<a class="sub" href="#c-${escapeHtml(level)}-${escapeHtml(name)}">${escapeHtml(name)}</a>`).join('')}`;
  return `<aside class="pv-nav">
  <h1>Forensic Design System</h1>
  <p class="site">${escapeHtml(site)}</p>
  <a href="#overview">Overview</a>
  <h2>Foundations <span class="count">${foundationsCount}</span></h2>
  <a class="sub" href="#foundations">Tokens</a>
  ${lvlNav('Atoms', 'atoms', atoms, atoms.length)}
  ${lvlNav('Molecules', 'molecules', molecules, molecules.length)}
  ${lvlNav('Organisms', 'organisms', organisms, organisms.length)}
</aside>`;
}

// ---- main ----------------------------------------------------------------

async function main() {
  log('manifest =', MANIFEST_PATH);
  log('components =', COMPONENTS_DIR);
  log('tokens =', TOKENS_DIR);

  const manifest = await loadJSON(MANIFEST_PATH);
  const site = manifest.site ?? 'site';

  // Foundations: find the *-variables.css file in the tokens dir.
  let variablesCss = '';
  try {
    const files = await readdir(TOKENS_DIR);
    const pick = files.find(f => /-variables\.css$/.test(f));
    if (pick) {
      variablesCss = await readText(join(TOKENS_DIR, pick));
      vlog('using variables css:', pick);
    }
  } catch { /* no tokens dir — foundations will be empty */ }
  const tokenGroups = parseVariables(variablesCss);
  const tokenTotal = tokenGroups.reduce((s, g) => s + g.items.length, 0);

  // Capture live <head> once so per-component preview shells can render
  // anatomy.html with their real CSS.
  await mkdir(COMPONENTS_DIR, { recursive: true });
  const liveHead = await resolveLiveHead(manifest);
  vlog('live head length:', liveHead.length);

  // Run levels sequentially so the log ordering stays readable when verbose.
  const atomsSection = await renderLevel('atoms', manifest, { liveHead });
  const molSection = await renderLevel('molecules', manifest, { liveHead });
  const orgSection = await renderLevel('organisms', manifest, { liveHead });

  const title = `Forensic Design System — ${site}`;
  const generated = new Date().toISOString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>${renderHead(title, liveHead, variablesCss)}</head>
<body>
<div class="pv-app">
  ${renderSidebar({
    site,
    foundationsCount: tokenTotal,
    atoms: atomsSection.items,
    molecules: molSection.items,
    organisms: orgSection.items,
  })}
  <main class="pv-main">
    <section id="overview" class="pv-hero">
      <h1>${escapeHtml(title)}</h1>
      <p>Living styleguide built from evidence extracted out of the live site. Each variant below is shown using its <strong>pixel-perfect screenshot from <code>extract-components.mjs</code></strong>; click <strong>live preview →</strong> on any component for a full-page rendering with the live site's CSS inlined.</p>
      <div class="stats">
        <div class="stat"><strong>${tokenTotal}</strong>tokens</div>
        <div class="stat"><strong>${atomsSection.count}</strong>atoms</div>
        <div class="stat"><strong>${molSection.count}</strong>molecules</div>
        <div class="stat"><strong>${orgSection.count}</strong>organisms</div>
      </div>
    </section>

    <section id="foundations" class="pv-section">
      <h2>Foundations <span class="count">${tokenTotal} tokens · raw designlang extraction</span></h2>
      <p class="lede">Un-normalised tokens as observed on the live site. Normalisation to a clean, curated set happens in the <code>migration-design-system</code> skill.</p>
      ${renderFoundationsSection(tokenGroups)}
    </section>

    <section id="atoms" class="pv-section">
      <h2>Atoms <span class="count">${atomsSection.count} components</span></h2>
      <p class="lede">Single-purpose elements rendered live from <code>components/atoms/&lt;name&gt;/anatomy.html</code>. Use <strong>live preview →</strong> for a full-page inspection of each component.</p>
      ${atomsSection.html || '<p class="preview-empty">No atoms extracted yet.</p>'}
    </section>

    <section id="molecules" class="pv-section">
      <h2>Molecules <span class="count">${molSection.count} components</span></h2>
      <p class="lede">Compositions of atoms. One intent per molecule. Rendered inline from each component's <code>anatomy.html</code>.</p>
      ${molSection.html || '<p class="preview-empty">No molecules extracted yet.</p>'}
    </section>

    <section id="organisms" class="pv-section">
      <h2>Organisms <span class="count">${orgSection.count} components</span></h2>
      <p class="lede">Page-scale compositions. Each maps to (or becomes) an EDS block — see <code>edsMapping.strategy</code> per component.</p>
      ${orgSection.html || '<p class="preview-empty">No organisms extracted yet.</p>'}
    </section>

    <footer style="color:var(--pv-muted);font-size:12px;margin-top:40px;border-top:1px solid var(--pv-border);padding-top:16px">
      Generated ${escapeHtml(generated)} · source:
      <code>${escapeHtml(relative(dirname(OUT_PATH), MANIFEST_PATH))}</code> +
      <code>${escapeHtml(relative(dirname(OUT_PATH), COMPONENTS_DIR))}/</code> +
      <code>${escapeHtml(relative(dirname(OUT_PATH), TOKENS_DIR))}/</code>
    </footer>
  </main>
</div>
</body>
</html>`;

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, html);
  log('wrote', OUT_PATH);
  log(`tokens=${tokenTotal}, atoms=${atomsSection.count}, molecules=${molSection.count}, organisms=${orgSection.count}`);
}

main().catch(err => {
  console.error('[preview] FAILED', err);
  process.exit(1);
});
