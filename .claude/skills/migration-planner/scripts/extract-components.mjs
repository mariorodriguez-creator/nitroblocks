#!/usr/bin/env node
/**
 * extract-components.mjs
 *
 * Evidence-based component extraction. For every atom / molecule / organism
 * declared in component-manifest.json, navigates to the sample page (with
 * bypass cookies loaded from bypass-cookies.json), locates the first DOM
 * match, and captures:
 *   - anatomy.html      — the element's outer HTML exactly as hydrated
 *   - computed.css      — a curated snapshot of getComputedStyle values
 *   - evidence/*.png    — per-variant cropped screenshot
 *   - stats.json        — occurrence count + page spread from cleaned.html
 *
 * The manifest drives everything: the script is generic and can be pointed
 * at any site that has been through run-discovery.sh (so bypass-cookies.json
 * and the per-page cleaned HTML under pages both exist).
 *
 * Usage:
 *   node extract-components.mjs --manifest ./migration-work/component-manifest.json
 *       --bypass ./migration-work/bypass-cookies.json
 *       --pages  ./migration-work/pages
 *       --out    ./migration-work/components
 *
 * Output structure:
 *   migration-work/components/
 *     README.md
 *     atoms/README.md
 *     atoms/<name>/        README.md, anatomy.html, computed.css, stats.json, evidence/
 *     molecules/...
 *     organisms/...
 */
import { mkdir, writeFile, readFile, access, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const VIEWPORTS = { width: 1440, height: 900, deviceScaleFactor: 2 };

// ---- argv ----------------------------------------------------------------

function parseArgs(argv) {
  const args = { };
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
const BYPASS_PATH = resolve(args.bypass ?? './migration-work/bypass-cookies.json');
const PAGES_DIR = resolve(args.pages ?? './migration-work/pages');
const OUT_DIR = resolve(args.out ?? './migration-work/components');
const VERBOSE = !!args.verbose;

// ---- helpers -------------------------------------------------------------

function log(...a) {
  console.log('[components]', ...a);
}
function vlog(...a) {
  if (VERBOSE) console.log('[components]', ...a);
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function loadJSON(p) {
  return JSON.parse(await readFile(p, 'utf-8'));
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

// Count DOM-fingerprint occurrences per page by scanning cleaned.html
async function pageSpreadStats(pagesDir, fingerprints) {
  let perPage = {};
  let total = 0;
  try {
    const slugs = await readdir(pagesDir, { withFileTypes: true });
    for (const entry of slugs) {
      if (!entry.isDirectory()) continue;
      const html = await readFile(join(pagesDir, entry.name, 'cleaned.html'), 'utf-8').catch(() => '');
      if (!html) continue;
      let count = 0;
      for (const fp of fingerprints) {
        if (fp.startsWith('.')) {
          const cls = fp.slice(1);
          const re = new RegExp(`class="[^"]*\\b${cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b[^"]*"`, 'g');
          count += (html.match(re) || []).length;
        } else {
          const re = new RegExp(`<${fp.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}[\\s>]`, 'g');
          count += (html.match(re) || []).length;
        }
      }
      if (count > 0) {
        perPage[entry.name] = count;
        total += count;
      }
    }
  } catch (err) {
    vlog('pageSpreadStats error', err.message);
  }
  return { total, perPage, pages: Object.keys(perPage).length };
}

// ---- extraction ----------------------------------------------------------

async function extractVariant(context, page, url, variant, bypassStorageState) {
  vlog(`  variant ${variant.name} → ${url}`);

  if (variant.clearBypass) {
    await context.clearCookies();
  } else if (bypassStorageState?.cookies) {
    // Re-apply bypass cookies in case a previous variant cleared them.
    await context.addCookies(bypassStorageState.cookies);
  }

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  } catch (err) {
    return { ok: false, reason: `navigation-failed: ${err.message}` };
  }
  // Hide known overlays that otherwise steal clip regions (cookie banner,
  // feedback widget, live chat, etc.). Safe to overhide — we care about the
  // main page layout, not these third-parties.
  await page.addStyleTag({
    content: `
      #onetrust-banner-sdk, #onetrust-consent-sdk, .ot-floating-button,
      #CybotCookiebotDialog, [id*="cookieBanner"],
      .ns-sitegainer, #qsi_div
      { display: none !important; visibility: hidden !important; }
    `,
  }).catch(() => {});
  await page.waitForTimeout(variant.extraWaitMs || 3000);

  // Locate the best visible candidate. A candidate is visible iff it has
  // non-zero box, inherited display/visibility pass on every ancestor, and
  // is either in-viewport or only marginally above/below the fold.
  const data = await page.evaluate((sel) => {
    function isTrulyVisible(el) {
      for (let node = el; node && node !== document.body.parentElement; node = node.parentElement) {
        const cs = getComputedStyle(node);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
        if (parseFloat(cs.opacity) === 0) return false;
      }
      const r = el.getBoundingClientRect();
      return r.width >= 2 && r.height >= 2;
    }
    function pickElement(selector) {
      const nodes = Array.from(document.querySelectorAll(selector));
      const visible = nodes.find(isTrulyVisible);
      return visible || null;
    }
    let el = pickElement(sel);
    let hiddenFallback = false;
    if (!el) {
      // Fallback: if the component is inside a collapsed modal (login, cart,
      // etc.) we still want the HTML + computed CSS for inventory purposes.
      // Flag the variant so the README notes it.
      el = document.querySelector(sel);
      if (!el) return { found: false, reason: 'selector-not-matched' };
      hiddenFallback = true;
    }
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const keys = [
      'display','position','width','height','color','backgroundColor','backgroundImage',
      'borderRadius','borderWidth','borderStyle','borderColor',
      'boxShadow','padding','margin','fontFamily','fontSize','fontWeight',
      'lineHeight','letterSpacing','textTransform','textDecoration',
      'gap','flexDirection','justifyContent','alignItems','gridTemplateColumns',
      'opacity','transition','transform','zIndex','outline','overflow'
    ];
    const styles = Object.fromEntries(keys.map((k) => [k, cs[k]]));

    let outerHTML = el.outerHTML;
    if (outerHTML.length > 20_000) {
      outerHTML = `${outerHTML.slice(0, 20_000)}\n<!-- truncated at 20,000 chars of ${outerHTML.length} -->`;
    }

    // Scroll into view so the clip coordinates are stable for the screenshot.
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    const rectAfter = el.getBoundingClientRect();

    return {
      found: true,
      hiddenFallback,
      outerHTML,
      styles,
      absBounds: {
        x: Math.max(0, Math.round(rectAfter.left)),
        y: Math.max(0, Math.round(rectAfter.top)),
        w: Math.round(rectAfter.width),
        h: Math.round(rectAfter.height),
      },
    };
  }, variant.selector);

  if (!data.found) return { ok: false, reason: data.reason || 'not-found' };

  // Reliable screenshot strategy:
  //  1. Tag the visible element with a unique data-attribute in page context.
  //  2. Use Playwright's locator API to target that attribute — locator
  //     screenshots re-read the bounding box at capture time AND auto-scroll.
  //  3. Clean up the tag afterwards.
  //
  // This sidesteps CLS drift between evaluate() and page.screenshot({clip})
  // that plagues the live site.
  let screenshotBuffer = null;
  if (!data.hiddenFallback) {
    const tag = `migx-${Math.random().toString(36).slice(2, 10)}`;
    const tagged = await page.evaluate(([sel, t]) => {
      function isTrulyVisible(el) {
        for (let n = el; n && n !== document.body.parentElement; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
          if (parseFloat(cs.opacity) === 0) return false;
        }
        const r = el.getBoundingClientRect();
        return r.width >= 2 && r.height >= 2;
      }
      for (const el of Array.from(document.querySelectorAll(sel))) {
        if (isTrulyVisible(el)) {
          el.setAttribute('data-migx-tag', t);
          return true;
        }
      }
      return false;
    }, [variant.selector, tag]);
    if (tagged) {
      try {
        // Let CLS settle before capture.
        await page.waitForTimeout(1500);
        const loc = page.locator(`[data-migx-tag="${tag}"]`);
        await loc.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(400);
        screenshotBuffer = await loc.screenshot({ type: 'png', animations: 'disabled', timeout: 15_000 });
      } catch (err) {
        vlog(`    screenshot failed for ${variant.name}: ${err.message}`);
      } finally {
        await page.evaluate((t) => {
          const el = document.querySelector(`[data-migx-tag="${t}"]`);
          if (el) el.removeAttribute('data-migx-tag');
        }, tag).catch(() => {});
      }
    } else {
      vlog(`    skipping screenshot: could not tag visible element`);
    }
  } else {
    vlog(`    skipping screenshot: element not visible (likely inside collapsed modal)`);
  }
  return {
    ok: true,
    hiddenFallback: data.hiddenFallback,
    outerHTML: data.outerHTML,
    styles: data.styles,
    bounds: data.absBounds,
    screenshotBuffer,
  };
}

async function extractComponent(context, page, comp, pagesMap, pagesDir, bypassStorageState) {
  const stats = await pageSpreadStats(pagesDir, comp.domFingerprint || []);

  const variantResults = [];
  for (const variant of comp.variants) {
    const pageUrl = pagesMap[variant.samplePage];
    if (!pageUrl) {
      variantResults.push({ name: variant.name, variant, ok: false, reason: `unknown-sample-page: ${variant.samplePage}` });
      continue;
    }
    const res = await extractVariant(context, page, pageUrl, variant, bypassStorageState);
    variantResults.push({ name: variant.name, variant, ...res });
    await page.waitForTimeout(1500);
  }

  return { component: comp, stats, variants: variantResults };
}

// ---- writing outputs -----------------------------------------------------

function renderStyles(styles) {
  return Object.entries(styles)
    .filter(([, v]) => v !== undefined && v !== '' && v !== 'none' && v !== 'normal' && v !== 'auto')
    .map(([k, v]) => `  ${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v};`)
    .join('\n');
}

function renderComputedCss(variants, componentName) {
  const sections = variants
    .filter((v) => v.ok && v.styles)
    .map(
      (v) => `/* variant: ${v.name} (${v.variant.selector}) */\n.${componentName}--${slugify(v.name)}-sample {\n${renderStyles(v.styles)}\n}`,
    );
  return [
    `/* ${componentName} — computed CSS snapshot from live DOM */`,
    `/* Generated by extract-components.mjs. Do not edit. */`,
    '',
    ...sections,
  ].join('\n\n');
}

function renderAnatomyHtml(variants, componentName) {
  const sections = variants
    .filter((v) => v.ok && v.outerHTML)
    .map(
      (v) =>
        `<!-- ${componentName} — variant: ${v.name} -->\n<!-- sample page: ${v.variant.samplePage} -->\n<!-- selector: ${v.variant.selector} -->\n${v.outerHTML}`,
    );
  return sections.length
    ? sections.join('\n\n')
    : `<!-- No anatomy extracted — all variants failed -->`;
}

function renderReadme(comp, stats, variants, level) {
  const lines = [];
  const title = comp.name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`**${level[0].toUpperCase()}${level.slice(1)}**  ·  ${comp.regulatory ? '⚠️ Regulatory  ·  ' : ''}${comp.description}`);
  lines.push('');
  lines.push('## Observed on the live site');
  lines.push('');
  lines.push(`- **Total instances:** ${stats.total}`);
  lines.push(`- **Page spread:** ${stats.pages} pages (of ${(comp.observedPages || []).length} declared)`);
  lines.push(`- **DOM fingerprint:** \`${(comp.domFingerprint || []).join('`, `')}\``);
  if (Object.keys(stats.perPage).length) {
    lines.push('');
    lines.push('| Page | Count |');
    lines.push('|------|-------|');
    for (const [slug, c] of Object.entries(stats.perPage).sort(([, a], [, b]) => b - a)) {
      lines.push(`| \`${slug}\` | ${c} |`);
    }
  }
  lines.push('');
  lines.push('## Variants');
  lines.push('');
  lines.push('| Variant | Selector | Sample page | Evidence | Status |');
  lines.push('|---------|----------|-------------|----------|--------|');
  for (const v of variants) {
    let status;
    if (v.ok && v.hiddenFallback) status = 'HTML captured (hidden in modal)';
    else if (v.ok) status = 'extracted';
    else status = `failed: ${v.reason}`;
    let ev = '—';
    if (v.ok && !v.hiddenFallback) ev = `![${v.name}](./evidence/${slugify(v.name)}.png)`;
    else if (v.ok && v.hiddenFallback) ev = 'HTML only';
    lines.push(`| \`${v.name}\` | \`${v.variant.selector}\` | \`${v.variant.samplePage}\` | ${ev} | ${status} |`);
  }
  lines.push('');
  lines.push('## EDS mapping');
  lines.push('');
  lines.push(`- **Strategy:** \`${comp.edsMapping?.strategy ?? 'TBD'}\``);
  if (comp.edsMapping?.notes) {
    lines.push(`- **Notes:** ${comp.edsMapping.notes}`);
  }
  lines.push('');
  lines.push('## Files');
  lines.push('');
  lines.push('- [`anatomy.html`](./anatomy.html) — outer HTML from live DOM (as-is, unnormalised).');
  lines.push('- [`computed.css`](./computed.css) — `getComputedStyle` snapshot per variant.');
  lines.push('- [`stats.json`](./stats.json) — page spread and occurrence counts.');
  lines.push('- [`evidence/`](./evidence) — per-variant element screenshots.');
  lines.push('');
  lines.push('## Source-of-truth note');
  lines.push('');
  lines.push('This inventory is extracted **as observed** — not normalised. Colours,');
  lines.push('spacing, weights, radii shown in `computed.css` reflect the live site.');
  lines.push('Token consolidation happens in `migration-design-system`.');
  return lines.join('\n');
}

async function writeComponent(outDir, level, comp, stats, variants) {
  const compDir = join(outDir, `${level}s`, comp.name);
  const evDir = join(compDir, 'evidence');
  await ensureDir(evDir);

  await writeFile(
    join(compDir, 'anatomy.html'),
    renderAnatomyHtml(variants, comp.name),
    'utf-8',
  );
  await writeFile(
    join(compDir, 'computed.css'),
    renderComputedCss(variants, comp.name),
    'utf-8',
  );
  await writeFile(
    join(compDir, 'stats.json'),
    JSON.stringify({
      component: comp.name,
      stats,
      variants: variants.map((v) => ({
        name: v.name,
        ok: !!v.ok,
        hiddenFallback: !!v.hiddenFallback,
        reason: v.reason,
        selector: v.variant?.selector,
      })),
    }, null, 2),
    'utf-8',
  );
  for (const v of variants) {
    if (v.ok && v.screenshotBuffer) {
      await writeFile(join(evDir, `${slugify(v.name)}.png`), v.screenshotBuffer);
    }
  }
  await writeFile(
    join(compDir, 'README.md'),
    renderReadme(comp, stats, variants, level),
    'utf-8',
  );
}

// ---- main ----------------------------------------------------------------

async function main() {
  if (!(await fileExists(MANIFEST_PATH))) {
    console.error(`[components] FATAL: manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }
  if (!(await fileExists(BYPASS_PATH))) {
    console.error(`[components] FATAL: bypass cookies not found at ${BYPASS_PATH}`);
    process.exit(1);
  }

  const manifest = await loadJSON(MANIFEST_PATH);
  const bypassStorageState = await loadJSON(BYPASS_PATH);
  log(`Loaded manifest: ${manifest.atoms?.length || 0} atoms, ${manifest.molecules?.length || 0} molecules, ${manifest.organisms?.length || 0} organisms`);

  await ensureDir(OUT_DIR);
  await ensureDir(join(OUT_DIR, 'atoms'));
  await ensureDir(join(OUT_DIR, 'molecules'));
  await ensureDir(join(OUT_DIR, 'organisms'));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: VIEWPORTS.width, height: VIEWPORTS.height },
    deviceScaleFactor: VIEWPORTS.deviceScaleFactor,
    storageState: BYPASS_PATH,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const results = { atoms: [], molecules: [], organisms: [] };
  const levels = [
    ['atom', manifest.atoms || [], 'atoms'],
    ['molecule', manifest.molecules || [], 'molecules'],
    ['organism', manifest.organisms || [], 'organisms'],
  ];

  for (const [level, list] of levels) {
    for (const comp of list) {
      log(`Extracting ${level} "${comp.name}" (${comp.variants.length} variants)`);
      const res = await extractComponent(context, page, comp, manifest.pages, PAGES_DIR, bypassStorageState);
      await writeComponent(OUT_DIR, level, res.component, res.stats, res.variants);
      results[`${level}s`].push({
        name: comp.name,
        stats: res.stats,
        variants: res.variants.map((v) => ({ name: v.name, ok: v.ok, reason: v.reason })),
      });
    }
  }

  await browser.close();

  // ---- level indexes ----------------------------------------------------
  await writeLevelIndex(OUT_DIR, 'atoms', results.atoms, manifest.atoms || []);
  await writeLevelIndex(OUT_DIR, 'molecules', results.molecules, manifest.molecules || []);
  await writeLevelIndex(OUT_DIR, 'organisms', results.organisms, manifest.organisms || []);
  await writeTopIndex(OUT_DIR, manifest, results);

  // ---- report.json ------------------------------------------------------
  await writeFile(
    join(OUT_DIR, 'extraction-report.json'),
    JSON.stringify({ site: manifest.site, source: manifest.source, generatedAt: new Date().toISOString(), results }, null, 2),
    'utf-8',
  );
  const total = results.atoms.length + results.molecules.length + results.organisms.length;
  const ok = [...results.atoms, ...results.molecules, ...results.organisms].flatMap((c) => c.variants).filter((v) => v.ok).length;
  const totalVariants = [...results.atoms, ...results.molecules, ...results.organisms].reduce((sum, c) => sum + c.variants.length, 0);
  log(`Done. Components: ${total}, variants: ${ok}/${totalVariants} extracted successfully.`);
}

async function writeLevelIndex(outDir, level, results, declared) {
  const lines = [];
  const title = level[0].toUpperCase() + level.slice(1);
  lines.push(`# ${title}`);
  lines.push('');
  const description = {
    atoms: 'Single-purpose elements that cannot be broken down further. Each atom has a folder with real DOM evidence, computed CSS, and per-variant screenshots from the live site.',
    molecules: 'Small combinations of atoms with a single intent. Each molecule shows the composition captured from the live DOM.',
    organisms: 'Standalone sections of the interface. Each organism maps 1:1 to an EDS block.',
  }[level];
  lines.push(description);
  lines.push('');
  lines.push(`Total: ${results.length} ${level}.`);
  lines.push('');
  lines.push('| Component | Instances | Pages | Variants (extracted/total) | Regulatory |');
  lines.push('|-----------|-----------|-------|----------------------------|------------|');
  for (const comp of declared) {
    const r = results.find((x) => x.name === comp.name);
    const ok = r ? r.variants.filter((v) => v.ok).length : 0;
    const total = comp.variants.length;
    const instances = r?.stats?.total ?? 0;
    const pages = r?.stats?.pages ?? 0;
    lines.push(`| [\`${comp.name}\`](./${comp.name}/) | ${instances} | ${pages} | ${ok}/${total} | ${comp.regulatory ? 'yes' : '—'} |`);
  }
  lines.push('');
  lines.push('Each component folder contains:');
  lines.push('- `README.md` — API description, observed variants, EDS mapping.');
  lines.push('- `anatomy.html` — outer HTML captured from the live DOM.');
  lines.push('- `computed.css` — per-variant `getComputedStyle()` snapshot.');
  lines.push('- `stats.json` — occurrence count and page spread.');
  lines.push('- `evidence/` — per-variant screenshots.');
  await writeFile(join(outDir, level, 'README.md'), lines.join('\n'), 'utf-8');
}

async function writeTopIndex(outDir, manifest, results) {
  const total = results.atoms.length + results.molecules.length + results.organisms.length;
  const okVariants = [...results.atoms, ...results.molecules, ...results.organisms]
    .flatMap((c) => c.variants)
    .filter((v) => v.ok).length;
  const totalVariants = [...results.atoms, ...results.molecules, ...results.organisms]
    .reduce((sum, c) => sum + c.variants.length, 0);

  const lines = [
    `# ${manifest.site} — Forensic Component Inventory`,
    '',
    `Source: [${manifest.source}](${manifest.source})`,
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- **${results.atoms.length}** atoms`,
    `- **${results.molecules.length}** molecules`,
    `- **${results.organisms.length}** organisms`,
    `- **${total}** components total, **${okVariants}/${totalVariants}** variants extracted with live-DOM evidence`,
    '',
    '## How this was built',
    '',
    '1. **DOM survey** — every class/tag pattern on `migration-work/pages/*/cleaned.html` was catalogued and ranked by occurrence + page spread.',
    '2. **Manifest authoring** — `migration-work/component-manifest.json` placed each pattern in its atomic level with a DOM selector and sample page.',
    '3. **Playwright extraction** — the script loaded the bypass `storageState`, navigated to each sample page, located the first live instance, and captured:',
    '   - outer HTML as-hydrated (`anatomy.html`)',
    '   - `getComputedStyle()` snapshot (`computed.css`)',
    '   - element screenshot (`evidence/*.png`)',
    '   - page spread stats (`stats.json`)',
    '4. **Indexes** — this file, plus per-level READMEs, link to every component folder.',
    '',
    '## Contents',
    '',
    `- [Atoms](./atoms/) — ${results.atoms.length} components`,
    `- [Molecules](./molecules/) — ${results.molecules.length} components`,
    `- [Organisms](./organisms/) — ${results.organisms.length} components`,
    '',
    '## Source-of-truth discipline',
    '',
    'Everything in this tree reflects the **current live site, un-normalised**. The',
    'computed-style snapshots still carry the raw (often duplicated) colour / type /',
    'spacing values — matching `01-design-system-audit.md`. Normalisation (token',
    'consolidation, contrast fixes, scale rationalisation) happens in the next',
    'skill (`migration-design-system`), whose audits cite these files as evidence.',
    '',
    '## Caveats',
    '',
    '- Hidden/regulatory patterns (age gate, location selector) are captured by',
    '  temporarily clearing the bypass cookie before navigation — see `forceVisible`',
    '  in the manifest.',
    '- Selectors are live heuristics. Occasionally a variant screenshot can be empty',
    '  because the element sits below the fold and can\'t be reliably scrolled into',
    '  view on that page. When that happens, `stats.json.variants[].reason` records',
    '  the failure — rerun with a different `samplePage` to fix.',
    '- Bot-detection (Imperva) will throttle rapid requests. The script throttles',
    '  at 1.5 s per variant — if you see `navigation-failed` for a batch, rerun',
    '  later or increase the delay.',
    '',
  ];
  await writeFile(join(outDir, 'README.md'), lines.join('\n'), 'utf-8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
