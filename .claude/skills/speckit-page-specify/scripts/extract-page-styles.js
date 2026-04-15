#!/usr/bin/env node

/**
 * Extract Computed Styles from a Live Webpage — Per Block
 *
 * Uses Playwright to load a page at multiple viewport widths and extract
 * computed CSS styles for specific blocks or all significant elements.
 * Outputs a JSON report organized by block, with breakpoint diffs.
 *
 * Usage:
 *   # Extract all elements under main
 *   node extract-page-styles.js "https://example.com/page" --output ./output
 *
 *   # Extract specific blocks by CSS selector
 *   node extract-page-styles.js "https://example.com/page" --output ./output \
 *     --blocks ".product-detail,.carousel.product,.accordion.faq,.columns"
 *
 *   # Custom root selector
 *   node extract-page-styles.js "https://example.com/page" --output ./output --selector "main"
 *
 *   # Custom post-navigation wait (ms) — default 5000
 *   node extract-page-styles.js "https://example.com/page" --output ./output --wait 8000
 *
 *   # Custom navigation timeout (ms) — default 30000
 *   node extract-page-styles.js "https://example.com/page" --output ./output --timeout 60000
 *
 * Requirements:
 *   npm install playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1200, height: 900 },
];

const STYLE_PROPERTIES = [
  'display', 'position',
  'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-self', 'gap',
  'grid-template-columns', 'grid-template-rows',
  'width', 'height', 'max-width', 'min-height', 'min-width', 'max-height',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform', 'text-align',
  'color', 'background-color', 'background-image',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'box-shadow', 'text-shadow',
  'opacity', 'overflow', 'z-index',
  'transition', 'transform',
];

const SKIP_VALUES = new Set([
  '', 'none', 'normal', 'auto', '0px', 'rgba(0, 0, 0, 0)',
  'transparent', 'static', 'visible', 'start', '0px 0px',
  '0px 0px 0px 0px',
]);

function parseArgs() {
  const args = process.argv.slice(2);
  const url = args.find((a) => a.startsWith('http'));
  if (!url) {
    console.error('Usage: node extract-page-styles.js <URL> --output <dir> [--blocks <selectors>] [--selector <root>] [--wait <ms>] [--timeout <ms>]');
    process.exit(1);
  }
  let output = './page-styles';
  let rootSelector = 'main';
  let blockSelectors = [];
  let postWait = 5000;
  let navTimeout = 30000;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) output = args[i + 1];
    if (args[i] === '--selector' && args[i + 1]) rootSelector = args[i + 1];
    if (args[i] === '--blocks' && args[i + 1]) blockSelectors = args[i + 1].split(',').map((s) => s.trim());
    if (args[i] === '--wait' && args[i + 1]) postWait = parseInt(args[i + 1], 10);
    if (args[i] === '--timeout' && args[i + 1]) navTimeout = parseInt(args[i + 1], 10);
  }
  return { url, output, rootSelector, blockSelectors, postWait, navTimeout };
}

/**
 * Browser-side: collect computed styles for a single block subtree.
 */
function collectBlockStyles({ blockSelector, properties, maxDepth }) {
  const roots = document.querySelectorAll(blockSelector);
  if (roots.length === 0) return { found: false, selector: blockSelector, elements: [] };

  const allResults = [];

  function shortSelector(el) {
    if (el.id) return `#${el.id}`;
    const tag = el.tagName.toLowerCase();
    const cls = Array.from(el.classList).filter((c) => c && !c.startsWith('_')).join('.');
    return cls ? `${tag}.${cls}` : tag;
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function extractStyles(el) {
    const computed = window.getComputedStyle(el);
    const styles = {};
    for (const prop of properties) {
      const val = computed.getPropertyValue(prop).trim();
      if (val && !['', 'none', 'normal', 'auto', '0px', 'rgba(0, 0, 0, 0)',
        'transparent', 'static', 'visible', 'start', '0px 0px', '0px 0px 0px 0px'].includes(val)) {
        styles[prop] = val;
      }
    }
    return styles;
  }

  function walk(el, depth, pathParts) {
    if (depth > maxDepth) return;
    if (!isVisible(el)) return;

    const seg = shortSelector(el);
    const currentPath = [...pathParts, seg];
    const rect = el.getBoundingClientRect();

    allResults.push({
      selector: currentPath.join(' > '),
      selectorShort: seg,
      tag: el.tagName.toLowerCase(),
      classes: Array.from(el.classList),
      role: el.getAttribute('role') || undefined,
      ariaExpanded: el.getAttribute('aria-expanded') || undefined,
      ariaSelected: el.getAttribute('aria-selected') || undefined,
      boundingBox: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      styles: extractStyles(el),
    });

    for (const child of el.children) {
      walk(child, depth + 1, currentPath);
    }
  }

  roots.forEach((root, idx) => {
    const label = roots.length > 1 ? `${shortSelector(root)}[${idx}]` : shortSelector(root);
    walk(root, 0, []);
  });

  const sectionEl = roots[0].closest('.section');
  let sectionStyles = null;
  if (sectionEl) {
    const sComputed = window.getComputedStyle(sectionEl);
    sectionStyles = {};
    for (const prop of ['background-color', 'background-image', 'padding-top', 'padding-bottom',
      'padding-left', 'padding-right', 'max-width', 'margin-top', 'margin-bottom', 'text-align']) {
      const val = sComputed.getPropertyValue(prop).trim();
      if (val && !['', 'none', 'normal', 'auto', '0px', 'rgba(0, 0, 0, 0)', 'transparent'].includes(val)) {
        sectionStyles[prop] = val;
      }
    }
    sectionStyles._classes = Array.from(sectionEl.classList);
  }

  return {
    found: true,
    selector: blockSelector,
    instanceCount: roots.length,
    sectionStyles,
    elements: allResults,
  };
}

async function extractBlockAtBreakpoint(page, blockSelector, breakpoint) {
  await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
  await page.waitForTimeout(800);

  const data = await page.evaluate(collectBlockStyles, { blockSelector, properties: STYLE_PROPERTIES, maxDepth: 6 });
  return { breakpoint: breakpoint.name, viewport: breakpoint, ...data };
}

function diffBlockBreakpoints(results) {
  if (results.length < 2) return {};

  const layoutProps = [
    'display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap',
    'grid-template-columns', 'grid-template-rows', 'width', 'max-width',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'font-size', 'line-height',
  ];

  const diffs = {};

  for (let i = 0; i < results.length - 1; i++) {
    const from = results[i];
    const to = results[i + 1];
    const key = `${from.breakpoint}-to-${to.breakpoint}`;
    diffs[key] = [];

    const toMap = new Map((to.elements || []).map((e) => [e.selector, e]));

    for (const fEl of from.elements || []) {
      const tEl = toMap.get(fEl.selector);
      if (!tEl) continue;
      const changes = {};
      for (const prop of layoutProps) {
        const fv = fEl.styles[prop] || 'unset';
        const tv = tEl.styles[prop] || 'unset';
        if (fv !== tv) changes[prop] = { from: fv, to: tv };
      }
      if (Object.keys(changes).length > 0) {
        diffs[key].push({ selector: fEl.selector, selectorShort: fEl.selectorShort, changes });
      }
    }
  }

  return diffs;
}

function buildBlockSummary(blockName, blockResults, diffs) {
  let md = `### Block: \`${blockName}\`\n\n`;

  if (!blockResults[0]?.found) {
    md += `**Not found on page.**\n\n`;
    return md;
  }

  md += `Instances: ${blockResults[0].instanceCount}\n\n`;

  if (blockResults[0].sectionStyles) {
    const ss = blockResults[0].sectionStyles;
    const classes = ss._classes || [];
    md += `**Section wrapper**: classes = \`${classes.join(' ')}\`\n`;
    const props = Object.entries(ss).filter(([k]) => !k.startsWith('_'));
    if (props.length > 0) {
      md += `| Property | Value |\n|---|---|\n`;
      for (const [p, v] of props) md += `| ${p} | \`${v}\` |\n`;
    }
    md += '\n';
  }

  for (const bp of blockResults) {
    md += `#### ${bp.breakpoint} (${bp.viewport.width}×${bp.viewport.height})\n\n`;
    const rootEl = bp.elements?.[0];
    if (rootEl) {
      md += `**Root element**: \`${rootEl.selector}\`\n\n`;
      md += `| Property | Value |\n|---|---|\n`;
      for (const [p, v] of Object.entries(rootEl.styles).slice(0, 20)) {
        md += `| ${p} | \`${v}\` |\n`;
      }
      md += '\n';
    }

    const layoutEls = (bp.elements || []).filter((e) =>
      ['flex', 'inline-flex', 'grid', 'inline-grid'].includes(e.styles.display));
    if (layoutEls.length > 0) {
      md += `**Layout containers:**\n\n`;
      md += `| Selector | display | flex-direction | gap | justify-content | align-items |\n`;
      md += `|---|---|---|---|---|---|\n`;
      for (const el of layoutEls.slice(0, 15)) {
        md += `| \`${el.selectorShort}\` | ${el.styles.display || ''} | ${el.styles['flex-direction'] || ''} | ${el.styles.gap || ''} | ${el.styles['justify-content'] || ''} | ${el.styles['align-items'] || ''} |\n`;
      }
      md += '\n';
    }
  }

  for (const [key, changes] of Object.entries(diffs)) {
    if (changes.length === 0) continue;
    md += `#### Changes: ${key}\n\n`;
    for (const ch of changes.slice(0, 15)) {
      md += `- \`${ch.selectorShort}\`\n`;
      for (const [prop, vals] of Object.entries(ch.changes)) {
        md += `  - ${prop}: \`${vals.from}\` → \`${vals.to}\`\n`;
      }
    }
    if (changes.length > 15) md += `  - ... and ${changes.length - 15} more\n`;
    md += '\n';
  }

  return md;
}

async function main() {
  const { url, output, rootSelector, blockSelectors, postWait, navTimeout } = parseArgs();

  fs.mkdirSync(output, { recursive: true });

  console.log(`Extracting styles from: ${url}`);
  console.log(`Block selectors: ${blockSelectors.length > 0 ? blockSelectors.join(', ') : '(auto-detect from ' + rootSelector + ')'}`);
  console.log(`Output: ${output}`);
  console.log(`Navigation timeout: ${navTimeout}ms, post-wait: ${postWait}ms`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Use 'domcontentloaded' instead of 'networkidle'.
  // Real-world sites with analytics, chat widgets, consent managers, and other
  // third-party scripts maintain persistent network activity — 'networkidle'
  // waits for zero in-flight requests for 500ms which may never resolve.
  // A fixed post-wait lets client-side JS render dynamic content.
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: navTimeout });
  await page.waitForTimeout(postWait);

  const selectors = blockSelectors.length > 0
    ? blockSelectors
    : await page.evaluate((root) => {
      const el = document.querySelector(root);
      if (!el) return [];
      const blocks = el.querySelectorAll('[class*="-wrapper"], [class]:not(.section)');
      const seen = new Set();
      const result = [];
      blocks.forEach((b) => {
        const cls = b.classList[0];
        if (cls && !seen.has(cls) && !['section', 'default-content-wrapper', 'section-metadata-container'].includes(cls)) {
          seen.add(cls);
          result.push(`.${cls}`);
        }
      });
      return result;
    }, rootSelector);

  console.log(`Blocks to extract: ${selectors.join(', ')}`);

  const allBlockData = {};
  let summaryMd = `# Page Style Extraction: ${url}\n\n`;
  summaryMd += `**Extracted**: ${new Date().toISOString()}\n\n`;

  for (const bpDef of BREAKPOINTS) {
    const screenshotPath = path.join(output, `screenshot-${bpDef.name}.png`);
    await page.setViewportSize({ width: bpDef.width, height: bpDef.height });
    await page.waitForTimeout(800);
    const buf = await page.screenshot({ fullPage: true });
    fs.writeFileSync(screenshotPath, buf);
    console.log(`Full-page screenshot: ${screenshotPath}`);
  }

  for (const sel of selectors) {
    console.log(`\nExtracting block: ${sel}`);
    const blockResults = [];

    for (const bp of BREAKPOINTS) {
      const result = await extractBlockAtBreakpoint(page, sel, bp);
      blockResults.push(result);
      console.log(`  ${bp.name}: ${result.found ? result.elements.length + ' elements' : 'NOT FOUND'}`);
    }

    const diffs = diffBlockBreakpoints(blockResults);
    allBlockData[sel] = { results: blockResults, diffs };
    summaryMd += buildBlockSummary(sel, blockResults, diffs);
    summaryMd += '---\n\n';
  }

  const reportPath = path.join(output, 'styles-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    url,
    timestamp: new Date().toISOString(),
    rootSelector,
    blockSelectors: selectors,
    blocks: allBlockData,
  }, null, 2));

  const summaryPath = path.join(output, 'styles-summary.md');
  fs.writeFileSync(summaryPath, summaryMd);

  console.log(`\nReport: ${reportPath}`);
  console.log(`Summary: ${summaryPath}`);

  await browser.close();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
