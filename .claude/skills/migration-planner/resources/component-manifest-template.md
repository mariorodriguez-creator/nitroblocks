# Component Manifest Authoring Guide

The component manifest is the input to `extract-components.mjs`. It drives the
forensic atomic inventory — every atom/molecule/organism listed here becomes a
subfolder under `migration-work/components/` with real DOM evidence, computed
CSS and cropped screenshots.

## How to build the manifest

1. **Survey DOM class patterns across every scraped page** using the classes
   and custom elements harvested from `migration-work/pages/*/cleaned.html`.
   Look for:
   - Custom web components (`<my-component>` tags)
   - Class prefixes that identify a component family (e.g. `bat-*`, `cmp-*`,
     `zui-*`, framework class patterns like `MuiButton-*`)
   - Repeated modifier classes (`--primary`, `-dark`, `-sm`)
2. **Count occurrences and page spread** for each class / tag. Heavy +
   site-wide spread = an atom or global organism (button, header, footer).
   Heavy + page-local spread = a molecule (a nav-item repeated inside a
   single nav). Singletons or low-spread = organism (hero, faq, store-
   locator).
3. **Cross-reference with `design-extract/*-screenshots.json`** to verify a
   designlang cluster exists for each atom you catalogue. If designlang
   missed a cluster, rely on DOM evidence instead — designlang's component
   detector is a heuristic and routinely under-catalogues custom web
   components.
4. **Cross-reference with `structure/*.md`** and `verification/anatomy-diff.md`
   for organism placement. Every organism listed there should appear in the
   manifest.

## Placement rules

**Atom** — a single-purpose element with no further decomposition.
- Single HTML element or a web-component that wraps one
- Has state variants (primary / secondary) but no internal slots
- Examples: button, link, icon, input, headline, text

**Molecule** — a small composition of atoms with a single intent.
- Multiple atoms arranged to serve one behaviour (form-field = label + input + hint)
- Repeats inside organisms; rarely stands alone on a page
- Examples: form-field, cta-list, nav-item, modal-shell, breadcrumb

**Organism** — a standalone section of an interface.
- Full page section; would have its own EDS block
- Examples: header, footer, hero, card-variants, carousels, forms, age-gate

## Manifest schema

```json
{
  "site": "zonnic.ca",
  "source": "https://www.zonnic.ca/ca/en",
  "pages": {
    "homepage": "https://www.zonnic.ca/ca/en",
    "product-detail": "https://www.zonnic.ca/ca/en/pouches/zonnic-mint-24-nicotine-pouches"
  },
  "coverage": {
    "chromeTags": [
      "bat-section-default",
      "bat-section-modal",
      "cs-native-frame-holder"
    ],
    "notes": "Custom-element tags dismissed by verify-component-coverage.mjs because they are structural wrappers / third-party widgets, not discrete components."
  },
  "atoms": [
    {
      "name": "button",
      "description": "Primary interaction atom. Triggers an action.",
      "regulatory": false,
      "observedPages": ["homepage", "product-detail", "sign-up"],
      "domFingerprint": [".bat-cta-style", ".bat-button"],
      "variants": [
        {
          "name": "primary",
          "hint": "Filled navy pill, white text, ALL CAPS.",
          "selector": ".bat-cta-style.button-dark, .bat-button--dark",
          "samplePage": "homepage"
        },
        {
          "name": "secondary",
          "hint": "Outlined navy pill, navy text, ALL CAPS.",
          "selector": ".bat-cta-style.button-secondary-dark",
          "samplePage": "homepage"
        }
      ],
      "edsMapping": {
        "strategy": "default-content + scripts.js decoration",
        "notes": "Authors write a link; scripts.js promotes to .button .primary / .button .secondary."
      }
    }
  ],
  "molecules": [ ... ],
  "organisms": [ ... ]
}
```

### Field reference

| Field | Required | Notes |
|-------|---------|-------|
| `name` | yes | lowercase-hyphenated slug. Becomes the folder name |
| `description` | yes | single sentence — what the component is for |
| `regulatory` | no | `true` for regulator-mandated patterns (age gate, health warning, location selector). Forces `preserve` strategy + audit-trail requirement |
| `observedPages` | yes | page keys from the `pages` map where the component appears |
| `domFingerprint` | yes | array of CSS selectors that reliably identify any instance. Used for statistics in the README and as a fallback |
| `variants` | yes | at least one variant entry. Use `"name": "default"` when there is only one |
| `variants[].selector` | yes | selector that uniquely matches this variant (e.g. button-dark vs button-secondary-dark) |
| `variants[].samplePage` | yes | page to visit when extracting evidence for this variant |
| `variants[].hint` | no | human description of the variant for the README |
| `edsMapping.strategy` | yes | one of: `default-content`, `default-content + scripts.js decoration`, `existing-block:{name}`, `adapt-block:{name}`, `new-block:{name}`, `preserve-third-party` |
| `edsMapping.notes` | no | rationale or additional context |
| `coverage.chromeTags` | no | Top-level array of custom-element tag names that `verify-component-coverage.mjs` should dismiss as non-component chrome (section wrappers, chat widgets, internal sub-pieces). Use after Phase 3g review when a surfaced tag is confirmed NOT to be a discrete component |
| `pages` entries | yes | Must resolve to the on-disk page slugs under `migration-work/pages/`. The coverage verifier matches by canonical URL, so keep URLs exactly as they appear in each page's `metadata.json`. |

## Coverage loop (Phase 3g)

After running `extract-components.mjs`, always run:

```bash
node .claude/skills/migration-planner/scripts/verify-component-coverage.mjs
```

Treat the three outputs as the acceptance gate for the manifest:

- **`observedPages` mismatches = 0** — if a variant's sample page shows no
  match, your `samplePage` / `observedPages` / selector is wrong.
- **Dead components = 0** — if a component matches zero pages anywhere,
  either the selector is wrong or the component isn't actually in the
  representative set.
- **Un-catalogued custom-element tags = 0** — every surfaced tag is
  either (a) a component to add to the manifest, (b) a variant/fingerprint
  of an existing entry, or (c) a chrome element added to
  `coverage.chromeTags`.

Iterate until the report is clean before moving to EDS mapping.

## Good hygiene

- Keep the variant list short (≤ 5 per atom). Extra variants belong in the DS
  normalization stage, not the planner.
- Prefer a selector that uses **only** the variant's distinguishing class — do
  not stack `body.class` or DOM-depth-dependent chains. If the variant
  requires complex context to match, note it in `hint` and use a simple class
  selector with a `nth-of-type` qualifier.
- Every organism must have `edsMapping.strategy` set so downstream skills can
  plan. `new-block:*` is fine — don't invent existing block names.
