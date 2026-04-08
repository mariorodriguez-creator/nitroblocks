#!/usr/bin/env node

/*
 * Sitemap Harvester
 *
 * Fetches XML sitemaps (including sitemap indexes), extracts all URLs,
 * clusters them by template pattern, and selects representative samples.
 *
 * Usage:
 *   node harvest-sitemap.js "https://example.com/sitemap.xml" --output ./out --samples 3
 *   node harvest-sitemap.js "https://example.com" --output ./out
 *
 * Requirements: Node.js 18+ (native fetch)
 * Dependencies: None
 */

const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');
const { gunzipSync } = require('zlib');

const DEFAULT_SAMPLES = 3;
const MAX_SITEMAP_DEPTH = 10;
const FETCH_TIMEOUT_MS = 30000;
const CONCURRENT_FETCHES = 5;

// Common locale/region path prefixes:
// 2-letter (en, fr), 2-letter_2-letter (ca_fr, hk_zh), region names (africa, mena_en, cis_ru)
const LOCALE_PATTERN = /^(?:[a-z]{2,6}(?:[_-][a-z]{2,4})?)$/i;

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

async function fetchBytes(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AEM-EDS-Sitemap-Harvester/1.0', Accept: '*/*' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return buf;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchXml(url) {
  const raw = await fetchBytes(url);
  if (url.endsWith('.gz') || raw[0] === 0x1f) {
    try {
      return gunzipSync(raw).toString('utf-8');
    } catch { /* not gzipped after all */ }
  }
  return raw.toString('utf-8');
}

// ---------------------------------------------------------------------------
// Sitemap parsing
// ---------------------------------------------------------------------------

function extractUrlEntries(xml) {
  const entries = [];
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  for (const block of blocks) {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim();
    if (!loc) continue;
    entries.push({
      url: loc.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      lastmod: block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1]?.trim() || null,
      changefreq: block.match(/<changefreq>([\s\S]*?)<\/changefreq>/)?.[1]?.trim() || null,
      priority: (() => {
        const p = block.match(/<priority>([\s\S]*?)<\/priority>/)?.[1]?.trim();
        return p ? parseFloat(p) : null;
      })(),
    });
  }
  return entries;
}

function extractChildSitemaps(xml) {
  const locs = [];
  const blocks = xml.match(/<sitemap>[\s\S]*?<\/sitemap>/g) || [];
  for (const block of blocks) {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim();
    if (loc) locs.push(loc.replace(/&amp;/g, '&'));
  }
  return locs;
}

/**
 * Recursively fetch all URLs from a sitemap or sitemap index.
 * Processes child sitemaps in batches for speed.
 */
async function harvestSitemap(url, depth = 0) {
  if (depth > MAX_SITEMAP_DEPTH) {
    console.error(`  ⤷ Max depth (${MAX_SITEMAP_DEPTH}) reached, skipping: ${url}`);
    return [];
  }

  process.stdout.write(`  Fetching: ${url} ... `);
  let xml;
  try {
    xml = await fetchXml(url);
  } catch (err) {
    console.log(`FAILED (${err.message})`);
    return [];
  }

  if (xml.includes('<sitemapindex')) {
    const children = extractChildSitemaps(xml);
    console.log(`index → ${children.length} child sitemaps`);

    const allUrls = [];
    for (let i = 0; i < children.length; i += CONCURRENT_FETCHES) {
      const batch = children.slice(i, i + CONCURRENT_FETCHES);
      const results = await Promise.all(
        batch.map((child) => harvestSitemap(child, depth + 1)),
      );
      for (const r of results) {
        for (const entry of r) allUrls.push(entry);
      }
    }
    return allUrls;
  }

  const entries = extractUrlEntries(xml);
  console.log(`${entries.length} URLs`);
  return entries;
}

// ---------------------------------------------------------------------------
// robots.txt fallback
// ---------------------------------------------------------------------------

async function sitemapUrlsFromRobots(baseOrigin) {
  try {
    const txt = (await fetchBytes(`${baseOrigin}/robots.txt`)).toString('utf-8');
    const urls = [];
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*Sitemap:\s*(\S+)/i);
      if (m) urls.push(m[1]);
    }
    return urls;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Clustering
// ---------------------------------------------------------------------------

function pathSegments(url) {
  try {
    return new URL(url).pathname.split('/').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Detect if a site uses locale prefixes (e.g. /en/, /fr/, /de/).
 * Returns the set of detected locales, or an empty set if none found.
 */
function detectLocales(urls) {
  const firstSegCounts = new Map();
  for (const entry of urls) {
    const segs = pathSegments(entry.url);
    if (segs.length > 0) {
      const first = segs[0].toLowerCase();
      firstSegCounts.set(first, (firstSegCounts.get(first) || 0) + 1);
    }
  }
  const locales = new Set();
  for (const [seg, count] of firstSegCounts) {
    if (LOCALE_PATTERN.test(seg) && count >= 3) locales.add(seg);
  }
  // Real i18n sites have many locale prefixes (5+). A threshold of 2 would
  // false-positive on sites where /docs and /blog match the pattern.
  return locales.size >= 5 ? locales : new Set();
}

/**
 * Cluster URLs by detecting template patterns in their paths.
 *
 * Algorithm:
 * 1. Group URLs by path depth (number of segments).
 * 2. Within each depth group, count distinct values per segment position.
 * 3. Positions with high cardinality (many distinct values) are "variable" → replaced with *.
 * 4. The resulting string is the template signature for grouping.
 *
 * When collapseLocales is true, locale prefixes (e.g. /en, /fr, /de) in the
 * first path segment are normalized to {locale}, grouping all locale variants
 * of the same template together. This dramatically reduces cluster count for
 * internationalized sites.
 */
function clusterUrls(urls, collapseLocales = false) {
  const locales = collapseLocales ? detectLocales(urls) : new Set();
  if (locales.size) {
    console.log(`  Detected ${locales.size} locale prefixes: ${[...locales].sort().join(', ')}`);
  }

  const byDepth = new Map();
  for (const entry of urls) {
    const segs = pathSegments(entry.url);
    // Normalize locale prefix
    if (locales.size && segs.length > 0 && locales.has(segs[0].toLowerCase())) {
      segs[0] = '{locale}';
    }
    const d = segs.length;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d).push({ entry, segs });
  }

  const clusters = new Map();

  for (const [depth, items] of byDepth) {
    if (depth === 0) {
      clusters.set('/', { pattern: '/', type: 'unique', urls: items.map((i) => i.entry) });
      continue;
    }

    const positionValues = Array.from({ length: depth }, () => new Set());
    for (const { segs } of items) {
      segs.forEach((s, i) => positionValues[i].add(s));
    }

    const variableThreshold = Math.max(3, Math.ceil(items.length * 0.1));

    const groups = new Map();
    for (const { entry, segs } of items) {
      const sig = segs
        .map((s, i) => (positionValues[i].size > variableThreshold ? '*' : s))
        .join('/');
      const key = `/${sig}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    }

    for (const [pattern, entries] of groups) {
      const type = entries.length === 1
        ? 'unique'
        : entries.length <= 5
          ? 'small-group'
          : 'template';
      clusters.set(pattern, { pattern, type, urls: entries });
    }
  }

  return { clusters, locales };
}

// ---------------------------------------------------------------------------
// Sampling
// ---------------------------------------------------------------------------

function selectSamples(cluster, n) {
  const { urls: entries } = cluster;
  if (entries.length <= n) {
    return entries.map((e) => ({ ...e, sampleReason: 'all-included' }));
  }

  const samples = [];
  const used = new Set();

  function add(entry, reason) {
    if (used.has(entry.url) || samples.length >= n) return;
    samples.push({ ...entry, sampleReason: reason });
    used.add(entry.url);
  }

  // Oldest and newest by lastmod
  const dated = entries.filter((e) => e.lastmod).sort((a, b) => a.lastmod.localeCompare(b.lastmod));
  if (dated.length) {
    add(dated[0], 'oldest-by-lastmod');
    add(dated[dated.length - 1], 'newest-by-lastmod');
  }

  // Fill remaining with evenly spaced picks for path diversity
  const remaining = n - samples.length;
  if (remaining > 0) {
    const available = entries.filter((e) => !used.has(e.url));
    const step = Math.max(1, Math.floor(available.length / (remaining + 1)));
    for (let i = 1; i <= remaining && (i * step - 1) < available.length; i++) {
      add(available[i * step - 1], 'path-diversity');
    }
  }

  // Backfill if still short
  for (const e of entries) {
    if (samples.length >= n) break;
    add(e, 'backfill');
  }

  return samples;
}

// ---------------------------------------------------------------------------
// Output generation
// ---------------------------------------------------------------------------

const ALL_URLS_THRESHOLD = 500;

function buildManifest(source, allUrls, clusters, samplesPerCluster, locales) {
  const clusterData = [];
  let totalSamples = 0;

  for (const [, cluster] of clusters) {
    const samples = selectSamples(cluster, samplesPerCluster);
    totalSamples += samples.length;
    const entry = {
      pattern: cluster.pattern,
      type: cluster.type,
      totalUrls: cluster.urls.length,
      samples,
    };
    if (cluster.urls.length <= ALL_URLS_THRESHOLD) {
      entry.allUrls = cluster.urls.map((e) => e.url);
    } else {
      entry.allUrlsOmitted = true;
      entry.allUrlsPreview = cluster.urls.slice(0, 10).map((e) => e.url);
    }
    clusterData.push(entry);
  }

  clusterData.sort((a, b) => {
    if (a.type === 'unique' && b.type !== 'unique') return -1;
    if (a.type !== 'unique' && b.type === 'unique') return 1;
    return b.totalUrls - a.totalUrls;
  });

  const result = {
    source,
    harvestedAt: new Date().toISOString(),
    stats: { totalUrls: allUrls.length, totalClusters: clusters.size, totalSamples, samplesPerCluster },
    clusters: clusterData,
  };
  if (locales.size) {
    result.locales = [...locales].sort();
  }
  return result;
}

function buildSummary(manifest) {
  const L = [];
  L.push('# Sitemap Harvest Summary');
  L.push('');
  L.push(`**Source:** ${manifest.source}`);
  L.push(`**Harvested:** ${manifest.harvestedAt}`);
  L.push(`**Total URLs:** ${manifest.stats.totalUrls.toLocaleString()}`);
  L.push(`**Clusters:** ${manifest.stats.totalClusters}`);
  L.push(`**Selected samples:** ${manifest.stats.totalSamples}`);
  L.push(`**Samples per cluster:** ${manifest.stats.samplesPerCluster}`);
  if (manifest.locales) {
    L.push(`**Locales detected (${manifest.locales.length}):** ${manifest.locales.join(', ')}`);
  }
  L.push('');
  L.push('---');
  L.push('');

  L.push('## Cluster Overview');
  L.push('');
  L.push('| # | Pattern | Type | URLs | Samples |');
  L.push('|---|---------|------|------|---------|');
  manifest.clusters.forEach((c, i) => {
    L.push(`| ${i + 1} | \`${c.pattern}\` | ${c.type} | ${c.totalUrls.toLocaleString()} | ${c.samples.length} |`);
  });
  L.push('');
  L.push('---');
  L.push('');

  L.push('## Selected Samples');
  L.push('');
  for (const cluster of manifest.clusters) {
    L.push(`### \`${cluster.pattern}\` (${cluster.totalUrls.toLocaleString()} URLs)`);
    L.push('');
    for (const s of cluster.samples) {
      const meta = [s.sampleReason];
      if (s.lastmod) meta.push(`lastmod: ${s.lastmod}`);
      if (s.priority !== null) meta.push(`priority: ${s.priority}`);
      L.push(`- ${s.url}`);
      L.push(`  _${meta.join(' · ')}_`);
    }
    L.push('');
  }

  L.push('---');
  L.push('');
  L.push('## URL Distribution');
  L.push('');
  const sorted = [...manifest.clusters].sort((a, b) => b.totalUrls - a.totalUrls);
  const top = sorted.slice(0, 15);
  const maxCount = top[0]?.totalUrls || 1;
  const BAR_WIDTH = 40;
  for (const c of top) {
    const barLen = Math.max(1, Math.round((c.totalUrls / maxCount) * BAR_WIDTH));
    L.push(`\`${c.pattern.padEnd(35)}\` ${'█'.repeat(barLen)} ${c.totalUrls.toLocaleString()}`);
  }
  if (sorted.length > 15) {
    L.push(`_…and ${sorted.length - 15} more clusters_`);
  }
  L.push('');

  return L.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Sitemap Harvester — Discover, cluster, and sample URLs from XML sitemaps.

Usage:
  node harvest-sitemap.js <url> [options]

Arguments:
  <url>               Sitemap URL, or base domain (will try /sitemap.xml and robots.txt)

Options:
  --output <dir>      Output directory (default: ./sitemap-harvest)
  --samples <n>       Samples per cluster (default: ${DEFAULT_SAMPLES})
  --locale            Collapse locale prefixes (e.g. /en/, /fr/) into one cluster
  --help, -h          Show this help

Examples:
  node harvest-sitemap.js "https://example.com/sitemap.xml"
  node harvest-sitemap.js "https://example.com" --output .specify/migration --samples 3
  node harvest-sitemap.js "https://i18n-site.com" --locale --samples 2`);
    process.exit(0);
  }

  const inputUrl = args[0];
  let outputDir = './sitemap-harvest';
  let samplesPerCluster = DEFAULT_SAMPLES;
  let collapseLocales = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) outputDir = args[++i];
    else if (args[i] === '--samples' && args[i + 1]) samplesPerCluster = parseInt(args[++i], 10);
    else if (args[i] === '--locale') collapseLocales = true;
  }

  let origin;
  try {
    origin = new URL(inputUrl).origin;
  } catch {
    console.error(`Invalid URL: ${inputUrl}`);
    process.exit(1);
  }

  console.log('\n=== Sitemap Harvest ===\n');
  console.log(`Input:   ${inputUrl}`);
  console.log(`Output:  ${outputDir}`);
  console.log(`Samples: ${samplesPerCluster} per cluster\n`);

  // Determine sitemap URL(s) to fetch
  let sitemapUrls = [];
  const parsed = new URL(inputUrl);
  const looksLikeSitemap = /sitemap.*\.xml/i.test(parsed.pathname) || parsed.pathname.endsWith('.xml');

  if (looksLikeSitemap) {
    sitemapUrls = [inputUrl];
  } else {
    // Try /sitemap.xml first, then fall back to robots.txt
    console.log('No explicit sitemap path — probing...');
    const candidate = `${origin}/sitemap.xml`;
    try {
      await fetchXml(candidate);
      sitemapUrls = [candidate];
      console.log(`  Found sitemap at ${candidate}`);
    } catch {
      console.log(`  ${candidate} not found, checking robots.txt...`);
      sitemapUrls = await sitemapUrlsFromRobots(origin);
      if (sitemapUrls.length) {
        console.log(`  Found ${sitemapUrls.length} sitemap(s) in robots.txt`);
      } else {
        console.error('\nNo sitemap found. Provide a direct sitemap URL.');
        process.exit(1);
      }
    }
  }

  // Harvest
  console.log('\nHarvesting URLs...');
  const allUrls = [];
  for (const smUrl of sitemapUrls) {
    const urls = await harvestSitemap(smUrl);
    for (const entry of urls) allUrls.push(entry);
  }

  // Deduplicate by URL
  const seen = new Set();
  const unique = [];
  for (const entry of allUrls) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      unique.push(entry);
    }
  }

  console.log(`\nTotal URLs found: ${allUrls.length}`);
  if (allUrls.length !== unique.length) {
    console.log(`After dedup:      ${unique.length} (removed ${allUrls.length - unique.length} duplicates)`);
  }

  if (unique.length === 0) {
    console.error('\nNo URLs extracted. The sitemap may be empty or in an unsupported format.');
    process.exit(1);
  }

  // Cluster
  console.log('\nClustering by URL pattern...');
  const { clusters, locales } = clusterUrls(unique, collapseLocales);
  console.log(`Clusters: ${clusters.size}`);

  // Build outputs
  const manifest = buildManifest(sitemapUrls.join(', '), unique, clusters, samplesPerCluster, locales);
  const summary = buildSummary(manifest);

  // Write
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const manifestPath = join(outputDir, 'sitemap-manifest.json');
  const summaryPath = join(outputDir, 'sitemap-summary.md');
  const urlListPath = join(outputDir, 'all-urls.txt');

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  writeFileSync(summaryPath, summary);

  // Write full URL list as a plain text file (one URL per line) — safe for any size
  const urlStream = require('fs').createWriteStream(urlListPath);
  for (const entry of unique) urlStream.write(`${entry.url}\n`);
  urlStream.end();

  console.log(`\nOutputs written:`);
  console.log(`  ${manifestPath}`);
  console.log(`  ${summaryPath}`);
  console.log(`  ${urlListPath} (${unique.length.toLocaleString()} URLs)`);
  console.log(`\nSelected ${manifest.stats.totalSamples} samples across ${clusters.size} clusters.\n`);

  // Quick cluster breakdown
  console.log('Cluster breakdown:');
  for (const c of manifest.clusters) {
    const bar = '█'.repeat(Math.max(1, Math.round((c.totalUrls / unique.length) * 40)));
    console.log(`  ${c.pattern.padEnd(35)} ${String(c.totalUrls).padStart(6)} URLs → ${c.samples.length} samples  ${bar}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
