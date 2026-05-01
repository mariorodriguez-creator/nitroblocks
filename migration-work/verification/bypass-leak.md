# Bypass Leak Verification

**Status:** FAIL

- Overlays detected in Phase B: age-gate, cookie-consent, salesforce-chat, location-selector
- Files scanned: 38
- Total leak-keyword hits: 1

## Hits by category

| Category | Hits | Critical? |
|---|---|---|
| consent-banner | 1 | YES |

## Sample evidence (up to 10 per category)

- **consent-banner** in `zonnic-ca-design-language.md` @23956: `onetrust`
  > slide-y | opacity, transform | 28 | | `onetrust-fade-in` | fade | opacity | 12 | | `sli

## Interpretation

Critical leak categories match overlays that the bypass probe detected. 
This means designlang's extraction likely ran against a page where the
overlay was still present. Re-check:

1. `bypass_cookies_full` in `bypass-result.json` — did designlang receive them?
2. Any cookies with `/` in value were filtered (designlang parser bug).
3. `verified: true` in `bypass-result.json` is for a fresh Playwright nav,
   not for designlang itself.
