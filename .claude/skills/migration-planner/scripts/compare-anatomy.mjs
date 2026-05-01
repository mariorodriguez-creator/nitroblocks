#!/usr/bin/env node
/**
 * Diff designlang's anatomy.tsx against independent DOM-structure evidence.
 *
 * designlang's `*-anatomy.tsx` enumerates organisms it thinks exist in
 * the design system. `analyze-dom-structure.mjs` enumerates DOM regions
 * and repeating patterns from actual per-template scraped HTML. A
 * healthy extraction has high overlap between the two lists. Large
 * asymmetries indicate:
 *
 *   - Organisms in anatomy but not in DOM evidence → over-extraction
 *     (likely overlay leakage, or anatomy synthesized from tokens not
 *     from live DOM)
 *   - Organisms in DOM evidence but not in anatomy → under-extraction
 *     (designlang crawled the homepage only; template variety missed)
 *
 * Usage:
 *   node compare-anatomy.mjs \
 *     --anatomy    ./migration-work/design-extract/zonnic-ca-anatomy.tsx \
 *     --structure  ./migration-work/structure/aggregate.json \
 *     --output-dir ./migration-work/verification
 *
 * The anatomy file path is auto-discovered if only --extract-dir is given.
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}

const ANATOMY_FLAG = getFlag('--anatomy');
const STRUCTURE_FILE = getFlag('--structure') || './migration-work/structure/aggregate.json';
const EXTRACT_DIR = getFlag('--extract-dir') || './migration-work/design-extract';
const OUTPUT_DIR = getFlag('--output-dir') || './migration-work/verification';

async function findAnatomyFile() {
  if (ANATOMY_FLAG) return ANATOMY_FLAG;
  try {
    const entries = await readdir(EXTRACT_DIR);
    const match = entries.find((n) => n.endsWith('-anatomy.tsx') || n === 'anatomy.tsx');
    return match ? resolve(EXTRACT_DIR, match) : null;
  } catch {
    return null;
  }
}

/**
 * Extract organism / component names from anatomy.tsx.
 * designlang usually emits React-like component declarations:
 *   export const Hero = ...
 *   export function Card({ variant }) { ... }
 *   // or JSX mention: <Hero variant="dark" />
 * Be permissive — we're looking for PascalCase identifiers used as
 * component names.
 */
function parseAnatomyNames(source) {
  const names = new Set();

  // 1. `export const|let|function|class Name`
  const exportRe = /export\s+(?:const|let|var|function|class)\s+([A-Z][A-Za-z0-9_]+)/g;
  let m;
  while ((m = exportRe.exec(source)) !== null) {
    names.add(m[1]);
  }

  // 2. `function Name(` / `const Name =`
  const declRe = /\b(?:function|const|let|class)\s+([A-Z][A-Za-z0-9_]+)\s*(?:\(|=|extends)/g;
  while ((m = declRe.exec(source)) !== null) {
    names.add(m[1]);
  }

  // 3. JSX opening tags `<Name` (capital)
  const jsxRe = /<([A-Z][A-Za-z0-9_]+)(?:\s|\/|>)/g;
  while ((m = jsxRe.exec(source)) !== null) {
    // Skip common React built-ins
    if (!['React', 'Fragment', 'Suspense', 'Provider', 'Consumer', 'Children'].includes(m[1])) {
      names.add(m[1]);
    }
  }

  // 4. Props / variants often hint at organism kinds — lines like
  //    `// Hero, Card, TeaserGrid, Footer, Header`
  //    or markdown-like `* Hero` bullets in comments
  const commentRe = /(?:\/\/|\*)\s*([A-Z][A-Za-z0-9_]+(?:\s*,\s*[A-Z][A-Za-z0-9_]+)+)/g;
  while ((m = commentRe.exec(source)) !== null) {
    m[1].split(/\s*,\s*/).forEach((n) => names.add(n));
  }

  return [...names];
}

/**
 * Normalize a name or fingerprint into a comparable slug.
 *   "Hero"              -> "hero"
 *   "HeroBanner"        -> "hero-banner"
 *   "section.hero"      -> "hero"
 *   "div.teaser-grid"   -> "teaser-grid"
 *   "header.site-nav"   -> "site-nav"
 */
function canonicalize(str) {
  if (!str) return '';
  let s = String(str).trim();
  // If it's a fingerprint like "tag.class", prefer the class
  if (s.includes('.')) {
    const parts = s.split('.');
    s = parts[parts.length - 1];
  }
  // PascalCase -> kebab-case
  s = s.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
  return s
    .toLowerCase()
    .replace(/_+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const anatomyPath = await findAnatomyFile();
  let anatomyNames = [];
  if (anatomyPath) {
    try {
      const source = await readFile(anatomyPath, 'utf-8');
      anatomyNames = parseAnatomyNames(source);
      process.stderr.write(`[compare] Anatomy file: ${anatomyPath} (${anatomyNames.length} names)\n`);
    } catch (err) {
      process.stderr.write(`[compare] Cannot read anatomy: ${err.message}\n`);
    }
  } else {
    process.stderr.write('[compare] No anatomy.tsx found\n');
  }

  let structureOrganisms = [];
  try {
    const raw = await readFile(STRUCTURE_FILE, 'utf-8');
    const data = JSON.parse(raw);
    structureOrganisms = (data.organisms || []).map((o) => ({
      raw: o.fp,
      pages: o.pages || [],
      total: o.total || 0,
    }));
    process.stderr.write(`[compare] Structure: ${structureOrganisms.length} organisms\n`);
  } catch (err) {
    process.stderr.write(`[compare] Cannot read structure: ${err.message}\n`);
  }

  const anatomyCanonical = new Map(); // canonical -> original
  for (const n of anatomyNames) {
    const c = canonicalize(n);
    if (c && !anatomyCanonical.has(c)) anatomyCanonical.set(c, n);
  }

  const structureCanonical = new Map(); // canonical -> { raw, pages, total }
  for (const org of structureOrganisms) {
    const c = canonicalize(org.raw);
    if (!c) continue;
    if (!structureCanonical.has(c)) {
      structureCanonical.set(c, { raw: org.raw, pages: org.pages, total: org.total });
    } else {
      const e = structureCanonical.get(c);
      e.total += org.total;
      const pageSet = new Set([...e.pages, ...org.pages]);
      e.pages = [...pageSet];
    }
  }

  const onlyInAnatomy = [];
  for (const [c, raw] of anatomyCanonical) {
    if (!structureCanonical.has(c)) {
      onlyInAnatomy.push({ canonical: c, name: raw });
    }
  }
  const onlyInStructure = [];
  for (const [c, data] of structureCanonical) {
    if (!anatomyCanonical.has(c)) {
      onlyInStructure.push({ canonical: c, fingerprint: data.raw, pages: data.pages, total: data.total });
    }
  }
  const intersection = [];
  for (const [c, raw] of anatomyCanonical) {
    if (structureCanonical.has(c)) {
      intersection.push({ canonical: c, anatomy_name: raw, structure: structureCanonical.get(c) });
    }
  }

  const total = anatomyCanonical.size + structureCanonical.size - intersection.length;
  const overlap = total > 0 ? intersection.length / total : 0;

  // Coverage view: how much of DOM reality is reflected in anatomy?
  const structureCovered = structureCanonical.size > 0
    ? intersection.length / structureCanonical.size
    : 0;

  // Anatomy.tsx from designlang is frequently thin or empty on real sites
  // (e.g. Zonnic extraction produced just Card + Button). When anatomy has
  // fewer than 5 components, comparing it against DOM structure produces
  // a false LOW signal — the anatomy is simply undersupplied, not wrong.
  // Treat these as UNDERSUPPLIED so the verification report can avoid
  // penalizing the whole extraction.
  const UNDERSUPPLIED_THRESHOLD = 5;
  const undersupplied = anatomyCanonical.size < UNDERSUPPLIED_THRESHOLD;

  // Signal level:
  //   UNDERSUPPLIED — anatomy has <5 components (designlang output too thin
  //                   to diff meaningfully; downstream skills should rely
  //                   on *-screenshots.json and DOM structure instead)
  //   HIGH          — structureCovered >= 0.7
  //   MEDIUM        — 0.4 <= structureCovered < 0.7
  //   LOW           — structureCovered < 0.4 (anatomy not grounded in DOM)
  let signal;
  if (undersupplied) {
    signal = 'UNDERSUPPLIED';
  } else if (structureCovered < 0.4) {
    signal = 'LOW';
  } else if (structureCovered < 0.7) {
    signal = 'MEDIUM';
  } else {
    signal = 'HIGH';
  }

  const result = {
    signal,
    undersupplied,
    undersupplied_threshold: UNDERSUPPLIED_THRESHOLD,
    overlap_ratio: Number(overlap.toFixed(3)),
    structure_covered_by_anatomy: Number(structureCovered.toFixed(3)),
    anatomy_only_count: onlyInAnatomy.length,
    structure_only_count: onlyInStructure.length,
    intersection_count: intersection.length,
    anatomy_names: anatomyNames,
    anatomy_canonical_count: anatomyCanonical.size,
    structure_canonical_count: structureCanonical.size,
    only_in_anatomy: onlyInAnatomy,
    only_in_structure: onlyInStructure.slice(0, 100),
    intersection: intersection.slice(0, 100),
  };

  const jsonPath = resolve(OUTPUT_DIR, 'anatomy-diff.json');
  await writeFile(jsonPath, JSON.stringify(result, null, 2));

  const md = [];
  md.push('# Anatomy vs DOM-Structure Diff');
  md.push('');
  md.push(`**Signal:** ${signal}`);
  md.push('');
  md.push(`- Anatomy components (canonical): ${anatomyCanonical.size}`);
  md.push(`- DOM organisms (canonical): ${structureCanonical.size}`);
  md.push(`- Overlap (Jaccard): ${(overlap * 100).toFixed(1)}%`);
  md.push(`- DOM patterns covered by anatomy: ${(structureCovered * 100).toFixed(1)}%`);
  md.push(`- Anatomy-only names: ${onlyInAnatomy.length}`);
  md.push(`- DOM-only patterns: ${onlyInStructure.length}`);
  md.push(`- Overlap (both): ${intersection.length}`);
  md.push('');
  if (signal === 'UNDERSUPPLIED') {
    md.push(`> **Note:** anatomy.tsx is thinly populated (<${UNDERSUPPLIED_THRESHOLD} components). This is common — designlang's anatomy output is often a weak reflection of the live component palette. Use the \`*-screenshots.json\` manifest, DOM structure aggregate, and \`identify-page-structure\` output as the primary component inventory. Do not interpret this signal as an extraction failure.`);
    md.push('');
  } else if (signal === 'LOW') {
    md.push('> **Warning:** anatomy has enough components to compare, but is a poor reflection of DOM evidence. Either designlang analyzed the homepage only (under-extraction) or anatomy was synthesized from tokens rather than live DOM.');
    md.push('');
  }

  if (onlyInAnatomy.length > 0) {
    md.push('## Organisms in anatomy but not seen in DOM');
    md.push('');
    md.push('These may be over-extraction (designlang imagined them) or reflect a template we did not scrape.');
    md.push('');
    for (const o of onlyInAnatomy.slice(0, 30)) {
      md.push(`- \`${o.name}\` (canonical: \`${o.canonical}\`)`);
    }
    if (onlyInAnatomy.length > 30) md.push(`- _…and ${onlyInAnatomy.length - 30} more._`);
    md.push('');
  }
  if (onlyInStructure.length > 0) {
    md.push('## Organisms in DOM evidence but not in anatomy');
    md.push('');
    md.push('These are likely real organisms designlang missed. Each has the pages where the fingerprint appears.');
    md.push('');
    for (const s of onlyInStructure.slice(0, 30)) {
      md.push(`- \`${s.fingerprint}\` (canonical: \`${s.canonical}\`, pages: ${s.pages.slice(0, 5).join(', ')}${s.pages.length > 5 ? '...' : ''})`);
    }
    if (onlyInStructure.length > 30) md.push(`- _…and ${onlyInStructure.length - 30} more._`);
    md.push('');
  }
  if (intersection.length > 0) {
    md.push('## Organisms in both (healthy overlap)');
    md.push('');
    for (const o of intersection.slice(0, 30)) {
      md.push(`- anatomy \`${o.anatomy_name}\` ↔ DOM \`${o.structure.raw}\``);
    }
    md.push('');
  }

  const mdPath = resolve(OUTPUT_DIR, 'anatomy-diff.md');
  await writeFile(mdPath, md.join('\n'));

  process.stderr.write(`[compare] Signal=${signal} overlap=${(overlap * 100).toFixed(1)}% coverage=${(structureCovered * 100).toFixed(1)}%\n`);
  process.stderr.write(`[compare] Wrote ${jsonPath}\n`);
  process.stderr.write(`[compare] Wrote ${mdPath}\n`);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

main().catch((err) => {
  console.error('[compare] Fatal:', err.message);
  console.error(err.stack);
  process.exit(0);
});
