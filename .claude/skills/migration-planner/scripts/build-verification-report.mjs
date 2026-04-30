#!/usr/bin/env node
/**
 * Aggregate all verification signals into a single confidence report.
 *
 * Reads:
 *   ./migration-work/sitemap-result.json
 *   ./migration-work/bypass-result.json
 *   ./migration-work/verification/bypass-leak.json
 *   ./migration-work/verification/grade-delta.json
 *   ./migration-work/verification/anatomy-diff.json
 *   ./migration-work/verification/third-party-inventory.json
 *   ./migration-work/a11y/summary.json
 *   ./migration-work/structure/aggregate.json
 *   ./migration-work/pages/<slug>/metadata.json (for scrape coverage)
 *   ./migration-work/design-extract/screenshots/*.png (visual-reference coverage)
 *
 * Writes:
 *   ./migration-work/verification/report.md   - human-readable summary
 *   ./migration-work/verification/report.json - machine-readable
 *
 * The report assigns a confidence level (HIGH / MEDIUM / LOW) to each
 * proposal dimension, which the agent uses when writing
 * 02-design-system-assessment.md and 08-risk-register.md.
 *
 * Usage:
 *   node build-verification-report.mjs [--work-dir ./migration-work]
 */

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}

const WORK_DIR = getFlag('--work-dir') || './migration-work';
const VERIFICATION_DIR = resolve(WORK_DIR, 'verification');
const PAGES_DIR = resolve(WORK_DIR, 'pages');
const A11Y_DIR = resolve(WORK_DIR, 'a11y');
const STRUCTURE_DIR = resolve(WORK_DIR, 'structure');
const SCREENSHOTS_DIR = resolve(WORK_DIR, 'design-extract', 'screenshots');

// Viewport labels we expect from capture-clean-screenshots.mjs.
// Filenames are <slug>-<label>[-<width>].png (the pixel-width suffix is new).
const EXPECTED_VIEWPORTS = ['mobile', 'tablet', 'desktop'];

async function readJsonSafe(path) {
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch {
    return null;
  }
}

async function countScrapedPages() {
  try {
    const entries = await readdir(PAGES_DIR, { withFileTypes: true });
    let n = 0;
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const meta = resolve(PAGES_DIR, e.name, 'metadata.json');
      try {
        await stat(meta);
        n += 1;
      } catch { /* no metadata */ }
    }
    return n;
  } catch {
    return 0;
  }
}

/**
 * Inventory screenshots on disk and map them back to the representative
 * slugs the planner expects. Returns per-slug viewport coverage so the
 * report can flag templates that will have no visual baseline for
 * downstream design-system / validate steps.
 */
async function auditScreenshotCoverage(sitemap) {
  const result = {
    total_files: 0,
    by_viewport: Object.fromEntries(EXPECTED_VIEWPORTS.map((v) => [v, 0])),
    orphans: [], // screenshots whose slug is not in representative_urls
    per_template: {},
    fully_covered: 0,
    partially_covered: 0,
    missing: 0,
  };

  let files = [];
  try {
    files = (await readdir(SCREENSHOTS_DIR)).filter((f) => f.endsWith('.png'));
  } catch {
    return result;
  }
  result.total_files = files.length;

  // Map filename → { slug, viewport }. Filenames are one of:
  //   <slug>-<viewport>.png
  //   <slug>-<viewport>-<pxWidth>.png
  // where viewport ∈ EXPECTED_VIEWPORTS. We search right-to-left so slugs
  // containing hyphens (e.g. "ca-en-contact-us") aren't mis-split.
  const parseFile = (name) => {
    const base = name.replace(/\.png$/, '');
    const parts = base.split('-');
    // Strip trailing numeric width token if present (e.g., "1440")
    let tail = parts[parts.length - 1];
    let viewportIdx = -1;
    if (/^\d+$/.test(tail)) {
      parts.pop();
      tail = parts[parts.length - 1];
    }
    if (EXPECTED_VIEWPORTS.includes(tail)) {
      viewportIdx = parts.length - 1;
    }
    if (viewportIdx === -1) return null;
    const viewport = parts[viewportIdx];
    const slug = parts.slice(0, viewportIdx).join('-');
    return { slug, viewport };
  };

  // Build the expected slug set from sitemap representative URLs
  const expectedSlugs = new Set(['homepage']);
  if (sitemap?.representative_urls?.length) {
    const basePath = sitemap.base_path || '';
    for (const u of sitemap.representative_urls) {
      try {
        const p = new URL(u);
        const rel = p.pathname
          .slice(basePath.length)
          .replace(/^\//, '')
          .replace(/\/$/, '');
        const slug = rel ? rel.replace(/\//g, '-') : 'homepage';
        expectedSlugs.add(slug);
      } catch { /* skip bad URL */ }
    }
  }

  // Initialize per-template coverage map
  for (const slug of expectedSlugs) {
    result.per_template[slug] = {
      mobile: false,
      tablet: false,
      desktop: false,
    };
  }

  for (const name of files) {
    const parsed = parseFile(name);
    if (!parsed) continue;
    result.by_viewport[parsed.viewport] =
      (result.by_viewport[parsed.viewport] || 0) + 1;

    if (!expectedSlugs.has(parsed.slug)) {
      // Screenshot whose slug doesn't map to a representative URL
      result.orphans.push({ file: name, slug: parsed.slug, viewport: parsed.viewport });
      continue;
    }
    if (result.per_template[parsed.slug]) {
      result.per_template[parsed.slug][parsed.viewport] = true;
    }
  }

  for (const cov of Object.values(result.per_template)) {
    const hits = EXPECTED_VIEWPORTS.filter((v) => cov[v]).length;
    if (hits === 3) result.fully_covered += 1;
    else if (hits > 0) result.partially_covered += 1;
    else result.missing += 1;
  }

  return result;
}

function fmtPct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${(n * 100).toFixed(0)}%`;
}

function assessDimension({ hasEvidence, evidenceStrength, blockers }) {
  // `evidenceStrength` is a 0-1 score from the relevant signal(s).
  // `blockers` is a list of reasons confidence is reduced regardless.
  if (!hasEvidence) return { level: 'LOW', reason: 'no direct evidence' };
  if (blockers && blockers.length > 0) return { level: 'LOW', reason: blockers.join('; ') };
  if (evidenceStrength >= 0.7) return { level: 'HIGH', reason: 'corroborated' };
  if (evidenceStrength >= 0.4) return { level: 'MEDIUM', reason: 'partial evidence' };
  return { level: 'LOW', reason: 'weak evidence' };
}

async function main() {
  await mkdir(VERIFICATION_DIR, { recursive: true });

  const sitemap = await readJsonSafe(resolve(WORK_DIR, 'sitemap-result.json'));
  const bypass = await readJsonSafe(resolve(WORK_DIR, 'bypass-result.json'));
  const bypassLeak = await readJsonSafe(resolve(VERIFICATION_DIR, 'bypass-leak.json'));
  const gradeDelta = await readJsonSafe(resolve(VERIFICATION_DIR, 'grade-delta.json'));
  const anatomyDiff = await readJsonSafe(resolve(VERIFICATION_DIR, 'anatomy-diff.json'));
  const thirdParty = await readJsonSafe(resolve(VERIFICATION_DIR, 'third-party-inventory.json'));
  const a11y = await readJsonSafe(resolve(A11Y_DIR, 'summary.json'));
  const structure = await readJsonSafe(resolve(STRUCTURE_DIR, 'aggregate.json'));
  const scrapedPages = await countScrapedPages();
  const screenshots = await auditScreenshotCoverage(sitemap);

  const representativeCount = sitemap?.representative_urls?.length || 0;
  const scrapeCoverage = representativeCount > 0 ? scrapedPages / representativeCount : 0;
  const expectedTemplates = Object.keys(screenshots.per_template).length;
  const screenshotCoverage = expectedTemplates > 0
    ? screenshots.fully_covered / expectedTemplates
    : 0;

  // Per-dimension confidence
  const confidences = {};

  // Sitemap / page inventory
  confidences['page_inventory'] = assessDimension({
    hasEvidence: !!sitemap && representativeCount > 0,
    evidenceStrength: representativeCount > 0 ? Math.min(1, sitemap.total_pages_filtered / 10) : 0,
    blockers: sitemap?.exclusion_summary && Object.keys(sitemap.exclusion_summary).length === 0
      ? ['no exclusion signals — filter may have been too permissive']
      : [],
  });

  // Bypass integrity
  const bypassBlockers = [];
  if (bypassLeak && !bypassLeak.pass) bypassBlockers.push('overlay fingerprints leaked into extraction');
  if (bypass && bypass.verified === false) bypassBlockers.push('bypass probe did not verify');
  confidences['bypass_integrity'] = assessDimension({
    hasEvidence: !!bypass && !!bypassLeak,
    evidenceStrength: bypassLeak?.pass ? 1 : 0.2,
    blockers: bypassBlockers,
  });

  // Design system tokens — homepage grade + grade delta across templates
  let tokenConfidence = 0;
  const tokenBlockers = [];
  if (gradeDelta) {
    if (gradeDelta.homepage_is_proxy) {
      tokenConfidence = 0.9;
    } else {
      tokenConfidence = Math.max(0.2, 0.8 - 0.1 * (gradeDelta.high_spread_dimensions?.length || 0));
      tokenBlockers.push(`${gradeDelta.high_spread_dimensions?.length || 0} dimension(s) drift across templates`);
    }
  }
  confidences['design_tokens'] = assessDimension({
    hasEvidence: !!gradeDelta,
    evidenceStrength: tokenConfidence,
    blockers: tokenBlockers,
  });

  // Component anatomy
  const anatomyBlockers = [];
  if (anatomyDiff?.signal === 'LOW') anatomyBlockers.push('anatomy does not reflect DOM evidence');
  confidences['component_anatomy'] = assessDimension({
    hasEvidence: !!anatomyDiff,
    evidenceStrength: anatomyDiff?.structure_covered_by_anatomy ?? 0,
    blockers: anatomyBlockers,
  });

  // Template coverage
  confidences['template_coverage'] = assessDimension({
    hasEvidence: representativeCount > 0 && scrapedPages > 0,
    evidenceStrength: scrapeCoverage,
    blockers: scrapeCoverage < 0.3 ? ['scraped < 30% of representative templates'] : [],
  });

  // Third-party integrations
  const tpCount = thirdParty?.unique_origins || 0;
  confidences['third_party_integrations'] = assessDimension({
    hasEvidence: tpCount > 0,
    evidenceStrength: tpCount > 0 ? Math.min(1, (thirdParty?.pages_analyzed || 0) / 5) : 0,
    blockers: tpCount === 0 ? ['no HAR evidence; inventory is speculative'] : [],
  });

  // Accessibility
  const a11yCritical = a11y?.totals?.critical ?? 0;
  const a11ySerious = a11y?.totals?.serious ?? 0;
  confidences['accessibility'] = assessDimension({
    hasEvidence: !!a11y && (a11y.pages_scanned > 0),
    evidenceStrength: a11y && a11y.pages_scanned > 0
      ? Math.max(0.2, 1 - (a11yCritical * 0.2 + a11ySerious * 0.05))
      : 0,
    blockers: a11yCritical > 0 ? [`${a11yCritical} critical WCAG violation(s) at runtime`] : [],
  });

  // Visual reference (screenshot coverage for downstream design-system / validate steps)
  const visualBlockers = [];
  if (expectedTemplates > 0 && screenshots.missing > 0) {
    visualBlockers.push(`${screenshots.missing} template(s) have no screenshot`);
  }
  if (expectedTemplates > 0 && screenshots.partially_covered > 0) {
    visualBlockers.push(`${screenshots.partially_covered} template(s) missing at least one viewport`);
  }
  confidences['visual_reference'] = assessDimension({
    hasEvidence: screenshots.total_files > 0,
    evidenceStrength: screenshotCoverage,
    blockers: visualBlockers,
  });

  const overall = (() => {
    const levels = Object.values(confidences).map((c) => c.level);
    if (levels.includes('LOW')) return 'LOW';
    if (levels.includes('MEDIUM')) return 'MEDIUM';
    return 'HIGH';
  })();

  const machine = {
    work_dir: WORK_DIR,
    overall_confidence: overall,
    dimensions: confidences,
    inputs: {
      sitemap: sitemap
        ? {
            total_pages: sitemap.total_pages,
            total_pages_filtered: sitemap.total_pages_filtered,
            template_groups: Object.keys(sitemap.template_groups || {}).length,
            representative_urls: representativeCount,
            exclusion_summary: sitemap.exclusion_summary || {},
          }
        : null,
      bypass: bypass
        ? {
            overlays_detected: bypass.overlays_detected,
            verified: bypass.verified,
          }
        : null,
      bypass_leak: bypassLeak
        ? {
            pass: bypassLeak.pass,
            total_hits: bypassLeak.total_hits,
            critical_categories: bypassLeak.critical_categories,
          }
        : null,
      grade_delta: gradeDelta
        ? {
            sampled: gradeDelta.sampled?.length || 0,
            high_spread_dimensions: gradeDelta.high_spread_dimensions || [],
            homepage_is_proxy: gradeDelta.homepage_is_proxy,
          }
        : null,
      anatomy_diff: anatomyDiff
        ? {
            signal: anatomyDiff.signal,
            overlap_ratio: anatomyDiff.overlap_ratio,
            structure_covered_by_anatomy: anatomyDiff.structure_covered_by_anatomy,
            anatomy_only_count: anatomyDiff.anatomy_only_count,
            structure_only_count: anatomyDiff.structure_only_count,
          }
        : null,
      third_party: thirdParty
        ? {
            unique_origins: thirdParty.unique_origins,
            pages_analyzed: thirdParty.pages_analyzed,
            categories: Object.keys(thirdParty.categories || {}),
          }
        : null,
      a11y: a11y
        ? {
            pages_scanned: a11y.pages_scanned,
            violations: a11y.totals?.violations || 0,
            critical: a11yCritical,
            serious: a11ySerious,
          }
        : null,
      structure: structure
        ? {
            pages_analyzed: structure.pages_analyzed,
            total_unique_organisms: structure.total_unique_organisms,
          }
        : null,
      scrape: {
        representative_urls: representativeCount,
        scraped_pages: scrapedPages,
        coverage: Number(scrapeCoverage.toFixed(3)),
      },
      screenshots: {
        total_files: screenshots.total_files,
        by_viewport: screenshots.by_viewport,
        expected_templates: expectedTemplates,
        fully_covered: screenshots.fully_covered,
        partially_covered: screenshots.partially_covered,
        missing: screenshots.missing,
        coverage: Number(screenshotCoverage.toFixed(3)),
        orphan_count: screenshots.orphans.length,
        per_template: screenshots.per_template,
      },
    },
  };

  await writeFile(resolve(VERIFICATION_DIR, 'report.json'), JSON.stringify(machine, null, 2));

  // Markdown report
  const md = [];
  md.push('# Migration-Planner Verification Report');
  md.push('');
  md.push(`**Overall confidence:** ${overall}`);
  md.push('');
  md.push('## Confidence by dimension');
  md.push('');
  md.push('| Dimension | Confidence | Reason |');
  md.push('|---|---|---|');
  for (const [dim, c] of Object.entries(confidences)) {
    md.push(`| ${dim} | **${c.level}** | ${c.reason} |`);
  }
  md.push('');
  md.push('## Evidence summary');
  md.push('');

  // Sitemap
  if (sitemap) {
    md.push('### Page inventory (sitemap)');
    md.push('');
    md.push(`- Total URLs discovered: ${sitemap.total_pages}`);
    md.push(`- After filtering: ${sitemap.total_pages_filtered}`);
    md.push(`- Template groups: ${Object.keys(sitemap.template_groups || {}).length}`);
    md.push(`- Representative URLs: ${representativeCount}`);
    if (sitemap.exclusion_summary && Object.keys(sitemap.exclusion_summary).length > 0) {
      md.push('- Exclusions by reason:');
      for (const [reason, count] of Object.entries(sitemap.exclusion_summary)) {
        md.push(`  - ${reason}: ${count}`);
      }
    }
    md.push('');
  }

  // Bypass
  if (bypass) {
    md.push('### Bypass');
    md.push('');
    md.push(`- Overlays detected: ${(bypass.overlays_detected || []).join(', ') || 'none'}`);
    md.push(`- Probe verified: ${bypass.verified ? 'yes' : 'no'}`);
    if (bypassLeak) {
      md.push(`- Post-extraction leak check: **${bypassLeak.pass ? 'PASS' : 'FAIL'}** (${bypassLeak.total_hits} keyword hits)`);
      if (!bypassLeak.pass) {
        md.push(`  - Critical categories: ${bypassLeak.critical_categories.join(', ')}`);
      }
    }
    md.push('');
  }

  // Grade delta
  if (gradeDelta) {
    md.push('### Design token consistency across templates');
    md.push('');
    md.push(`- Sampled templates: ${gradeDelta.sampled?.length || 0}`);
    md.push(`- Homepage is a safe proxy: ${gradeDelta.homepage_is_proxy ? 'yes' : 'no'}`);
    if (gradeDelta.high_spread_dimensions?.length > 0) {
      md.push('- High-spread dimensions (>20 points):');
      for (const d of gradeDelta.high_spread_dimensions) {
        md.push(`  - ${d.dim}: ${d.min} → ${d.max} (spread ${d.spread})`);
      }
    }
    md.push('');
  }

  // Anatomy diff
  if (anatomyDiff) {
    md.push('### Component anatomy vs DOM evidence');
    md.push('');
    md.push(`- Signal: ${anatomyDiff.signal}`);
    md.push(`- DOM patterns covered by anatomy: ${fmtPct(anatomyDiff.structure_covered_by_anatomy)}`);
    md.push(`- Anatomy-only organisms: ${anatomyDiff.anatomy_only_count}`);
    md.push(`- DOM-only organisms: ${anatomyDiff.structure_only_count}`);
    md.push('');
  }

  // Third-party
  if (thirdParty) {
    md.push('### Third-party integrations (HAR evidence)');
    md.push('');
    md.push(`- Pages analyzed: ${thirdParty.pages_analyzed}`);
    md.push(`- Unique origins: ${thirdParty.unique_origins}`);
    if (thirdParty.categories) {
      const cats = Object.entries(thirdParty.categories)
        .map(([k, v]) => `${k}(${v.count})`)
        .join(', ');
      md.push(`- By category: ${cats}`);
    }
    md.push('');
  }

  // A11y
  if (a11y) {
    md.push('### Runtime accessibility');
    md.push('');
    md.push(`- Pages scanned: ${a11y.pages_scanned}`);
    md.push(`- Total violations: ${a11y.totals?.violations || 0}`);
    md.push(`- Critical: ${a11yCritical} · Serious: ${a11ySerious} · Moderate: ${a11y.totals?.moderate || 0} · Minor: ${a11y.totals?.minor || 0}`);
    md.push('');
  }

  // Scrape coverage
  md.push('### Scrape coverage');
  md.push('');
  md.push(`- Representative URLs: ${representativeCount}`);
  md.push(`- Pages successfully scraped: ${scrapedPages}`);
  md.push(`- Coverage: ${fmtPct(scrapeCoverage)}`);
  md.push('');

  // Visual reference coverage
  md.push('### Visual reference (screenshots)');
  md.push('');
  md.push(`- Total screenshot files: ${screenshots.total_files}`);
  md.push(`- By viewport: mobile ${screenshots.by_viewport.mobile}, tablet ${screenshots.by_viewport.tablet}, desktop ${screenshots.by_viewport.desktop}`);
  md.push(`- Templates fully covered (mobile + tablet + desktop): ${screenshots.fully_covered} / ${expectedTemplates}`);
  md.push(`- Partially covered: ${screenshots.partially_covered}`);
  md.push(`- Missing entirely: ${screenshots.missing}`);
  if (screenshots.orphans.length > 0) {
    md.push(`- Orphan screenshots (slug not in sitemap): ${screenshots.orphans.length}`);
  }
  md.push(`- Coverage (all-3-viewports / expected): ${fmtPct(screenshotCoverage)}`);
  md.push('');
  // Per-template breakdown for templates missing at least one viewport
  const incomplete = Object.entries(screenshots.per_template).filter(
    ([, cov]) => !(cov.mobile && cov.tablet && cov.desktop),
  );
  if (incomplete.length > 0) {
    md.push('#### Templates with incomplete viewport coverage');
    md.push('');
    md.push('| Slug | Mobile | Tablet | Desktop |');
    md.push('|---|---|---|---|');
    const mark = (b) => (b ? '✓' : '—');
    for (const [slug, cov] of incomplete.slice(0, 30)) {
      md.push(`| ${slug} | ${mark(cov.mobile)} | ${mark(cov.tablet)} | ${mark(cov.desktop)} |`);
    }
    if (incomplete.length > 30) {
      md.push(`_…and ${incomplete.length - 30} more. See report.json for full list._`);
    }
    md.push('');
  }

  md.push('## How to consume this report');
  md.push('');
  md.push('When writing `02-design-system-assessment.md`, use the per-dimension');
  md.push('confidence levels to calibrate claims:');
  md.push('');
  md.push('- **HIGH** — state findings plainly ("the site uses 4 core color tokens…")');
  md.push('- **MEDIUM** — qualify ("based on homepage extraction, the color palette appears to use…")');
  md.push('- **LOW** — flag as an open question requiring discovery-phase validation');
  md.push('');
  md.push('When writing `08-risk-register.md`, add a risk entry for every LOW');
  md.push('dimension with severity proportional to its impact on downstream phases.');
  md.push('');

  await writeFile(resolve(VERIFICATION_DIR, 'report.md'), md.join('\n'));

  process.stderr.write(`[report] Overall confidence: ${overall}\n`);
  for (const [dim, c] of Object.entries(confidences)) {
    process.stderr.write(`  ${dim}: ${c.level} — ${c.reason}\n`);
  }
  process.stderr.write(`[report] Wrote ${resolve(VERIFICATION_DIR, 'report.json')}\n`);
  process.stderr.write(`[report] Wrote ${resolve(VERIFICATION_DIR, 'report.md')}\n`);
  process.stdout.write(JSON.stringify(machine, null, 2) + '\n');
}

main().catch((err) => {
  console.error('[report] Fatal:', err.message);
  console.error(err.stack);
  process.exit(0);
});
