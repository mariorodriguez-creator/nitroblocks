#!/usr/bin/env node

/**
 * Scrape + Validate in one command.
 *
 * Runs mirror-site.js (full site mirror), then validate-mirror.js
 * (per-page visual diff + broken resource check) — sequentially, single command.
 *
 * Usage:
 *   node scrape-and-validate.js <url> [options]
 *
 * All mirror-site.js and validate-mirror.js options are accepted.
 * Use --no-validate to skip validation (mirror only).
 * Use --no-mirror to skip mirroring and only (re-)validate an existing mirror.
 */

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIRROR = path.join(__dirname, 'mirror-site.js');
const VALIDATE = path.join(__dirname, 'validate-mirror.js');

// Args shared between both scripts (pass everything through; each script ignores what it doesn't know)
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  process.stdout.write(`
Usage: node scrape-and-validate.js <url> [options]

Mirrors a full website then validates each page one by one against the live site.

Mirror options:
  --output <dir>        Output directory (default: ./scrape)
  --max-pages <n>       Max HTML pages to crawl
  --exclude <pattern>   Skip URLs matching regex (repeatable)
  --exclude-ext <exts>  Skip URLs with these file extensions, comma-separated (e.g. "pdf,zip,xlsx")
  --concurrency <n>     Parallel browser tabs during mirror (default: 3)
  --external-assets     Also download assets from external domains/CDNs

Validation options:
  --threshold <pct>     Pixel diff % to flag as "different" (default: 5)
  --limit <n>           Validate only first n pages
  --port <n>            Local server port (default: 4042)

Control:
  --no-mirror           Skip mirroring, only (re-)validate existing mirror
  --no-validate         Skip validation, only mirror

Examples:
  node scrape-and-validate.js "https://example.com"
  node scrape-and-validate.js "https://example.com" --external-assets --threshold 3
  node scrape-and-validate.js "https://example.com" --no-mirror   # re-validate existing mirror
  node scrape-and-validate.js "https://example.com" --no-validate # mirror only
`);
  process.exit(0);
}

const skipMirror = args.includes('--no-mirror');
const skipValidate = args.includes('--no-validate');

const CONTROL_FLAGS = new Set(['--no-mirror', '--no-validate']);

// Flags exclusive to one script — split into value flags (consume next arg) and boolean flags
const MIRROR_ONLY_VALUE_FLAGS = new Set(['--max-pages', '--concurrency', '--exclude', '--exclude-ext',
  '--sitemap', '--scroll-delay', '--load-more-limit', '--navigation-timeout']);
const MIRROR_ONLY_BOOL_FLAGS = new Set(['--external-assets', '--no-scroll', '--no-load-more']);
const VALIDATE_ONLY_VALUE_FLAGS = new Set(['--threshold', '--limit', '--port']);

/**
 * Build a filtered arg list for a target script.
 * Drops flags (and their value arg) that belong exclusively to the other script.
 * Boolean flags are dropped without consuming the next arg.
 */
function argsFor(target) {
  const excludeValue = target === 'mirror' ? VALIDATE_ONLY_VALUE_FLAGS : MIRROR_ONLY_VALUE_FLAGS;
  const excludeBool = target === 'mirror' ? new Set() : MIRROR_ONLY_BOOL_FLAGS;
  const result = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (CONTROL_FLAGS.has(a)) continue;         // drop --no-mirror / --no-validate
    if (excludeBool.has(a)) continue;           // drop boolean flag, no value to skip
    if (excludeValue.has(a)) { i++; continue; } // drop flag + its value arg
    result.push(a);
  }
  return result;
}

function run(label, script, target) {
  process.stdout.write(`${'─'.repeat(60)}\n`);
  process.stdout.write(`▶  ${label}\n`);
  process.stdout.write(`${'─'.repeat(60)}\n`);

  const result = spawnSync('node', [script, ...argsFor(target)], { stdio: 'inherit' });

  if (result.error) {
    process.stderr.write(`Failed to start ${label}: ${result.error.message}\n`);
    process.exit(1);
  }
  if (result.status !== 0) {
    if (target === 'validate') return result.status; // exit 1 means score < 100, not a crash
    process.exit(result.status || 1);
  }
  return 0;
}

if (!skipMirror) run('Phase 1: Mirror', MIRROR, 'mirror');
if (!skipValidate) {
  const code = run('Phase 2: Validate', VALIDATE, 'validate');
  process.exit(code);
}
