# T-Shirt Estimation Guide for EDS Migrations

Calibrated for AEM Edge Delivery Services: buildless, content-first, vanilla
JS/CSS, Lighthouse 100 constraint, block isolation model.

## Size Definitions

| Size | Hours | Days | Description |
|------|-------|------|-------------|
| XS | 1-2h | < 0.5d | Trivial change, single file, no risk |
| S | 2-4h | 0.5-1d | Small focused task, one concern |
| M | 4-8h | 1-2d | Moderate task, multiple files or decisions |
| L | 8-16h | 2-3d | Complex task, multiple concerns, testing needed |
| XL | 16-40h | 3-5d | Large task, cross-cutting, architectural decisions |

## Estimation by Category

### Foundations (FOUND- / DS-)

| Work Item | Size | Rationale |
|-----------|------|-----------|
| Define color tokens in `:root` | XS | Single CSS file, mechanical mapping |
| Define typography scale + font setup | S | Font hosting, fallback config, CSS vars |
| Define full token system (colors + type + spacing + shadows + radii) | M | Multiple token categories, design decisions |
| Dark mode token layer | M | Duplicate token set, theme switching logic |
| Motion token implementation | S | CSS animations/transitions from extracted tokens |
| Full design system in Pencil | L | Token entry + atom/molecule/organism frames |

### Atoms (ATOM-)

| Work Item | Size | Rationale |
|-----------|------|-----------|
| Button auto-decoration rules | XS | CSS classes + scripts.js decoration |
| Heading hierarchy styling | XS | CSS only, follows type scale |
| Icon system setup | S | SVG pipeline, icon naming, CSS |
| Default content styling (full) | S | All semantic elements, responsive |
| Image handling conventions | XS | CSS for responsive images |

### Blocks -- Existing (BLOCK-ADAPT-)

| Work Item | Size | Rationale |
|-----------|------|-----------|
| Add CSS-only variant to existing block | XS | New class, CSS rules |
| Add variant requiring JS decoration changes | S | JS + CSS changes, test |
| Add responsive variant (new breakpoint behavior) | S | CSS media queries |
| Add complex variant (new DOM structure) | M | JS decoration + CSS + content model update |

### Blocks -- New Development (BLOCK-NEW-)

| Work Item | Size | Rationale |
|-----------|------|-----------|
| CSS-only block (no JS, pure styling) | S | CSS file only, block class scoping |
| Simple block (decoration-only JS) | M | JS decoration + CSS, follows boilerplate pattern |
| Interactive block (tabs, accordion, carousel) | L | JS state management + a11y + CSS + testing |
| Async-data block (fetches external data) | L | JS fetch + loading states + error handling |
| Complex block (multi-variant + interactive + responsive) | XL | Full JS + CSS + multiple variants + thorough testing |

### Templates (TMPL-)

| Work Item | Size | Rationale |
|-----------|------|-----------|
| Simple auto-blocking rule | XS | Single condition in scripts.js |
| Template with multiple auto-blocks | S | Multiple conditions, ordering logic |
| Authoring guide per template | S | Documentation, examples, screenshots |
| Complex template (conditional blocks + metadata) | M | Multiple auto-blocks + section metadata |

### Header / Footer / Navigation

| Work Item | Size | Rationale |
|-----------|------|-----------|
| Simple header (logo + nav links) | M | JS decoration, responsive menu, a11y |
| Complex header (mega-menu, search, auth) | XL | Multi-level nav, JS interactions, responsive |
| Simple footer (links + legal) | S | Mostly CSS, simple decoration |
| Complex footer (multi-column, newsletter, social) | M | More decoration, form integration |

### Integrations (BUILD-INT-)

| Work Item | Size | Rationale |
|-----------|------|-----------|
| Analytics tag in delayed.js | XS | Script injection, single file |
| Consent management (OneTrust/CookieBot) | S | delayed.js + conditional loading |
| Simple form (contact, newsletter) | M | Endpoint, validation, block |
| Complex form (multi-step, CRM integration) | L | Multiple blocks, API calls, validation |
| Search integration (Algolia/Coveo) | XL | New block, API, indexing, UI |
| Auth/login flow | XL | Edge workers, token management, protected content |
| E-commerce integration | XL | Cart, checkout, payment, product data |
| Chat widget (Intercom/Zendesk) | S | delayed.js script injection |
| Video embed block | S | Block with lazy loading |
| Social embed/share | XS | Simple block or default content |
| Maps integration | S | Block with API key management |

### Content Migration (MIGRATE-)

| Work Item | Size | Rationale |
|-----------|------|-----------|
| Migration script setup (batch orchestrator) | M | Script to loop pages through page-import |
| Simple template batch (10-20 pages) | S | Mostly automated, review checkpoint |
| Medium template batch (20-50 pages) | M | More review, edge cases |
| Large template batch (50-100+ pages) | L | Significant review, iteration |
| SEO redirect mapping | S | Spreadsheet + redirect rules |
| Media asset migration | S | Bulk download + organization |

### Testing and UAT (TEST-)

| Work Item | Size | Rationale |
|-----------|------|-----------|
| Visual regression setup | M | Tool config, baseline capture |
| Lighthouse verification (all templates) | S | Automated CI check |
| WCAG audit (all templates) | M | Automated + manual review |
| Content author UAT | M | Training, feedback collection, iteration |
| Go-live checklist execution | S | DNS, CDN, redirects, monitoring |
| Hypercare period | M | 1-2 weeks of monitoring and fixes |

## Aggregation Rules

When summing work items to phase totals:
- Use the **midpoint** of each size range for planning estimates
- Use the **max** of each size range for risk-adjusted estimates
- Parallel work reduces calendar time but not total effort
- Add 15-20% contingency buffer to total

| Size | Midpoint (hours) | Max (hours) |
|------|-----------------|-------------|
| XS | 1.5 | 2 |
| S | 3 | 4 |
| M | 6 | 8 |
| L | 12 | 16 |
| XL | 28 | 40 |
