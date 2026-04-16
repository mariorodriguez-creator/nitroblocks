---
name: athenai-assets
description: Manual asset processing skill for Figma layers. Accepts layer URLs and writes deterministic files to drafts/media using curl+sips, with optional get_screenshot fallback.
---

# Athenai Assets

Manual skill for downloading and transforming visual assets from Figma layer URLs.

This skill is intentionally separate from extraction skills. It does not create `design.md` and does not run `get_design_context`.

## Invocation Model

- Run manually after design extraction when you have layer URLs to process.
- Primary path uses `curl` + `sips`.
- Fallback (`get_screenshot`) is optional and only used when URL-based export fails.

## Inputs (required)

- `FEATURE_DIR`: feature directory containing `spec.md` and optional `design.md`
- `assetManifest`: list of layer assets with:
  - `name`: human-readable layer name
  - `nodeId`: Figma node id when available
  - `url`: downloadable layer URL from extraction output
  - `kind`: `standalone` or `per-breakpoint`
  - `breakpoints` (for `per-breakpoint`): width/height targets and suffixes (e.g. `mobile`, `tablet`, `desktop`)
- `imageFormat`: `jpg` (default), `png`, or `source`

## Output Guarantees

- Writes exported files under `drafts/media/` only.
- Produces deterministic names using slugified layer names.
- Returns a path map for all exported assets (success + failures).
- Never mutates spec or functional docs.

## Naming Rules

- Base slug: lowercase, spaces to hyphens, strip non-alphanumeric except hyphen.
- Empty/generic names fallback to `asset-{index}`.
- `standalone`: `drafts/media/{slug}.{ext}`
- `per-breakpoint`: `drafts/media/{slug}-{breakpoint}.{ext}`
- Extension is `.jpg` for `imageFormat=jpg`, `.png` for `imageFormat=png`, source extension for `source`.

## Processing Flow

1. Ensure `drafts/media/` exists.
2. For each manifest item:
   - If `standalone`: `curl -sL -o` directly to target.
   - If `per-breakpoint`:
     - Download source once with `curl`.
     - Resize/crop each breakpoint with `sips`.
     - Use `jpeg` as `sips` format when `imageFormat=jpg`.
     - Remove intermediates after all outputs are written.
3. On URL failure, optionally use `get_screenshot` fallback for that node only.
4. Emit compact markdown report:
   - Saved paths
   - Failed items and reason
   - Whether fallback was used

## Fallback Policy

Use `get_screenshot` only when:
- URL is missing/expired, or
- `curl` fails and retry does not recover, or
- exact node clipping cannot be reproduced from URL + `sips`.

If fallback is unavailable in the environment, keep failure in report and proceed.

## Integration Rules for Other Skills

- Extraction skills (`athenai-design`, `speckit-figma-specify`) must preserve references to `drafts/media/*` paths.
- Extraction skills must not execute download logic directly.
- Before implement phase, verify referenced `drafts/media/*` files exist.

## Timer Guidance

When used with athenai pipeline timing:
- Start `0-assets` before processing.
- End `0-assets` after report generation.
- Keep `0-design` and `0-assets` as separate records.
