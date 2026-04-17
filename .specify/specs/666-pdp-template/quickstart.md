# Quickstart: PDP Template

**Branch**: `f/666-pdp-template`  
**Spec dir**: `/Users/pawelsobolewski/Projects/accelerator/nitroblocks/.specify/specs/666-pdp-template`  
**Date**: 2026-04-16

## Prerequisites

- Repo root: `/Users/pawelsobolewski/Projects/accelerator/nitroblocks`
- Node deps installed (`npm install`)
- AEM CLI: `npx -y @adobe/aem-cli up --no-open --html-folder drafts`

## Draft URLs

| Draft | File | Local URL |
|-------|------|-----------|
| Reference PDP | `drafts/dev/pdp-spearmint.plain.html` | `http://localhost:3000/drafts/dev/pdp-spearmint` |
| Newsletter fragment | `drafts/dev/fragments/newsletter-signup.plain.html` | `http://localhost:3000/drafts/dev/fragments/newsletter-signup` (loaded via fragment fetch, not primary visual test) |

Smoke check:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/drafts/dev/pdp-spearmint
```

Expect `200` once the dev server is running.

## Integration scenarios

1. **Happy path** — Open PDP draft; verify product-detail gallery, description toggle, buy panel, carousel cards, testimonial section, two columns layouts, FAQ accordion, newsletter strip.
2. **Template class** — Production pages use `<meta name="template" content="pdp">` so `decorateTemplateAndTheme` adds body class `pdp`. Global `head.html` in this repo does not set it per-page; rely on **research R-002** (`buildHeroBlock` guard using `.product-detail` or future per-env meta) when testing hero suppression.
3. **Placeholders** — Before accepting EN/FR toggle labels, ensure `readMore` / `readLess` exist in the project Placeholders sheet (or dev equivalent).
4. **Fragment** — Newsletter block points to `/drafts/dev/fragments/newsletter-signup`; if the file is missing, expect silent failure per spec edge case.
5. **Video** — Draft uses a public sample MP4 URL suitable for autoplay tests; swap for `/media/...` in production content.

## HTML / CSS authority

- **Functional requirements**: `spec.md`
- **HTML structure, breakpoints, Layout Matrix, CSS Skeleton**: `design.md` (source of truth for layout)

Do not “simplify” breakpoints or layout tables when implementing `product-detail`, `carousel product`, or `accordion faq` CSS.

## Next workflow step

Run **`/speckit-tasks`** to generate `tasks.md` from this plan + spec + design.
