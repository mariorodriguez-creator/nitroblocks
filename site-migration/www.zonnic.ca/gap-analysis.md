# Migration Gap Analysis

**Source site:** [https://www.zonnic.ca](https://www.zonnic.ca)
**Date:** 2026-04-13
**Templates analyzed:** 15
**Unique patterns found:** 18

## Summary


| Tier                           | Count | Description                                         |
| ------------------------------ | ----- | --------------------------------------------------- |
| Tier 1 — Covered               | 5     | Existing blocks, no code changes                    |
| Tier 2 — Variant               | 6     | Existing blocks, need CSS variant or minor JS tweak |
| Tier 3 — New Block             | 4     | Must be built from scratch                          |
| Default Content / Out of Scope | 3     | No block needed or handled outside EDS              |


---

## Tier 3 — New Blocks


| #   | Pattern                       | Proposed Block Name | Frequency | Templates       | Effort | Notes                                                                                                                                                                                                                                                                     |
| --- | ----------------------------- | ------------------- | --------- | --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Age Gate Modal                | `age-gate`          | 15        | All             | L      | Full-screen overlay with province selector, age verification, language toggle. Must persist state (cookie/localStorage) to avoid re-prompting. Complex JS: modal lifecycle, form validation, province storage, redirect for underage. High-priority — blocks all content. |
| 2   | Product Cards with Pricing    | `product-cards`     | 1         | Product Listing | M      | E-commerce card grid with product image, name, price, discover CTA, add-to-cart controls, quantity selectors. Requires integration with cart/checkout system (Felix pharmacy).                                                                                            |
| 3   | Product Detail Hero           | `product-detail`    | 1         | Product Detail  | M      | Image gallery (3 images), product name/flavour/variant, price display, "Buy Now" external CTA, "Find Nearest Store" CTA. May need lightbox or thumbnail navigation.                                                                                                       |
| 4   | Interactive Store Locator Map | `store-locator`     | 1         | Store Locator   | L      | Mapbox map integration, address search with autocomplete, store pins/markers, results list panel. Requires Mapbox API key and store location data source (JSON/API).                                                                                                      |


Effort guide: **S** = simple structure, minimal JS · **M** = moderate decoration, responsive · **L** = complex interaction or API integration

---

## Tier 2 — Variant Blocks


| #   | Pattern                            | Base Block                   | Proposed Variant          | Frequency | Templates                                                                                          | Effort | Notes                                                                                                                                                                         |
| --- | ---------------------------------- | ---------------------------- | ------------------------- | --------- | -------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | FAQ Accordion                      | accordion (Block Collection) | `accordion (faq)`         | 6         | Blog Article, Product Detail, What Is Zonnic, Why Zonnic, Testimonials Landing, Testimonial Detail | S      | Standard accordion with FAQ heading + "View All" CTA link at bottom. Add to project from Block Collection, then add `faq` variant for the heading+CTA wrapper.                |
| 2   | Testimonial Quote Carousel         | carousel (Block Collection)  | `carousel (testimonials)` | 3         | Why Zonnic, Testimonials Landing, Testimonial Detail                                               | M      | Carousel of cards with user photo, name, and quote text. Base carousel handles rotation; variant adds testimonial card styling.                                               |
| 3   | Icon + Text Benefit Grid           | cards                        | `cards (icon-grid)`       | 3         | What Is Zonnic, FAQ, Contact Us                                                                    | S      | Existing cards block with an icon-centric layout variant: centred icon/image, heading, short description. Cards already handle image+text; this is a CSS-only layout variant. |
| 4   | Social Media / Instagram Section   | embed                        | `embed (instagram)`       | 1         | Homepage                                                                                           | S      | Could use embed block to pull Instagram feed, or a simple HTML section. Needs social media icons and photo grid styling.                                                      |
| 5   | Lifestyle/Motivational Blurb Cards | cards                        | `cards (blurb)`           | 3         | Homepage, Why Zonnic, Testimonial Detail                                                           | S      | Tall cards with lifestyle image and short motivational text. Cards block with a full-bleed image variant. Carousel on mobile.                                                 |
| 6   | Product Carousel                   | carousel (Block Collection)  | `carousel (product)`      | 3         | Homepage, Product Detail, Store Locator                                                            | M      | Carousel of product "masthead" cards with large product image, tagline, and CTA. Base carousel handles rotation; variant adds product card styling with angled imagery.       |


---

## Tier 1 — Covered Blocks (no code needed)

Verify visual output against source after applying global design tokens.


| #   | Pattern                     | Block                            | Frequency | Notes                                                                                      |
| --- | --------------------------- | -------------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| 1   | Full-Width Hero Banner      | hero                             | 12        | Standard hero with image, heading, optional body text and CTA buttons. Already in project. |
| 2   | Article/Blog Card Grid      | cards                            | 5         | Grid of image + title + excerpt + link cards. Existing cards block covers this directly.   |
| 3   | Video Embed                 | embed / video (Block Collection) | 5         | Inline video player. Standard embed or video block handles this.                           |
| 4   | Site Header with Navigation | header                           | 15        | Existing header block — will need design token updates for Zonnic branding.                |
| 5   | Site Footer                 | footer                           | 15        | Existing footer block — will need design token updates for Zonnic branding.                |


---

## Default Content / Out of Scope


| #   | Pattern                      | Notes                                                                                                                                                                                                      |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Health Warning Banner        | Full-width regulatory image — default content (image in section). No block needed.                                                                                                                         |
| 2   | Newsletter Signup Bar        | Heading + email input — could be default content with a form integration, or a simple fragment. Evaluate during implementation.                                                                            |
| 3   | Multi-Step Registration Form | Complex form with address autocomplete, DOB, password fields. Likely handled by an external service (e.g., Salesforce, identity provider) embedded via iframe or JS integration. Not a standard EDS block. |


---

## Global Style Observations

Observations about the source site's visual DNA that will inform design token extraction:

- **Colors:** Dark gradient backgrounds (steel grey to charcoal), white text on dark backgrounds, teal/green accent (#00b4a0 range), bright green CTAs, dark navy (#1a1a2e range). Brand uses a premium, moody palette.
- **Typography:** Sans-serif throughout (appears to be a custom BAT brand font). Bold uppercase headings, light/regular weight body text. H1s are large and uppercase.
- **Spacing:** Generous section padding (60-80px vertical). Full-width sections with content max-width ~1200px. Card grids use consistent gaps.
- **Other:** Rounded corners on buttons (pill-shaped CTAs), product imagery uses dramatic angled shots with gradient backgrounds. Heavy use of lifestyle photography. Slick slider for all carousels. Mapbox for maps.

---

## Template Readiness Matrix


| Template             | Tier 3 Blockers          | Tier 2 Blockers                                         | Ready for Import? |
| -------------------- | ------------------------ | ------------------------------------------------------- | ----------------- |
| Homepage             | age-gate                 | carousel (product), cards (blurb), embed (instagram)    | No                |
| Blog Listing         | age-gate                 | —                                                       | No                |
| Blog Article         | age-gate                 | accordion (faq)                                         | No                |
| Product Listing      | age-gate, product-cards  | —                                                       | No                |
| Product Detail       | age-gate, product-detail | accordion (faq), carousel (product)                     | No                |
| FAQ                  | age-gate                 | cards (icon-grid)                                       | No                |
| Healthcare Landing   | age-gate                 | —                                                       | No                |
| Healthcare Article   | age-gate                 | —                                                       | No                |
| Testimonials Landing | age-gate                 | accordion (faq), carousel (testimonials)                | No                |
| Testimonial Detail   | age-gate                 | accordion (faq), carousel (testimonials), cards (blurb) | No                |
| Contact Us           | age-gate                 | cards (icon-grid)                                       | No                |
| What Is Zonnic       | age-gate                 | cards (icon-grid), accordion (faq)                      | No                |
| Why Zonnic           | age-gate                 | accordion (faq), carousel (testimonials), cards (blurb) | No                |
| Store Locator        | age-gate, store-locator  | carousel (product)                                      | No                |
| Sign Up              | age-gate                 | —                                                       | No                |


---

## Recommended Build Order

1. **age-gate** (Tier 3, L) — Blocks all 15 templates. Must be built first as every page depends on it. Consider implementing as an auto-block in `scripts.js` rather than a standard authored block.
2. **accordion (from Block Collection)** + `faq` variant (Tier 2, S) — Unblocks FAQ pattern on 6 templates.
3. **carousel (from Block Collection)** + `product` variant (Tier 2, M) — Unblocks product carousel on 3 templates.
4. **carousel** `testimonials` variant (Tier 2, M) — Unblocks testimonial carousel on 3 templates. Same base block as #3.
5. **cards** `icon-grid` variant (Tier 2, S) — Unblocks icon grid on 3 templates.
6. **cards** `blurb` variant (Tier 2, S) — Unblocks lifestyle cards on 3 templates.
7. **product-cards** (Tier 3, M) — Unblocks Product Listing. Depends on e-commerce integration decisions.
8. **product-detail** (Tier 3, M) — Unblocks Product Detail. Related to product-cards integration.
9. **store-locator** (Tier 3, L) — Unblocks Store Locator. Requires Mapbox API setup and store data source.
10. **embed (instagram)** variant (Tier 2, S) — Low priority, only affects Homepage.

---

## Structural Decisions

### Decision 1: Age Gate Implementation Approach

- **Decision:** Should the age gate be an authored block or an auto-block injected by `scripts.js`?
- **Options:**
  - **Option A — Auto-block in scripts.js**: Injected automatically on every page. Province/age data stored in cookie. No authoring needed.
  - **Option B — Authored block**: Authors add it to each page (or via fragment). More flexible but error-prone.
- **Recommendation:** Option A — Auto-block. The age gate is identical on every page and is a regulatory requirement. It should never be accidentally omitted.
- **Impact:** Affects `scripts.js` core decoration. Province data must be available to other blocks (e.g., store locator).

### Decision 2: E-Commerce Integration Strategy

- **Decision:** How should product pricing, add-to-cart, and checkout be handled?
- **Options:**
  - **Option A — External pharmacy redirect**: "Buy Now" links to Felix/LiveWell pharmacy sites. No cart in EDS. Simplifies implementation significantly.
  - **Option B — Embedded cart**: Mini-cart and checkout embedded via JS widget from external provider.
- **Recommendation:** Option A for MVP. The source site already uses Felix pharmacy for purchases. Replicate the redirect-based model first. Add embedded cart later if needed.
- **Impact:** Reduces product-cards and product-detail complexity from M to S if no cart integration.

### Decision 3: Newsletter Signup Approach

- **Decision:** Standalone block vs default content with form integration vs fragment?
- **Options:**
  - **Option A — Fragment**: Author once, embed on all pages via fragment block.
  - **Option B — Auto-block**: Like age gate, injected automatically before footer.
  - **Option C — Footer integration**: Part of the footer block.
- **Recommendation:** Option A — Fragment. Authors control the content and can update the copy. Fragment reference in each page template keeps it DRY.
- **Impact:** Requires form submission integration (Salesforce Marketing Cloud or similar).

### Decision 4: Registration Form

- **Decision:** Build as EDS block or embed external identity provider?
- **Options:**
  - **Option A — External embed**: Embed Salesforce/identity provider form via iframe or JS widget.
  - **Option B — Native EDS form**: Build form natively with EDS form handling.
- **Recommendation:** Option A — External embed. The form has address autocomplete, password management, and account creation — all handled by the existing identity provider. Attempting to rebuild this natively is high-risk and low-value.
- **Impact:** Sign-up page and header login panel both depend on this decision.

### Decision 5: Bilingual Content Strategy

- **Decision:** How to handle EN/FR content?
- **Options:**
  - **Option A — Separate content trees**: `/ca/en/...` and `/ca/fr/...` as separate authored pages.
  - **Option B — Single tree with language toggle**: One content source with translated variants.
- **Recommendation:** Option A — Separate content trees. This matches the source site's URL structure and is the standard EDS approach for multilingual sites. Use [Multi-site config](https://www.aem.live/docs/multi-site) if needed.
- **Impact:** Doubles page count for content migration. Authors maintain both language versions.

---

## Risk Assessment


| Risk                                                               | Likelihood | Impact | Mitigation                                                                                                                                          |
| ------------------------------------------------------------------ | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Age gate complexity exceeds estimate                               | M          | H      | Prototype early. Consider simpler province-only gate if full form is too complex. Test cookie persistence across browsers.                          |
| Mapbox API costs or rate limits                                    | L          | M      | Evaluate free tier limits. Consider alternative mapping providers (Leaflet + OpenStreetMap).                                                        |
| E-commerce integration scope creep                                 | H          | H      | Strictly limit to external pharmacy redirects for MVP. No cart, no checkout in EDS.                                                                 |
| French content migration lag                                       | M          | M      | Migrate English first, then French. Use consistent content models so FR pages are structurally identical.                                           |
| Regulatory compliance (health warnings)                            | M          | H      | Health warning banner must appear on every page without exception. Implement as auto-block alongside age gate. Validate with legal/compliance team. |
| Third-party script performance impact (Salesforce chat, analytics) | M          | M      | Defer all third-party scripts to `delayed.js` (3s+ after LCP). Test Lighthouse score after each integration.                                        |
| Carousel accessibility                                             | M          | M      | Use Block Collection carousel which has built-in a11y. Test with screen readers. Ensure keyboard navigation works.                                  |
| Store location data source                                         | L          | M      | Confirm data format and API endpoint early. May need to export from existing Salesforce/BAT system to JSON.                                         |


