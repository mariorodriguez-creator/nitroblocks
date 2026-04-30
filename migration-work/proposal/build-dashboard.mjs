#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TEMPLATE = path.join(ROOT, '..', '.claude', 'skills', 'migration-planner', 'resources', 'dashboard-template.html');
const OUT = path.join(ROOT, 'proposal', 'migration-proposal.html');
const SCREENSHOTS = path.join(ROOT, 'design-extract', 'screenshots');

const sitemap = JSON.parse(fs.readFileSync(path.join(ROOT, 'sitemap-result.json'), 'utf8'));
const grade = JSON.parse(fs.readFileSync(path.join(ROOT, 'design-extract', 'zonnic-ca-grade.json'), 'utf8'));
const a11y = JSON.parse(fs.readFileSync(path.join(ROOT, 'a11y', 'summary.json'), 'utf8'));
const verif = JSON.parse(fs.readFileSync(path.join(ROOT, 'verification', 'report.json'), 'utf8'));

const SITE_NAME = 'ZONNIC Canada';
const SOURCE_URL = 'https://www.zonnic.ca/ca/en';
const DATE = '2026-04-29';

// ---------------- KPIs ----------------
const PAGES = sitemap.total_pages_filtered; // 106
const TEMPLATES = Object.keys(sitemap.template_groups).length; // 25
const BLOCKS = 27; // 3 reuse + 4 adapt + 20 new
const INTEGRATIONS = 14; // vendor snippets to drop in (client-provided)
const WORK_ITEMS = 99;
const EFFORT_RANGE = '475–870h';
const WEEKS_RANGE = '8–11';
const GRADE_LETTER = grade.grade;
const GRADE_SCORE = grade.overall;

// ---------------- Design grade (high-to-low) ----------------
const gradeDims = [
  ['Border Radii', grade.scores.radiusConsistency],
  ['Accessibility', grade.scores.accessibility],
  ['Spacing System', grade.scores.spacingSystem],
  ['Color Discipline', grade.scores.colorDiscipline],
  ['Shadow Consistency', grade.scores.shadowConsistency],
  ['Tokenization', grade.scores.tokenization],
  ['Typography Consistency', grade.scores.typographyConsistency],
  ['CSS Health', grade.scores.cssHealth],
].sort((a, b) => b[1] - a[1]);

const gradeBarsHtml = gradeDims.map(([label, score]) => {
  const color = score < 50 ? 'red' : 'navy';
  return `        <div class="bar-row"><div class="bar-label">${label}</div><div class="bar-track"><div class="bar-fill ${color}" style="width:${score}%">${score}</div></div></div>`;
}).join('\n');

// ---------------- Normalization delta (planner flags; values are targets the DS phase will confirm) ----------------
const normDelta = [
  ['Colors (unique)', 27, 20, '26%'],
  ['Type sizes', 15, 7, '53%'],
  ['Font weights', 8, 4, '50%'],
  ['Font families', 5, 2, '60%'],
  ['Spacing values', 18, 14, '22%'],
  ['Shadows', 10, 3, '70%'],
  ['Border radii', 7, 4, '43%'],
  ['!important rules', 179, 0, '100%'],
  ['Unused CSS %', '92%', '< 5%', '—'],
];
const normDeltaHtml = normDelta.map(([a, s, n, r]) =>
  `          <tr><td>${a}</td><td class="num">${s}</td><td class="num">${n}</td><td class="num">${r}</td></tr>`).join('\n');

// ---------------- Template cards (grid) ----------------
// Map template key -> preferred slug (screenshot slug) and complexity + block list
const tplMeta = {
  'homepage':                     { slug: 'homepage', complexity: 'High', blocks: ['hero', 'masthead-card', 'blurb-card', 'cards (blog)', 'cta', 'announcement-bar', 'age-gate'] },
  'pouches':                      { slug: 'pouches-zonnic-mint-24-nicotine-pouches', complexity: 'High', blocks: ['product-hero', 'product-carousel', 'tabbed-carousel', 'faq', 'cta'] },
  'blog':                         { slug: 'blog-what-are-nicotine-pouches', complexity: 'Low', blocks: ['text', 'cards (blog)', 'cta'] },
  'testingblogarticletemplate':   { slug: 'testingblogarticletemplate', complexity: 'Low', blocks: ['text', 'cards (blog)'] },
  'why-zonnic':                   { slug: 'why-zonnic', complexity: 'Medium', blocks: ['masthead-card', 'blurb-card', 'tabbed-carousel', 'cta'] },
  'what-is-zonnic':               { slug: 'what-is-zonnic', complexity: 'Medium', blocks: ['masthead-card', 'blurb-card', 'product-carousel', 'cta'] },
  'store-locator':                { slug: 'store-locator', complexity: 'High', blocks: ['store-locator', 'text', 'cta'] },
  'sign-up':                      { slug: 'sign-up', complexity: 'Medium', blocks: ['signup-form', 'text (box)'] },
  'contact-us':                   { slug: 'contact-us-let-us-talk-testimonials', complexity: 'Medium', blocks: ['contact-card', 'blog-card', 'cta'] },
  'newsletter':                   { slug: 'newsletter', complexity: 'Low', blocks: ['signup-form (newsletter)', 'text'] },
  'healthcare-professionals':     { slug: 'healthcare-professionals-side-effects-quitting-smoking-patient-concerns', complexity: 'Medium', blocks: ['masthead-card', 'blurb-card', 'text', 'cards'] },
  'zonnic-nicotine-pouches':      { slug: 'zonnic-nicotine-pouches11', complexity: 'Medium', blocks: ['product-hero', 'text', 'cta'] },
  'zonnic-helped-me-quit':        { slug: 'zonnic-helped-me-quit', complexity: 'Low', blocks: ['masthead-card', 'blurb-card', 'cta'] },
  'world-no-tobacco-day':         { slug: 'world-no-tobacco-day', complexity: 'Low', blocks: ['masthead-card', 'text', 'cta'] },
  'quit-zone':                    { slug: 'quit-zone', complexity: 'Medium', blocks: ['masthead-card', 'blurb-card', 'faq', 'cta'] },
  'keep-zonnic-accessible':       { slug: 'keep-zonnic-accessible', complexity: 'Low', blocks: ['masthead-card', 'text', 'cta'] },
  'truth-about-zonnic':           { slug: 'truth-about-zonnic', complexity: 'Medium', blocks: ['masthead-card', 'faq', 'cta'] },
  'quit-on-your-terms':           { slug: 'quit-on-your-terms', complexity: 'Low', blocks: ['masthead-card', 'blurb-card', 'cta'] },
  'faq-old-donotindex':           { slug: 'faq-old-donotindex-faq-general-information', complexity: 'Low', blocks: ['faq', 'text'] },
  'ask-your-pharmacist':          { slug: 'ask-your-pharmacist', complexity: 'Low', blocks: ['masthead-card', 'cta'] },
  'zonnic-insurance-reimbursement': { slug: 'zonnic-insurance-reimbursement', complexity: 'Low', blocks: ['masthead-card', 'text'] },
  'real-people-real-success':     { slug: 'real-people-real-success-marks-quit-smoking-testimonial', complexity: 'Medium', blocks: ['masthead-card', 'blog-card', 'cta'] },
  'faq':                          { slug: 'faq-about-zonnic', complexity: 'Low', blocks: ['faq', 'text'] },
  'quit-zone-archived-page':      { slug: 'quit-zone-archived-page', complexity: 'Low', blocks: ['masthead-card', 'text'] },
  'email-verification':           { slug: 'email-verification', complexity: 'Low', blocks: ['text (box)'] },
};

const complexityPill = (c) => c === 'High' ? 'pill-new' : (c === 'Medium' ? 'pill-adapt' : 'pill-reuse');

const tplEntries = Object.entries(sitemap.template_groups)
  .map(([key, g]) => ({ key, count: g.count, url: g.representative, meta: tplMeta[key] }))
  .sort((a, b) => b.count - a.count);

const tplCardsHtml = tplEntries.map(t => {
  const slug = t.meta?.slug || t.key;
  const primary = path.join(SCREENSHOTS, `${slug}-desktop-1440.png`);
  const hasThumb = fs.existsSync(primary);
  const thumb = hasThumb
    ? `<img class="thumb" src="../design-extract/screenshots/${slug}-desktop-1440.png" alt="${t.key} desktop preview" loading="lazy" onerror="this.onerror=null;this.src='../design-extract/screenshots/${slug}-desktop.png';" />`
    : `<div class="thumb thumb-placeholder">no preview</div>`;
  const blocks = (t.meta?.blocks || []).map(b => `<span class="block-tag">${b}</span>`).join('');
  const complexity = t.meta?.complexity || 'Medium';
  return `      <div class="template-card">
        ${thumb}
        <div class="name">${t.key}</div>
        <div class="page-count">${t.count}</div><div class="page-label">page${t.count === 1 ? '' : 's'}</div>
        <div class="complexity"><span class="pill ${complexityPill(complexity)}">${complexity}</span></div>
        <div class="block-flow">${blocks}</div>
        <a class="live-link" href="${t.url}" target="_blank">View live page &rarr;</a>
      </div>`;
}).join('\n');

// ---------------- Block inventory ----------------
const REUSE = 3, ADAPT = 4, NEW = 20;

const blockRows = [
  // reuse
  ['section metadata',   'bat-section-default',       'reuse', 'None',    '0h'],
  ['button decoration',  'bat-cta-default',           'reuse', 'None',    '0h'],
  ['default content',    'headline / text / image',   'reuse', 'None',    '0h'],
  // adapt
  ['header',             'bat-header-zonnicheadless', 'adapt', 'Medium',  'M'],
  ['footer',             'bat-footer-zonnic',         'adapt', 'Low',     'S'],
  ['hero',               'bat-hero-zonnic',           'adapt', 'Medium',  'M'],
  ['cards (blog)',       'blog listing / article',    'adapt', 'Low',     'S'],
  // new chrome
  ['age-gate',           'bat-agegate-*',             'new',   'High',    'L'],
  ['announcement-bar',   'bat-announcementbar-*',     'new',   'Low',     'S'],
  ['location-selector',  'bat-locationselector-*',    'new',   'Medium',  'M'],
  ['modal',              'shared container',          'new',   'Medium',  'M'],
  // new content
  ['masthead-card',      'bat-masthead-card',         'new',   'Medium',  'M'],
  ['blurb-card',         'bat-blurb-card',            'new',   'Low',     'S'],
  ['blog-card',          'bat-blog-card',             'new',   'Low',     'S'],
  ['contact-card',       'bat-contact-card',          'new',   'Low',     'S'],
  ['faq',                'bat-faq',                   'new',   'Medium',  'M'],
  ['cta',                'bat-cta-composite',         'new',   'Medium',  'M'],
  ['text (box)',         'bat-text-default (variant)','new',   'Low',     'XS'],
  ['signup-form',        'bat-signupform',            'new',   'High',    'L'],
  ['login-form',         'bat-loginform',             'new',   'High',    'L'],
  ['password-reset-form','bat-passwordresetform',     'new',   'Medium',  'M'],
  // specialised
  ['product-carousel',   'bat-product-carousel',      'new',   'High',    'L'],
  ['tabbed-carousel',    'bat-tabbed-carousel',       'new',   'High',    'XL'],
  ['product-hero',       'bat-product-hero',          'new',   'High',    'L'],
  ['product-card',       'bat-product-card',          'new',   'Low',     'S'],
  ['store-locator',      'bat-storelocator',          'new',   'High',    'XL'],
  ['minicart',           'bat-minicart-zonnic',       'new',   'High',    'XL'],
];

const blockRowsHtml = blockRows.map(([b, s, status, c, size]) => {
  const pill = status === 'reuse' ? 'pill-reuse' : status === 'adapt' ? 'pill-adapt' : 'pill-new';
  const label = status === 'reuse' ? 'Reuse' : status === 'adapt' ? 'Adapt' : 'New';
  return `        <tr><td>${b}</td><td>${s}</td><td><span class="pill ${pill}">${label}</span></td><td>${c}</td><td class="num">${size}</td></tr>`;
}).join('\n');

// ---------------- Atomic design table (values) ----------------
const atomicRows = {
  tokens: 34 + 15 + 8 + 18 + 10 + 7 + 6,
  atoms: 8,
  molecules: 6,
  organisms: 27,
  templates: 3,
  pages: 106,
};

// ---------------- Integrations ----------------
const integrations = [
  ['OneTrust',                   'consent',        'snippet-drop',  'delayed.js (consent gate)',   'S'],
  ['Salesforce (login / signup / password-reset)','auth','snippet-drop','into form blocks',         'S'],
  ['Salesforce chat',            'messaging',      'snippet-drop',  'delayed.js',                  'XS'],
  ['Qualtrics Site Intercept',   'survey',         'snippet-drop',  'delayed.js',                  'XS'],
  ['AEM.live RUM',               'perf telemetry', 'preserve',      'eager (in aem.js)',           'XS'],
  ['ContentSquare',              'UX analytics',   'snippet-drop',  'delayed.js',                  'XS'],
  ['Adobe DTM',                  'tag manager',    'snippet-drop',  'delayed.js',                  'XS'],
  ['Google Tag Manager',         'tag manager',    'snippet-drop',  'delayed.js',                  'XS'],
  ['Adobe Target',               'experimentation','snippet-drop',  'delayed.js (flicker OK)',     'XS'],
  ['Adobe Audience Manager',     'DMP',            'snippet-drop',  'chain of DTM',                'XS'],
  ['Meta Pixel / ad pixels',     'advertising',    'snippet-drop',  'chain of GTM/DTM',            'XS'],
  ['ssapi.vuse.com',             'subscription',   'snippet-drop',  'if retained (DISC-02)',       'XS'],
  ['Mapbox',                     'maps',           'snippet-drop',  'store-locator + IO lazy',     'S'],
  ['PriceSpider',                'commerce widget','snippet-drop',  'if retained (DISC-02)',       'XS'],
  ['unpkg / npmcdn',             'CDN',            'replace',       'self-host',                   'XS'],
];

const integrationRowsHtml = integrations.map(([svc, cat, strat, loading, size]) => {
  const strategyClass = strat === 'preserve' ? 'pill-preserve' :
                         strat === 'snippet-drop' ? 'pill-reuse' :
                         strat === 'replace' ? 'pill-adapt' : 'pill-inactive';
  return `        <tr><td>${svc}</td><td>${cat}</td><td><span class="pill ${strategyClass}">${strat}</span></td><td>${loading}</td><td class="num">${size}</td></tr>`;
}).join('\n');

// ---------------- Work items by phase ----------------
const phaseItems = { 'Discovery': 13, 'Design System': 15, 'Site Build': 45, 'Migration': 14, 'Testing & UAT': 12 };
const phaseItemsMax = Math.max(...Object.values(phaseItems));
const workByPhaseHtml = Object.entries(phaseItems).map(([label, count]) => {
  const pct = Math.round((count / phaseItemsMax) * 100);
  return `        <div class="bar-row"><div class="bar-label">${label}</div><div class="bar-track"><div class="bar-fill navy" style="width:${pct}%">${count}</div></div></div>`;
}).join('\n');

// ---------------- Effort by phase ----------------
const phaseEffort = {
  'Discovery':       { mid: 36,  max: 48  },
  'Design System':   { mid: 91,  max: 116 },
  'Site Build':      { mid: 290, max: 400 },
  'Migration':       { mid: 78,  max: 100 },
  'Testing & UAT':   { mid: 76,  max: 96  },
};
const effortMax = Math.max(...Object.values(phaseEffort).map(p => p.max));
const effortHtml = Object.entries(phaseEffort).map(([label, { mid, max }]) => {
  const midPct = Math.round((mid / effortMax) * 100);
  const maxPct = Math.round((max / effortMax) * 100);
  return `        <div class="bar-row"><div class="bar-label">${label}</div><div class="bar-track"><div class="bar-fill navy" style="width:${midPct}%">${mid}h</div><div class="bar-secondary navy" style="width:${maxPct}%"></div></div></div>`;
}).join('\n');

// ---------------- T-shirt distribution ----------------
const tshirts = [
  ['XS', 1.5, 2, 19, 'green'],
  ['S',  3,   4, 32, 'navy'],
  ['M',  6,   8, 40, 'navy'],
  ['L',  12, 16, 6,  'amber'],
  ['XL', 28, 40, 1,  'red'],
];
const tshirtsWithTotals = tshirts.map(([size, mid, max, count, color]) => ({
  size, mid, max, count, color,
  midTotal: mid * count,
  maxTotal: max * count,
}));
const maxOfMaxTotals = Math.max(...tshirtsWithTotals.map(t => t.maxTotal));
const tshirtRowsHtml = tshirtsWithTotals.map(({ size, mid, max, count, color, midTotal, maxTotal }) => {
  const pct = Math.round((maxTotal / maxOfMaxTotals) * 100);
  const hours = `(${mid}–${max}h)`;
  const label = `${mid + (max - mid) / 2}h`.replace('.5h', '.5h');
  return `        <tr><td><strong>${size}</strong> ${hours}</td><td>${((mid + max) / 2).toFixed(1)}h</td><td class="num">${count}</td><td class="num">${midTotal}h</td><td class="num">${maxTotal}h</td><td><div class="bar-track" style="width:200px;height:14px;display:inline-block"><div class="bar-fill ${color}" style="width:${pct}%;font-size:0"></div></div></td></tr>`;
}).join('\n');

// ---------------- Gantt ----------------
const TOTAL_WEEKS = 14;
const ganttWeeksHtml = Array.from({ length: TOTAL_WEEKS }, (_, i) =>
  `      <div class="gantt-week" style="flex:1">W${i + 1}</div>`).join('\n');
// Phase bars: [label, startWeek (1-based), durationWeeks, color]
const phases = [
  ['1. Discovery',          1,  1, 'var(--navy)'],
  ['2. Design System',      2,  3, 'var(--navy-light)'],
  ['3. Site Build',         4,  5, 'var(--green)'],
  ['Vendor snippet drops',  4,  5, 'var(--amber)'],
  ['Critical: tabbed-carousel', 8, 1, 'var(--red)'],
  ['4. Migration',          8,  3, 'var(--navy-light)'],
  ['5. Testing & UAT',      9,  3, 'var(--navy)'],
  ['Go-live',               12, 1, 'var(--red)'],
  ['Hypercare',             13, 2, '#555568'],
];
const ganttRowsHtml = phases.map(([label, start, dur, color]) => {
  const left = ((start - 1) / TOTAL_WEEKS) * 100;
  const width = (dur / TOTAL_WEEKS) * 100;
  return `      <div class="gantt-row"><div class="gantt-label">${label}</div><div class="gantt-track"><div class="gantt-bar" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%;background:${color}">${dur}w</div></div></div>`;
}).join('\n');

// ---------------- Resources ----------------
const resources = [
  ['EDS Developer A',  '230h',  ['advisory', 'advisory', 'full',     'advisory', 'full']],
  ['EDS Developer B',  '160h',  ['inactive', 'advisory', 'full',     'inactive', 'advisory']],
  ['Designer',         '110h',  ['advisory', 'full',     'advisory', 'inactive', 'advisory']],
  ['Content Author',   '90h',   ['advisory', 'inactive', 'advisory', 'full',     'advisory']],
  ['QA',               '60h',   ['inactive', 'inactive', 'advisory', 'advisory', 'full']],
  ['SEO',              '20h',   ['advisory', 'inactive', 'inactive', 'advisory', 'advisory']],
  ['Architect / PM',   '70h',   ['full',     'advisory', 'advisory', 'advisory', 'advisory']],
];
const pillMap = {
  full:     `<span class="pill pill-reuse">Full</span>`,
  advisory: `<span class="pill pill-advisory">Advisory</span>`,
  inactive: `<span class="pill pill-inactive">—</span>`,
};
const resourceRowsHtml = resources.map(([role, hours, phases]) => {
  const cells = phases.map(p => `<td>${pillMap[p]}</td>`).join('');
  return `        <tr><td>${role}</td><td class="num">${hours}</td>${cells}</tr>`;
}).join('\n');

// ---------------- Risks ----------------
const risks = [
  ['R-02', 'Component anatomy LOW — anatomy covers 0% of DOM patterns; block inventory biased',                'Discovery',    'critical', 'Re-scrape 25 templates (DISC-04); budget 10–20% block-count headroom'],
  ['R-01', 'Bypass integrity LOW — consent/chat fingerprints leaked into designlang output',                   'Discovery',    'high',     'Re-run designlang with stronger --ignore + verify clean bypass-leak scan'],
  ['R-04', 'Accessibility LOW — 3 critical + 11 serious WCAG 2.2 AA violations live today',                     'Accessibility','high',     'Assign every violation to owner block in DISC-08; gate Phase 5 on zero critical'],
  ['R-05', 'Typography score 35/100 — 5 families / 8 weights; Santral has no 400 weight',                      'Design system','high',     'DS-04/05 normalize to 2-family / 4-weight / 7-size scale'],
  ['R-09', 'Vendor snippet availability & change control — build depends on client-delivered snippets',        'Integration',  'high',     'DISC-02 collects manifest with owners + delivery dates; weekly check-in in Phase 3'],
  ['R-10', 'Lighthouse 100 with vendor snippets — OneTrust may demand eager placement',                         'Delivery',     'high',     'Default everything into delayed.js; escalate any eager demand to trade-off decision; verify via BUILD-INT-14'],
  ['R-12', 'Content freeze feasibility — marketing may push campaigns mid-migration',                           'Content',      'high',     'Coordinate 3-week freeze (DISC-10); capture mid-flight updates via change log'],
  ['R-03', 'Template coverage MEDIUM — only 10/25 representatives scraped',                                     'Discovery',    'medium',   'Complete scrape in DISC-04'],
  ['R-06', 'CSS Health 35/100 — 179 !important rules, 92% unused CSS',                                          'Design system','medium',   'Forensic audit + visual-diff during normalization'],
  ['R-07', '2 WCAG contrast failures in token audit',                                                           'Design system','medium',   'Remap affected tokens; re-audit in DS-03'],
  ['R-11', 'OneTrust consent gating ordering in delayed.js',                                                    'Integration',  'medium',   'BUILD-INT-03 loads OneTrust first; verify network waterfall in BUILD-INT-14'],
  ['R-13', 'Authoring model unfamiliar to marketing team',                                                      'Content',      'medium',   '2× author training sessions + cheat sheet per template'],
  ['R-14', 'Image re-hosting — product/hero images on BAT CDN',                                                 'Content',      'medium',   'MIGRATE-11 ingests images into AEM DAM'],
  ['R-08', 'Santral font licensing under EDS unknown',                                                          'Design system','low',      'DISC-07 confirms; fallback font is DS-16 option'],
  ['R-15', 'Age-gate is regulatory requirement (Health Canada) — must remain',                                  'Delivery',     'low',      'BUILD-CHROME-08 reproduces gate with cookie memory; legal sign-off'],
];
const riskStats = { critical: 0, high: 0, medium: 0, low: 0 };
for (const r of risks) riskStats[r[3]]++;
const riskRowsHtml = risks.map(([id, desc, cat, sev, mit]) => {
  return `        <tr><td><strong>${id}</strong> — ${desc}</td><td>${cat}</td><td><span class="pill pill-${sev}">${sev}</span></td><td>${mit}</td></tr>`;
}).join('\n');

// ---------------- Assemble ----------------
let html = fs.readFileSync(TEMPLATE, 'utf8');

// 1. HEADER
html = html.replace('{{SITE_NAME}}', SITE_NAME);
html = html.replace('Migration Proposal: {{SITE_NAME}}', `Migration Proposal: ${SITE_NAME}`);
html = html.replace('{{SOURCE_STACK}}', 'AEM + Handlebars CSR (bat-* components)');
html = html.replace(/{{SOURCE_URL}}/g, SOURCE_URL);
html = html.replace(/{{DATE}}/g, DATE);

// 2. KPI stats — build them fresh (replace the whole stats-row block)
const kpiHtml = `<div class="stats-row">
  <div class="stat-card"><div class="value">${PAGES}</div><div class="label">Pages</div></div>
  <div class="stat-card"><div class="value">${TEMPLATES}</div><div class="label">Templates</div></div>
  <div class="stat-card"><div class="value">${BLOCKS}</div><div class="label">Blocks</div></div>
  <div class="stat-card"><div class="value">${INTEGRATIONS}</div><div class="label">Integrations</div></div>
  <div class="stat-card"><div class="value">${WORK_ITEMS}</div><div class="label">Work Items</div></div>
  <div class="stat-card"><div class="value">${EFFORT_RANGE}</div><div class="label">Total Effort</div></div>
  <div class="stat-card"><div class="value">${WEEKS_RANGE}</div><div class="label">Weeks</div></div>
  <div class="stat-card warning"><div class="value">${GRADE_LETTER}</div><div class="label">Grade (${GRADE_SCORE}/100)</div></div>
</div>`;
html = html.replace(/<!-- 2\. KPI STATS[\s\S]*?<\/div>\s*\n<\/div>/m, `<!-- 2. KPI STATS -->\n${kpiHtml}`);

// 3. Design grade bars
html = html.replace(
  /<!-- One bar-row per grade dimension[\s\S]*?<!-- repeat for each dimension, ordered high-to-low -->/,
  gradeBarsHtml
);

// 4. Normalization delta
html = html.replace(
  /<!-- One row per normalized aspect[\s\S]*?<tr><td>{{ASPECT}}<\/td>[\s\S]*?<\/tr>/,
  normDeltaHtml
);

// 5. Templates
html = html.replace('{{TEMPLATE_COUNT}}', String(TEMPLATES));
html = html.replace(
  /<!-- One template-card per template[\s\S]*?<a class="live-link"[\s\S]*?<\/a>\s*<\/div>/,
  tplCardsHtml
);

// 6. Block inventory
html = html.replace('{{BLOCK_COUNT}}', String(BLOCKS));
html = html.replace('{{REUSE_COUNT}}', String(REUSE));
html = html.replace('{{ADAPT_COUNT}}', String(ADAPT));
html = html.replace('{{NEW_COUNT}}', String(NEW));
html = html.replace(
  /<!-- One row per block[\s\S]*?<tr><td>{{BLOCK_NAME}}<\/td>[\s\S]*?<\/tr>/,
  blockRowsHtml
);

// 7. Atomic design
html = html.replace('{{TOKEN_COUNT}}', String(atomicRows.tokens));
html = html.replace('{{ATOM_COUNT}}', String(atomicRows.atoms));
html = html.replace('{{MOL_COUNT}}', String(atomicRows.molecules));
html = html.replace('{{ORG_COUNT}}', String(atomicRows.organisms));
html = html.replace('{{TMPL_COUNT}}', String(atomicRows.templates));
html = html.replace('{{PAGE_TOTAL}}', String(atomicRows.pages));
html = html.replace('{{FOUNDATIONS_DESC}}', '27 colors, 15 type sizes, 8 weights, 18 spacing values, 10 shadows, 7 radii, 6 durations — flagged for normalization in DS phase');
html = html.replace('{{ATOMS_DESC}}', 'Buttons (primary/secondary/accent), text links, form inputs, headlines (H1–H6), body copy, icons, eyebrow labels, images');
html = html.replace('{{MOLECULES_DESC}}', 'CTA group, form field, FAQ row, blurb unit, blog stub, product tile');
html = html.replace('{{ORGANISMS_DESC}}', '27 distinct blocks: 3 reuse (sections, buttons, default content) + 4 adapt (header, footer, hero, cards) + 20 new');
html = html.replace('{{TEMPLATES_DESC}}', 'generic-template, blog-article-template, non-branded-generic-template');
html = html.replace('{{PAGES_DESC}}', '106 pages across 25 template groups; largest groups are blog (39) and contact-us / healthcare-professionals / real-people-real-success (9 each)');

// 8. Integrations
html = html.replace('{{INT_COUNT}}', String(integrations.length));
html = html.replace(
  /<!-- pill-preserve for preserve[\s\S]*?<tr><td>{{SERVICE}}<\/td>[\s\S]*?<\/tr>/,
  integrationRowsHtml
);

// 9. Work items by phase
html = html.replace('{{TOTAL_ITEMS}}', String(WORK_ITEMS));
html = html.replace(
  /<div class="bar-chart">\s*<!-- width% = \(phase_count[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
  `<div class="bar-chart">\n${workByPhaseHtml}\n      </div>\n    </div>\n  </section>`
);

// 10. Effort by phase
html = html.replace(
  /<!-- bar-fill width = midpoint[\s\S]*?<div class="bar-row"><div class="bar-label">{{PHASE}}<\/div>[\s\S]*?<\/div>\s*<\/div>/,
  effortHtml
);

// 11. T-shirt distribution
html = html.replace(
  /<tbody>\s*<!-- Proportion bar[\s\S]*?<tr><td><strong>XL<\/strong>[\s\S]*?<\/tr>\s*<\/tbody>/,
  `<tbody>\n${tshirtRowsHtml}\n      </tbody>`
);

// 12. Gantt
html = html.replace(
  /<div class="gantt-weeks">[\s\S]*?<!-- \.\.\. repeat \.\.\. -->\s*<\/div>/,
  `<div class="gantt-weeks">\n${ganttWeeksHtml}\n      </div>`
);
html = html.replace(
  /<!-- One gantt-row per phase[\s\S]*?<div class="gantt-row"><div class="gantt-label">{{PHASE}}<\/div>[\s\S]*?<\/div>\s*<\/div>/,
  ganttRowsHtml
);
html = html.replace(/\({{WEEKS_RANGE}} weeks\)/, `(${TOTAL_WEEKS} weeks including hypercare)`);

// 13. Resources
html = html.replace(
  /<tbody>\s*<!-- Per-phase pills[\s\S]*?<tr>\s*<td>{{ROLE}}<\/td>[\s\S]*?<\/tr>\s*<\/tbody>/,
  `<tbody>\n${resourceRowsHtml}\n      </tbody>`
);
html = html.replace('{{EFFORT_RANGE}}', EFFORT_RANGE);
html = html.replace('{{ROLE_COUNT}}', String(resources.length));
html = html.replace('{{PEAK_WEEKS}}', 'W7–W10');

// 14. Risk register
html = html.replace('{{RISK_COUNT}}', String(risks.length));
html = html.replace('{{CRITICAL}}', String(riskStats.critical));
html = html.replace('{{HIGH}}', String(riskStats.high));
html = html.replace('{{MEDIUM}}', String(riskStats.medium));
html = html.replace('{{LOW}}', String(riskStats.low));
html = html.replace(
  /<!-- pill-critical, pill-high[\s\S]*?<tr><td>{{RISK}}<\/td>[\s\S]*?<\/tr>/,
  riskRowsHtml
);

fs.writeFileSync(OUT, html, 'utf8');
console.log(`Wrote ${OUT} (${html.length.toLocaleString()} bytes)`);
