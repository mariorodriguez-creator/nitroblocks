# Anatomy vs DOM-Structure Diff

**Signal:** LOW

- Overlap (Jaccard): 0.0%
- DOM patterns covered by anatomy: 0.0%
- Anatomy-only names: 2
- DOM-only patterns: 8
- Overlap (both): 0

> **Warning:** anatomy is a poor reflection of DOM evidence. Either designlang analyzed the homepage only (under-extraction) or anatomy was synthesized from tokens rather than live DOM.

## Organisms in anatomy but not seen in DOM

These may be over-extraction (designlang imagined them) or reflect a template we did not scrape.

- `Card` (canonical: `card`)
- `Button` (canonical: `button`)

## Organisms in DOM evidence but not in anatomy

These are likely real organisms designlang missed. Each has the pages where the fingerprint appears.

- `div.QSIFeedbackButton` (canonical: `qsifeedback-button`, pages: blog-what-are-nicotine-pouches, contact-us-let-us-talk-testimonials, homepage, newsletter, pouches-zonnic-mint-24-nicotine-pouches...)
- `section.ot-sdk-row` (canonical: `ot-sdk-row`, pages: blog-what-are-nicotine-pouches, contact-us-let-us-talk-testimonials, homepage, newsletter, pouches-zonnic-mint-24-nicotine-pouches...)
- `section.ot-hide` (canonical: `ot-hide`, pages: blog-what-are-nicotine-pouches, contact-us-let-us-talk-testimonials, homepage, newsletter, pouches-zonnic-mint-24-nicotine-pouches...)
- `section` (canonical: `section`, pages: blog-what-are-nicotine-pouches, contact-us-let-us-talk-testimonials, homepage, newsletter, pouches-zonnic-mint-24-nicotine-pouches...)
- `section.ot-host-cnt` (canonical: `ot-host-cnt`, pages: blog-what-are-nicotine-pouches, contact-us-let-us-talk-testimonials, homepage, newsletter, pouches-zonnic-mint-24-nicotine-pouches...)
- `div.bat-wrapper` (canonical: `bat-wrapper`, pages: blog-what-are-nicotine-pouches, contact-us-let-us-talk-testimonials, homepage, newsletter, pouches-zonnic-mint-24-nicotine-pouches...)
- `div` (canonical: `div`, pages: blog-what-are-nicotine-pouches, contact-us-let-us-talk-testimonials, homepage, newsletter, pouches-zonnic-mint-24-nicotine-pouches...)
- `div.embedded-messaging` (canonical: `embedded-messaging`, pages: contact-us-let-us-talk-testimonials, homepage, newsletter, pouches-zonnic-mint-24-nicotine-pouches, sign-up...)
