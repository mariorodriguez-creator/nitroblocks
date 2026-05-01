# zonnic.ca — Forensic Component Inventory

Source: [https://www.zonnic.ca/ca/en](https://www.zonnic.ca/ca/en)
Generated: 2026-04-30T16:46:11.435Z

## Summary

- **7** atoms
- **5** molecules
- **19** organisms
- **31** components total, **43/43** variants extracted with live-DOM evidence

## How this was built

1. **DOM survey** — every class/tag pattern on `migration-work/pages/*/cleaned.html` was catalogued and ranked by occurrence + page spread.
2. **Manifest authoring** — `migration-work/component-manifest.json` placed each pattern in its atomic level with a DOM selector and sample page.
3. **Playwright extraction** — the script loaded the bypass `storageState`, navigated to each sample page, located the first live instance, and captured:
   - outer HTML as-hydrated (`anatomy.html`)
   - `getComputedStyle()` snapshot (`computed.css`)
   - element screenshot (`evidence/*.png`)
   - page spread stats (`stats.json`)
4. **Indexes** — this file, plus per-level READMEs, link to every component folder.

## Contents

- [Atoms](./atoms/) — 7 components
- [Molecules](./molecules/) — 5 components
- [Organisms](./organisms/) — 19 components

## Source-of-truth discipline

Everything in this tree reflects the **current live site, un-normalised**. The
computed-style snapshots still carry the raw (often duplicated) colour / type /
spacing values — matching `01-design-system-audit.md`. Normalisation (token
consolidation, contrast fixes, scale rationalisation) happens in the next
skill (`migration-design-system`), whose audits cite these files as evidence.

## Caveats

- Hidden/regulatory patterns (age gate, location selector) are captured by
  temporarily clearing the bypass cookie before navigation — see `forceVisible`
  in the manifest.
- Selectors are live heuristics. Occasionally a variant screenshot can be empty
  because the element sits below the fold and can't be reliably scrolled into
  view on that page. When that happens, `stats.json.variants[].reason` records
  the failure — rerun with a different `samplePage` to fix.
- Bot-detection (Imperva) will throttle rapid requests. The script throttles
  at 1.5 s per variant — if you see `navigation-failed` for a batch, rerun
  later or increase the delay.
