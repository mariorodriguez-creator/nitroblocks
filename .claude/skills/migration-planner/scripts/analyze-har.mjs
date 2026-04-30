#!/usr/bin/env node
/**
 * Third-party origin inventory from HAR files.
 *
 * Phase 1e of migration-planner catalogs analytics / chat / search /
 * auth / ecommerce / consent / personalization / media / social / maps
 * integrations. Today that inventory is speculative — the planner reads
 * designlang's stack-intel.json (often <200 bytes) and prose-matches.
 *
 * HAR files from scrape-webpage capture what the browser actually
 * requested. Grouping requests by origin and classifying by a small rule
 * table produces a concrete, evidence-based inventory.
 *
 * Usage:
 *   node analyze-har.mjs \
 *     --pages-dir  ./migration-work/pages \
 *     --output-dir ./migration-work/verification
 *
 * Looks for `network.har` inside each subdirectory of --pages-dir.
 * Outputs an aggregated third-party inventory keyed by origin, with
 * category, per-template occurrence, and request counts.
 */

import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}

const PAGES_DIR = getFlag('--pages-dir') || './migration-work/pages';
const OUTPUT_DIR = getFlag('--output-dir') || './migration-work/verification';
const PRIMARY_HOST = getFlag('--primary-host'); // optional override

// Origin -> category rules. Order matters: the first match wins.
// Keep conservative — false positives hurt more than false negatives,
// because downstream skills will use this for architectural decisions.
const ORIGIN_RULES = [
  // Analytics / tag management
  { re: /(^|\.)google-analytics\.com$/i, category: 'analytics', vendor: 'Google Analytics' },
  { re: /(^|\.)googletagmanager\.com$/i, category: 'analytics', vendor: 'Google Tag Manager' },
  { re: /(^|\.)analytics\.google\.com$/i, category: 'analytics', vendor: 'Google Analytics' },
  { re: /(^|\.)doubleclick\.net$/i, category: 'analytics', vendor: 'Google DoubleClick' },
  { re: /(^|\.)facebook\.com$/i, category: 'analytics', vendor: 'Meta Pixel' },
  { re: /(^|\.)connect\.facebook\.net$/i, category: 'analytics', vendor: 'Meta Pixel' },
  { re: /(^|\.)omtrdc\.net$/i, category: 'analytics', vendor: 'Adobe Analytics' },
  { re: /(^|\.)demdex\.net$/i, category: 'analytics', vendor: 'Adobe Audience Manager' },
  { re: /(^|\.)everesttech\.net$/i, category: 'analytics', vendor: 'Adobe Advertising Cloud' },
  { re: /(^|\.)adobedtm\.com$/i, category: 'analytics', vendor: 'Adobe DTM/Launch' },
  { re: /(^|\.)assets\.adobedtm\.com$/i, category: 'analytics', vendor: 'Adobe Launch' },
  { re: /(^|\.)hotjar\.com$/i, category: 'analytics', vendor: 'Hotjar' },
  { re: /(^|\.)segment\.(com|io)$/i, category: 'analytics', vendor: 'Segment' },
  { re: /(^|\.)mixpanel\.com$/i, category: 'analytics', vendor: 'Mixpanel' },
  { re: /(^|\.)amplitude\.com$/i, category: 'analytics', vendor: 'Amplitude' },
  { re: /(^|\.)contentsquare\.(net|com)$/i, category: 'analytics', vendor: 'ContentSquare' },

  // Consent management
  { re: /(^|\.)onetrust\.com$/i, category: 'consent', vendor: 'OneTrust' },
  { re: /(^|\.)cookielaw\.org$/i, category: 'consent', vendor: 'OneTrust' },
  { re: /(^|\.)cookiebot\.com$/i, category: 'consent', vendor: 'Cookiebot' },
  { re: /(^|\.)usercentrics\.eu$/i, category: 'consent', vendor: 'Usercentrics' },
  { re: /(^|\.)iubenda\.com$/i, category: 'consent', vendor: 'Iubenda' },
  { re: /(^|\.)termly\.io$/i, category: 'consent', vendor: 'Termly' },

  // Chat / support
  { re: /(^|\.)salesforceliveagent\.com$/i, category: 'chat', vendor: 'Salesforce Live Agent' },
  { re: /(^|\.)force\.com$/i, category: 'chat', vendor: 'Salesforce Chat' },
  { re: /(^|\.)intercom\.(com|io)$/i, category: 'chat', vendor: 'Intercom' },
  { re: /(^|\.)intercomcdn\.com$/i, category: 'chat', vendor: 'Intercom' },
  { re: /(^|\.)zendesk\.com$/i, category: 'chat', vendor: 'Zendesk' },
  { re: /(^|\.)zopim\.com$/i, category: 'chat', vendor: 'Zendesk Chat' },
  { re: /(^|\.)drift\.com$/i, category: 'chat', vendor: 'Drift' },
  { re: /(^|\.)livechatinc\.com$/i, category: 'chat', vendor: 'LiveChat' },
  { re: /(^|\.)tawk\.to$/i, category: 'chat', vendor: 'Tawk.to' },

  // Survey / feedback
  { re: /(^|\.)qualtrics\.com$/i, category: 'survey', vendor: 'Qualtrics' },
  { re: /(^|\.)surveymonkey\.com$/i, category: 'survey', vendor: 'SurveyMonkey' },

  // Forms / CRM
  { re: /(^|\.)hubspot\.com$/i, category: 'crm', vendor: 'HubSpot' },
  { re: /(^|\.)marketo\.com$/i, category: 'crm', vendor: 'Marketo' },
  { re: /(^|\.)salesforce\.com$/i, category: 'crm', vendor: 'Salesforce' },
  { re: /(^|\.)pardot\.com$/i, category: 'crm', vendor: 'Pardot' },

  // Search
  { re: /(^|\.)algolia(net|ia)\.(net|com)$/i, category: 'search', vendor: 'Algolia' },
  { re: /(^|\.)coveo\.com$/i, category: 'search', vendor: 'Coveo' },
  { re: /(^|\.)klevu\.com$/i, category: 'search', vendor: 'Klevu' },
  { re: /(^|\.)searchspring\.(net|com)$/i, category: 'search', vendor: 'Searchspring' },

  // A/B testing / personalization
  { re: /(^|\.)optimizely\.com$/i, category: 'experimentation', vendor: 'Optimizely' },
  { re: /(^|\.)vwo\.com$/i, category: 'experimentation', vendor: 'VWO' },
  { re: /(^|\.)launchdarkly\.com$/i, category: 'experimentation', vendor: 'LaunchDarkly' },
  { re: /(^|\.)split\.io$/i, category: 'experimentation', vendor: 'Split.io' },
  { re: /(^|\.)mutinyhq\.(io|com)$/i, category: 'experimentation', vendor: 'Mutiny' },

  // Media
  { re: /(^|\.)youtube\.com$/i, category: 'media', vendor: 'YouTube' },
  { re: /(^|\.)youtube-nocookie\.com$/i, category: 'media', vendor: 'YouTube' },
  { re: /(^|\.)ytimg\.com$/i, category: 'media', vendor: 'YouTube' },
  { re: /(^|\.)vimeo\.com$/i, category: 'media', vendor: 'Vimeo' },
  { re: /(^|\.)wistia\.(com|net)$/i, category: 'media', vendor: 'Wistia' },
  { re: /(^|\.)brightcove\.com$/i, category: 'media', vendor: 'Brightcove' },
  { re: /(^|\.)jwplayer\.com$/i, category: 'media', vendor: 'JW Player' },
  { re: /(^|\.)cloudinary\.com$/i, category: 'media-cdn', vendor: 'Cloudinary' },
  { re: /(^|\.)imgix\.net$/i, category: 'media-cdn', vendor: 'imgix' },

  // Maps / geo
  { re: /(^|\.)maps\.googleapis\.com$/i, category: 'maps', vendor: 'Google Maps' },
  { re: /(^|\.)maps\.google\.com$/i, category: 'maps', vendor: 'Google Maps' },
  { re: /(^|\.)mapbox\.com$/i, category: 'maps', vendor: 'Mapbox' },

  // Social
  { re: /(^|\.)twitter\.com$/i, category: 'social', vendor: 'Twitter/X' },
  { re: /(^|\.)t\.co$/i, category: 'social', vendor: 'Twitter/X' },
  { re: /(^|\.)instagram\.com$/i, category: 'social', vendor: 'Instagram' },
  { re: /(^|\.)linkedin\.com$/i, category: 'social', vendor: 'LinkedIn' },
  { re: /(^|\.)ads\.linkedin\.com$/i, category: 'analytics', vendor: 'LinkedIn Insight' },
  { re: /(^|\.)tiktok\.com$/i, category: 'social', vendor: 'TikTok' },
  { re: /(^|\.)analytics\.tiktok\.com$/i, category: 'analytics', vendor: 'TikTok Pixel' },

  // Fonts
  { re: /(^|\.)fonts\.googleapis\.com$/i, category: 'font-service', vendor: 'Google Fonts' },
  { re: /(^|\.)fonts\.gstatic\.com$/i, category: 'font-service', vendor: 'Google Fonts' },
  { re: /(^|\.)use\.typekit\.net$/i, category: 'font-service', vendor: 'Adobe Fonts (Typekit)' },
  { re: /(^|\.)typekit\.net$/i, category: 'font-service', vendor: 'Adobe Fonts (Typekit)' },

  // reCAPTCHA / anti-bot
  { re: /(^|\.)gstatic\.com$/i, category: 'google-shared', vendor: 'Google Shared Assets' },
  { re: /(^|\.)recaptcha\.net$/i, category: 'anti-bot', vendor: 'reCAPTCHA' },

  // Generic CDNs (not an integration but still relevant)
  { re: /(^|\.)cloudfront\.net$/i, category: 'cdn', vendor: 'AWS CloudFront' },
  { re: /(^|\.)akamaized\.net$/i, category: 'cdn', vendor: 'Akamai' },
  { re: /(^|\.)fastly\.net$/i, category: 'cdn', vendor: 'Fastly' },
  { re: /(^|\.)jsdelivr\.net$/i, category: 'cdn', vendor: 'jsDelivr' },
  { re: /(^|\.)unpkg\.com$/i, category: 'cdn', vendor: 'unpkg' },
];

function classifyOrigin(hostname) {
  for (const rule of ORIGIN_RULES) {
    if (rule.re.test(hostname)) return { category: rule.category, vendor: rule.vendor };
  }
  return { category: 'unknown', vendor: null };
}

function registrableDomain(hostname) {
  // Crude but good enough for grouping: take last two labels for most TLDs,
  // three for known multi-label TLDs (.co.uk, .com.au, etc.).
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  const last = parts.slice(-2).join('.');
  const twoPart = /\b(co|com|ac|gov|edu|net|org)\.[a-z]{2,3}$/i;
  if (twoPart.test(last)) {
    return parts.slice(-3).join('.');
  }
  return last;
}

async function collectHarFiles() {
  const har = [];
  let entries = [];
  try {
    entries = await readdir(PAGES_DIR, { withFileTypes: true });
  } catch (err) {
    process.stderr.write(`[har] Cannot read --pages-dir ${PAGES_DIR}: ${err.message}\n`);
    return har;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const p = resolve(PAGES_DIR, entry.name, 'network.har');
    try {
      await stat(p);
      har.push({ slug: entry.name, path: p });
    } catch {
      // no har, skip
    }
  }
  return har;
}

function analyzeHar(harJson, primaryHost) {
  // HAR 1.2 schema: log.entries[].request.url
  const entries = harJson?.log?.entries || [];
  const byOrigin = new Map();
  for (const e of entries) {
    const urlStr = e?.request?.url;
    if (!urlStr) continue;
    let host;
    try {
      host = new URL(urlStr).hostname.toLowerCase();
    } catch {
      continue;
    }
    if (!host) continue;
    if (primaryHost && (host === primaryHost || host.endsWith(`.${primaryHost}`))) continue;
    const rec = byOrigin.get(host) || { host, count: 0, samples: [] };
    rec.count += 1;
    if (rec.samples.length < 3) rec.samples.push(urlStr);
    byOrigin.set(host, rec);
  }
  return [...byOrigin.values()];
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const harFiles = await collectHarFiles();
  if (harFiles.length === 0) {
    process.stderr.write('[har] No HAR files found. Did Phase F capture network traces?\n');
    const empty = { pages_analyzed: 0, origins: [], categories: {} };
    await writeFile(resolve(OUTPUT_DIR, 'third-party-inventory.json'), JSON.stringify(empty, null, 2));
    process.stdout.write(JSON.stringify(empty, null, 2) + '\n');
    return;
  }
  process.stderr.write(`[har] Analyzing ${harFiles.length} HAR file(s)\n`);

  // Origin aggregation across all pages
  const siteOrigins = new Map();
  const perPage = [];

  for (const { slug, path } of harFiles) {
    let harJson = null;
    try {
      const raw = await readFile(path, 'utf-8');
      harJson = JSON.parse(raw);
    } catch (err) {
      process.stderr.write(`  [${slug}] HAR read failed: ${err.message}\n`);
      continue;
    }
    const host = PRIMARY_HOST || harJson?.log?.pages?.[0]?.title || null;
    const originsForPage = analyzeHar(harJson, host && new URL(host).hostname ? new URL(host).hostname : host);
    perPage.push({ slug, origin_count: originsForPage.length });
    process.stderr.write(`  [${slug}] ${originsForPage.length} third-party origins\n`);

    for (const { host: hostName, count, samples } of originsForPage) {
      if (!siteOrigins.has(hostName)) {
        const { category, vendor } = classifyOrigin(hostName);
        siteOrigins.set(hostName, {
          host: hostName,
          registrable_domain: registrableDomain(hostName),
          category,
          vendor,
          total_requests: 0,
          pages: new Set(),
          samples: [],
        });
      }
      const rec = siteOrigins.get(hostName);
      rec.total_requests += count;
      rec.pages.add(slug);
      for (const s of samples) {
        if (rec.samples.length < 5 && !rec.samples.includes(s)) rec.samples.push(s);
      }
    }
  }

  const origins = [...siteOrigins.values()]
    .map((o) => ({ ...o, pages: [...o.pages] }))
    .sort((a, b) => b.total_requests - a.total_requests);

  const categories = {};
  for (const o of origins) {
    const key = o.category;
    if (!categories[key]) categories[key] = { count: 0, vendors: new Set(), origins: [] };
    categories[key].count += 1;
    if (o.vendor) categories[key].vendors.add(o.vendor);
    categories[key].origins.push(o.host);
  }
  // Convert Set to array
  for (const v of Object.values(categories)) {
    v.vendors = [...v.vendors];
  }

  const result = {
    pages_analyzed: perPage.length,
    unique_origins: origins.length,
    origins,
    categories,
    per_page: perPage,
  };

  const jsonPath = resolve(OUTPUT_DIR, 'third-party-inventory.json');
  await writeFile(jsonPath, JSON.stringify(result, null, 2));

  // Markdown
  const md = [];
  md.push('# Third-Party Inventory (from HAR)');
  md.push('');
  md.push(`Analyzed ${perPage.length} template(s); ${origins.length} unique third-party origins.`);
  md.push('');
  md.push('## By category');
  md.push('');
  md.push('| Category | Origins | Vendors |');
  md.push('|---|---|---|');
  const catOrder = Object.keys(categories).sort((a, b) => {
    if (a === 'unknown') return 1;
    if (b === 'unknown') return -1;
    return categories[b].count - categories[a].count;
  });
  for (const cat of catOrder) {
    const c = categories[cat];
    md.push(`| ${cat} | ${c.count} | ${c.vendors.join(', ') || '—'} |`);
  }
  md.push('');
  md.push('## All origins (top 50)');
  md.push('');
  md.push('| Origin | Category | Vendor | Requests | Pages |');
  md.push('|---|---|---|---|---|');
  for (const o of origins.slice(0, 50)) {
    md.push(`| ${o.host} | ${o.category} | ${o.vendor || '—'} | ${o.total_requests} | ${o.pages.length} |`);
  }
  md.push('');
  if (origins.length > 50) {
    md.push(`_…and ${origins.length - 50} more. See third-party-inventory.json for full list._`);
    md.push('');
  }

  const mdPath = resolve(OUTPUT_DIR, 'third-party-inventory.md');
  await writeFile(mdPath, md.join('\n'));

  process.stderr.write(`[har] Done. ${origins.length} origins across ${Object.keys(categories).length} categories\n`);
  process.stderr.write(`[har] Wrote ${jsonPath}\n`);
  process.stderr.write(`[har] Wrote ${mdPath}\n`);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

main().catch((err) => {
  console.error('[har] Fatal:', err.message);
  console.error(err.stack);
  process.exit(0);
});
