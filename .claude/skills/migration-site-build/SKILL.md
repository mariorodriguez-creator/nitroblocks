---
name: migration-site-build
description: Build EDS blocks, global styles, and site infrastructure from migration-planner block specs. Orchestrates SDD/speckit workflow per component -- each block is built independently based on its organism spec, content model, and token system. Use after migration-design-system to implement the site from the approved design system.
---

# Migration Site Build

Execution Phase 3 of the EDS migration pipeline. Builds the EDS site
component by component from the planner's block specs and the approved
design system.

## When to Use

- After `migration-design-system` produces the approved design system
- To build a specific block from the planner's organism specs
- To set up site foundations (tokens, fonts, global styles)
- To implement integrations and auto-blocking rules

## Scope

This skill is **component-oriented**, not page-oriented:
- Each block is built as an independent unit from its organism spec
- Global styles and tokens are a system-level concern
- Auto-blocking rules define template structure, not individual pages
- Integrations are site-wide infrastructure

Pages are not the unit of work here. Blocks are.

## Input

- **Required:** discovery refined artifacts in `./migration-work/discovery/refined/`:
  - `block-mapping-refined.md` -- authoritative block mapping (reuse/adapt/new)
  - `atomic-inventory-refined.md` -- confirmed atomic hierarchy
  - `variables-refined.css` -- approved CSS custom properties
  - `anatomy-refined.tsx` -- confirmed component anatomy
  - `motion-tokens-refined.json` -- confirmed motion tokens
- **Required:** refined work plan in `./migration-work/discovery/refined-work-plan.md`
- **Required:** design system from `migration-design-system`:
  - `./migration-work/design-system/token-mapping.md` -- Pencil → CSS mapping
- **Reference:** designlang raw extraction in `./migration-work/design-extract/`:
  - `*-design-language.md` -- design rationale and usage guidelines
  - `*-agent-rules.md` -- design rules to follow during implementation
- **Optional:** specific block name or work item ID to build

## Output

- Implemented blocks in `blocks/{name}/`
- Updated global styles in `styles/`
- Auto-blocking rules in `scripts/scripts.js`
- Integration code in `scripts/delayed.js`

## Workflow

### Step 0: Load Context

Read from the planner proposal:
1. `04-block-mapping.md` -- full block inventory with specs
2. `05-work-items.md` -- BUILD- items with dependencies and sizing
3. Token mapping from `./migration-work/design-system/token-mapping.md`

Organize into three tracks:
- **Track A: Foundations** -- global styles, tokens, fonts (FOUND/ATOM items)
- **Track B: Blocks** -- individual block components (BLOCK-NEW, BLOCK-ADAPT items)
- **Track C: Infrastructure** -- integrations, auto-blocking, delayed.js (BUILD-INT, TMPL items)

Tracks A and C are system-level. Track B is component-level, one block at a time.

### Step 1: Foundation Setup (Track A)

System-level work. Do this once before any blocks.

**1a. Token integration**

Start from `variables-refined.css` (discovery-approved properties) and apply the
token mapping from `token-mapping.md` (Pencil → CSS mapping). This produces
the final `:root` declaration for `styles/styles.css`.

Include motion tokens from `motion-tokens-refined.json` as CSS custom properties
(durations, easing functions).

Follow `eds-styles` skill for naming conventions.

```css
:root {
  --color-primary: #...;
  --heading-font-family: '...';
  --body-font-family: '...';
  --spacing-xs: 4px;
  --spacing-s: 8px;
  --transition-fast: 150ms ease-out;
  --transition-normal: 300ms ease-in-out;
  /* ... all normalized tokens */
}
```

**1b. Font setup**

- Source fonts (self-hosted in `fonts/`)
- Create `styles/fonts.css` with `@font-face` declarations
- Configure font fallbacks per EDS font-fallback technique
- Fonts load after LCP (lazy phase)

**1c. Global default content styling**

Atom-level styling in `styles/styles.css`:
- Heading hierarchy using typography tokens
- Body text, links, lists
- Button auto-decoration rules in `scripts/scripts.js`
- Icon system setup

### Step 2: Block Development (Track B)

Each block is an independent unit of work. Build one at a time.

**For each block, consult `04-block-mapping.md` to determine the approach:**

#### 2a. Adapt an existing block (BLOCK-ADAPT)

- Identify the Block Collection source via `block-collection-and-party`
- Add required variants (CSS classes, JS decoration changes)
- Ensure token usage follows the design system
- Follow `building-blocks` skill patterns

#### 2b. Develop a new block (BLOCK-NEW)

The planner provides per organism:
- Proposed name, content model sketch, variant axes
- JS complexity, CSS complexity, reference block

**Feed into the speckit workflow:**

1. **speckit-specify** -- create `spec.md` from the planner's organism description.
   Include: content model from `04-block-mapping.md`, variant axes, complexity,
   reference block.

2. **speckit-plan** -- generate implementation plan. Reference the token mapping
   for CSS variables and the design system from Pencil.

3. **speckit-tasks** -- generate ordered implementation tasks.

4. **speckit-implement** -- execute. This invokes `content-driven-development`
   and `building-blocks` internally.

#### 2c. Per-block verification

After each block is built:
1. Ensure test content exists (from speckit's CDD workflow)
2. Verify block renders with test content in dev server
3. Run `npm run lint`
4. Verify token usage (block CSS uses design system variables, not hardcoded values)
5. Verify block isolation (no side effects on other blocks)

### Step 3: Infrastructure (Track C)

System-level work. Can run in parallel with block development.

**3a. Header and footer**

Build as blocks via the speckit workflow (Step 2b). These are typically the most
complex blocks -- priority is high because many other blocks depend on the
overall page structure.

**3b. Auto-blocking rules**

For each template in `03-atomic-inventory.md` (Templates section):
- Add auto-blocking logic in `scripts/scripts.js` `buildAutoBlocks()` function
- Follow EDS auto-blocking patterns (template-based, link-based)

**3c. Integration setup**

For each BUILD-INT work item:

| Strategy | Implementation |
|----------|---------------|
| **preserve** | Add script in `scripts/delayed.js` |
| **replace** | Build replacement block (back to Step 2) or EDS-native approach |
| **requires-solution** | Architecture decision + custom implementation |

**3d. Delayed.js organization**

All martech, consent, chat, and non-critical third-party scripts go in
`scripts/delayed.js`. Loaded >= 3s after LCP. Keep TBT at zero.

### Step 4: System Verification

After all blocks and infrastructure are built:
1. Run `npm run lint` -- must pass across all files
2. Start dev server and verify all blocks render with test content
3. Check no Lighthouse regression on test pages
4. Verify token consistency across all blocks

## How to Test This Skill

To validate a single block build:
- Pick one organism from `04-block-mapping.md`
- Run Step 2b (speckit workflow) for that block only
- Verify: content model works, renders correctly, lint passes
- Compare actual effort against planner's t-shirt estimate

This tests the skill's ability to translate planner specs into working blocks,
without building the entire site.

## Related Skills

- **migration-planner** -- produces block specs
- **migration-design-system** -- produces token mapping
- **speckit** skills -- SDD workflow for each block
- **content-driven-development** -- CDD methodology (invoked by speckit)
- **building-blocks** -- block implementation patterns
- **eds-styles** -- CSS conventions for token usage
- **eds-wcag** -- accessibility per block
