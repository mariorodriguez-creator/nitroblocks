#!/usr/bin/env bash
# Usage: bash extract-urls.sh <urls-file> <output-dir>
# Reads a flat list of URLs (one per line) and groups them by first path segment.
# Writes one file per section: <output-dir>/sec_<name>.txt
# Prints a summary table to stdout.

set -euo pipefail

URLS_FILE="${1:?Usage: extract-urls.sh <urls-file> <output-dir>}"
OUT_DIR="${2:?Usage: extract-urls.sh <urls-file> <output-dir>}"

mkdir -p "$OUT_DIR"

# Remove any leftover section files
rm -f "$OUT_DIR"/sec_*.txt

declare -A section_counts

while IFS= read -r url; do
  [[ -z "$url" ]] && continue

  # Strip protocol and host, get first path segment
  path="${url#*://}"      # remove https://
  path="${path#*/}"       # remove host
  segment="${path%%/*}"   # first path segment

  # Normalise: empty = homepage, otherwise lowercase + replace dots with dashes
  if [[ -z "$segment" || "$segment" == *"."* && "$segment" != *"/"* ]]; then
    # root or file directly on the domain (e.g. /index.html)
    segment="root"
  fi
  segment="${segment,,}"           # lowercase
  segment="${segment//./-}"        # dots → dashes

  echo "$url" >> "$OUT_DIR/sec_${segment}.txt"
done < "$URLS_FILE"

# Print summary table
echo ""
echo "Section               | Pages | Size bucket"
echo "----------------------|-------|------------"

total=0
for f in "$OUT_DIR"/sec_*.txt; do
  name="${f##*/sec_}"
  name="${name%.txt}"
  count=$(wc -l < "$f" | tr -d ' ')
  total=$((total + count))

  if   [ "$count" -lt 100 ];   then bucket="small  (100% sample)"
  elif [ "$count" -lt 200 ];   then bucket="mid    (50% sample)"
  else                               bucket="large  (25% sample)"
  fi

  printf "%-22s| %-5s | %s\n" "$name" "$count" "$bucket"
done

echo "----------------------|-------|"
printf "%-22s| %s\n" "TOTAL" "$total"
