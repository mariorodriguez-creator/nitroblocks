#!/usr/bin/env bash
# Regenerate speckit workflow diagrams from .puml sources using Kroki.io
# Usage: .specify/scripts/bash/regenerate-diagrams.sh [--help]
# Requires: curl, internet connection

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIAGRAMS_DIR="$(cd "$SCRIPT_DIR/../../docs/diagrams" && pwd)"
KROKI_URL="https://kroki.io/plantuml/png"

usage() {
  echo "Usage: $(basename "$0") [--help]"
  echo "Regenerates PNG diagrams from .puml files in .specify/docs/diagrams/"
  echo "Uses Kroki.io public API (requires internet)."
}

for arg in "$@"; do
  case "$arg" in
    --help|-h) usage; exit 0 ;;
  esac
done

if [[ ! -d "$DIAGRAMS_DIR" ]]; then
  echo "ERROR: Diagrams directory not found: $DIAGRAMS_DIR" >&2
  exit 1
fi

count=0
for puml in "$DIAGRAMS_DIR"/*.puml; do
  [[ -f "$puml" ]] || continue
  base=$(basename "$puml" .puml)
  png="$DIAGRAMS_DIR/${base}.png"
  echo "Generating ${base}.png..."
  if curl -sS -X POST "$KROKI_URL" \
    -H "Content-Type: text/plain" \
    --data-binary "@$puml" \
    -o "$png"; then
    echo "  -> $png"
    ((count++)) || true
  else
    echo "  ERROR: Failed to generate ${base}.png" >&2
    exit 1
  fi
done

echo ""
echo "Done. Generated $count diagram(s)."
