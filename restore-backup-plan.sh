#!/usr/bin/env bash
set -euo pipefail

SRC="drafts/countdown.plain.html"
TMP_DIR=".tmp/dev"
TMP_FILE="$TMP_DIR/countdown.plain.html"

BLOCKS_DIR="blocks/countdown"
BLOCK_FILE="$BLOCKS_DIR/countdown.js"
BLOCK_CSS_FILE="$BLOCKS_DIR/countdown.css"

# 1. Save a copy of the currentcountdown.plain.html
echo "Saving copy of $SRC to $TMP_FILE..."
mkdir -p "$TMP_DIR"
mv "$SRC" "$TMP_FILE"
echo "  Saved."

# 2. Save a copy of the current countdown.js and countdown.css
echo "Saving copy of $BLOCK_FILE to $BLOCK_FILE.backup..."
mv "$BLOCK_FILE" "$BLOCK_FILE.backup"
echo "  Saved."

echo "Saving copy of $BLOCK_CSS_FILE to $BLOCK_CSS_FILE.backup..."
mv "$BLOCK_CSS_FILE" "$BLOCK_CSS_FILE.backup"
echo "  Saved."


# 2. Find and apply the "backup plan" stash
echo "Looking for stash titled 'backup plan'..."
STASH_REF=$(git stash list | grep -i "backup plan" | head -1 | cut -d: -f1)

if [[ -z "$STASH_REF" ]]; then
  echo "Error: no stash with title 'backup plan' found." >&2
  echo "Available stashes:" >&2
  git stash list >&2
  exit 1
fi

echo "  Found: $STASH_REF — applying..."
git stash apply "$STASH_REF"
echo "  Applied."

# 3. Restore the saved copy back to its original location
echo "Restoring saved copy to $SRC..."
cp "$TMP_FILE" "$SRC"
echo "  Restored."

echo "Done."
