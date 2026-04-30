#!/usr/bin/env node
/**
 * Runtime accessibility scan using axe-core on representative pages.
 *
 * This is an independent signal: designlang's grade.json reports an
 * "accessibility" score derived from CSS heuristics (contrast, ARIA
 * presence). axe-core actually runs against the live DOM with the same
 * bypass cookies the extraction used — catching issues that only
 * surface at runtime (focus traps, dynamic landmarks, reachable
 * widgets, form labels, etc.).
 *
 * Usage:
 *   node a11y-scan.mjs <base-url> \
 *     --bypass-file ./migration-work/bypass-result.json \
 *     --pages-file  ./migration-work/sitemap-result.json \
 *     --output-dir  ./migration-work/a11y \
 *     [--max-templates 10]
 *
 * Outputs (per representative page):
 *   <output-dir>/<slug>.json      -- full axe result
 *   <output-dir>/summary.json     -- aggregated violations across pages
 */

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// axe-core is injected from CDN at runtime to avoid an npm dependency
// in the buildless repo. Pin the major version for reproducibility.
const AXE_CDN_URL = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.0/axe.min.js';

const args = process.argv.slice(2);
const BASE_URL_ARG = args.find((a) => !a.startsWith('--'));

function getFlag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}

if (!BASE_URL_ARG) {
  console.error('Usage: node a11y-scan.mjs <base-url> [--bypass-file <path>] [--pages-file <path>] [--output-dir <dir>] [--max-templates N]');
  process.exit(1);
}

const BYPASS_FILE = getFlag('--bypass-file');
const PAGES_FILE = getFlag('--pages-file');
const OUTPUT_DIR = getFlag('--output-dir') || './migration-work/a11y';
const MAX_TEMPLATES = parseInt(getFlag('--max-templates') || '10', 10);

async function loadBypass() {
  if (!BYPASS_FILE) return { cookies: [], hideSelectors: [] };
  try {
    const raw = await readFile(BYPASS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    const host = new URL(BASE_URL_ARG).hostname;
    const cookies = (data.bypass_cookies_full || []).map((c) => ({
      name: c.name,
      value: c.value,
      domain: `.${host}`,
      path: '/',
    }));
    return { cookies, hideSelectors: data.hide_css_selectors || [] };
  } catch (err) {
    process.stderr.write(`[a11y] Warning: could not read bypass file: ${err.message}\n`);
    return { cookies: [], hideSelectors: [] };
  }
}

async function loadPages() {
  const pages = [];
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
        if (!relative) continue;
        const slug = relative.replace(/\//g, '-') || 'page';
        pages.push({ slug, url });
      }
    } catch (err) {
      process.stderr.write(`[a11y] Warning: could not read pages file: ${err.message}\n`);
    }
  }

  // Cap to --max-templates (homepage + first N-1)
  return pages.slice(0, MAX_TEMPLATES);
}

async function scanPage(context, hideCSS, { slug, url }) {
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    process.stderr.write(`  [${slug}] skip (nav: ${err.message.split('\n')[0]})\n`);
    await page.close();
    return { slug, url, skipped: true, error: err.message };
  }

  if (hideCSS) {
    await page.addStyleTag({ content: hideCSS }).catch(() => {});
  }

  await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  try {
    await page.addScriptTag({ url: AXE_CDN_URL });
  } catch (err) {
    process.stderr.write(`  [${slug}] skip (axe inject: ${err.message})\n`);
    await page.close();
    return { slug, url, skipped: true, error: `axe inject failed: ${err.message}` };
  }

  const results = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const axeResults = await axe.run(document, {
      resultTypes: ['violations', 'incomplete'],
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
    });
    return {
      violations: axeResults.violations,
      incomplete: axeResults.incomplete,
      testEngine: axeResults.testEngine,
      url: axeResults.url,
    };
  });

  await page.close();

  const counts = {
    violations: results.violations.length,
    incomplete: results.incomplete.length,
    byImpact: { critical: 0, serious: 0, moderate: 0, minor: 0 },
    byRule: {},
  };
  for (const v of results.violations) {
    if (v.impact && counts.byImpact[v.impact] !== undefined) {
      counts.byImpact[v.impact] += v.nodes.length;
    }
    counts.byRule[v.id] = (counts.byRule[v.id] || 0) + v.nodes.length;
  }

  process.stderr.write(`  [${slug}] violations=${counts.violations} critical=${counts.byImpact.critical} serious=${counts.byImpact.serious}\n`);
  return { slug, url, counts, ...results };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const { cookies, hideSelectors } = await loadBypass();
  const pages = await loadPages();

  const hideCSS = hideSelectors.length > 0
    ? `${hideSelectors.join(', ')} { display: none !important; visibility: hidden !important; pointer-events: none !important; }`
    : '';

  process.stderr.write(`[a11y] Scanning ${pages.length} page(s)\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  });

  if (cookies.length > 0) {
    await context.addCookies(cookies);
  }

  const perPageResults = [];
  for (const pg of pages) {
    const result = await scanPage(context, hideCSS, pg);
    perPageResults.push(result);
    const path = resolve(OUTPUT_DIR, `${pg.slug}.json`);
    await writeFile(path, JSON.stringify(result, null, 2));
  }

  await context.close();
  await browser.close();

  // Aggregate summary across pages
  const summary = {
    pages_scanned: perPageResults.length,
    pages_skipped: perPageResults.filter((r) => r.skipped).length,
    totals: {
      violations: 0,
      incomplete: 0,
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    },
    byRule: {},
    perPage: perPageResults.map((r) => ({
      slug: r.slug,
      url: r.url,
      skipped: !!r.skipped,
      counts: r.counts || null,
    })),
  };

  for (const r of perPageResults) {
    if (!r.counts) continue;
    summary.totals.violations += r.counts.violations;
    summary.totals.incomplete += r.counts.incomplete;
    summary.totals.critical += r.counts.byImpact.critical;
    summary.totals.serious += r.counts.byImpact.serious;
    summary.totals.moderate += r.counts.byImpact.moderate;
    summary.totals.minor += r.counts.byImpact.minor;
    for (const [rule, count] of Object.entries(r.counts.byRule)) {
      summary.byRule[rule] = (summary.byRule[rule] || 0) + count;
    }
  }

  const summaryPath = resolve(OUTPUT_DIR, 'summary.json');
  await writeFile(summaryPath, JSON.stringify(summary, null, 2));

  process.stderr.write(
    `[a11y] Done. ${summary.totals.violations} total violations (${summary.totals.critical} critical, ${summary.totals.serious} serious)\n`,
  );
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
}

main().catch((err) => {
  console.error('[a11y] Fatal:', err.message);
  console.error(err.stack);
  process.exit(0); // don't break the pipeline
});
