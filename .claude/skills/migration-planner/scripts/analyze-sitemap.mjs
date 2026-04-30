#!/usr/bin/env node
/**
 * Analyze a site's sitemap to determine crawl depth, page inventory,
 * and template classification for migration planning.
 *
 * - Fetches /sitemap.xml (and resolves sitemap indexes recursively)
 * - Checks robots.txt for additional Sitemap: directives
 * - Filters to the same locale as the input URL
 * - Computes max URL depth relative to the base path
 * - Classifies pages into template groups by URL pattern
 * - Picks one representative URL per template group
 * - Excludes obvious test/draft pages and shadow locales
 * - Records a reason per excluded URL for debuggability
 * - Dedupes near-duplicate templates with numeric suffixes
 *   (e.g. /pouches + /pouches1 + /pouches11 -> one template)
 *
 * Usage:
 *   node analyze-sitemap.mjs "https://www.zonnic.ca/ca/en"
 *
 * Outputs JSON to stdout.
 */

const INPUT_URL = process.argv[2];
if (!INPUT_URL) {
  console.error('Usage: node analyze-sitemap.mjs <url>');
  process.exit(1);
}

const MAX_DEPTH_CAP = 10;

// Test / draft / archive / preview patterns. Each entry is { re, reason }
// so the exclusion_reasons output explains why a URL was dropped.
const TEST_PAGE_PATTERNS = [
  { re: /\/test(?:[-_/]|\d*$)/i, reason: 'test-page' },
  { re: /\/prod-bucket-test/i, reason: 'test-bucket' },
  { re: /\/ip-test/i, reason: 'test-ip' },
  { re: /\/cprt\d+/i, reason: 'test-cprt' },
  { re: /\/superscript/i, reason: 'test-superscript' },
  { re: /\/donotindex/i, reason: 'donotindex' },
  { re: /\/archived?(?:-page)?(?:\/|$)/i, reason: 'archived' },
  { re: /-archive(?:d)?(?:\/|$)/i, reason: 'archived' },
  { re: /\/error-\d+$/i, reason: 'error-page' },
  { re: /\/_?preview(?:\/|$)/i, reason: 'preview' },
  { re: /\/_drafts?(?:\/|$)/i, reason: 'draft' },
  { re: /\/drafts?\//i, reason: 'draft' },
  { re: /\/sandbox(?:\/|$)/i, reason: 'sandbox' },
  { re: /\/demo(?:-|\/|$)/i, reason: 'demo' },
];

const parsed = new URL(INPUT_URL);
const ORIGIN = parsed.origin;
const BASE_PATH = parsed.pathname.replace(/\/$/, '');
const LOCALE_SEGMENT = BASE_PATH; // e.g. "/ca/en"

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'migration-planner/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractLocs(xml) {
  const locs = [];
  const re = /<loc>\s*(.*?)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1].trim());
  }
  return locs;
}

function isSitemapIndex(xml) {
  return /<sitemapindex[\s>]/i.test(xml);
}

/**
 * Recursively resolve a sitemap URL into a flat list of page URLs.
 * If the sitemap is an index, fetch each child sitemap that matches
 * the locale, then extract <loc> entries from those.
 */
async function resolveSitemap(sitemapUrl, depth = 0) {
  if (depth > 3) return [];
  const xml = await fetchText(sitemapUrl);
  if (!xml) return [];

  if (isSitemapIndex(xml)) {
    const childUrls = extractLocs(xml);
    const localeKey = LOCALE_SEGMENT.replace(/\//g, '-').replace(/^-/, '');
    const matching = childUrls.filter((u) => {
      const lower = u.toLowerCase();
      return lower.includes(localeKey) || lower.includes(LOCALE_SEGMENT);
    });
    const toFetch = matching.length > 0 ? matching : childUrls;
    const results = await Promise.all(
      toFetch.map((u) => resolveSitemap(u, depth + 1)),
    );
    return results.flat();
  }

  return extractLocs(xml);
}

async function discoverSitemapUrls() {
  const urls = new Set();

  const rootSitemap = `${ORIGIN}/sitemap.xml`;
  const fromRoot = await resolveSitemap(rootSitemap);
  fromRoot.forEach((u) => urls.add(u));

  const robotsTxt = await fetchText(`${ORIGIN}/robots.txt`);
  if (robotsTxt) {
    const sitemapLines = robotsTxt
      .split('\n')
      .filter((l) => /^sitemap:/i.test(l.trim()))
      .map((l) => l.replace(/^sitemap:\s*/i, '').trim());

    for (const smUrl of sitemapLines) {
      if (
        smUrl.includes(LOCALE_SEGMENT) ||
        smUrl.includes(LOCALE_SEGMENT.replace(/\//g, '-'))
      ) {
        const fromRobots = await resolveSitemap(smUrl);
        fromRobots.forEach((u) => urls.add(u));
      }
    }
  }

  return [...urls];
}

function pathOf(urlStr) {
  try {
    return new URL(urlStr).pathname;
  } catch {
    return '';
  }
}

function testPageReason(urlStr) {
  const p = pathOf(urlStr);
  for (const { re, reason } of TEST_PAGE_PATTERNS) {
    if (re.test(p)) return reason;
  }
  return null;
}

function isLocaleMatch(urlStr) {
  const p = pathOf(urlStr);
  if (!p) return false;
  // Accept the base path exactly or as a prefix followed by a slash or end.
  if (!LOCALE_SEGMENT) return true;
  if (p === LOCALE_SEGMENT) return true;
  return p.startsWith(`${LOCALE_SEGMENT}/`);
}

/**
 * Detect shadow locales like /ca/en1/ or /ca/en2/foo that are parallel
 * staging copies. Matches locale segment followed immediately by digits,
 * then either end-of-path or a slash.
 */
function isShadowLocale(urlStr) {
  const p = pathOf(urlStr);
  if (!p || !LOCALE_SEGMENT) return false;
  const escaped = LOCALE_SEGMENT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const shadowRe = new RegExp(`^${escaped}\\d+(?:/|$)`);
  return shadowRe.test(p);
}

function computeDepth(urlStr) {
  const p = pathOf(urlStr);
  if (!p) return 0;
  const relative = p.slice(BASE_PATH.length).replace(/^\//, '');
  if (!relative) return 0;
  return relative.split('/').filter(Boolean).length;
}

/**
 * Normalize a path segment for template grouping by stripping trailing
 * numeric suffixes. /pouches, /pouches1, /pouches11, /pouches111 all
 * become "pouches" — they are almost always staging duplicates.
 */
function stripNumericSuffix(segment) {
  return segment.replace(/\d+$/, '');
}

function classifyTemplate(urlStr) {
  const p = pathOf(urlStr);
  if (!p) return 'unknown';
  const relative = p.slice(BASE_PATH.length).replace(/^\//, '');
  if (!relative) return 'homepage';
  const firstSegment = relative.split('/')[0];
  if (!firstSegment) return 'homepage';
  const normalized = stripNumericSuffix(firstSegment.toLowerCase());
  return normalized || firstSegment.toLowerCase();
}

function pickRepresentative(urls) {
  // Prefer URLs without numeric suffixes (the canonical spelling)
  // then a URL with depth >= 2 (a real inner page, not just a root).
  const withoutSuffix = urls.filter((u) => {
    const p = pathOf(u);
    const segs = p.slice(BASE_PATH.length).replace(/^\//, '').split('/').filter(Boolean);
    return segs.length > 0 && !/\d+$/.test(segs[0]);
  });
  const pool = withoutSuffix.length > 0 ? withoutSuffix : urls;
  const withDepth = pool.filter((u) => computeDepth(u) >= 2);
  return withDepth[0] || pool[0] || urls[0];
}

async function main() {
  process.stderr.write(`[sitemap] Analyzing ${ORIGIN}${BASE_PATH}\n`);

  const allUrls = await discoverSitemapUrls();
  process.stderr.write(`[sitemap] Found ${allUrls.length} total URLs\n`);

  // Filter with per-URL exclusion reasons
  const exclusionReasons = {};
  const filtered = [];
  for (const u of allUrls) {
    if (!isLocaleMatch(u)) {
      exclusionReasons[u] = 'locale-mismatch';
      continue;
    }
    if (isShadowLocale(u)) {
      exclusionReasons[u] = 'shadow-locale';
      continue;
    }
    const testReason = testPageReason(u);
    if (testReason) {
      exclusionReasons[u] = testReason;
      continue;
    }
    filtered.push(u);
  }
  process.stderr.write(
    `[sitemap] After filtering: ${filtered.length} URLs (${Object.keys(exclusionReasons).length} excluded)\n`,
  );

  // Summarize exclusion reasons for quick debugging
  const exclusionSummary = {};
  for (const reason of Object.values(exclusionReasons)) {
    exclusionSummary[reason] = (exclusionSummary[reason] || 0) + 1;
  }

  // Compute depths
  const depths = filtered.map(computeDepth);
  const maxDepth = depths.length > 0 ? Math.max(...depths) : 0;
  const recommendedDepth = Math.min(Math.max(maxDepth, 1), MAX_DEPTH_CAP);

  // Classify into template groups (numeric-suffix normalized)
  const groups = {};
  for (const u of filtered) {
    const tpl = classifyTemplate(u);
    if (!groups[tpl]) groups[tpl] = { count: 0, urls: [] };
    groups[tpl].count++;
    groups[tpl].urls.push(u);
  }

  // Pick representative URL per group
  const templateGroups = {};
  const representativeUrls = [];
  for (const [name, data] of Object.entries(groups)) {
    const rep = pickRepresentative(data.urls);
    templateGroups[name] = {
      count: data.count,
      representative: rep,
      variants: data.urls.filter((u) => u !== rep),
    };
    representativeUrls.push(rep);
  }

  const result = {
    total_pages: allUrls.length,
    total_pages_filtered: filtered.length,
    max_depth: maxDepth,
    recommended_depth: recommendedDepth,
    base_path: BASE_PATH,
    template_groups: templateGroups,
    representative_urls: representativeUrls,
    all_urls: filtered,
    exclusion_summary: exclusionSummary,
    exclusion_reasons: exclusionReasons,
  };

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.stderr.write(
    `[sitemap] ${Object.keys(templateGroups).length} template groups, recommended depth: ${recommendedDepth}\n`,
  );
  if (Object.keys(exclusionSummary).length > 0) {
    const summaryLine = Object.entries(exclusionSummary)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    process.stderr.write(`[sitemap] Excluded by reason: ${summaryLine}\n`);
  }
}

main().catch((err) => {
  console.error('[sitemap] Fatal:', err.message);
  const fallback = {
    total_pages: 0,
    total_pages_filtered: 0,
    max_depth: 0,
    recommended_depth: 5,
    base_path: BASE_PATH,
    template_groups: {},
    representative_urls: [],
    all_urls: [],
    exclusion_summary: {},
    exclusion_reasons: {},
    error: err.message,
  };
  process.stdout.write(JSON.stringify(fallback, null, 2) + '\n');
  process.exit(0);
});
