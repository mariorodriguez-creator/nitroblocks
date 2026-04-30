# Organism Structure Cross-Check

Derived from `<bat-*>` custom element counts in cleaned.html per representative template.

## Global organisms (appear on every page)

| Element | Pages | Total instances | EDS mapping |
|---|---:|---:|---|
| `bat-image-default` | 10/10 | 200 | default content `<img>` |
| `bat-text-default` | 10/10 | 191 | default content `<p>` |
| `bat-headline-default` | 10/10 | 161 | default content `<h1>/<h2>/<h3>` |
| `bat-section-default` | 10/10 | 84 | EDS section + section metadata |
| `bat-section-modal` | 10/10 | 30 | modal block (shared) |
| `bat-locationselector-zonnic` | 10/10 | 30 | location-selector block (modal, medium) |
| `bat-form-loginzonnic` | 10/10 | 20 | login form (requires Salesforce integration) |
| `bat-minicart-zonnic` | 10/10 | 20 | minicart block (commerce; defer decision) |
| `bat-agegate-zonnic` | 10/10 | 10 | age-gate (modal, auto-block) |
| `bat-header-zonnicheadless` | 10/10 | 10 | `<header>` + header block (existing) |
| `bat-footer-zonnic` | 10/10 | 10 | `<footer>` + footer block (existing) |

## Content organisms (appear on some templates)

| Element | Pages | Total instances | EDS mapping |
|---|---:|---:|---|
| `bat-cta-default` | 7/10 | 41 | button auto-decoration (atom) |
| `bat-cta-loggedin` | 9/10 | 36 | cta block — `(logged-in)` variant |
| `bat-card-blurb` | 2/10 | 34 | blurb-card block (new) |
| `bat-card-mastheadzonnic` | 3/10 | 32 | masthead-card block (new) |
| `bat-card-blog` | 3/10 | 24 | blog-card block (new, list + item) |
| `bat-form-signup` | 8/10 | 20 | signup-form block |
| `bat-hero-zonnic` | 5/10 | 15 | hero block (existing, adapt) |
| `bat-carousel-zonnictabsync` | 3/10 | 12 | tabbed-carousel block (new, interactive, complex) |
| `bat-messagebar-zonnic` | 9/10 | 9 | announcement-bar block (new, simple) |
| `bat-carousel-product` | 3/10 | 6 | product-carousel block (new, interactive) |
| `bat-faq-default` | 4/10 | 5 | faq block (new, accordion) |
| `bat-form-newsletterzonnic` | 2/10 | 4 | newsletter-form block |

## Unique organisms (appear on only one template)

| Element | Template | Instances | EDS mapping |
|---|---|---:|---|
| `bat-form-autofilllogindetails` | contact-us-let-us-talk-testimonials | 2 | autofill-login variant |
| `bat-cta-account` | what-is-zonnic | 2 | cta block — `(account)` variant |
| `bat-text-box` | contact-us-let-us-talk-testimonials | 1 | text block — `(box)` variant |
| `bat-producthero-zonnic` | pouches-zonnic-mint-24-nicotine-pouches | 1 | product-hero block (new, product PDP) |
| `bat-mapboxstorelocator-zonnic` | store-locator | 1 | store-locator block (new, async + Mapbox) |

## Per-template counts

### blog-what-are-nicotine-pouches
`bat-headline-default`×12, `bat-text-default`×10, `bat-card-blog`×6, `bat-image-default`×5, `bat-section-default`×4, `bat-cta-default`×4, `bat-cta-loggedin`×4, `bat-section-modal`×3, `bat-locationselector-zonnic`×3, `bat-form-loginzonnic`×2, `bat-minicart-zonnic`×2, `bat-faq-default`×2, `bat-form-signup`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-messagebar-zonnic`×1, `bat-footer-zonnic`×1

### contact-us-let-us-talk-testimonials
`bat-text-default`×8, `bat-headline-default`×4, `bat-cta-loggedin`×4, `bat-image-default`×3, `bat-section-modal`×3, `bat-locationselector-zonnic`×3, `bat-section-default`×3, `bat-form-loginzonnic`×2, `bat-minicart-zonnic`×2, `bat-form-autofilllogindetails`×2, `bat-form-newsletterzonnic`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-messagebar-zonnic`×1, `bat-hero-zonnic`×1, `bat-text-box`×1, `bat-footer-zonnic`×1

### homepage
`bat-headline-default`×20, `bat-card-blurb`×19, `bat-image-default`×17, `bat-section-default`×15, `bat-card-mastheadzonnic`×15, `bat-card-blog`×15, `bat-text-default`×14, `bat-hero-zonnic`×6, `bat-carousel-zonnictabsync`×4, `bat-cta-default`×4, `bat-cta-loggedin`×4, `bat-section-modal`×3, `bat-locationselector-zonnic`×3, `bat-form-loginzonnic`×2, `bat-minicart-zonnic`×2, `bat-carousel-product`×2, `bat-form-signup`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-messagebar-zonnic`×1, `bat-footer-zonnic`×1

### newsletter
`bat-image-default`×4, `bat-headline-default`×4, `bat-text-default`×4, `bat-form-signup`×4, `bat-locationselector-zonnic`×3, `bat-form-loginzonnic`×2, `bat-section-modal`×2, `bat-minicart-zonnic`×2, `bat-section-default`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-footer-zonnic`×1

### pouches-zonnic-mint-24-nicotine-pouches
`bat-text-default`×32, `bat-headline-default`×25, `bat-image-default`×17, `bat-section-default`×16, `bat-card-mastheadzonnic`×15, `bat-cta-default`×8, `bat-cta-loggedin`×4, `bat-section-modal`×3, `bat-locationselector-zonnic`×3, `bat-form-loginzonnic`×2, `bat-minicart-zonnic`×2, `bat-carousel-product`×2, `bat-hero-zonnic`×2, `bat-form-signup`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-messagebar-zonnic`×1, `bat-producthero-zonnic`×1, `bat-faq-default`×1, `bat-footer-zonnic`×1

### sign-up
`bat-text-default`×8, `bat-headline-default`×6, `bat-section-modal`×4, `bat-form-signup`×4, `bat-cta-loggedin`×4, `bat-image-default`×3, `bat-locationselector-zonnic`×3, `bat-section-default`×3, `bat-form-loginzonnic`×2, `bat-minicart-zonnic`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-messagebar-zonnic`×1, `bat-footer-zonnic`×1

### store-locator
`bat-image-default`×41, `bat-text-default`×20, `bat-headline-default`×14, `bat-cta-default`×8, `bat-section-default`×7, `bat-carousel-zonnictabsync`×4, `bat-cta-loggedin`×4, `bat-section-modal`×3, `bat-locationselector-zonnic`×3, `bat-form-loginzonnic`×2, `bat-minicart-zonnic`×2, `bat-card-mastheadzonnic`×2, `bat-form-signup`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-messagebar-zonnic`×1, `bat-mapboxstorelocator-zonnic`×1, `bat-footer-zonnic`×1

### testingblogarticletemplate
`bat-text-default`×15, `bat-headline-default`×12, `bat-image-default`×6, `bat-cta-loggedin`×4, `bat-section-modal`×3, `bat-locationselector-zonnic`×3, `bat-section-default`×3, `bat-card-blog`×3, `bat-form-loginzonnic`×2, `bat-minicart-zonnic`×2, `bat-form-newsletterzonnic`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-messagebar-zonnic`×1, `bat-cta-default`×1, `bat-footer-zonnic`×1

### what-is-zonnic
`bat-text-default`×52, `bat-image-default`×43, `bat-headline-default`×39, `bat-section-default`×17, `bat-cta-default`×8, `bat-hero-zonnic`×4, `bat-cta-loggedin`×4, `bat-section-modal`×3, `bat-locationselector-zonnic`×3, `bat-form-loginzonnic`×2, `bat-minicart-zonnic`×2, `bat-cta-account`×2, `bat-form-signup`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-messagebar-zonnic`×1, `bat-faq-default`×1, `bat-footer-zonnic`×1

### why-zonnic
`bat-image-default`×61, `bat-text-default`×28, `bat-headline-default`×25, `bat-card-blurb`×15, `bat-section-default`×14, `bat-cta-default`×8, `bat-carousel-zonnictabsync`×4, `bat-cta-loggedin`×4, `bat-section-modal`×3, `bat-locationselector-zonnic`×3, `bat-form-loginzonnic`×2, `bat-minicart-zonnic`×2, `bat-hero-zonnic`×2, `bat-carousel-product`×2, `bat-form-signup`×2, `bat-agegate-zonnic`×1, `bat-header-zonnicheadless`×1, `bat-messagebar-zonnic`×1, `bat-faq-default`×1, `bat-footer-zonnic`×1
