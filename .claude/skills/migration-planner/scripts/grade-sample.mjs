#!/usr/bin/env node
/**
 * Multi-template designlang grade sampling.
 *
 * run-discovery.sh only grades the base URL. On multi-template sites,
 * homepage quality can be very different from the rest of the site —
 * the homepage is often redesigned while blog/legacy pages retain older
 * CSS. Sample 3-5 representative templates and produce a delta report.
 *
 * Uses `designlang grade` (not the full extract) per representative URL,
 * collects per-dimension scores, and writes a delta table showing where
 * the homepage is a poor proxy for the rest of the site.
 *
 * Usage:
 *   node grade-sample.mjs <base-url> \
 *     --bypass-file ./migration-work/bypass-result.json \
 *     --pages-file  ./migration-work/sitemap-result.json \
 *     --output-dir  ./migration-work/verification \
 *     [--max-samples 5]
 */

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const BASE_URL_ARG = args.find((a) => !a.startsWith('--'));

function getFlag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}

if (!BASE_URL_ARG) {
  console.error('Usage: node grade-sample.mjs <base-url> [--bypass-file <path>] [--pages-file <path>] [--output-dir <dir>] [--max-samples N]');
  process.exit(1);
}

const BYPASS_FILE = getFlag('--bypass-file');
const PAGES_FILE = getFlag('--pages-file');
const OUTPUT_DIR = getFlag('--output-dir') || './migration-work/verification';
const MAX_SAMPLES = parseInt(getFlag('--max-samples') || '5', 10);

// Preferred template slugs to grade (in priority order). Real sites almost
// always have these — we pick whichever matches the representative list.
const PREFERRED_TEMPLATES = [
  'homepage',
  'pouches',
  'product',
  'products',
  'blog',
  'faq',
  'contact',
  'contact-us',
  'about',
  'about-us',
  'store-locator',
];

async function loadPages() {
  const pages = [{ slug: 'homepage', url: BASE_URL_ARG }];
  if (!PAGES_FILE) return pages;
  try {
    const raw = await readFile(PAGES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    const basePath = data.base_path || '';
    for (const url of data.representative_urls || []) {
      const p = new URL(url);
      const relative = p.pathname.slice(basePath.length).replace(/^\//, '');
      if (!relative) continue;
      const slug = relative.replace(/\//g, '-') || 'page';
      pages.push({ slug, url });
    }
  } catch (err) {
    process.stderr.write(`[grade-sample] Warning: pages file: ${err.message}\n`);
  }
  return pages;
}

function pickSamples(pages) {
  // Always include homepage, then prefer matches in PREFERRED_TEMPLATES order.
  const [hp, ...rest] = pages;
  const picked = [hp];
  const seen = new Set([hp.url]);

  for (const preferred of PREFERRED_TEMPLATES) {
    if (picked.length >= MAX_SAMPLES) break;
    const match = rest.find(
      (p) => !seen.has(p.url) && p.slug.toLowerCase().startsWith(preferred),
    );
    if (match) {
      picked.push(match);
      seen.add(match.url);
    }
  }
  // Fill remaining slots with arbitrary templates until we hit MAX_SAMPLES
  for (const p of rest) {
    if (picked.length >= MAX_SAMPLES) break;
    if (!seen.has(p.url)) {
      picked.push(p);
      seen.add(p.url);
    }
  }
  return picked;
}

async function buildBypassArgs() {
  if (!BYPASS_FILE) return [];
  try {
    const raw = await readFile(BYPASS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    const args = [];
    for (const c of data.bypass_cookies || []) {
      args.push('--cookie', c);
    }
    return args;
  } catch {
    return [];
  }
}

function runDesignlangGrade(url, outDir, extraArgs) {
  return new Promise((resolvePromise) => {
    const cmd = 'npx';
    const baseArgs = [
      '--yes',
      'designlang',
      'grade',
      url,
      '--wait',
      '3000',
      '-o',
      outDir,
    ];
    const fullArgs = [...baseArgs, ...extraArgs];
    process.stderr.write(`  ${cmd} ${fullArgs.join(' ')}\n`);

    const child = spawn(cmd, fullArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.stdout.on('data', () => {});
    child.on('close', (code) => {
      resolvePromise({ code, stderr });
    });
    child.on('error', (err) => {
      resolvePromise({ code: -1, stderr: err.message });
    });
  });
}

async function findGradeJson(dir) {
  try {
    const { readdir } = await import('node:fs/promises');
    const entries = await readdir(dir);
    const match = entries.find((n) => n.endsWith('.grade.json'));
    return match ? resolve(dir, match) : null;
  } catch {
    return null;
  }
}

async function gradePage(url, slug, extraArgs) {
  const tempDir = join(tmpdir(), `designlang-grade-${slug}-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });
  const { code, stderr } = await runDesignlangGrade(url, tempDir, extraArgs);
  const gradePath = await findGradeJson(tempDir);
  let grade = null;
  if (gradePath) {
    try {
      grade = JSON.parse(await readFile(gradePath, 'utf-8'));
    } catch (err) {
      process.stderr.write(`  [${slug}] grade parse failed: ${err.message}\n`);
    }
  }
  // Clean up temp dir to avoid disk bloat
  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  return { slug, url, code, grade, gradeFound: !!gradePath, stderrTail: stderr.split('\n').slice(-5).join('\n') };
}

function extractDimensions(grade) {
  // Normalize: grade.json uses camelCase dimension names at the top-level
  // alongside `overall` and `grade`. Different designlang versions may vary.
  if (!grade) return {};
  const dims = {};
  for (const [k, v] of Object.entries(grade)) {
    if (typeof v === 'number' && k !== 'overall') {
      dims[k] = v;
    }
  }
  if (typeof grade.overall === 'number') {
    dims.overall = grade.overall;
  }
  return dims;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const pages = await loadPages();
  const samples = pickSamples(pages);
  const extraArgs = await buildBypassArgs();

  process.stderr.write(`[grade-sample] Grading ${samples.length} template(s):\n`);
  for (const s of samples) {
    process.stderr.write(`  - ${s.slug} -> ${s.url}\n`);
  }

  const results = [];
  for (const s of samples) {
    process.stderr.write(`\n[grade-sample] ${s.slug}\n`);
    const r = await gradePage(s.url, s.slug, extraArgs);
    results.push(r);
  }

  // Build delta table: dimension rows, template columns
  const allDims = new Set();
  for (const r of results) {
    const d = extractDimensions(r.grade);
    for (const k of Object.keys(d)) allDims.add(k);
  }
  const dimList = [...allDims];
  dimList.sort((a, b) => {
    if (a === 'overall') return -1;
    if (b === 'overall') return 1;
    return a.localeCompare(b);
  });

  const dimensionScores = {};
  for (const dim of dimList) {
    dimensionScores[dim] = {};
    for (const r of results) {
      const d = extractDimensions(r.grade);
      dimensionScores[dim][r.slug] = d[dim] ?? null;
    }
  }

  // Compute spread (max - min) per dimension as a "proxy quality" signal
  const dimensionSpread = {};
  for (const [dim, byTemplate] of Object.entries(dimensionScores)) {
    const vals = Object.values(byTemplate).filter((v) => typeof v === 'number');
    if (vals.length === 0) continue;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    dimensionSpread[dim] = { min, max, spread: max - min };
  }

  // A template is "drift-prone" if any dimension spread > 20 points.
  const highSpread = Object.entries(dimensionSpread)
    .filter(([, s]) => s.spread > 20)
    .map(([dim, s]) => ({ dim, ...s }));

  const summary = {
    sampled: samples.map((s) => ({ slug: s.slug, url: s.url })),
    dimension_scores: dimensionScores,
    dimension_spread: dimensionSpread,
    high_spread_dimensions: highSpread,
    homepage_is_proxy: highSpread.length === 0,
  };

  const jsonPath = resolve(OUTPUT_DIR, 'grade-delta.json');
  await writeFile(jsonPath, JSON.stringify(summary, null, 2));

  // Markdown delta report
  const md = [];
  md.push('# Grade Delta Across Templates');
  md.push('');
  md.push(`Sampled ${samples.length} template(s):`);
  md.push('');
  for (const s of samples) {
    md.push(`- **${s.slug}** — ${s.url}`);
  }
  md.push('');
  md.push('## Per-dimension scores');
  md.push('');
  const header = ['Dimension', ...samples.map((s) => s.slug), 'Min', 'Max', 'Spread'];
  md.push(`| ${header.join(' | ')} |`);
  md.push(`| ${header.map(() => '---').join(' | ')} |`);
  for (const dim of dimList) {
    const row = [dim];
    for (const s of samples) {
      const v = dimensionScores[dim][s.slug];
      row.push(v === null || v === undefined ? '-' : String(v));
    }
    const sp = dimensionSpread[dim];
    row.push(sp ? String(sp.min) : '-');
    row.push(sp ? String(sp.max) : '-');
    row.push(sp ? String(sp.spread) : '-');
    md.push(`| ${row.join(' | ')} |`);
  }
  md.push('');
  if (highSpread.length > 0) {
    md.push('## Drift detected');
    md.push('');
    md.push('These dimensions vary by more than 20 points across templates.');
    md.push('The homepage is NOT a safe proxy for the whole site — design system');
    md.push('recommendations based on homepage-only extraction will miss issues.');
    md.push('');
    for (const { dim, min, max, spread } of highSpread) {
      md.push(`- **${dim}**: ${min} → ${max} (spread ${spread})`);
    }
    md.push('');
  } else {
    md.push('## No significant drift');
    md.push('');
    md.push('All dimensions stay within 20 points across sampled templates.');
    md.push('Homepage-based extraction is a reasonable proxy for the whole site.');
    md.push('');
  }

  const mdPath = resolve(OUTPUT_DIR, 'grade-delta.md');
  await writeFile(mdPath, md.join('\n'));

  process.stderr.write(`\n[grade-sample] Done. ${highSpread.length} high-spread dimension(s)\n`);
  process.stderr.write(`[grade-sample] Wrote ${jsonPath}\n`);
  process.stderr.write(`[grade-sample] Wrote ${mdPath}\n`);
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
}

main().catch((err) => {
  console.error('[grade-sample] Fatal:', err.message);
  console.error(err.stack);
  process.exit(0);
});
