# PDP Template — Block Structure

This document describes the block structure for the Product Detail Page (PDP) template. Each section defines the block type, content model, and layout behaviour. Content examples reference the Spearmint PDP (https://www.zonnic.ca/ca/en/pouches/zonnic-spearmint-24-nicotine-pouches) but the structure applies to all product pages — actual content will vary per product.

---

# Header

The site header appears on every page. It uses the existing **header** block with Zonnic branding.

## Content

**Logo bar** (top row):
- The site logo, linking to the homepage

**Navigation bar** (second row):
- Primary navigation items, each preceded by a small icon
- Displayed in uppercase, evenly spaced, dark navy text. Hover state changes colour. No active/current page indicator
- e.g. "NICOTINE POUCHES", "WHAT IS ZONNIC", "WHY ZONNIC", "QUIT ZONE", "BLOG", "HELP", "STORE LOCATOR"

**Utility bar** (integrated into the logo row, right side):
- A promotional CTA button (e.g. "QuitZone")
- Country/language selector showing current province and flag
- Login link with user icon
- A secondary link (e.g. "Healthcare Practitioners")

**Announcement banner** (third row):
- Full-width teal/mint background strip
- Centred copy with an inline link
- e.g. "Quit smoking on your own terms. Try the new QuitZone experience. Get started."

## Layout

1. Desktop: Three stacked rows, full-width with content constrained to page max-width
   1. Row 1: Logo left-aligned, utility links right-aligned. White background
   2. Row 2: Navigation items centred horizontally, evenly spaced. White background
   3. Row 3: Announcement banner — full-width teal/mint background, centred text with link
2. Mobile: Single compact row
   1. Logo on the left, hamburger menu icon on the right
   2. When the hamburger is tapped, a navigation panel slides in from the right
   3. The panel contains the navigation items as stacked rows (icon + link), separated by horizontal divider lines
   4. The panel appears below the header bar and is independently scrollable
   5. The hamburger icon transforms into an X close icon while the panel is open
   6. Tapping the X closes the panel

---

# Product Hero

The first content section on the page, immediately below the header. It presents the main product information in a two-column layout. This is a **new block** (`product-detail` in the migration analysis).

## Content

**Image gallery** (left side on desktop, top on mobile):
- A large product image at roughly 1:1 aspect ratio, set against a gradient background covering the full column
- Multiple product images (typically 3) that the user can cycle through
- A row of square thumbnails below the active image, with an indicator above the active one. Clicking a thumbnail swaps the main image
- Previous/Next arrows on either side of the main image
- e.g. front of can, back of can, close-up of pouch

**Product info** (right side on desktop, below on mobile):
- **Product name** — the main heading, bold uppercase (e.g. "ZONNIC Nicotine Pouches")
- **Flavour** — secondary heading, bold uppercase (e.g. "MINT")
- **Package format** — tertiary heading, bold uppercase (e.g. "Regular - 24 pouches")
- **Expandable product description** (see sub-component below)
- **Buy panel** (see sub-component below)
- **Store locator CTA** — a secondary button linking to the store locator page (e.g. "FIND NEAREST STORE")

### Sub-component: Expandable Product Description

The product description is authored as a bullet list but displayed collapsed by default — only the first bullet is visible. A "Read more" link toggles the full list open/closed.

Typical bullet items include:
- Flavour profile and taste intensity
- Nicotine content per unit
- Product category explanation (e.g. NRT, how it works)
- Ingredients list
- Allergen warnings
- Dietary notes (e.g. "No sucrose added")

### Sub-component: Buy Panel

A branded purchase callout panel inside the product info area. This is a structured, boxed component — not a simple link:

- **Header** — includes the partner name and logo (e.g. "Buy **ZONNIC** online via **felix**")
- **Numbered step flow** — typically 3 steps explaining the purchase process (e.g. 1. Choose your product, 2. Get redirected, 3. Complete purchase)
- **CTA** — a primary button linking to the external purchase partner

Authors provide the partner name, logo, steps, and CTA link. If the partner changes, authors update the content without a code change.

## Layout

1. Desktop: Two-column layout, roughly 50/50 split
   1. Left column: Image gallery with gradient background
   2. Right column: Product info stacked vertically — name, flavour, format, expandable description, buy panel, then both CTAs side by side
2. Mobile: Single-column, stacked layout
   1. Image gallery on top (full width, with swipe navigation)
   2. Product info below, full width

---

# Default Content — Product Label Download

A short section immediately below the product hero. This is **default content** (no block needed).

## Content

- **Text** — a sentence prompting the user to download product details (e.g. "Download the product label for more details.")
- **CTA** — a button linking to a PDF file (e.g. "DOWNLOAD PDF")

## Layout

1. Desktop and mobile: Left-aligned text with the button below it. Full-width section, content constrained to page max-width.

---

# Default Content — Product Range Introduction

A centred statement section that introduces the product range. This is **default content** (no block needed).

## Content

- **Headline** — bold uppercase, centred (e.g. "A FRESH SPIN ON QUITTING.")
- **Statement** — body copy, centred below the headline (e.g. "ZONNIC is now available in three different mint flavours.")

## Layout

1. Desktop and mobile: Both lines centred horizontally within a white-background section. Generous vertical padding. Acts as an intro heading for the product carousel that follows.

---

# Carousel — Product Flavour Cards

A horizontal row of product cards showcasing available flavour variants. Each card links to its respective PDP. This maps to the **carousel (product)** variant identified in the migration analysis.

## Content

Each card contains:
- **Image** — a product image displayed on the right side of the card
- **Headline** — a flavour tagline, bold uppercase (e.g. "A BALANCED SPEARMINT BLEND.")
- **CTA** — a button linking to that variant's PDP (e.g. "Learn more")

The number of cards matches the number of available product variants (e.g. 3 flavours).

## Layout

1. Desktop: Cards side by side in a row, equal width, light grey background. Each card has a horizontal layout (text left, image right) with a dark navy outline border and rounded corners
2. Mobile: Cards stack vertically or scroll horizontally as a carousel with swipe navigation

---

# Testimonial Teaser

A promotional section that highlights user stories and invites visitors to explore testimonials. This maps to a **columns** block or a custom teaser layout.

## Content

- **Image** — a lifestyle photograph (e.g. group of testimonial subjects sitting together)
- **Title** — bold, dark navy, uppercase (e.g. "THEY CHOSE TO QUIT SMOKING.")
- **Subtitle** — same heading in a lighter weight/colour, creating a two-tone effect (e.g. "YOU CAN TOO.")
- **Text** — body copy with brand emphasis (e.g. "Real stories. Real success. **THIS IS ZONNIC**.")
- **CTA** — an arrow-link (not a button), uppercase, linking to the testimonials landing page (e.g. "GET TO KNOW THEIR STORIES →")

## Layout

1. Desktop: Two-column layout within a light grey background section
   1. Left column: Lifestyle photo, roughly 40–50% width
   2. Right column: Title, subtitle, text, and CTA stacked vertically, vertically centred
2. Mobile: Single-column — image on top, text content below

---

# Columns — Image + Text

A two-column section pairing editorial text with a product or lifestyle image. This uses the existing **columns** block. This pattern can repeat multiple times on a PDP with different content.

## Content

- **Column 1** (text):
  - **Headline** — bold uppercase (e.g. "ALL NEW. ALL FRESH FLAVOURS.")
  - **Text** — one or more body paragraphs (e.g. "ZONNIC's lineup just got extended. The new mint flavours now feature distinct flavour notes, sensations, and tastes.")
  - **CTA** (optional) — a button or arrow-link
- **Column 2** (image):
  - A product or lifestyle photograph

The column order may be reversed (image left, text right) for visual variety between consecutive sections.

## Layout

1. Desktop: Two-column layout, roughly 40/60 or 50/50 split. Text column vertically centred
2. Mobile: Single-column — text stacked above (or below) the image

---

# Columns — Text + Video

A two-column section pairing instructional text with an embedded video. This uses the existing **columns** block, with a **video** block embedded in one column.

## Content

- **Column 1** (text):
  - **Headline** — bold uppercase (e.g. "HOW TO OPEN THE CAN?")
  - **Steps** — a series of bold subheadings with body copy (e.g. "TWIST" / "Twist the can to break the seal.", "SQUEEZE" / "Squeeze open the can.", "OPEN" / "Grab a fresh pouch from the main compartment.")
  - **CTA** (optional) — an arrow-link (e.g. "EXPLORE MINT →")
- **Column 2** (video):
  - An autoplaying, looping, muted video demonstrating the instructional content. Plays without visible controls, functioning as an animated product demonstration

**Block dependency**: Requires the **video** or **embed** block from the Block Collection to be added to the project.

## Layout

1. Desktop: Two-column layout, roughly 40/60 split
   1. Text column: Headline, steps, and CTA stacked vertically
   2. Video column: Looping video (no visible controls, autoplay)
2. Mobile: Single-column — text stacked above the video

---

# FAQ Accordion

A section with expandable question-and-answer pairs related to the product. This maps to the **accordion (faq)** variant identified in the migration analysis.

## Content

- **Section heading** — centred, bold, uppercase (e.g. "FAQ")
- **Questions** (expandable) — typically 3 product-relevant Q&As. Each question is a clickable row with a "+" icon on the right. Clicking expands the answer below
- e.g. "Is ZONNIC a Natural Health Product (NHP)?", "What are the benefits of using ZONNIC to help you quit smoking?"

Questions and answers vary per product and are author-managed.

## Layout

1. Desktop and mobile: Full-width section, centred. Questions stacked vertically as full-width rows with horizontal divider lines. Expand/collapse icon on the right edge of each row.

---

# Newsletter Signup Bar

A promotional strip that appears on every page between the main content and the footer. Handled as a **fragment** (authored once, embedded on all pages).

## Content

- **Heading** — bold, uppercase, white text (e.g. "SIGN UP FOR OUR ZONNIC NEWSLETTER")
- **Description** — body copy, white text, may include inline links (e.g. "Sign up to receive updates on new products, exclusive offers, and tips via our newsletter directly in your inbox.")
- **CTA** — a button that triggers the signup flow (e.g. "SIGN UP NOW")

## Layout

1. Desktop: Full-width dark navy background. Heading and description on the left, CTA button on the right, vertically centred. Content constrained to page max-width
2. Mobile: Full-width dark navy background. Heading, description, and button stack vertically, centred

---

# Footer

The site footer appears on every page below the newsletter signup bar. It uses the existing **footer** block with Zonnic branding.

## Content

**Brand column** (leftmost):
- The site logo on dark background

**Link columns** (2–3 columns):
- Each has a column heading (bold, uppercase, white text with a rule below) and a list of links
- e.g. "HELP" (Contact Us, FAQ, Store Locator, blog articles), "LEGAL" (Terms of Use, Privacy Policy, UGC Terms)

**Contact column**:
- Column heading (e.g. "GET IN TOUCH")
- Phone number as a clickable link
- Support ticket link
- Business hours
- Social media icon(s)

**Legal disclaimers** (below the columns):
- Regulatory statements, purchase restrictions, jurisdiction notice, testimonials disclaimer, copyright notice
- Small-print paragraphs spanning the full width

## Layout

1. Desktop: Full-width dark navy background. Columns across the top (logo + 2–3 link groups + contact). Legal disclaimer text spans full width below as small-print paragraphs
2. Mobile: Single-column stacked layout — logo, then each link group vertically, then legal disclaimers at the bottom
