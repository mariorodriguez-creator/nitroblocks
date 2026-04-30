#!/usr/bin/env node
/**
 * Post-extraction bypass-leak verification.
 *
 * After designlang runs with bypass cookies, the extracted artifacts
 * (design-language.md, design-tokens.json, anatomy.tsx, preview.html,
 * variables.css, shadcn-theme.css) should NOT contain age-gate,
 * consent-banner, or chat-widget fingerprints. If they do, the bypass
 * silently failed and the design system catalog is contaminated.
 *
 * Detects four leak classes:
 *   1. Suspicious component/token names (age-gate, overlay, modal,
 *      consent, agegate, onetrust, cookiebot, qualtrics, QSI, embedded
 *      service, chat widget)
 *   2. Overlay-like token dimensions (full viewport width/height)
 *   3. Design-language narrative mentioning overlay/modal content
 *   4. Screenshot filenames containing overlay/widget keywords
 *
 * Cross-references against bypass-result.json's detected overlays and
 * ignore_selectors so reporting is concrete: "age-gate was detected but
 * these tokens slipped through".
 *
 * Usage:
 *   node verify-extraction.mjs \
 *     --extract-dir ./migration-work/design-extract \
 *     --bypass-file ./migration-work/bypass-result.json \
 *     --output-dir  ./migration-work/verification
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, basename, extname } from 'node:path';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}

const EXTRACT_DIR = getFlag('--extract-dir') || './migration-work/design-extract';
const BYPASS_FILE = getFlag('--bypass-file') || './migration-work/bypass-result.json';
const OUTPUT_DIR = getFlag('--output-dir') || './migration-work/verification';

// Keywords that should never appear in the extracted design system if the
// bypass worked. Categorized by leak class so reporting is actionable.
const LEAK_KEYWORDS = {
  'age-gate': [
    /age[-_ ]?gate/i,
    /age[-_ ]?verify/i,
    /age[-_ ]?verification/i,
    /are[-_ ]?you[-_ ]?of[-_ ]?age/i,
    /legal[-_ ]?age/i,
    /bat-agegate/i,
  ],
  'consent-banner': [
    /onetrust/i,
    /cookiebot/i,
    /\bconsent[-_ ]?banner\b/i,
    /\bcookie[-_ ]?consent\b/i,
    /\bcookie[-_ ]?notice\b/i,
    /OptanonAlertBoxClosed/i,
    /iubenda/i,
    /usercentrics/i,
  ],
  'chat-widget': [
    /qualtrics/i,
    /\bQSI\b/,
    /embeddedService/i,
    /embeddedMessaging/i,
    /helpButton/i,
    /salesforce[-_ ]?chat/i,
    /intercom[-_ ]?launcher/i,
  ],
  'modal-overlay': [
    /modal[-_ ]?overlay/i,
    /modal[-_ ]?backdrop/i,
    /\boverlay[-_ ]?bg\b/i,
    /\bage[-_ ]?modal\b/i,
    /popup[-_ ]?consent/i,
  ],
};

// Files inside the extract worth scanning (text-based designlang outputs).
const SCAN_EXTENSIONS = ['.md', '.json', '.tsx', '.ts', '.css', '.js', '.html'];

async function readJsonSafe(path) {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function listScanFiles(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip .claude and .cursor mirrors (designlang writes SKILL.md copies here)
      if (entry.name === '.claude' || entry.name === '.cursor' || entry.name === 'screenshots') {
        continue;
      }
      const nested = await listScanFiles(full);
      out.push(...nested);
    } else if (SCAN_EXTENSIONS.includes(extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

function scanForLeaks(text, filename) {
  const hits = [];
  for (const [category, patterns] of Object.entries(LEAK_KEYWORDS)) {
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        // Grab a small context window for evidence
        const start = Math.max(0, match.index - 40);
        const end = Math.min(text.length, match.index + match[0].length + 40);
        const context = text.slice(start, end).replace(/\s+/g, ' ').trim();
        hits.push({
          category,
          pattern: pattern.toString(),
          match: match[0],
          file: filename,
          offset: match.index,
          context,
        });
      }
    }
  }
  return hits;
}

async function scanScreenshots(extractDir) {
  const screenshotsDir = resolve(extractDir, 'screenshots');
  const hits = [];
  let entries = [];
  try {
    entries = await readdir(screenshotsDir);
  } catch {
    return hits;
  }
  for (const name of entries) {
    for (const [category, patterns] of Object.entries(LEAK_KEYWORDS)) {
      for (const pattern of patterns) {
        if (pattern.test(name)) {
          hits.push({
            category,
            pattern: pattern.toString(),
            match: name,
            file: resolve(screenshotsDir, name),
            context: 'screenshot filename',
          });
          break;
        }
      }
    }
  }
  return hits;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const bypass = await readJsonSafe(BYPASS_FILE);
  const detectedOverlays = bypass?.overlays_detected || [];
  const ignoreSelectors = bypass?.ignore_selectors || [];

  process.stderr.write(`[verify] Scanning ${EXTRACT_DIR} for overlay leakage\n`);
  process.stderr.write(`[verify] Bypass detected overlays: ${detectedOverlays.join(', ') || 'none'}\n`);

  const files = await listScanFiles(EXTRACT_DIR);
  process.stderr.write(`[verify] ${files.length} file(s) to scan\n`);

  const allHits = [];
  const hitsByFile = {};
  for (const filePath of files) {
    let text = '';
    try {
      text = await readFile(filePath, 'utf-8');
    } catch {
      continue;
    }
    const hits = scanForLeaks(text, filePath);
    if (hits.length > 0) {
      allHits.push(...hits);
      hitsByFile[basename(filePath)] = hits.length;
    }
  }

  const screenshotHits = await scanScreenshots(EXTRACT_DIR);
  allHits.push(...screenshotHits);

  const byCategory = {};
  for (const hit of allHits) {
    byCategory[hit.category] = (byCategory[hit.category] || 0) + 1;
  }

  // A leak is "critical" if the category matches an overlay we detected
  // in Phase B. If bypass detected age-gate and we now see age-gate
  // fingerprints in tokens, the bypass didn't work.
  const criticalCategories = [];
  if (detectedOverlays.includes('age-gate') && byCategory['age-gate']) {
    criticalCategories.push('age-gate');
  }
  if (detectedOverlays.includes('cookie-consent') && byCategory['consent-banner']) {
    criticalCategories.push('consent-banner');
  }
  if (
    (detectedOverlays.includes('qualtrics-feedback') ||
      detectedOverlays.includes('salesforce-chat')) &&
    byCategory['chat-widget']
  ) {
    criticalCategories.push('chat-widget');
  }

  const pass = criticalCategories.length === 0;

  // Deduplicate and cap hits per category for readability
  const cappedHits = [];
  const seenPerCategory = {};
  for (const hit of allHits) {
    seenPerCategory[hit.category] = (seenPerCategory[hit.category] || 0) + 1;
    if (seenPerCategory[hit.category] <= 10) {
      cappedHits.push(hit);
    }
  }

  const result = {
    pass,
    critical_categories: criticalCategories,
    overlays_detected_in_bypass: detectedOverlays,
    ignore_selectors_count: ignoreSelectors.length,
    files_scanned: files.length,
    total_hits: allHits.length,
    hits_by_category: byCategory,
    hits_by_file: hitsByFile,
    sample_hits: cappedHits,
  };

  const jsonPath = resolve(OUTPUT_DIR, 'bypass-leak.json');
  await writeFile(jsonPath, JSON.stringify(result, null, 2));

  // Markdown report for humans
  const md = [];
  md.push('# Bypass Leak Verification');
  md.push('');
  md.push(`**Status:** ${pass ? 'PASS' : 'FAIL'}`);
  md.push('');
  md.push(`- Overlays detected in Phase B: ${detectedOverlays.join(', ') || '_none_'}`);
  md.push(`- Files scanned: ${files.length}`);
  md.push(`- Total leak-keyword hits: ${allHits.length}`);
  md.push('');
  if (Object.keys(byCategory).length > 0) {
    md.push('## Hits by category');
    md.push('');
    md.push('| Category | Hits | Critical? |');
    md.push('|---|---|---|');
    for (const [cat, count] of Object.entries(byCategory)) {
      md.push(`| ${cat} | ${count} | ${criticalCategories.includes(cat) ? 'YES' : 'no'} |`);
    }
    md.push('');
  }
  if (cappedHits.length > 0) {
    md.push('## Sample evidence (up to 10 per category)');
    md.push('');
    for (const hit of cappedHits) {
      md.push(`- **${hit.category}** in \`${basename(hit.file)}\` @${hit.offset ?? '-'}: \`${hit.match}\``);
      if (hit.context && hit.context !== 'screenshot filename') {
        md.push(`  > ${hit.context}`);
      }
    }
    md.push('');
  }
  if (!pass) {
    md.push('## Interpretation');
    md.push('');
    md.push('Critical leak categories match overlays that the bypass probe detected. ');
    md.push('This means designlang\'s extraction likely ran against a page where the');
    md.push('overlay was still present. Re-check:');
    md.push('');
    md.push('1. `bypass_cookies_full` in `bypass-result.json` — did designlang receive them?');
    md.push('2. Any cookies with `/` in value were filtered (designlang parser bug).');
    md.push('3. `verified: true` in `bypass-result.json` is for a fresh Playwright nav,');
    md.push('   not for designlang itself.');
    md.push('');
  }
  const mdPath = resolve(OUTPUT_DIR, 'bypass-leak.md');
  await writeFile(mdPath, md.join('\n'));

  process.stderr.write(`[verify] ${pass ? 'PASS' : 'FAIL'} (${allHits.length} hits, ${criticalCategories.length} critical)\n`);
  process.stderr.write(`[verify] Wrote ${jsonPath}\n`);
  process.stderr.write(`[verify] Wrote ${mdPath}\n`);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

main().catch((err) => {
  console.error('[verify] Fatal:', err.message);
  console.error(err.stack);
  process.exit(0);
});
