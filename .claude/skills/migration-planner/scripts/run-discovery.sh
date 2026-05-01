#!/usr/bin/env bash
#
# run-discovery.sh — site discovery orchestrator for migration planning.
#
# Phase A: Sitemap analysis (compute depth, classify pages)
# Phase B: Overlay probe (discover bypass cookies + selectors)
# Phase C: designlang extraction (with bypass cookies, including --screenshots
#          for component crops; --deep-interact intentionally excluded)
# Phase D: Grade + verify outputs
# Phase E: Per-template full-page Playwright captures (screenshots/templates/)
# Phase F: Per-template scrape (cleaned HTML + HAR + screenshot)
# Phase G: Runtime accessibility scan (axe-core per representative)
# Phase H: Bypass-leak verification on designlang output
# Phase I: Multi-template grade sampling (delta report)
# Phase J: DOM structure analysis + anatomy diff
# Phase K: Aggregated verification report
#
# Usage:
#   bash run-discovery.sh <url> [depth-override] [--max-templates N] [--skip-hardening]
#
# Flags:
#   --max-templates N    Cap the per-template hardening phases to N pages
#                        (default 10). Phases F-J/K honor this cap.
#   --skip-hardening     Run only Phases A-E (the original pipeline).
#
# The depth is auto-computed from the sitemap. Pass a second argument to override.
# Output goes to ./migration-work/design-extract/ (design system) and
# ./migration-work/{pages,a11y,structure,verification}/ (hardening signals).

set -euo pipefail

# Parse args: first positional is URL, second optional positional is depth-override.
URL=""
DEPTH_OVERRIDE=""
MAX_TEMPLATES=10
SKIP_HARDENING=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-templates)
      MAX_TEMPLATES="$2"
      shift 2
      ;;
    --skip-hardening)
      SKIP_HARDENING=1
      shift
      ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    --*)
      echo "ERROR: unknown flag $1" >&2
      exit 1
      ;;
    *)
      if [ -z "$URL" ]; then
        URL="$1"
      elif [ -z "$DEPTH_OVERRIDE" ]; then
        DEPTH_OVERRIDE="$1"
      else
        echo "ERROR: unexpected arg $1" >&2
        exit 1
      fi
      shift
      ;;
  esac
done

if [ -z "$URL" ]; then
  echo "Usage: run-discovery.sh <url> [depth-override] [--max-templates N] [--skip-hardening]" >&2
  exit 1
fi

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="./migration-work/design-extract"
WORK_DIR="./migration-work"
VERIFICATION_DIR="$WORK_DIR/verification"

if ! command -v npx &>/dev/null; then
  echo "ERROR: npx not found. Install Node.js 20+." >&2
  exit 1
fi

if ! command -v node &>/dev/null; then
  echo "ERROR: node not found. Install Node.js 20+." >&2
  exit 1
fi

mkdir -p "$OUT_DIR" "$WORK_DIR/pages" "$WORK_DIR/a11y" "$WORK_DIR/structure" "$VERIFICATION_DIR"

echo "=== Migration Planner: Site Discovery ==="
echo "URL:   $URL"
echo "Output: $OUT_DIR"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase A: Sitemap Analysis
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase A: Sitemap analysis ---"

SITEMAP_RESULT="$WORK_DIR/sitemap-result.json"

if node "$SCRIPTS_DIR/analyze-sitemap.mjs" "$URL" > "$SITEMAP_RESULT"; then
  # Extract values from JSON
  TOTAL_PAGES=$(node -e "const d=JSON.parse(require('fs').readFileSync('$SITEMAP_RESULT','utf-8')); console.log(d.total_pages_filtered || 0)")
  MAX_DEPTH=$(node -e "const d=JSON.parse(require('fs').readFileSync('$SITEMAP_RESULT','utf-8')); console.log(d.recommended_depth || 5)")
  TEMPLATE_COUNT=$(node -e "const d=JSON.parse(require('fs').readFileSync('$SITEMAP_RESULT','utf-8')); console.log(Object.keys(d.template_groups || {}).length)")

  echo "  Pages found: $TOTAL_PAGES"
  echo "  Max depth: $MAX_DEPTH"
  echo "  Template groups: $TEMPLATE_COUNT"
else
  echo "  WARNING: Sitemap analysis failed. Using fallback depth."
  MAX_DEPTH=5
  TOTAL_PAGES=0
  TEMPLATE_COUNT=0
fi

# Apply depth override if provided
if [ -n "$DEPTH_OVERRIDE" ]; then
  echo "  Depth override: $DEPTH_OVERRIDE (was $MAX_DEPTH)"
  MAX_DEPTH="$DEPTH_OVERRIDE"
fi

DEPTH="$MAX_DEPTH"
echo "  Using depth: $DEPTH"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase B: Overlay Probe
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase B: Overlay probe ---"

BYPASS_RESULT="$WORK_DIR/bypass-result.json"
BYPASS_COOKIES=""
COOKIE_FILE_PATH=""
IGNORE_ARGS=""

if node "$SCRIPTS_DIR/bypass-overlays.mjs" "$URL" --output-dir "$WORK_DIR" > "$BYPASS_RESULT"; then
  # Read detected overlays
  OVERLAYS=$(node -e "const d=JSON.parse(require('fs').readFileSync('$BYPASS_RESULT','utf-8')); console.log((d.overlays_detected || []).join(', ') || 'none')")
  VERIFIED=$(node -e "const d=JSON.parse(require('fs').readFileSync('$BYPASS_RESULT','utf-8')); console.log(d.verified ? 'yes' : 'no')")
  CLICKED=$(node -e "const d=JSON.parse(require('fs').readFileSync('$BYPASS_RESULT','utf-8')); console.log(d.interaction_clicked || '-')")

  echo "  Overlays detected: $OVERLAYS"
  echo "  Interaction click: $CLICKED"
  echo "  Bypass verified:   $VERIFIED"

  # For designlang: use --cookie name=value flags (the --cookie-file flag in
  # designlang v12 has a parsing bug where storageState JSON cookies aren't
  # reliably applied before navigation). The bypass_cookies list has already
  # been filtered to values without '/' (avoids the other designlang parser
  # bug where '/' in value silently cancels all cookies).
  BYPASS_COOKIES=$(node -e "
    const d=JSON.parse(require('fs').readFileSync('$BYPASS_RESULT','utf-8'));
    const UNSAFE = /\/|%2[fF]/;
    const cookies = (d.bypass_cookies || []).filter(c => !UNSAFE.test(c.split('=').slice(1).join('=')));
    console.log(cookies.map(c => '--cookie ' + JSON.stringify(c)).join(' '));
  ")
  echo "  Cookie flags:       $(echo "$BYPASS_COOKIES" | tr ' ' '\n' | grep -c '^--cookie$') cookie(s)"

  # The storageState JSON is still useful for Playwright-based phases
  # (E/F/G) which consume it directly via Playwright's context.storageState.
  COOKIE_FILE_PATH=$(node -e "const d=JSON.parse(require('fs').readFileSync('$BYPASS_RESULT','utf-8')); console.log(d.cookie_file || '')")
  if [ -n "$COOKIE_FILE_PATH" ] && [ -s "$COOKIE_FILE_PATH" ]; then
    echo "  Cookie file:        $COOKIE_FILE_PATH (for Playwright phases E/F/G)"
  fi

  # Build --ignore flags
  IGNORE_ARGS=$(node -e "
    const d=JSON.parse(require('fs').readFileSync('$BYPASS_RESULT','utf-8'));
    const sels = d.ignore_selectors || [];
    if (sels.length > 0) console.log('--ignore ' + sels.map(s => JSON.stringify(s)).join(' '));
  ")

  echo "  Ignore selectors:   $(node -e "const d=JSON.parse(require('fs').readFileSync('$BYPASS_RESULT','utf-8')); console.log((d.ignore_selectors || []).length)") total"
else
  echo "  WARNING: Overlay probe failed. Proceeding without bypass."
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase C: designlang extraction
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase C: designlang extraction ---"
echo "  Flags: --responsive --interactions --dark --perf --emit-agent-rules --screenshots"
echo "  Wait: 3000ms (component hydration)"
echo "  NOTE: --deep-interact intentionally excluded (hangs on gated sites)"
echo "  NOTE: --screenshots writes component crops to $OUT_DIR/screenshots/"
echo "        Phase H (bypass-leak) scans filenames for overlay leakage."
echo ""

# Build the full designlang command
# NOTE: --deep-interact is intentionally excluded — it interacts with
# overlay CTAs and hangs on gated sites.
# --screenshots produces component-level crops (buttons, cards, nav) plus
# a *-screenshots.json manifest with variant × bounds metadata. It lands
# in $OUT_DIR/screenshots/ alongside Phase E's per-template captures.
# Overlay misfire risk is mitigated by the bypass pipeline:
#   1. --cookie injects bypass cookies BEFORE navigation
#   2. --ignore-widgets strips curated third-party selectors
#   3. $IGNORE_ARGS adds selectors discovered in Phase B
# Any residual overlay leakage into component filenames (e.g.
# "age-gate-modal-0.png") is caught by Phase H's verify-extraction scan.
# NOTE: --json is deliberately NOT passed. When --json is set, designlang
# v12 streams the extraction to stdout and suppresses the on-disk emission
# of *-design-language.md, *-design-tokens.json, *-variables.css, etc. —
# the very files downstream skills consume.
DESIGNLANG_CMD="npx --yes designlang \"$URL\" \
  --responsive \
  --interactions \
  --screenshots \
  --dark \
  --perf \
  --emit-agent-rules \
  --verbose \
  --wait 3000 \
  --depth $DEPTH \
  --ignore-widgets \
  $BYPASS_COOKIES \
  $IGNORE_ARGS \
  -o \"$OUT_DIR\""

echo "  Running: designlang (depth=$DEPTH)"
eval $DESIGNLANG_CMD || {
  echo ""
  echo "  WARNING: designlang extraction returned non-zero exit code."
  echo "  Checking if partial output was generated..."
}

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase D: Grade + Verify
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase D: Grade + verify ---"

# NOTE: `designlang grade` in v12 does not accept --cookie / --cookie-file.
# On gated sites the grade report will reflect the public/age-gate surface,
# not the post-bypass DOM. Treat the grade as a coarse signal; use the main
# extraction (Phase C) as the authoritative quality source.
GRADE_CMD="npx --yes designlang grade \"$URL\" \
  -o \"$OUT_DIR\""

echo "  Running: designlang grade"
eval $GRADE_CMD || echo "  WARNING: designlang grade returned non-zero exit code."

echo ""
echo "  Verifying outputs..."

FILE_COUNT=$(find "$OUT_DIR" -type f | wc -l | tr -d ' ')
echo "  Files generated: $FILE_COUNT"

MISSING=0
OPTIONAL_MISSING=0

# Critical outputs (extraction fails without these).
# NOTE: *-anatomy.tsx is intentionally NOT in this list — it is a
# supplementary React scaffold and is often thin or absent. The primary
# component inventory comes from *-screenshots.json (checked below).
for pattern in "*-design-language.md" "*-design-tokens.json" "*-grade.html"; do
  MATCH=$(find "$OUT_DIR" -name "$pattern" -print -quit 2>/dev/null)
  if [ -n "$MATCH" ]; then
    SIZE=$(wc -c < "$MATCH" | tr -d ' ')
    if [ "$SIZE" -gt 100 ]; then
      echo "  OK: $pattern -> $(basename "$MATCH") (${SIZE} bytes)"
    else
      echo "  WARN: $pattern -> $(basename "$MATCH") (only ${SIZE} bytes — possibly empty)"
      MISSING=$((MISSING + 1))
    fi
  else
    echo "  MISSING: $pattern"
    MISSING=$((MISSING + 1))
  fi
done

# High-value outputs for downstream skills
for pattern in "*-figma-variables.json" "*-variables.css" "*-motion-tokens.json" "*-agent-rules.md" "*-screenshots.json" "*-anatomy.tsx"; do
  MATCH=$(find "$OUT_DIR" -name "$pattern" -print -quit 2>/dev/null)
  if [ -n "$MATCH" ]; then
    SIZE=$(wc -c < "$MATCH" | tr -d ' ')
    echo "  OK: $pattern -> $(basename "$MATCH") (${SIZE} bytes)"
  else
    echo "  OPTIONAL MISSING: $pattern"
    OPTIONAL_MISSING=$((OPTIONAL_MISSING + 1))
  fi
done

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "  ⚠ $MISSING critical output(s) missing or empty."
  echo "  Possible causes:"
  echo "    - Age gate or overlay was not fully bypassed"
  echo "    - Site requires additional cookies (check bypass-result.json)"
  echo "    - Network/timeout issues during extraction"
  echo "  Check $BYPASS_RESULT for detected overlays and cookies."
fi

if [ "$OPTIONAL_MISSING" -gt 0 ]; then
  echo ""
  echo "  ℹ $OPTIONAL_MISSING optional output(s) not generated."
  echo "  These are high-value for downstream skills (design-system, site-build)."
  echo "  May require newer designlang version or specific flags."
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase E: Per-template full-page screenshots
# ───────────────────────────────────────────────────────────────────────────
#
# designlang's --screenshots (Phase C) gives us component crops + one
# homepage full-page capture. Phase E adds per-template × per-viewport
# full-page captures used by:
#   - the dashboard template cards (thumbnails)
#   - migration-design-system's preview/reference/ visual baselines
#   - the Phase K verification report's template coverage audit
#
# Outputs land in screenshots/templates/ so designlang's manifest paths
# in $OUT_DIR/*-screenshots.json remain valid and filename collisions
# between component crops and template captures are impossible.

echo "--- Phase E: Per-template full-page screenshots ---"

SCREENSHOT_ROOT="$OUT_DIR/screenshots"
TEMPLATE_SHOT_DIR="$SCREENSHOT_ROOT/templates"
SCREENSHOT_CMD="node \"$SCRIPTS_DIR/capture-clean-screenshots.mjs\" \"$URL\" \
  --output-dir \"$TEMPLATE_SHOT_DIR\""

# Pass bypass file if it exists
if [ -f "$BYPASS_RESULT" ]; then
  SCREENSHOT_CMD="$SCREENSHOT_CMD --bypass-file \"$BYPASS_RESULT\""
fi

# Pass pages file if it exists
if [ -f "$SITEMAP_RESULT" ]; then
  SCREENSHOT_CMD="$SCREENSHOT_CMD --pages-file \"$SITEMAP_RESULT\""
fi

echo "  Running: capture-clean-screenshots -> $TEMPLATE_SHOT_DIR"
eval $SCREENSHOT_CMD 2>&1 || echo "  WARNING: Template screenshot capture returned non-zero exit code."

COMPONENT_SHOT_COUNT=$(find "$SCREENSHOT_ROOT" -maxdepth 1 -name "*.png" -type f 2>/dev/null | wc -l | tr -d ' ')
TEMPLATE_SHOT_COUNT=$(find "$TEMPLATE_SHOT_DIR" -name "*.png" -type f 2>/dev/null | wc -l | tr -d ' ')
echo ""
echo "  Component crops (designlang): $COMPONENT_SHOT_COUNT"
echo "  Template captures (Playwright): $TEMPLATE_SHOT_COUNT"

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Hardening phases F-K
# ───────────────────────────────────────────────────────────────────────────
#
# Each phase is best-effort: a failure prints a warning but does not break
# the pipeline. The final Phase K aggregates all signals into a verification
# report with confidence scores per proposal dimension.

SCRAPE_WEBPAGE_SCRIPT=""
for candidate in \
  "../../scrape-webpage/scripts/analyze-webpage.js" \
  ".claude/skills/scrape-webpage/scripts/analyze-webpage.js" \
  "$SCRIPTS_DIR/../../scrape-webpage/scripts/analyze-webpage.js"; do
  resolved="$(cd "$SCRIPTS_DIR" 2>/dev/null && cd "$(dirname "$candidate")" 2>/dev/null && pwd)/$(basename "$candidate")"
  if [ -f "$resolved" ]; then
    SCRAPE_WEBPAGE_SCRIPT="$resolved"
    break
  fi
  if [ -f "$candidate" ]; then
    SCRAPE_WEBPAGE_SCRIPT="$(cd "$(dirname "$candidate")" && pwd)/$(basename "$candidate")"
    break
  fi
done

if [ "$SKIP_HARDENING" -eq 1 ]; then
  echo "--- Skipping hardening phases F-K (--skip-hardening) ---"
else

# ───────────────────────────────────────────────────────────────────────────
# Phase F: Per-template scrape (cleaned HTML + HAR + screenshot)
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase F: Per-template scrape (--max-templates $MAX_TEMPLATES) ---"

if [ -z "$SCRAPE_WEBPAGE_SCRIPT" ]; then
  echo "  WARNING: scrape-webpage/analyze-webpage.js not found — skipping Phase F"
  echo "  Phases G, J1, K will run with reduced evidence."
elif [ ! -f "$SITEMAP_RESULT" ]; then
  echo "  WARNING: no sitemap result — skipping Phase F"
else
  PAGES_PARENT="$WORK_DIR/pages"
  mkdir -p "$PAGES_PARENT"

  # Extract (slug, url) pairs from sitemap, capped at MAX_TEMPLATES.
  # Emit lines of form "slug<TAB>url".
  PAGES_TSV=$(node -e "
    const d = JSON.parse(require('fs').readFileSync('$SITEMAP_RESULT','utf-8'));
    const basePath = d.base_path || '';
    const reps = d.representative_urls || [];
    const slugFor = (u) => {
      const p = new URL(u).pathname.slice(basePath.length).replace(/^\\//,'').replace(/\\/\$/,'');
      return p.replace(/\\//g,'-') || 'homepage';
    };
    const seen = new Set();
    const out = [];
    // Ensure homepage comes first
    if (reps.length > 0) {
      const firstIsBase = reps.some((u) => new URL(u).pathname.replace(/\\/\$/,'') === basePath);
      if (!firstIsBase) {
        out.push(['homepage', '$URL'].join('\t'));
        seen.add('$URL');
      }
    }
    for (const u of reps) {
      if (seen.has(u)) continue;
      seen.add(u);
      out.push([slugFor(u), u].join('\t'));
      if (out.length >= $MAX_TEMPLATES) break;
    }
    process.stdout.write(out.join('\n'));
  ")

  SCRAPE_SUCCESS=0
  SCRAPE_FAIL=0
  while IFS=$'\t' read -r SLUG PG_URL; do
    [ -z "$SLUG" ] && continue
    OUT_SUB="$PAGES_PARENT/$SLUG"
    echo "  [$SLUG] $PG_URL -> $OUT_SUB"
    SCRAPE_ARGS=(--output "$OUT_SUB" --capture-har)
    if [ -f "$BYPASS_RESULT" ]; then
      SCRAPE_ARGS+=(--bypass-file "$BYPASS_RESULT")
    fi
    if node "$SCRAPE_WEBPAGE_SCRIPT" "$PG_URL" "${SCRAPE_ARGS[@]}" >/dev/null 2>"$OUT_SUB.scrape.log"; then
      SCRAPE_SUCCESS=$((SCRAPE_SUCCESS + 1))
      rm -f "$OUT_SUB.scrape.log"
    else
      SCRAPE_FAIL=$((SCRAPE_FAIL + 1))
      echo "    (failed — see $OUT_SUB.scrape.log)"
    fi
  done <<< "$PAGES_TSV"

  echo "  Scraped: $SCRAPE_SUCCESS success, $SCRAPE_FAIL failed"
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase G: Runtime accessibility scan
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase G: Accessibility scan ---"

A11Y_CMD="node \"$SCRIPTS_DIR/a11y-scan.mjs\" \"$URL\" \
  --output-dir \"$WORK_DIR/a11y\" \
  --max-templates $MAX_TEMPLATES"
if [ -f "$BYPASS_RESULT" ]; then
  A11Y_CMD="$A11Y_CMD --bypass-file \"$BYPASS_RESULT\""
fi
if [ -f "$SITEMAP_RESULT" ]; then
  A11Y_CMD="$A11Y_CMD --pages-file \"$SITEMAP_RESULT\""
fi

eval $A11Y_CMD >/dev/null 2>"$WORK_DIR/a11y/run.log" \
  || echo "  WARNING: a11y-scan returned non-zero (see $WORK_DIR/a11y/run.log)"

if [ -f "$WORK_DIR/a11y/summary.json" ]; then
  A11Y_VIOL=$(node -e "const d=JSON.parse(require('fs').readFileSync('$WORK_DIR/a11y/summary.json','utf-8'));console.log(d.totals?.violations||0)")
  A11Y_CRIT=$(node -e "const d=JSON.parse(require('fs').readFileSync('$WORK_DIR/a11y/summary.json','utf-8'));console.log(d.totals?.critical||0)")
  echo "  Violations: $A11Y_VIOL ($A11Y_CRIT critical)"
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase H: Bypass-leak verification
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase H: Bypass-leak verification ---"

node "$SCRIPTS_DIR/verify-extraction.mjs" \
  --extract-dir "$OUT_DIR" \
  --bypass-file "$BYPASS_RESULT" \
  --output-dir "$VERIFICATION_DIR" \
  >/dev/null 2>"$VERIFICATION_DIR/bypass-leak.log" \
  || echo "  WARNING: verify-extraction returned non-zero"

if [ -f "$VERIFICATION_DIR/bypass-leak.json" ]; then
  LEAK_PASS=$(node -e "const d=JSON.parse(require('fs').readFileSync('$VERIFICATION_DIR/bypass-leak.json','utf-8'));console.log(d.pass?'PASS':'FAIL')")
  LEAK_HITS=$(node -e "const d=JSON.parse(require('fs').readFileSync('$VERIFICATION_DIR/bypass-leak.json','utf-8'));console.log(d.total_hits||0)")
  echo "  Result: $LEAK_PASS ($LEAK_HITS keyword hits)"
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase I: Multi-template grade sampling
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase I: Multi-template grade sampling ---"

GRADE_SAMPLE_CMD="node \"$SCRIPTS_DIR/grade-sample.mjs\" \"$URL\" \
  --output-dir \"$VERIFICATION_DIR\" \
  --max-samples 5"
if [ -f "$BYPASS_RESULT" ]; then
  GRADE_SAMPLE_CMD="$GRADE_SAMPLE_CMD --bypass-file \"$BYPASS_RESULT\""
fi
if [ -f "$SITEMAP_RESULT" ]; then
  GRADE_SAMPLE_CMD="$GRADE_SAMPLE_CMD --pages-file \"$SITEMAP_RESULT\""
fi

eval $GRADE_SAMPLE_CMD >/dev/null 2>"$VERIFICATION_DIR/grade-sample.log" \
  || echo "  WARNING: grade-sample returned non-zero (see $VERIFICATION_DIR/grade-sample.log)"

if [ -f "$VERIFICATION_DIR/grade-delta.json" ]; then
  SPREAD_COUNT=$(node -e "const d=JSON.parse(require('fs').readFileSync('$VERIFICATION_DIR/grade-delta.json','utf-8'));console.log((d.high_spread_dimensions||[]).length)")
  echo "  High-spread dimensions (>20 pts): $SPREAD_COUNT"
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase J: Structure cross-check (DOM analysis + anatomy diff)
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase J: Structure cross-check ---"

# J1: deterministic DOM structure analysis per scraped page
node "$SCRIPTS_DIR/analyze-dom-structure.mjs" \
  --pages-dir "$WORK_DIR/pages" \
  --output-dir "$WORK_DIR/structure" \
  >/dev/null 2>"$WORK_DIR/structure/run.log" \
  || echo "  WARNING: analyze-dom-structure returned non-zero"

if [ -f "$WORK_DIR/structure/aggregate.json" ]; then
  ORG_COUNT=$(node -e "const d=JSON.parse(require('fs').readFileSync('$WORK_DIR/structure/aggregate.json','utf-8'));console.log(d.total_unique_organisms||0)")
  echo "  DOM organisms (unique fingerprints): $ORG_COUNT"
fi

# Anatomy diff
node "$SCRIPTS_DIR/compare-anatomy.mjs" \
  --extract-dir "$OUT_DIR" \
  --structure "$WORK_DIR/structure/aggregate.json" \
  --output-dir "$VERIFICATION_DIR" \
  >/dev/null 2>"$VERIFICATION_DIR/anatomy-diff.log" \
  || echo "  WARNING: compare-anatomy returned non-zero"

if [ -f "$VERIFICATION_DIR/anatomy-diff.json" ]; then
  DIFF_SIGNAL=$(node -e "const d=JSON.parse(require('fs').readFileSync('$VERIFICATION_DIR/anatomy-diff.json','utf-8'));console.log(d.signal||'UNKNOWN')")
  echo "  Anatomy-vs-DOM signal: $DIFF_SIGNAL"
fi

# HAR analysis for third-party inventory
node "$SCRIPTS_DIR/analyze-har.mjs" \
  --pages-dir "$WORK_DIR/pages" \
  --output-dir "$VERIFICATION_DIR" \
  >/dev/null 2>"$VERIFICATION_DIR/har.log" \
  || echo "  WARNING: analyze-har returned non-zero"

if [ -f "$VERIFICATION_DIR/third-party-inventory.json" ]; then
  TP_COUNT=$(node -e "const d=JSON.parse(require('fs').readFileSync('$VERIFICATION_DIR/third-party-inventory.json','utf-8'));console.log(d.unique_origins||0)")
  echo "  Third-party origins (from HAR): $TP_COUNT"
fi

echo ""

# ───────────────────────────────────────────────────────────────────────────
# Phase K: Aggregated verification report
# ───────────────────────────────────────────────────────────────────────────

echo "--- Phase K: Verification report ---"

node "$SCRIPTS_DIR/build-verification-report.mjs" --work-dir "$WORK_DIR" \
  >/dev/null 2>"$VERIFICATION_DIR/report.log" \
  || echo "  WARNING: build-verification-report returned non-zero"

if [ -f "$VERIFICATION_DIR/report.json" ]; then
  OVERALL=$(node -e "const d=JSON.parse(require('fs').readFileSync('$VERIFICATION_DIR/report.json','utf-8'));console.log(d.overall_confidence||'UNKNOWN')")
  echo "  Overall confidence: $OVERALL"
fi

echo ""

fi # SKIP_HARDENING

# ───────────────────────────────────────────────────────────────────────────
# Summary
# ───────────────────────────────────────────────────────────────────────────

echo "=== Discovery complete ==="
echo ""
echo "Output directory: $OUT_DIR"
echo "  Sitemap analysis:     $SITEMAP_RESULT"
echo "  Bypass probe:         $BYPASS_RESULT"
echo "  Design tokens:        $OUT_DIR/*-design-tokens.json"
echo "  Design narrative:     $OUT_DIR/*-design-language.md"
echo "  Grade report:         $OUT_DIR/*-grade.html"
echo "  Component manifest:   $OUT_DIR/*-screenshots.json"
echo "  Component crops:      $SCREENSHOT_ROOT/*.png"
echo "  Template captures:    $TEMPLATE_SHOT_DIR/"
if [ "$SKIP_HARDENING" -eq 0 ]; then
  echo ""
  echo "Hardening outputs:"
  echo "  Per-template scrapes: $WORK_DIR/pages/"
  echo "  Accessibility:        $WORK_DIR/a11y/"
  echo "  DOM structure:        $WORK_DIR/structure/"
  echo "  Verification report:  $VERIFICATION_DIR/report.md"
fi
echo ""
echo "Next: read outputs in $OUT_DIR and run scrape-webpage on representative pages."
