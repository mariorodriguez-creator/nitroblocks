#!/usr/bin/env node
/**
 * Probe a site for blocking overlays (age gates, cookie banners, location
 * selectors) and discover the bypass strategy: cookies to inject and
 * selectors to ignore/hide.
 *
 * Two-stage approach:
 *   Stage 1 — Probe: navigate headless, detect overlay type, inspect the
 *             site's JS/cookies to find the bypass cookie name+value.
 *   Stage 2 — Validate: re-navigate with discovered cookies, confirm the
 *             overlay is gone and main content is visible.
 *
 * Outputs JSON to stdout with bypass_cookies, ignore_selectors, and
 * hide_css_selectors for the downstream designlang extraction and
 * screenshot capture scripts.
 *
 * Design rationale (from zonnic-ds/scripts/extract.sh):
 *   Cookie injection > click interaction. Setting the bypass cookie makes
 *   the site boot as if the user already passed the gate — no overlay
 *   renders, no body class, no hidden-overflow styles. Clicking through
 *   the gate is fragile and can hang (especially with --deep-interact).
 *
 * Usage:
 *   node bypass-overlays.mjs "https://www.zonnic.ca/ca/en"
 *   node bypass-overlays.mjs "https://www.zonnic.ca/ca/en" --output-dir ./migration-work
 */

import { chromium } from 'playwright';

const URL_ARG = process.argv[2];
if (!URL_ARG) {
  console.error('Usage: node bypass-overlays.mjs <url> [--output-dir <dir>]');
  process.exit(1);
}

const OUTPUT_DIR_IDX = process.argv.indexOf('--output-dir');
const OUTPUT_DIR =
  OUTPUT_DIR_IDX !== -1 ? process.argv[OUTPUT_DIR_IDX + 1] : './migration-work';

// ---------------------------------------------------------------------------
// Known overlay patterns
// ---------------------------------------------------------------------------

const OVERLAY_DETECTORS = {
  'age-gate': {
    selectors: [
      '[class*="agegate"]',
      '[class*="age-gate"]',
      '[class*="age_gate"]',
      '[data-component-name="ageGate"]',
      '[data-component-id*="AgeGate"]',
    ],
    customElementPattern: /agegate/i,
    // Common cookie names that bypass age gates
    cookieCandidates: [
      { name: 'age_verify', value: 'confirmed' },
      { name: 'age_verified', value: 'true' },
      { name: 'ageVerified', value: 'true' },
      { name: 'age-gate', value: 'passed' },
      { name: 'over_age', value: 'true' },
      { name: 'is_adult', value: 'true' },
    ],
  },
  'cookie-consent': {
    selectors: [
      '#onetrust-banner-sdk',
      '#onetrust-consent-sdk',
      '#CybotCookiebotDialog',
      '#CybotCookiebotDialogBody',
      '[class*="cookie-banner"]',
      '[class*="cookie-consent"]',
      '#cookie-banner',
      '#cookie-notice',
      '.cc-window',
      '.cc-banner',
      '#usercentrics-root',
      '#iubenda-cs-banner',
      '.termly-banner-top',
    ],
    customElementPattern: null,
    cookieCandidates: [
      { name: 'OptanonAlertBoxClosed', value: new Date().toISOString() },
      { name: 'CookieConsent', value: 'true' },
    ],
  },
  'qualtrics-feedback': {
    selectors: ['[id^="QSI"]', '[class*="QSIFeedbackButton"]'],
    customElementPattern: null,
    cookieCandidates: [],
  },
  'salesforce-chat': {
    selectors: [
      '[id*="embeddedMessaging"]',
      '[class*="embeddedService"]',
      '.helpButton',
    ],
    customElementPattern: null,
    cookieCandidates: [],
  },
  'location-selector': {
    selectors: [
      '[class*="locationselector"]',
      '[class*="location-selector"]',
      '[class*="region-selector"]',
      '[class*="country-selector"]',
    ],
    customElementPattern: /locationselector/i,
    cookieCandidates: [],
  },
};

// Selectors that should always be hidden/ignored regardless of detection
const ALWAYS_HIDE = [
  '#onetrust-banner-sdk',
  '#onetrust-consent-sdk',
  '#onetrust-pc-sdk',
  '.ot-sdk-container',
  '#ot-sdk-btn-floating',
  '[id^="QSI"]',
  '[class*="QSIFeedbackButton"]',
  '[id*="embeddedMessaging"]',
  '[class*="embeddedService"]',
  '.helpButton',
  '.grecaptcha-badge',
];

// ---------------------------------------------------------------------------
// Stage 1: Probe
// ---------------------------------------------------------------------------

async function probeOverlays(page) {
  const detected = [];
  const bypassCookies = [];
  const ignoreSelectors = [...ALWAYS_HIDE];
  const hideCssSelectors = [...ALWAYS_HIDE];

  for (const [type, config] of Object.entries(OVERLAY_DETECTORS)) {
    let found = false;

    // Check static selectors
    for (const sel of config.selectors) {
      const count = await page.locator(sel).count().catch(() => 0);
      if (count > 0) {
        found = true;
        ignoreSelectors.push(sel);
        hideCssSelectors.push(sel);
      }
    }

    // Check custom elements by tag name pattern
    if (config.customElementPattern) {
      const customEls = await page.evaluate((patternStr) => {
        const re = new RegExp(patternStr, 'i');
        const all = document.querySelectorAll('*');
        const tags = new Set();
        for (const el of all) {
          if (el.tagName.includes('-') && re.test(el.tagName)) {
            tags.add(el.tagName.toLowerCase());
          }
        }
        return [...tags];
      }, config.customElementPattern.source);

      if (customEls.length > 0) {
        found = true;
        for (const tag of customEls) {
          ignoreSelectors.push(tag);
          hideCssSelectors.push(tag);
        }
      }
    }

    if (found) {
      detected.push(type);
      bypassCookies.push(...config.cookieCandidates);
    }
  }

  // Check for generic full-screen blocking overlays
  const genericBlockers = await page.evaluate(() => {
    const results = [];
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    document.querySelectorAll('*').forEach((el) => {
      const style = window.getComputedStyle(el);
      const pos = style.position;
      if (pos !== 'fixed' && pos !== 'absolute') return;

      const z = parseInt(style.zIndex, 10);
      if (isNaN(z) || z < 100) return;

      const rect = el.getBoundingClientRect();
      const coverageW = rect.width / vpW;
      const coverageH = rect.height / vpH;
      if (coverageW > 0.5 && coverageH > 0.5) {
        const tag = el.tagName.toLowerCase();
        const id = el.id;
        const cls = el.className?.toString?.().slice(0, 100) || '';
        results.push({ tag, id, cls, z, coverageW, coverageH });
      }
    });

    return results;
  });

  if (genericBlockers.length > 0) {
    for (const b of genericBlockers) {
      const sel = b.id ? `#${b.id}` : b.cls ? `.${b.cls.split(' ')[0]}` : null;
      if (sel && !ignoreSelectors.includes(sel)) {
        ignoreSelectors.push(sel);
        hideCssSelectors.push(sel);
      }
    }
  }

  // Try to discover bypass cookies by inspecting the page's scripts
  if (detected.includes('age-gate')) {
    const discoveredCookies = await discoverBypassCookies(page);
    if (discoveredCookies.length > 0) {
      // Prefer discovered cookies over generic candidates
      const discovered = discoveredCookies.filter(
        (c) => !bypassCookies.some((bc) => bc.name === c.name),
      );
      bypassCookies.unshift(...discovered);
    }
  }

  // Deduplicate
  const uniqueCookies = [];
  const seenNames = new Set();
  for (const c of bypassCookies) {
    if (!seenNames.has(c.name)) {
      seenNames.add(c.name);
      uniqueCookies.push(c);
    }
  }

  return {
    detected,
    bypassCookies: uniqueCookies,
    ignoreSelectors: [...new Set(ignoreSelectors)],
    hideCssSelectors: [...new Set(hideCssSelectors)],
  };
}

/**
 * Inspect the page's inline scripts, data-model attributes, and logic
 * script URLs to discover which cookie name the age gate reads.
 */
async function discoverBypassCookies(page) {
  return page.evaluate(() => {
    const cookies = [];

    // Search data-model JSON on age gate elements for cookie references
    const ageGateEls = document.querySelectorAll(
      '[class*="agegate"], [data-component-name="ageGate"]',
    );
    for (const el of ageGateEls) {
      const model = el.getAttribute('data-model');
      if (model) {
        // Look for analytics or cookie field names in the model JSON
        try {
          const parsed = JSON.parse(model);
          if (parsed.analytics?.['dtm-1']) {
            // The dtm event name often hints at the cookie
            // e.g. "age-gate-over" → age_verify=confirmed
          }
        } catch { /* not valid JSON */ }
      }

      // Check the logic script URL for cookie patterns
      const logicUrl = el.getAttribute('data-logic-url');
      if (logicUrl) {
        // We can't fetch the script synchronously, but we know common patterns
        // from BAT sites: the logic.js typically sets age_verify=confirmed
      }
    }

    // Scan inline scripts for cookie assignment patterns
    const scripts = document.querySelectorAll('script:not([src])');
    for (const script of scripts) {
      const text = script.textContent || '';
      // Match patterns like: document.cookie = "age_verify=confirmed"
      // or: setCookie("age_verify", "confirmed")
      const cookieAssignRe =
        /(?:document\.cookie\s*=\s*["']|setCookie\s*\(\s*["'])(\w+)=([^"';]+)/g;
      let m;
      while ((m = cookieAssignRe.exec(text)) !== null) {
        if (/age|verify|gate|adult/i.test(m[1])) {
          cookies.push({ name: m[1], value: m[2] });
        }
      }
    }

    // Check existing cookies set on page load
    const existing = document.cookie.split(';').map((c) => c.trim());
    for (const c of existing) {
      const [name, ...rest] = c.split('=');
      if (/age|verify|gate|adult/i.test(name)) {
        cookies.push({ name: name.trim(), value: rest.join('=').trim() });
      }
    }

    return cookies;
  });
}

// ---------------------------------------------------------------------------
// Stage 2: Validate
// ---------------------------------------------------------------------------

async function validateBypass(browser, url, probeResult) {
  const { bypassCookies, hideCssSelectors } = probeResult;
  if (bypassCookies.length === 0 && probeResult.detected.length === 0) {
    return { verified: true, contentHeight: 0 };
  }

  const domain = new URL(url).hostname;
  const dotDomain = domain.startsWith('.') ? domain : `.${domain}`;

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  });

  // Inject bypass cookies
  const playwrightCookies = bypassCookies.map((c) => ({
    name: c.name,
    value: c.value,
    domain: dotDomain,
    path: '/',
  }));
  if (playwrightCookies.length > 0) {
    await context.addCookies(playwrightCookies);
  }

  const page = await context.newPage();

  // Inject hide CSS before navigation
  const hideCSS = `${hideCssSelectors.join(', ')} { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }`;
  await page.addInitScript((css) => {
    const style = document.createElement('style');
    style.textContent = css;
    document.documentElement.appendChild(style);
  }, hideCSS);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check if main content is visible (scroll height > viewport)
    const metrics = await page.evaluate(() => ({
      scrollHeight: document.body.scrollHeight,
      viewportHeight: window.innerHeight,
      hasMainContent:
        document.body.scrollHeight > window.innerHeight * 1.5,
    }));

    // Check that no detected overlay selectors are still visible
    let overlaysGone = true;
    for (const type of probeResult.detected) {
      const config = OVERLAY_DETECTORS[type];
      if (!config) continue;
      for (const sel of config.selectors) {
        const visible = await page
          .locator(sel)
          .first()
          .isVisible()
          .catch(() => false);
        if (visible) {
          overlaysGone = false;
          break;
        }
      }
    }

    await context.close();
    return {
      verified: metrics.hasMainContent && overlaysGone,
      contentHeight: metrics.scrollHeight,
    };
  } catch (err) {
    process.stderr.write(`[bypass] Validation error: ${err.message}\n`);
    await context.close();
    return { verified: false, contentHeight: 0 };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  process.stderr.write(`[bypass] Probing ${URL_ARG} for blocking overlays\n`);

  const browser = await chromium.launch();

  // Stage 1: Probe
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    await page.goto(URL_ARG, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    process.stderr.write(`[bypass] Navigation failed: ${err.message}\n`);
    await browser.close();
    outputFallback();
    return;
  }

  // Wait for JS hydration (BAT components need ~3s)
  await page.waitForTimeout(3000);

  const probeResult = await probeOverlays(page);
  await context.close();

  process.stderr.write(
    `[bypass] Detected overlays: ${probeResult.detected.join(', ') || 'none'}\n`,
  );
  process.stderr.write(
    `[bypass] Bypass cookies: ${probeResult.bypassCookies.map((c) => `${c.name}=${c.value}`).join(', ') || 'none'}\n`,
  );

  // Stage 2: Validate
  const validation = await validateBypass(browser, URL_ARG, probeResult);
  await browser.close();

  process.stderr.write(
    `[bypass] Validation: ${validation.verified ? 'PASS' : 'FAIL'} (content height: ${validation.contentHeight}px)\n`,
  );

  // Filter bypass cookies to only those with simple values (no / in value)
  // to avoid designlang --cookie parser bugs
  const safeCookies = probeResult.bypassCookies.filter(
    (c) => !c.value.includes('/'),
  );
  const unsafeCookies = probeResult.bypassCookies.filter((c) =>
    c.value.includes('/'),
  );

  if (unsafeCookies.length > 0) {
    process.stderr.write(
      `[bypass] WARNING: ${unsafeCookies.length} cookie(s) contain '/' in value and will be skipped for --cookie flag (designlang parser bug):\n`,
    );
    for (const c of unsafeCookies) {
      process.stderr.write(`[bypass]   ${c.name}=${c.value}\n`);
    }
  }

  const result = {
    overlays_detected: probeResult.detected,
    bypass_cookies: safeCookies.map((c) => `${c.name}=${c.value}`),
    bypass_cookies_full: probeResult.bypassCookies,
    ignore_selectors: probeResult.ignoreSelectors,
    hide_css_selectors: probeResult.hideCssSelectors,
    wait_ms: 3000,
    verified: validation.verified,
  };

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

function outputFallback() {
  const fallback = {
    overlays_detected: [],
    bypass_cookies: [],
    bypass_cookies_full: [],
    ignore_selectors: ALWAYS_HIDE,
    hide_css_selectors: ALWAYS_HIDE,
    wait_ms: 3000,
    verified: false,
    error: 'Navigation failed',
  };
  process.stdout.write(JSON.stringify(fallback, null, 2) + '\n');
}

main().catch((err) => {
  console.error('[bypass] Fatal:', err.message);
  outputFallback();
  process.exit(0);
});
