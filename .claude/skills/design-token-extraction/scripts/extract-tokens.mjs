#!/usr/bin/env node

/**
 * Extract Design Tokens from a Source Website
 *
 * Uses Playwright to navigate to a URL, extract computed styles from key
 * semantic elements, collect the color palette from stylesheets, download
 * web font files, and output a structured tokens.json.
 *
 * Usage:
 *   node extract-tokens.mjs "https://example.com" --output ./tokens-output
 *
 * Requirements:
 *   npm install playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const url = args.find((a) => a.startsWith('http'));
  let output = './tokens-output';
  const outputIdx = args.indexOf('--output');
  if (outputIdx !== -1 && args[outputIdx + 1]) {
    output = args[outputIdx + 1];
  }
  if (!url) {
    console.error('Usage: node extract-tokens.mjs "https://example.com" --output ./tokens-output');
    process.exit(1);
  }
  return { url, output };
}

function hexFromRgb(rgb) {
  if (!rgb) return null;
  if (rgb.startsWith('#')) return rgb.toLowerCase();
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  const [, r, g, b] = match.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const proto = fileUrl.startsWith('https') ? https : http;
    const request = (u, redirects = 5) => {
      proto.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects > 0) {
          const next = new URL(res.headers.location, u).href;
          const nextProto = next.startsWith('https') ? https : http;
          nextProto.get(next, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r2) => {
            if ([301, 302, 303, 307, 308].includes(r2.statusCode) && r2.headers.location && redirects > 1) {
              request(new URL(r2.headers.location, next).href, redirects - 2);
              return;
            }
            const ws = fs.createWriteStream(destPath);
            r2.pipe(ws);
            ws.on('finish', () => { ws.close(); resolve(destPath); });
            ws.on('error', reject);
          }).on('error', reject);
          return;
        }
        const ws = fs.createWriteStream(destPath);
        res.pipe(ws);
        ws.on('finish', () => { ws.close(); resolve(destPath); });
        ws.on('error', reject);
      }).on('error', reject);
    };
    request(fileUrl);
  });
}

// ---------------------------------------------------------------------------
// In-browser extraction (runs inside page.evaluate)
// ---------------------------------------------------------------------------

function browserExtract() {
  const cs = (el) => window.getComputedStyle(el);

  // -- Computed styles from semantic elements --------------------------------
  const body = document.body;
  const bodyStyle = cs(body);

  const bodyTokens = {
    fontFamily: bodyStyle.fontFamily,
    fontSize: bodyStyle.fontSize,
    lineHeight: bodyStyle.lineHeight,
    color: bodyStyle.color,
    backgroundColor: bodyStyle.backgroundColor,
    fontWeight: bodyStyle.fontWeight,
  };

  const headingTokens = {};
  for (let level = 1; level <= 6; level += 1) {
    const el = document.querySelector(`h${level}`);
    if (el) {
      const s = cs(el);
      headingTokens[`h${level}`] = {
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        color: s.color,
        letterSpacing: s.letterSpacing,
        textTransform: s.textTransform,
      };
    }
  }

  // Prefer links inside main content over header/nav links
  const linkEl = document.querySelector('main a[href]') || document.querySelector('article a[href]') || document.querySelector('a[href]');
  const linkTokens = {};
  if (linkEl) {
    const s = cs(linkEl);
    linkTokens.color = s.color;
    linkTokens.textDecoration = s.textDecorationLine || s.textDecoration;
  }

  // Also extract body background more carefully — check html, body, and main
  const htmlBg = cs(document.documentElement).backgroundColor;
  const mainEl = document.querySelector('main') || document.querySelector('[role="main"]');
  const mainBg = mainEl ? cs(mainEl).backgroundColor : null;
  const contentBg = {
    htmlBg,
    bodyBg: bodyStyle.backgroundColor,
    mainBg,
  };

  // Try to find buttons / CTAs
  const btnSelectors = [
    'a.button', 'button.cta', 'a.cta', 'button.btn', 'a.btn',
    '.button', '.cta', '.btn',
    'button[type="submit"]', 'a[role="button"]',
    'main a[class*="btn"]', 'main a[class*="button"]', 'main a[class*="cta"]',
  ];
  let btnEl = null;
  for (const sel of btnSelectors) {
    btnEl = document.querySelector(sel);
    if (btnEl) break;
  }
  const buttonTokens = {};
  if (btnEl) {
    const s = cs(btnEl);
    buttonTokens.backgroundColor = s.backgroundColor;
    buttonTokens.color = s.color;
    buttonTokens.borderRadius = s.borderRadius;
    buttonTokens.borderColor = s.borderColor;
    buttonTokens.borderWidth = s.borderWidth;
    buttonTokens.padding = s.padding;
    buttonTokens.fontFamily = s.fontFamily;
    buttonTokens.fontSize = s.fontSize;
    buttonTokens.fontWeight = s.fontWeight;
    buttonTokens.textTransform = s.textTransform;
  }

  // -- Section / layout spacing ---------------------------------------------
  const sections = document.querySelectorAll('main > section, main > div, [class*="section"], [class*="container"]');
  const spacingSet = [];
  sections.forEach((sec) => {
    const s = cs(sec);
    spacingSet.push({
      paddingTop: s.paddingTop,
      paddingBottom: s.paddingBottom,
      maxWidth: s.maxWidth,
    });
  });

  // -- Nav height -----------------------------------------------------------
  const navEl = document.querySelector('header, nav, [class*="header"], [class*="nav"]');
  let navHeight = null;
  if (navEl) {
    navHeight = `${navEl.getBoundingClientRect().height}px`;
  }

  // -- Color palette from stylesheets ---------------------------------------
  const colorFreq = {};
  const hexPattern = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
  const rgbPattern = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g;
  try {
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (const rule of rules) {
          const text = rule.cssText || '';
          const hexMatches = text.match(hexPattern) || [];
          hexMatches.forEach((h) => {
            const lower = h.toLowerCase();
            colorFreq[lower] = (colorFreq[lower] || 0) + 1;
          });
          const rgbMatches = text.match(rgbPattern) || [];
          rgbMatches.forEach((r) => {
            const m = r.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (m) {
              const hex = `#${((1 << 24) + (Number(m[1]) << 16) + (Number(m[2]) << 8) + Number(m[3])).toString(16).slice(1)}`;
              colorFreq[hex] = (colorFreq[hex] || 0) + 1;
            }
          });
        }
      } catch { /* CORS-blocked stylesheet, skip */ }
    }
  } catch { /* stylesheet iteration failed */ }

  const palette = Object.entries(colorFreq)
    .map(([hex, frequency]) => ({ hex, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  // -- @font-face declarations ----------------------------------------------
  const fontFaces = [];
  try {
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (const rule of rules) {
          if (rule instanceof CSSFontFaceRule) {
            const family = rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim();
            const weight = rule.style.getPropertyValue('font-weight') || '400';
            const style = rule.style.getPropertyValue('font-style') || 'normal';
            const srcRaw = rule.style.getPropertyValue('src') || '';
            const display = rule.style.getPropertyValue('font-display') || '';
            const unicodeRange = rule.style.getPropertyValue('unicode-range') || '';
            const urls = [];
            const urlRe = /url\(['"]?([^'")\s]+)['"]?\)/g;
            let m;
            while ((m = urlRe.exec(srcRaw)) !== null) {
              urls.push(m[1]);
            }
            fontFaces.push({ family, weight, style, display, unicodeRange, urls, srcRaw });
          }
        }
      } catch { /* CORS-blocked */ }
    }
  } catch { /* iteration failed */ }

  // -- CSS custom properties from :root -------------------------------------
  const customProps = {};
  try {
    const rootStyle = cs(document.documentElement);
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (const rule of rules) {
          if (rule.selectorText === ':root' || rule.selectorText === 'html') {
            for (let i = 0; i < rule.style.length; i += 1) {
              const prop = rule.style[i];
              if (prop.startsWith('--')) {
                customProps[prop] = rule.style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch { /* CORS-blocked */ }
    }
  } catch { /* failed */ }

  // -- Breakpoints from media queries ---------------------------------------
  const breakpoints = new Set();
  try {
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (const rule of rules) {
          if (rule instanceof CSSMediaRule) {
            const text = rule.conditionText || rule.media?.mediaText || '';
            const bpMatch = text.match(/(\d+)\s*px/g);
            if (bpMatch) bpMatch.forEach((bp) => breakpoints.add(bp));
          }
        }
      } catch { /* CORS-blocked */ }
    }
  } catch { /* failed */ }

  // -- Link hover color (scan stylesheets for :hover rules) -----------------
  let linkHoverColor = null;
  try {
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (const rule of rules) {
          if (rule.selectorText && rule.selectorText.includes('a') && rule.selectorText.includes(':hover')) {
            const c = rule.style.getPropertyValue('color');
            if (c) linkHoverColor = c;
          }
        }
      } catch { /* CORS-blocked */ }
    }
  } catch { /* failed */ }

  return {
    body: bodyTokens,
    contentBg,
    headings: headingTokens,
    link: { ...linkTokens, hoverColor: linkHoverColor },
    button: buttonTokens,
    spacing: spacingSet,
    navHeight,
    palette,
    fontFaces,
    customProperties: customProps,
    breakpoints: [...breakpoints].sort((a, b) => parseInt(a, 10) - parseInt(b, 10)),
  };
}

// ---------------------------------------------------------------------------
// Font file download
// ---------------------------------------------------------------------------

async function downloadFonts(fontFaces, outputDir, pageUrl) {
  const fontsDir = path.join(outputDir, 'fonts');
  fs.mkdirSync(fontsDir, { recursive: true });

  const downloaded = [];
  const seen = new Set();

  for (const face of fontFaces) {
    const ranked = [...face.urls].sort((a, b) => {
      const rank = (u) => {
        if (u.includes('woff2')) return 0;
        if (u.includes('.woff') && !u.includes('woff2')) return 1;
        return 2;
      };
      return rank(a) - rank(b);
    });

    const bestUrl = ranked[0];
    if (!bestUrl || bestUrl.startsWith('data:')) continue;

    const key = `${face.family}-${face.weight}-${face.style}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Resolve relative URLs against the page URL
    let absoluteUrl;
    try {
      if (bestUrl.startsWith('//')) {
        absoluteUrl = `https:${bestUrl}`;
      } else if (bestUrl.startsWith('http')) {
        absoluteUrl = bestUrl;
      } else {
        absoluteUrl = new URL(bestUrl, pageUrl).href;
      }
    } catch {
      console.warn(`  Skipping unresolvable font URL: ${bestUrl}`);
      continue;
    }

    // Strip query strings for extension detection
    const cleanPath = absoluteUrl.split('?')[0];
    const safeName = face.family.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const weightLabel = face.weight === '400' ? 'regular' : (face.weight === '700' ? 'bold' : `w${face.weight}`);
    let ext;
    if (cleanPath.includes('woff2')) ext = '.woff2';
    else if (cleanPath.includes('.woff')) ext = '.woff';
    else if (cleanPath.includes('.ttf')) ext = '.ttf';
    else if (cleanPath.includes('.otf')) ext = '.otf';
    else ext = '.woff2';
    const filename = `${safeName}-${weightLabel}${face.style !== 'normal' ? `-${face.style}` : ''}${ext}`;
    const destPath = path.join(fontsDir, filename);

    try {
      await downloadFile(absoluteUrl, destPath);
      const stat = fs.statSync(destPath);
      if (stat.size > 0) {
        downloaded.push({
          family: face.family,
          weight: face.weight,
          style: face.style,
          display: face.display,
          unicodeRange: face.unicodeRange,
          sourceUrl: absoluteUrl,
          localPath: `fonts/${filename}`,
          filename,
          format: ext.replace('.', ''),
        });
        console.log(`  Downloaded: ${filename} (${(stat.size / 1024).toFixed(1)}KB)`);
      } else {
        fs.unlinkSync(destPath);
      }
    } catch (err) {
      console.warn(`  Failed to download font ${absoluteUrl}: ${err.message}`);
    }
  }

  return downloaded;
}

// ---------------------------------------------------------------------------
// Post-processing: derive semantic color roles
// ---------------------------------------------------------------------------

function deriveColorRoles(raw) {
  const { body, contentBg, link, button, palette } = raw;

  const colors = {};

  // Pick the most meaningful background: prefer main > body > html, skip transparent/black
  const isTransparentOrBlack = (c) => {
    if (!c) return true;
    const h = hexFromRgb(c);
    return !h || h === '#000000' || c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
  };
  if (contentBg && !isTransparentOrBlack(contentBg.mainBg)) {
    colors.body_bg = hexFromRgb(contentBg.mainBg);
  } else if (!isTransparentOrBlack(body.backgroundColor)) {
    colors.body_bg = hexFromRgb(body.backgroundColor);
  } else if (contentBg && !isTransparentOrBlack(contentBg.htmlBg)) {
    colors.body_bg = hexFromRgb(contentBg.htmlBg);
  } else {
    colors.body_bg = '#ffffff';
  }

  colors.body_text = hexFromRgb(body.color) || '#000000';
  colors.link = hexFromRgb(link.color) || colors.body_text;
  colors.link_hover = hexFromRgb(link.hoverColor) || colors.link;

  if (button.backgroundColor) {
    colors.button_bg = hexFromRgb(button.backgroundColor);
    colors.button_text = hexFromRgb(button.color);
    colors.button_border = hexFromRgb(button.borderColor);
  }

  // Derive light / dark from palette by luminance
  const luminance = (hex) => {
    const m = hex.match(/^#(..)(..)(..)$/);
    if (!m) return 0.5;
    const [r, g, b] = [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };

  // Filter palette to non-trivial colors (skip pure black/white and near-transparent)
  const meaningful = palette
    .filter((p) => !['#000000', '#ffffff', '#fff', '#000'].includes(p.hex))
    .filter((p) => p.hex.length >= 7);

  const light = meaningful.find((p) => luminance(p.hex) > 0.85);
  const dark = meaningful.find((p) => {
    const l = luminance(p.hex);
    return l > 0.1 && l < 0.45;
  });

  colors.light = light ? light.hex : '#f8f8f8';
  colors.dark = dark ? dark.hex : '#505050';

  return colors;
}

// ---------------------------------------------------------------------------
// Post-processing: derive spacing tokens
// ---------------------------------------------------------------------------

function deriveSpacing(spacingSet, navHeight) {
  const paddings = spacingSet
    .map((s) => parseInt(s.paddingTop, 10))
    .filter((v) => v > 0)
    .sort((a, b) => b - a);

  const maxWidths = spacingSet
    .map((s) => parseInt(s.maxWidth, 10))
    .filter((v) => v > 0 && v < 3000)
    .sort((a, b) => a - b);

  const sectionPadding = paddings.length > 0 ? `${paddings[Math.floor(paddings.length / 2)]}px` : '40px';
  const contentMaxWidth = maxWidths.length > 0 ? `${maxWidths[Math.floor(maxWidths.length / 2)]}px` : '1200px';

  return {
    sectionPadding,
    contentMaxWidth,
    navHeight: navHeight || '64px',
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { url, output } = parseArgs();
  fs.mkdirSync(output, { recursive: true });

  console.log(`Extracting design tokens from: ${url}`);
  console.log(`Output directory: ${output}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    console.log('Loading page...');
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    console.log('Extracting computed styles...');
    const raw = await page.evaluate(browserExtract);

    console.log(`  Found ${Object.keys(raw.headings).length} heading levels`);
    console.log(`  Found ${raw.palette.length} unique colors in stylesheets`);
    console.log(`  Found ${raw.fontFaces.length} @font-face declarations`);
    console.log(`  Found ${raw.breakpoints.length} breakpoints`);
    console.log(`  Found ${Object.keys(raw.customProperties).length} CSS custom properties`);

    // Download fonts
    console.log('\nDownloading font files...');
    const downloadedFonts = await downloadFonts(raw.fontFaces, output, url);
    console.log(`  ${downloadedFonts.length} font files downloaded`);

    // Derive semantic tokens
    const colors = deriveColorRoles(raw);
    const spacing = deriveSpacing(raw.spacing, raw.navHeight);

    // Build final tokens object
    const tokens = {
      url,
      timestamp: new Date().toISOString(),
      colors,
      palette: raw.palette.slice(0, 50),
      typography: {
        body: {
          family: raw.body.fontFamily,
          size: raw.body.fontSize,
          lineHeight: raw.body.lineHeight,
          weight: raw.body.fontWeight,
        },
        headings: raw.headings,
      },
      fonts: downloadedFonts,
      fontFaces: raw.fontFaces.map((f) => ({
        family: f.family,
        weight: f.weight,
        style: f.style,
        display: f.display,
        unicodeRange: f.unicodeRange,
        urls: f.urls,
      })),
      spacing,
      components: {
        buttons: raw.button,
        navHeight: spacing.navHeight,
      },
      breakpoints: raw.breakpoints,
      customProperties: raw.customProperties,
      link: raw.link,
      rawBackgrounds: raw.contentBg,
    };

    const tokensPath = path.join(output, 'tokens.json');
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    console.log(`\nTokens saved to: ${tokensPath}`);

    return tokens;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Extraction failed:', err.message);
  process.exit(1);
});
