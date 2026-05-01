#!/usr/bin/env node
/**
 * verify-component-coverage.mjs
 *
 * Phase 3g — Coverage validation.
 *
 * Verifies the forensic component inventory (driven by component-manifest.json
 * + produced by extract-components.mjs) actually covers every representative
 * page of the site:
 *
 *   1. For each page under migration-work/pages/*, parse cleaned.html.
 *   2. For every component/variant in the manifest, count DOM matches on
 *      that page using the same selectors extract-components.mjs uses.
 *   3. Flag gaps:
 *        (a) pages listed in a component's observedPages that have 0 matches
 *            (manifest disagrees with reality)
 *        (b) top-level sections / custom elements present on the page that
 *            don't match ANY manifest selector (candidate un-catalogued
 *            components)
 *        (c) components in the manifest that match 0 pages (dead entries)
 *   4. Emit:
 *        migration-work/components/coverage-matrix.json   -- machine-readable
 *        migration-work/components/coverage-report.md     -- human-readable
 *
 * Usage:
 *   node verify-component-coverage.mjs
 *       [--manifest ./migration-work/component-manifest.json]
 *       [--pages    ./migration-work/pages]
 *       [--sitemap  ./migration-work/sitemap-result.json]
 *       [--out      ./migration-work/components]
 *       [--verbose]
 */

import { mkdir, writeFile, readFile, readdir, access } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

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
const PAGES_DIR = resolve(args.pages ?? './migration-work/pages');
const SITEMAP_PATH = resolve(args.sitemap ?? './migration-work/sitemap-result.json');
const OUT_DIR = resolve(args.out ?? './migration-work/components');
const VERBOSE = !!args.verbose;

function log(...a) { console.log('[coverage]', ...a); }
function vlog(...a) { if (VERBOSE) console.log('[coverage]', ...a); }

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function loadJSON(p) { return JSON.parse(await readFile(p, 'utf-8')); }

// ---- page discovery ------------------------------------------------------

/**
 * Enumerate migration-work/pages/<slug>/ and read metadata.json to get the
 * canonical URL. Returns an ordered array of { slug, url, html, metadata }.
 */
async function discoverPages() {
  const entries = await readdir(PAGES_DIR, { withFileTypes: true });
  const pages = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = join(PAGES_DIR, e.name);
    const htmlPath = join(dir, 'cleaned.html');
    const metaPath = join(dir, 'metadata.json');
    if (!(await fileExists(htmlPath))) continue;
    const html = await readFile(htmlPath, 'utf-8');
    let metadata = {};
    if (await fileExists(metaPath)) {
      metadata = await loadJSON(metaPath).catch(() => ({}));
    }
    pages.push({
      slug: e.name,
      url: metadata.url || '',
      title: metadata?.metadata?.title || '',
      template: metadata?.metadata?.template || '',
      html,
    });
  }
  return pages.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Resolve manifest page-alias -> page slug on disk. Manifests use aliases
 * like "homepage", "product-detail", "blog-article"; disk uses URL slugs.
 * We match by URL.
 */
function resolveManifestPageMap(manifest, pages) {
  const map = {};
  const byUrl = new Map(pages.map(p => [normalizeUrl(p.url), p.slug]));
  for (const [alias, url] of Object.entries(manifest.pages ?? {})) {
    const n = normalizeUrl(url);
    // Direct match.
    if (byUrl.has(n)) {
      map[alias] = byUrl.get(n);
      continue;
    }
    // Fuzzy match: manifest URLs sometimes use "/" where disk uses "-"
    // (e.g. manifest "contact-us/testimonials" -> disk slug
    // "contact-us-testimonials").
    for (const p of pages) {
      if (!p.url) continue;
      const slugFromUrl = urlToSlug(p.url);
      if (slugFromUrl === urlToSlug(url)) {
        map[alias] = p.slug;
        break;
      }
    }
  }
  return map;
}

function normalizeUrl(u) {
  if (!u) return '';
  try {
    const url = new URL(u);
    return (url.origin + url.pathname).replace(/\/$/, '');
  } catch {
    return String(u).replace(/\/$/, '');
  }
}
function urlToSlug(u) {
  const n = normalizeUrl(u);
  return n.split('/').filter(Boolean).slice(-3).join('-').toLowerCase();
}

// ---- DOM matching --------------------------------------------------------

function buildDom(html) {
  return new JSDOM(html).window.document;
}

/**
 * Robustly run querySelectorAll with selector groups. If any single selector
 * in a comma-separated list is invalid (jsdom rejects bat-* pseudo-selectors
 * occasionally) we split and run each fragment individually.
 */
function safeQueryAll(root, selector) {
  if (!selector) return [];
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    const parts = selector.split(',').map(s => s.trim()).filter(Boolean);
    const results = new Set();
    for (const p of parts) {
      try {
        for (const el of root.querySelectorAll(p)) results.add(el);
      } catch { /* ignore invalid fragment */ }
    }
    return Array.from(results);
  }
}

/**
 * Does at least one fingerprint match this page? Fingerprints are simple CSS
 * selectors stored on each manifest entry (e.g. ".bat-cta-style", ".bat-button").
 */
function matchFingerprint(doc, fingerprints) {
  let total = 0;
  for (const fp of fingerprints ?? []) {
    total += safeQueryAll(doc, fp).length;
  }
  return total;
}

// ---- coverage ------------------------------------------------------------

function levels(manifest) {
  return [
    { name: 'atoms', items: manifest.atoms ?? [] },
    { name: 'molecules', items: manifest.molecules ?? [] },
    { name: 'organisms', items: manifest.organisms ?? [] },
  ];
}

function computePageCoverage(page, manifest) {
  const doc = buildDom(page.html);
  const rows = [];
  for (const { name: levelName, items } of levels(manifest)) {
    for (const comp of items) {
      let totalHits = matchFingerprint(doc, comp.domFingerprint ?? []);
      const variants = [];
      for (const v of comp.variants ?? []) {
        const hits = safeQueryAll(doc, v.selector).length;
        variants.push({ name: v.name, selector: v.selector, hits });
      }
      const variantHits = variants.reduce((s, v) => s + v.hits, 0);
      const used = totalHits > 0 || variantHits > 0;
      rows.push({
        level: levelName,
        component: comp.name,
        used,
        fingerprintHits: totalHits,
        variantHits,
        variants,
      });
    }
  }
  return rows;
}

// ---- gap detection -------------------------------------------------------

/**
 * Enumerate "obvious" top-level DOM nodes that look like components but
 * don't match any manifest selector. Heuristic: look for custom elements
 * (tag names with a dash, e.g. <bat-hero-zonnic>) and for direct children
 * of section wrappers. Filter out whitelisted site-chrome elements.
 */
// Base whitelist of regulatory / bypassed overlays that are always
// covered elsewhere (age gate + location selector are captured but kept
// hidden on visible pages).
const BASE_WHITELIST = new Set([
  'bat-agegate-zonnic',
  'bat-locationselector-zonnic',
]);
function buildWhitelist(manifest) {
  const set = new Set(BASE_WHITELIST);
  for (const tag of manifest?.coverage?.chromeTags ?? []) {
    set.add(String(tag).toLowerCase());
  }
  return set;
}
// Custom elements we already catalog by direct selector OR by fingerprint on
// an ancestor. Used to suppress duplicate gap flags -- we match by "the tag
// appears anywhere in a manifest selector string".
function cataloguedTagNames(manifest) {
  const tags = new Set();
  for (const { items } of levels(manifest)) {
    for (const comp of items) {
      const blobs = [
        ...(comp.domFingerprint ?? []),
        ...(comp.variants ?? []).map(v => v.selector ?? ''),
      ];
      for (const s of blobs) {
        for (const m of String(s).matchAll(/\bbat-[a-z0-9-]+\b/g)) {
          tags.add(m[0]);
        }
      }
    }
  }
  return tags;
}

function detectGapsOnPage(page, manifest) {
  const doc = buildDom(page.html);
  const catalogued = cataloguedTagNames(manifest);
  const whitelist = buildWhitelist(manifest);

  const gaps = [];
  const seen = new Set();

  // All custom elements (tag contains a dash and isn't a standard element).
  const customEls = Array.from(doc.querySelectorAll('*')).filter(el => {
    const tag = el.tagName.toLowerCase();
    if (!tag.includes('-')) return false;
    // Skip SVG-ish / MathML / known web component hosts from libraries.
    if (tag.startsWith('svg-')) return false;
    return true;
  });
  for (const el of customEls) {
    const tag = el.tagName.toLowerCase();
    if (whitelist.has(tag)) continue;
    if (catalogued.has(tag)) continue;
    // Skip if any ancestor matches a catalogued custom element (i.e.,
    // nested bat-* usually belongs to its parent organism).
    let ancestorCatalogued = false;
    let cur = el.parentElement;
    while (cur) {
      if (catalogued.has(cur.tagName.toLowerCase())) {
        ancestorCatalogued = true;
        break;
      }
      cur = cur.parentElement;
    }
    if (ancestorCatalogued) continue;
    const key = `tag:${tag}`;
    if (seen.has(key)) continue;
    seen.add(key);
    gaps.push({
      kind: 'custom-element',
      signature: tag,
      count: doc.querySelectorAll(tag).length,
      sampleClass: el.className || '',
    });
  }

  return gaps;
}

// ---- outputs -------------------------------------------------------------

function asTable(headers, rows) {
  const lines = [];
  lines.push(`| ${headers.join(' | ')} |`);
  lines.push(`|${headers.map(() => '---').join('|')}|`);
  for (const r of rows) {
    lines.push(`| ${r.map(c => String(c ?? '').replace(/\|/g, '\\|')).join(' | ')} |`);
  }
  return lines.join('\n');
}

function buildMarkdownReport({ manifest, pages, manifestPageMap, coverage, gapsByPage, summary }) {
  const out = [];
  out.push('# Component Coverage Report');
  out.push('');
  out.push(`> Generated by \`verify-component-coverage.mjs\` against \`${manifest.site ?? 'unknown'}\`.`);
  out.push('>');
  out.push('> For each representative page, cross-checks whether every atom /');
  out.push('> molecule / organism in the manifest matches any DOM element on that');
  out.push('> page. The result is the definitive proof that the forensic inventory');
  out.push('> covers the full site.');
  out.push('');

  // --- Summary -----------------------------------------------------------
  out.push('## Summary');
  out.push('');
  out.push(asTable(
    ['Metric', 'Value'],
    [
      ['Representative pages analysed', summary.pageCount],
      ['Components in manifest', summary.componentCount],
      ['Component × page cells evaluated', summary.cellCount],
      ['Cells with ≥1 DOM match', summary.matchedCells],
      ['Cells flagged as observedPages mismatches', summary.observedMismatches],
      ['Dead components (0 matches anywhere)', summary.deadComponents.length],
      ['Candidate un-catalogued DOM tags', summary.totalGaps],
    ],
  ));
  out.push('');
  if (summary.observedMismatches > 0) {
    out.push('> ⚠️  `observedPages` mismatches mean the manifest claims a page uses a');
    out.push('>    component but no DOM element matches. Either the selector is wrong');
    out.push('>    or the observedPages list needs trimming.');
    out.push('');
  }
  if (summary.deadComponents.length > 0) {
    out.push(`> ⚠️  Dead components: \`${summary.deadComponents.join('`, `')}\``);
    out.push('');
  }
  if (summary.totalGaps > 0) {
    out.push('> ⚠️  Candidate un-catalogued DOM tags below — review and add to the');
    out.push('>    manifest (or dismiss as non-component chrome).');
    out.push('');
  }

  // --- Coverage matrix ---------------------------------------------------
  out.push('## Coverage matrix');
  out.push('');
  out.push('Rows = components. Columns = representative pages. `•` = at least one DOM match.');
  out.push('');

  const pageHeaders = pages.map(p => p.slug);
  for (const lv of ['atoms', 'molecules', 'organisms']) {
    const items = (manifest[lv] ?? []).map(c => c.name);
    if (!items.length) continue;
    out.push(`### ${lv[0].toUpperCase()}${lv.slice(1)}`);
    out.push('');
    const matrixRows = items.map(compName => {
      const cells = pages.map(p => {
        const row = coverage[p.slug].find(r => r.component === compName && r.level === lv);
        return row && row.used ? '•' : '';
      });
      return [compName, ...cells];
    });
    out.push(asTable(['Component', ...pageHeaders], matrixRows));
    out.push('');
  }

  // --- Observed vs matched -----------------------------------------------
  if (summary.observedRows.length) {
    out.push('## observedPages mismatches');
    out.push('');
    out.push(asTable(
      ['Component', 'Level', 'Manifest page', 'Resolved slug', 'Matches?'],
      summary.observedRows,
    ));
    out.push('');
  }

  // --- Dead components ---------------------------------------------------
  if (summary.deadComponents.length) {
    out.push('## Dead components (0 matches on any page)');
    out.push('');
    for (const name of summary.deadComponents) out.push(`- \`${name}\``);
    out.push('');
  }

  // --- Gaps --------------------------------------------------------------
  if (summary.totalGaps) {
    out.push('## Candidate un-catalogued DOM tags');
    out.push('');
    out.push('Custom elements observed on representative pages whose tag name is not');
    out.push('referenced by any manifest selector. Review and either add to the');
    out.push('manifest or dismiss as site chrome / deprecated.');
    out.push('');
    const aggregate = new Map();
    for (const [slug, gaps] of Object.entries(gapsByPage)) {
      for (const g of gaps) {
        const key = `${g.kind}:${g.signature}`;
        if (!aggregate.has(key)) aggregate.set(key, { ...g, pages: new Set() });
        aggregate.get(key).pages.add(slug);
      }
    }
    const rows = Array.from(aggregate.values())
      .sort((a, b) => b.pages.size - a.pages.size || a.signature.localeCompare(b.signature))
      .map(g => [
        g.signature,
        g.kind,
        g.count,
        Array.from(g.pages).sort().join(', '),
      ]);
    out.push(asTable(['Tag / signature', 'Kind', 'Count on sample page', 'Pages'], rows));
    out.push('');
  }

  // --- Per-page breakdown ------------------------------------------------
  out.push('## Per-page breakdown');
  out.push('');
  for (const page of pages) {
    out.push(`### ${page.slug}`);
    out.push('');
    if (page.url) out.push(`\`${page.url}\``);
    out.push('');
    const rows = coverage[page.slug];
    const used = rows.filter(r => r.used);
    const unused = rows.filter(r => !r.used);
    out.push(`**Components used:** ${used.length} / ${rows.length}`);
    out.push('');
    out.push(asTable(
      ['Level', 'Component', 'Fingerprint hits', 'Variant hits'],
      used
        .sort((a, b) => (b.fingerprintHits + b.variantHits) - (a.fingerprintHits + a.variantHits))
        .map(r => [r.level, r.component, r.fingerprintHits, r.variantHits]),
    ));
    out.push('');
    if (unused.length) {
      out.push('<details><summary>Components absent from this page</summary>');
      out.push('');
      out.push(unused.map(r => `- \`${r.level}/${r.component}\``).join('\n'));
      out.push('');
      out.push('</details>');
      out.push('');
    }
  }

  return out.join('\n');
}

// ---- main ----------------------------------------------------------------

async function main() {
  log('manifest =', MANIFEST_PATH);
  log('pages    =', PAGES_DIR);
  log('out      =', OUT_DIR);

  await mkdir(OUT_DIR, { recursive: true });

  const [manifest, pages] = await Promise.all([
    loadJSON(MANIFEST_PATH),
    discoverPages(),
  ]);
  // Sitemap isn't strictly required; include for context if present.
  let sitemap = null;
  if (await fileExists(SITEMAP_PATH)) {
    sitemap = await loadJSON(SITEMAP_PATH).catch(() => null);
  }

  log(`${pages.length} representative pages on disk`);
  const manifestPageMap = resolveManifestPageMap(manifest, pages);
  vlog('alias -> slug', manifestPageMap);

  const coverage = {};
  const gapsByPage = {};
  for (const page of pages) {
    coverage[page.slug] = computePageCoverage(page, manifest);
    gapsByPage[page.slug] = detectGapsOnPage(page, manifest);
    vlog(`${page.slug}: ${coverage[page.slug].filter(r => r.used).length} components, ${gapsByPage[page.slug].length} gap candidates`);
  }

  // Derive observedPages mismatches: manifest entry declares a component is
  // used on alias X, but resolved page shows zero matches.
  const observedRows = [];
  let observedMismatches = 0;
  for (const { name: lv, items } of levels(manifest)) {
    for (const comp of items) {
      for (const alias of comp.observedPages ?? []) {
        const slug = manifestPageMap[alias];
        if (!slug || !coverage[slug]) {
          observedRows.push([comp.name, lv, alias, slug ?? '(unresolved)', 'n/a']);
          continue;
        }
        const row = coverage[slug].find(r => r.level === lv && r.component === comp.name);
        const ok = row && row.used;
        if (!ok) {
          observedMismatches += 1;
          observedRows.push([comp.name, lv, alias, slug, '❌']);
        }
      }
    }
  }

  // Dead components: 0 matches across ALL pages.
  const deadComponents = [];
  for (const { name: lv, items } of levels(manifest)) {
    for (const comp of items) {
      const anyHit = Object.values(coverage).some(rows => rows.find(r => r.level === lv && r.component === comp.name && r.used));
      if (!anyHit) deadComponents.push(`${lv}/${comp.name}`);
    }
  }

  const componentCount = levels(manifest).reduce((s, l) => s + l.items.length, 0);
  const cellCount = componentCount * pages.length;
  const matchedCells = Object.values(coverage).flat().filter(r => r.used).length;
  const totalGaps = Object.values(gapsByPage).reduce((s, g) => s + g.length, 0);

  const summary = {
    pageCount: pages.length,
    componentCount,
    cellCount,
    matchedCells,
    observedMismatches,
    observedRows,
    deadComponents,
    totalGaps,
  };

  const matrixOut = {
    generatedAt: new Date().toISOString(),
    site: manifest.site ?? null,
    pages: pages.map(p => ({ slug: p.slug, url: p.url, template: p.template, title: p.title })),
    manifestPageMap,
    summary,
    coverage,
    gapsByPage,
  };

  const jsonPath = join(OUT_DIR, 'coverage-matrix.json');
  const mdPath = join(OUT_DIR, 'coverage-report.md');
  await writeFile(jsonPath, JSON.stringify(matrixOut, null, 2));
  await writeFile(mdPath, buildMarkdownReport({ manifest, pages, manifestPageMap, coverage, gapsByPage, summary }));

  log(`wrote ${jsonPath}`);
  log(`wrote ${mdPath}`);
  log(`pages=${summary.pageCount}, components=${summary.componentCount}, matched=${summary.matchedCells}/${summary.cellCount}, observedMismatches=${summary.observedMismatches}, dead=${summary.deadComponents.length}, gaps=${summary.totalGaps}`);

  if (summary.observedMismatches > 0 || summary.deadComponents.length > 0) {
    // Non-zero exit so CI can gate on it; keep soft for gaps (those are advisory).
    process.exitCode = 2;
  }
}

main().catch(err => {
  console.error('[coverage] FAILED', err);
  process.exit(1);
});
