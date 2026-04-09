#!/usr/bin/env bash
# Usage: bash parse-components.sh <url> <section>
# Fetches a URL and extracts CSS class names that look like component names
# (multi-part kebab-case, 2+ words). Prints: section|url|class1,class2,...
#
# Called by run-batch.py; not normally run directly.

URL="${1:?Usage: parse-components.sh <url> <section>}"
SEC="${2:-unknown}"

HTML=$(curl -sA "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  --max-time 15 --compressed --location "$URL" 2>/dev/null)

if [[ -z "$HTML" ]]; then
  echo "${SEC}|${URL}|FETCH_FAILED"
  exit 0
fi

# Extract class attributes, split on whitespace, keep multi-word kebab identifiers
# Pattern: two or more lowercase words separated by hyphens (no numbers at start)
COMPS=$(echo "$HTML" \
  | grep -oE 'class="[^"]*"' \
  | grep -oE '"[^"]*"' \
  | tr -d '"' \
  | tr ' ' '\n' \
  | grep -E '^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)+$' \
  | grep -vE '^(is-|has-|js-|no-|visually-hidden|sr-only|clearfix|flex-|grid-)' \
  | sort -u \
  | tr '\n' ',')

# Remove trailing comma
COMPS="${COMPS%,}"

echo "${SEC}|${URL}|${COMPS:-NO_CLASSES}"
