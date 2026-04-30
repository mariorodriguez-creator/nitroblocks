#!/usr/bin/env node
/**
 * Deterministic DOM structure extraction from scraped pages.
 *
 * Reads cleaned.html from one or more scraped pages (output of
 * scrape-webpage) and produces an independent section + repeating-pattern
 * inventory. This is a mechanical sanity check on designlang's anatomy:
 * if DOM traversal finds 12 distinct section types on the homepage but
 * anatomy.tsx lists only 3, designlang is under-extracting.
 *
 * Detection rules (conservative, buildless-friendly):
 *
 *   Sections:
 *     - <section> / <article> / <main> / <aside> / role="region" nodes
 *     - Direct children of <main> or <body> that appear to be block-level
 *       with a class name (e.g. <div class="hero">)
 *     - Headers of h1/h2 that start a new visual region
 *
 *   Repeating patterns (likely cards / lists / grids):
 *     - Parent nodes with >= 3 direct children sharing the same
 *       tagName + class fingerprint
 *     - These almost always correspond to a "list of N items" organism
 *
 *   Classname fingerprints:
 *     - First token of a class attribute (e.g. "hero" for class="hero dark")
 *     - Used as a coarse organism identity
 *
 * Uses Playwright's setContent (no network) to avoid new deps.
 *
 * Usage:
 *   node analyze-dom-structure.mjs \
 *     --pages-dir  ./migration-work/pages \
 *     --output-dir ./migration-work/structure
 *
 * Or for a single file:
 *   node analyze-dom-structure.mjs \
 *     --html       ./migration-work/pages/homepage/cleaned.html \
 *     --slug       homepage \
 *     --output-dir ./migration-work/structure
 */

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}

const PAGES_DIR = getFlag('--pages-dir');
const SINGLE_HTML = getFlag('--html');
const SINGLE_SLUG = getFlag('--slug');
const OUTPUT_DIR = getFlag('--output-dir') || './migration-work/structure';

if (!PAGES_DIR && !SINGLE_HTML) {
  console.error('Usage: node analyze-dom-structure.mjs (--pages-dir <dir> | --html <file> --slug <name>) [--output-dir <dir>]');
  process.exit(1);
}

async function collectTargets() {
  if (SINGLE_HTML) {
    return [{ slug: SINGLE_SLUG || 'page', html: SINGLE_HTML }];
  }
  const targets = [];
  let entries = [];
  try {
    entries = await readdir(PAGES_DIR, { withFileTypes: true });
  } catch (err) {
    process.stderr.write(`[structure] Cannot read --pages-dir ${PAGES_DIR}: ${err.message}\n`);
    return targets;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const htmlPath = resolve(PAGES_DIR, entry.name, 'cleaned.html');
    try {
      await stat(htmlPath);
      targets.push({ slug: entry.name, html: htmlPath });
    } catch {
      // no cleaned.html, skip
    }
  }
  return targets;
}

/**
 * The main DOM extraction runs inside Playwright's page context.
 * It returns a plain JSON structure.
 */
const EXTRACTOR_FN = () => {
  function firstClassToken(el) {
    const cls = el.getAttribute('class');
    if (!cls) return null;
    const tok = cls.trim().split(/\s+/)[0];
    return tok || null;
  }

  function elementFingerprint(el) {
    const tag = el.tagName.toLowerCase();
    const cls = firstClassToken(el);
    return cls ? `${tag}.${cls}` : tag;
  }

  function describeSection(el, index) {
    const tag = el.tagName.toLowerCase();
    const cls = el.getAttribute('class') || '';
    const id = el.id || null;
    const role = el.getAttribute('role') || null;
    const aria = el.getAttribute('aria-label') || null;
    // Headings inside the section (first 3)
    const headings = [];
    for (const h of el.querySelectorAll('h1, h2, h3')) {
      if (headings.length >= 3) break;
      const text = (h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
      if (text) headings.push({ level: h.tagName.toLowerCase(), text });
    }
    // Child fingerprints (unique, up to 8)
    const childFps = new Set();
    for (const child of el.children) {
      childFps.add(elementFingerprint(child));
      if (childFps.size >= 8) break;
    }
    return {
      index,
      selector: id ? `#${id}` : firstClassToken(el) ? `${tag}.${firstClassToken(el)}` : tag,
      tag,
      class: cls,
      id,
      role,
      aria_label: aria,
      headings,
      child_fingerprints: [...childFps],
      fingerprint: elementFingerprint(el),
    };
  }

  function findRepeatingPatterns(root) {
    const patterns = [];
    // Walk all elements; for each, if it has >=3 children with the same
    // fingerprint, that's a candidate repeating pattern (card grid, list).
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let node = walker.currentNode;
    const visited = new Set();
    while (node) {
      if (node.children && node.children.length >= 3 && !visited.has(node)) {
        const groups = new Map();
        for (const child of node.children) {
          const fp = elementFingerprint(child);
          groups.set(fp, (groups.get(fp) || 0) + 1);
        }
        for (const [fp, count] of groups) {
          if (count >= 3) {
            const parentFp = elementFingerprint(node);
            patterns.push({
              parent: parentFp,
              child: fp,
              count,
            });
          }
        }
        visited.add(node);
      }
      node = walker.nextNode();
    }
    return patterns;
  }

  // Section discovery: explicit semantic containers first.
  const SECTION_SELECTORS = [
    'section',
    'article',
    'aside',
    'main > *',
    'body > *:not(script):not(style):not(link):not(meta)',
    '[role="region"]',
    '[role="main"]',
    '[role="banner"]',
    '[role="contentinfo"]',
  ];

  const seen = new Set();
  const sections = [];
  let i = 0;
  for (const sel of SECTION_SELECTORS) {
    document.querySelectorAll(sel).forEach((el) => {
      if (seen.has(el)) return;
      // Skip tiny inline elements (likely noise)
      const text = (el.textContent || '').trim();
      const hasChildren = el.children.length > 0;
      if (!hasChildren && text.length < 40) return;
      seen.add(el);
      sections.push(describeSection(el, i));
      i += 1;
    });
  }

  // Count organism fingerprints across all <section> and top-level blocks
  const organismCounts = new Map();
  for (const s of sections) {
    if (!s.fingerprint) continue;
    organismCounts.set(s.fingerprint, (organismCounts.get(s.fingerprint) || 0) + 1);
  }

  const patterns = findRepeatingPatterns(document.body);
  // Dedupe patterns by parent.child key, keep max count
  const patternMap = new Map();
  for (const p of patterns) {
    const key = `${p.parent}>${p.child}`;
    const existing = patternMap.get(key);
    if (!existing || existing.count < p.count) {
      patternMap.set(key, p);
    }
  }

  return {
    section_count: sections.length,
    unique_organism_fingerprints: [...organismCounts.entries()].map(([fp, count]) => ({ fp, count })),
    sections,
    repeating_patterns: [...patternMap.values()].sort((a, b) => b.count - a.count),
  };
};

async function analyzeOne(page, target) {
  const htmlContent = await readFile(target.html, 'utf-8');
  // Wrap in minimal HTML structure if cleaned.html is body-only
  const wrapped = htmlContent.trim().toLowerCase().startsWith('<!doctype') || htmlContent.trim().toLowerCase().startsWith('<html')
    ? htmlContent
    : `<!doctype html><html><head><meta charset="utf-8"></head>${htmlContent}</html>`;
  await page.setContent(wrapped, { waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(EXTRACTOR_FN);
  return {
    slug: target.slug,
    html_file: target.html,
    ...result,
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const targets = await collectTargets();
  if (targets.length === 0) {
    process.stderr.write('[structure] No HTML files to analyze\n');
    process.stdout.write(JSON.stringify({ pages: [], aggregate: { organisms: [] } }, null, 2) + '\n');
    return;
  }
  process.stderr.write(`[structure] Analyzing ${targets.length} page(s)\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  for (const t of targets) {
    try {
      const r = await analyzeOne(page, t);
      const outPath = resolve(OUTPUT_DIR, `${t.slug}.json`);
      await writeFile(outPath, JSON.stringify(r, null, 2));
      process.stderr.write(`  [${t.slug}] sections=${r.section_count} unique=${r.unique_organism_fingerprints.length} patterns=${r.repeating_patterns.length}\n`);
      results.push(r);
    } catch (err) {
      process.stderr.write(`  [${t.slug}] ERROR: ${err.message}\n`);
      results.push({ slug: t.slug, error: err.message });
    }
  }

  await context.close();
  await browser.close();

  // Aggregate: union of unique organism fingerprints across all pages
  const siteOrganisms = new Map();
  for (const r of results) {
    if (!r.unique_organism_fingerprints) continue;
    for (const { fp, count } of r.unique_organism_fingerprints) {
      if (!siteOrganisms.has(fp)) {
        siteOrganisms.set(fp, { fp, total: 0, pages: [] });
      }
      const entry = siteOrganisms.get(fp);
      entry.total += count;
      entry.pages.push(r.slug);
    }
  }
  const siteOrganismList = [...siteOrganisms.values()].sort((a, b) => b.total - a.total);

  const aggregate = {
    pages_analyzed: results.filter((r) => !r.error).length,
    total_unique_organisms: siteOrganismList.length,
    organisms: siteOrganismList,
  };
  const aggregatePath = resolve(OUTPUT_DIR, 'aggregate.json');
  await writeFile(aggregatePath, JSON.stringify(aggregate, null, 2));

  process.stderr.write(`[structure] Done. ${aggregate.total_unique_organisms} unique organism fingerprints across ${aggregate.pages_analyzed} page(s)\n`);
  process.stdout.write(JSON.stringify({ pages: results, aggregate }, null, 2) + '\n');
}

main().catch((err) => {
  console.error('[structure] Fatal:', err.message);
  console.error(err.stack);
  process.exit(0);
});
