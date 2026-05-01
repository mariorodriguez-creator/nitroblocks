# Anatomy vs DOM-Structure Diff

**Signal:** UNDERSUPPLIED

- Anatomy components (canonical): 2
- DOM organisms (canonical): 8
- Overlap (Jaccard): 0.0%
- DOM patterns covered by anatomy: 0.0%
- Anatomy-only names: 2
- DOM-only patterns: 8
- Overlap (both): 0

> **Note:** anatomy.tsx is thinly populated (<5 components). This is common — designlang's anatomy output is often a weak reflection of the live component palette. Use the `*-screenshots.json` manifest, DOM structure aggregate, and `identify-page-structure` output as the primary component inventory. Do not interpret this signal as an extraction failure.

## Organisms in anatomy but not seen in DOM

These may be over-extraction (designlang imagined them) or reflect a template we did not scrape.

- `Card` (canonical: `card`)
- `Button` (canonical: `button`)

## Organisms in DOM evidence but not in anatomy

These are likely real organisms designlang missed. Each has the pages where the fingerprint appears.

- `div.QSIFeedbackButton` (canonical: `qsifeedback-button`, pages: contact-us-testimonials, homepage, pouches-zonnic-mint-24-nicotine-pouches, sign-up, store-locator...)
- `section.ot-sdk-row` (canonical: `ot-sdk-row`, pages: contact-us-testimonials, homepage, pouches-zonnic-mint-24-nicotine-pouches, sign-up, store-locator...)
- `section.ot-hide` (canonical: `ot-hide`, pages: contact-us-testimonials, homepage, pouches-zonnic-mint-24-nicotine-pouches, sign-up, store-locator...)
- `section` (canonical: `section`, pages: contact-us-testimonials, homepage, pouches-zonnic-mint-24-nicotine-pouches, sign-up, store-locator...)
- `section.ot-host-cnt` (canonical: `ot-host-cnt`, pages: contact-us-testimonials, homepage, pouches-zonnic-mint-24-nicotine-pouches, sign-up, store-locator...)
- `div.bat-wrapper` (canonical: `bat-wrapper`, pages: contact-us-testimonials, homepage, pouches-zonnic-mint-24-nicotine-pouches, sign-up, store-locator...)
- `div` (canonical: `div`, pages: contact-us-testimonials, homepage, pouches-zonnic-mint-24-nicotine-pouches, sign-up, store-locator...)
- `div.embedded-messaging` (canonical: `embedded-messaging`, pages: contact-us-testimonials, homepage, pouches-zonnic-mint-24-nicotine-pouches, sign-up, store-locator...)
