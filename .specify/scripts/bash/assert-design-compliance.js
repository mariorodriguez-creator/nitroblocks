#!/usr/bin/env node
/**
 * Assert design compliance: checks that block CSS matches expectations from
 * design-expectations.json (derived from design.md).
 *
 * Use this to catch drift in spacing, typography, and layout after implementation.
 * Block CSS is the source; no build step.
 *
 * Usage:
 *   node assert-design-compliance.js <path-to-design-expectations.json> [path-to-block.css]
 *   If path-to-block.css is omitted, uses cssPath from the expectations file (relative to repo root).
 *
 * Exit: 0 if all expectations pass, 1 otherwise.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../../');

function parseCSS(css) {
  const rules = [];
  let i = 0;
  const len = css.length;

  function skipWhitespaceAndComments() {
    while (i < len) {
      if (css[i] === '/' && css[i + 1] === '*') {
        i += 2;
        while (i < len - 1 && !(css[i] === '*' && css[i + 1] === '/')) i++;
        i += 2;
      } else if (/\s/.test(css[i])) {
        i++;
      } else {
        break;
      }
    }
  }

  function findMatchingClose(start) {
    let depth = 1;
    let j = start;
    while (j < len && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    return j - 1;
  }

  function parseDeclarations(block) {
    const decls = {};
    const parts = block.split(';');
    for (const part of parts) {
      const colon = part.indexOf(':');
      if (colon === -1) continue;
      const prop = part.slice(0, colon).trim();
      const value = part.slice(colon + 1).trim();
      if (prop && value) decls[prop] = value;
    }
    return decls;
  }

  while (i < len) {
    skipWhitespaceAndComments();
    if (i >= len) break;

    const mediaMatch = css.slice(i).match(/^@media\s+(?:only\s+screen\s+and\s+)?\((?:min-width:\s*(\d+)px|width\s*>=\s*(\d+)px)\)[^{]*\{/);
    if (mediaMatch) {
      const mediaPx = mediaMatch[1] || mediaMatch[2];
      i += mediaMatch[0].length;
      const close = findMatchingClose(i);
      const inner = css.slice(i, close);
      i = close + 1;
      const innerRules = parseCSS(inner);
      innerRules.forEach((r) => {
        rules.push({ ...r, media: mediaPx });
      });
      continue;
    }

    const ruleStart = i;
    const open = css.indexOf('{', i);
    if (open === -1) break;
    const selector = css.slice(ruleStart, open).trim();
    const close = findMatchingClose(open + 1);
    const block = css.slice(open + 1, close);
    const declarations = parseDeclarations(block);
    rules.push({ selector, media: null, declarations });
    i = close + 1;
  }

  return rules;
}

function normalizeSelector(sel) {
  return sel.replace(/\s+/g, ' ').trim();
}

function buildCascadeByBreakpoint(rules) {
  const bySelector = {};
  const breakpoints = [null, '600', '768', '900', '1024', '1200', '1280', '1440'];
  for (const rule of rules) {
    const sel = normalizeSelector(rule.selector);
    if (!bySelector[sel]) bySelector[sel] = {};
    const media = rule.media || '0';
    if (!bySelector[sel][media]) bySelector[sel][media] = {};
    Object.assign(bySelector[sel][media], rule.declarations);
  }
  const cascade = {};
  for (const [sel, byMedia] of Object.entries(bySelector)) {
    cascade[sel] = { base: {} };
    let acc = {};
    for (const bp of breakpoints) {
      const key = bp === null ? '0' : bp;
      if (byMedia[key]) {
        for (const [k, v] of Object.entries(byMedia[key])) acc[k] = v;
      }
      cascade[sel][key] = { ...acc };
    }
  }
  return cascade;
}

/**
 * Build a global map of CSS custom properties per breakpoint (merged in cascade order).
 * Variables defined in any rule (e.g. .countdown or .countdown-header)
 * are available when resolving values; later rules override.
 */
function buildGlobalVarScope(rules) {
  const byMedia = {};
  for (const rule of rules) {
    const media = rule.media || '0';
    if (!byMedia[media]) byMedia[media] = {};
    for (const [k, v] of Object.entries(rule.declarations || {})) {
      if (k.startsWith('--') && v) byMedia[media][k] = v.trim();
    }
  }
  const breakpoints = ['0', '600', '768', '900', '1024', '1200', '1280', '1440'];
  const merged = {};
  let acc = {};
  for (const bp of breakpoints) {
    if (byMedia[bp]) Object.assign(acc, byMedia[bp]);
    merged[bp] = { ...acc };
  }
  return merged;
}

function parsePx(value) {
  if (typeof value !== 'string') return null;
  const m = value.match(/^(\d+(?:\.\d+)?)\s*px$/);
  return m ? Number(m[1]) : null;
}

function parseNumber(value) {
  if (typeof value !== 'string') return null;
  const n = parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

/**
 * Build a scope of CSS custom properties (--name: value) from merged declarations.
 * Used to resolve var(--x) and nested var(--y, fallback) to concrete values.
 */
function getVarScope(declarations) {
  const scope = {};
  if (!declarations) return scope;
  for (const [k, v] of Object.entries(declarations)) {
    if (k.startsWith('--') && v) scope[k] = v.trim();
  }
  return scope;
}

/**
 * Parse var(--name) or var(--name, fallback) where fallback may contain nested var().
 * Returns { name, fallback } or null.
 */
function parseVar(value) {
  if (!value || typeof value !== 'string') return null;
  const v = value.trim();
  if (!v.startsWith('var(')) return null;
  let depth = 1;
  const start = 4;
  let nameEnd = start;
  while (nameEnd < v.length) {
    const c = v[nameEnd];
    if (depth === 1 && (c === ',' || c === ')')) break;
    if (c === '(') depth++;
    else if (c === ')') depth--;
    nameEnd++;
  }
  const name = v.slice(start, nameEnd).trim();
  if (!name.startsWith('--')) return null;
  if (nameEnd >= v.length || v[nameEnd] === ')') {
    return { name, fallback: null };
  }
  const commaPos = nameEnd;
  let end = commaPos + 1;
  while (end < v.length) {
    const c = v[end];
    if (c === '(') depth++;
    else if (c === ')') {
      depth--;
      if (depth === 0) break;
    }
    end++;
  }
  const fallback = v.slice(commaPos + 1, end).trim();
  return { name, fallback: fallback || null };
}

/**
 * Resolve a CSS value by expanding var() using the given variable scope.
 * Handles var(--name) and var(--name, fallback). Recurses so nested vars
 * (e.g. --countdown-bg -> var(--countdown-bg, #6e6e6e) -> #6e6e6e) resolve.
 * Cycle detection: if we re-enter the same var we use fallback or return unresolved.
 */
function resolveVar(value, varScope, visited) {
  if (!value || typeof value !== 'string') return value;
  const v = value.trim();
  const parsed = parseVar(v);
  if (!parsed) return v;
  const { name, fallback } = parsed;
  const key = name.trim();
  if (visited && visited.has(key)) {
    return fallback ? resolveVar(fallback, varScope, visited) : v;
  }
  const nextVisited = new Set(visited || []);
  nextVisited.add(key);
  if (Object.prototype.hasOwnProperty.call(varScope, key)) {
    return resolveVar(varScope[key], varScope, nextVisited);
  }
  if (fallback) {
    return resolveVar(fallback, varScope, nextVisited);
  }
  return v;
}

function valueMatches(actual, expected, tolerancePx, acceptVar, resolvedActual) {
  const toCheck = resolvedActual != null ? resolvedActual : actual;
  if (!toCheck || !expected) return false;
  const actualNorm = (toCheck && toCheck.trim()) || '';
  const expectedNorm = expected.value.trim();
  if (actualNorm === expectedNorm) return true;
  const tol = expected.tolerancePx != null ? expected.tolerancePx : 0;
  const actualPx = parsePx(actualNorm) ?? parseNumber(actualNorm);
  const expectedPx = parsePx(expectedNorm) ?? parseNumber(expectedNorm);
  if (actualPx != null && expectedPx != null) {
    if (Math.abs(actualPx - expectedPx) <= tol) return true;
  }
  if (acceptVar && actualNorm.includes('var(')) {
    const fallbackMatch = actualNorm.match(/,\s*(\d+(?:\.\d+)?\s*px)\)/);
    if (fallbackMatch && parsePx(fallbackMatch[1]) != null) {
      const fallbackPx = parsePx(fallbackMatch[1]);
      if (expectedPx != null && Math.abs(fallbackPx - expectedPx) <= tol) return true;
    }
    if (tol > 0 && actualPx != null && expectedPx != null) return Math.abs(actualPx - expectedPx) <= tol;
  }
  return false;
}

/**
 * Derive the source path from the CSS path.
 * Block CSS at blocks/<name>/<name>.css is the source.
 */
function getSourcePathFromCssPath(cssPath) {
  const rel = path.relative(REPO_ROOT, cssPath);
  return path.resolve(REPO_ROOT, rel);
}

function runAssertions(expectationsPath, cssPathOverride) {
  const expectationsFull = path.isAbsolute(expectationsPath)
    ? expectationsPath
    : path.resolve(process.cwd(), expectationsPath);
  const specDir = path.dirname(expectationsFull);
  const raw = JSON.parse(fs.readFileSync(expectationsFull, 'utf-8'));
  const cssPath = cssPathOverride
    ? path.resolve(process.cwd(), cssPathOverride)
    : path.resolve(REPO_ROOT, raw.cssPath || '');
  if (!fs.existsSync(cssPath)) {
    console.error(`CSS file not found: ${cssPath}`);
    console.error('Ensure the block CSS file exists at blocks/{block-name}/{block-name}.css');
    process.exit(1);
  }
  const css = fs.readFileSync(cssPath, 'utf-8');
  const rules = parseCSS(css);
  const cascade = buildCascadeByBreakpoint(rules);
  const globalVarScope = buildGlobalVarScope(rules);
  const failures = [];
  const cascadeKeys = Object.keys(cascade);
  function findDecls(selector) {
    const norm = normalizeSelector(selector);
    if (cascade[norm]) return cascade[norm];
    const exact = cascadeKeys.find((k) => k === norm);
    if (exact) return cascade[exact];
    const endsWith = cascadeKeys.find((k) => k.endsWith(norm));
    if (endsWith) return cascade[endsWith];
    const includes = cascadeKeys.find((k) => k.includes(norm));
    return includes ? cascade[includes] : null;
  }
  for (const exp of raw.expectations || []) {
    const selector = exp.selector;
    const media = exp.media;
    const decls = findDecls(selector);
    if (!decls) {
      failures.push({ id: exp.id, reason: `Selector not found in CSS: ${selector}` });
      continue;
    }
    const mediaKey = media === null || media === undefined ? '0' : String(media).replace(/px$/i, '') || '0';
    const effective = decls[mediaKey] || decls.base;
    if (!effective) {
      failures.push({ id: exp.id, reason: `No rules for selector at media ${mediaKey}: ${selector}` });
      continue;
    }
    const localVars = getVarScope(effective);
    const varScope = { ...(globalVarScope[mediaKey] || {}), ...localVars };
    for (const [prop, constraint] of Object.entries(exp.properties || {})) {
      const actual = effective[prop];
      const resolved = actual ? resolveVar(actual, varScope) : null;
      const expected = typeof constraint === 'object' && constraint.value != null
        ? constraint
        : { value: constraint, tolerancePx: 0, acceptVar: true };
      if (!valueMatches(actual, expected, expected.tolerancePx, expected.acceptVar, resolved)) {
        failures.push({
          id: exp.id,
          selector,
          media: mediaKey,
          property: prop,
          expected: expected.value,
          actual: actual || '(missing)',
          resolved: resolved !== actual && resolved ? ` (resolved: ${resolved})` : '',
        });
      }
    }
  }
  return { failures, cssPathUsed: cssPath };
}

function main() {
  const args = process.argv.slice(2);
  const expectationsPath = args[0];
  const cssPathOverride = args[1];
  if (!expectationsPath) {
    console.error('Usage: node assert-design-compliance.js <path-to-design-expectations.json> [path-to-block.css]');
    process.exit(1);
  }
  const { failures, cssPathUsed } = runAssertions(expectationsPath, cssPathOverride);
  if (failures.length > 0) {
    const sourcePath = getSourcePathFromCssPath(cssPathUsed);
    const sourceRel = path.relative(REPO_ROOT, sourcePath);
    const existsNote = fs.existsSync(sourcePath) ? '' : ' (file not found)';
    const sourceLabel = 'Source CSS';
    const RED = '\x1b[31m';
    const RESET = '\x1b[0m';
    console.error(`Design compliance: ${RED}✗ FAIL${RESET}\n`);
    console.error(`${sourceLabel}: ${sourceRel}${existsNote}\n`);
    failures.forEach((f) => {
      const msg = f.reason || `${f.selector} @ ${f.media}: ${f.property} expected "${f.expected}", got "${f.actual}"${f.resolved || ''}`;
      console.error(`  [${f.id}] ${msg}`);
    });
    process.exit(1);
  }
  const GREEN = '\x1b[32m';
  const RESET = '\x1b[0m';
  console.log(`Design compliance: ${GREEN}✓ PASS${RESET}`);
  process.exit(0);
}

main();
