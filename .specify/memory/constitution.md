<!--
=== Sync Impact Report ===
Version change: N/A → 1.0.0 (initial ratification)
Added principles:
  - I. Code Quality (NEW)
  - II. Performance & Optimization (NEW)
  - III. Security (NEW)
  - IV. Accessibility (NEW)
  - V. Maintainability & Minimal Technical Debt (NEW)
  - VI. Testing (NEW)
  - VII. Specification-Driven Development (NEW)
  - VIII. Observability & Monitoring (NEW)
Added sections:
  - EDS Technical Standards (NEW)
  - Development Workflow & Coding Standards (NEW)
  - Governance (NEW)
Removed sections: none
Templates validated:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check section is generic)
  - .specify/templates/spec-template.md ✅ compatible (requirements are generic)
  - .specify/templates/tasks-template.md ✅ updated (aligned test-first language with Principle VI implementation-first approach)
  - .specify/templates/checklist-template.md ✅ compatible (generic checklist structure)
  - .specify/templates/agent-file-template.md ✅ compatible (generic agent file)
  - No command templates found in .specify/templates/commands/
Deferred items: none
-->

# AEM Edge Delivery Services Constitution

## Core Principles

### I. Code Quality

All code MUST meet enterprise-grade quality standards. In the context of
AEM Edge Delivery Services this means:

- Vanilla JavaScript (ES6+) with no transpiling and no build steps.
  Every `.js` file MUST use standard ES module syntax with explicit
  `.js` extensions on imports.
- CSS3 with modern browser-supported features only. No preprocessors
  (Sass, Less, PostCSS) and no utility frameworks (Tailwind) unless the
  entire team explicitly agrees.
- HTML5 semantic markup decorated client-side; server-rendered canonical
  content MUST NOT be replaced by client-side rendering except for
  non-canonical, dynamic blocks (listings, applications).
- Airbnb ESLint rules and Stylelint standard configuration MUST pass
  with zero errors before any code is merged.
- All CSS selectors inside a block file MUST be scoped to that block
  (`.blockname .selector`) to prevent style leakage.
- The `!important` rule MUST NOT be used except in rare, isolated,
  and explicitly justified cases.

**Rationale**: EDS projects are buildless and rely on the browser's
native module system. Keeping code vanilla ensures any developer can
onboard instantly and that the loading pipeline stays predictable.

### II. Performance & Optimization

Web performance is the primary technical success metric. Every change
MUST preserve or improve Lighthouse and Core Web Vitals scores:

- Mobile and Desktop PageSpeed Insights scores MUST remain at 100.
  PRs that lower the score below 100 MUST NOT be merged.
- The three-phase loading model (Eager → Lazy → Delayed) MUST be
  respected:
  - **Eager**: Only resources required for LCP. Aggregate payload
    before LCP MUST stay below 100 KB. No second-origin connections
    before LCP.
  - **Lazy**: Remaining sections, blocks, and same-origin assets.
    No third-party scripts in this phase.
  - **Delayed**: Third-party tags, analytics, consent management.
    MUST start at least 3 seconds after LCP.
- Fonts MUST be loaded asynchronously after LCP using the font-fallback
  technique. Preloading fonts is prohibited.
- No early hints, HTTP/2 push, or preconnect directives that consume
  the pre-LCP bandwidth budget.
- Images MUST use `loading="lazy"` except for the LCP candidate image
  in the first section.
- No JavaScript frameworks in the LCP critical path. Frameworks are
  permitted only for isolated application-like functionality that does
  not affect CWV.
- `head.html` MUST remain minimal: no inline scripts, no inline styles,
  no marketing technology, no tag managers.
- Minification is NOT required; files MUST be kept small by design
  (block-scoped architecture). If a single JS or CSS file exceeds 20 KB,
  it MUST be reviewed for decomposition.

**Rationale**: EDS achieves its value proposition through near-perfect
web performance. Every byte and every connection in the critical path
directly impacts user experience, SEO ranking, and business outcomes.

### III. Security

All code is client-side and served on the public web. Security practices
MUST account for this exposure:

- Secrets, API keys, passwords, and tokens MUST NEVER appear in the
  repository or in client-side code.
- All user-supplied input rendered into the DOM MUST be sanitized to
  prevent XSS.
- Third-party scripts MUST be loaded in the Delayed phase and MUST be
  evaluated for supply-chain risk before inclusion.
- Dependencies MUST be kept up to date. Renovate or equivalent
  automated dependency management MUST be configured.
- The `.hlxignore` file MUST be maintained to prevent unintended files
  from being served.
- Content Security Policy headers SHOULD be configured via
  `custom-headers` when the project is in production.

**Rationale**: Because EDS code is fully public and runs in the visitor's
browser, the attack surface is broad. Defence-in-depth at the code level
is the only reliable mitigation.

### IV. Accessibility

All deliverables MUST conform to WCAG 2.2 Level AA:

- Semantic HTML5 elements MUST be used (headings, landmarks, lists,
  buttons vs. divs).
- Heading hierarchy MUST be sequential (no skipped levels).
- All interactive elements MUST be keyboard-operable and have visible
  focus indicators.
- All non-text content MUST have text alternatives (`alt` attributes,
  `aria-label` where appropriate).
- ARIA attributes MUST be preferred over custom CSS classes for state
  (e.g., `aria-expanded` instead of `.is-open`) and SHOULD be
  leveraged for CSS styling.
- Color contrast MUST meet WCAG 2.2 AA ratios (4.5:1 normal text,
  3:1 large text / UI components).
- Forms MUST have associated labels, error messages, and programmatic
  grouping.
- Dynamic content changes MUST be announced to assistive technology
  via ARIA live regions.

**Rationale**: Accessibility is a legal requirement in most markets, a
moral imperative, and directly measured by Lighthouse. Failures here
block production deployment.

### V. Maintainability & Minimal Technical Debt

The codebase MUST remain easy to understand, modify, and extend:

- The EDS block architecture MUST be preserved: each block is a
  self-contained directory (`blocks/{name}/{name}.js` + `.css`).
- Global styles are split into `styles/styles.css` (eager) and
  `styles/lazy-styles.css` (lazy). Changes MUST respect this boundary.
- `aem.js` MUST NEVER be modified. Project-specific extensions MUST
  live outside the library.
- PRs MUST be small and focused (scaled trunk-based development).
  Long-lived feature branches are prohibited.
- CSS property reordering, indentation changes, and linting rule
  modifications MUST NOT be mixed into functional PRs.
- Content structures (block contracts) MUST be backward-compatible.
  Breaking changes require a migration plan approved before merge.
- Strings displayed to end users MUST be sourced from authored content
  (placeholders or spreadsheets), not hard-coded in JS/CSS.
- Binaries and large static assets MUST NOT be committed to the
  repository; they MUST be authored as content.

**Rationale**: EDS projects are long-lived, multi-team endeavors.
Keeping the codebase simple, conventional, and backwards-compatible
minimizes onboarding friction and reduces the cost of change.

### VI. Testing

Testing MUST validate correctness without blocking development velocity.
This project follows an implementation-first testing approach:

- Code is written first, then validated through testing. Test-Driven
  Development (TDD) is NOT the default workflow.
- `npm run lint` (ESLint + Stylelint) MUST pass with zero errors before
  any PR is opened.
- Google PageSpeed Insights checks (run automatically by the AEM GitHub
  bot) MUST return green for both mobile and desktop on every PR.
- Each PR MUST include a preview URL
  (`https://{branch}--{repo}--{owner}.aem.page/{path}`) so reviewers
  can visually and functionally verify the change.
- Automated browser tests (Playwright or Puppeteer) SHOULD be added for
  complex interactions or regressions, following the testing-blocks
  skill workflow.
- Unit tests SHOULD be added for logic-heavy utilities.
- Content-driven validation: `curl` the local dev server to inspect
  rendered HTML and verify block decoration before committing.

**Rationale**: EDS development relies heavily on visual verification
against live content. The built-in PSI checks and preview URLs provide
a strong quality gate; additional automated tests supplement but do not
replace this workflow.

### VII. Specification-Driven Development

Development MUST be guided by explicit specifications and content
models before implementation begins:

- Every non-trivial feature MUST start with a written specification
  that defines user scenarios, acceptance criteria, and functional
  requirements.
- An implementation plan MUST capture technical context, project
  structure decisions, and a constitution compliance check before
  coding starts.
- Tasks MUST be derived from the specification and plan, organized
  by user story priority so each story can be delivered independently.
- Block development MUST follow a content-first workflow: design the
  content model (author experience) first, review it with stakeholders,
  then implement code.
- Sample or draft content MUST exist before block code is written.
  Use the `/drafts/` folder to isolate work-in-progress content from
  production pages.
- Specifications, plans, and task breakdowns SHOULD live alongside
  the feature code in a discoverable location (e.g., a `specs/`
  directory).

**Rationale**: Content-first, spec-first development prevents wasted
effort, ensures author-developer alignment, and produces predictable,
reviewable deliverables.

### VIII. Observability & Monitoring

Production behavior MUST be measurable and diagnosable:

- Real Use Monitoring (RUM) via AEM's built-in operational telemetry
  MUST be enabled and actively reviewed for CWV regression.
- Client-side errors MUST be catchable and reportable; blocks SHOULD
  use try/catch with structured error context.
- Structured logging patterns MUST be used in any server-side or
  edge-function code (if applicable).
- Performance budgets (LCP < 1560 ms, CLS ≈ 0, TBT minimized) MUST
  be tracked against field data, not just lab scores.
- When Core Web Vitals field data diverges from lab results, the field
  data takes precedence and MUST trigger investigation.

**Rationale**: Lab scores alone are insufficient. Real-world telemetry
closes the feedback loop and ensures the performance promise holds for
actual visitors on real devices and networks.

## EDS Technical Standards

This section codifies platform-specific constraints that span multiple
principles:

- **Project structure** MUST follow the AEM Boilerplate convention:
  `blocks/`, `styles/`, `scripts/`, `fonts/`, `icons/`, `head.html`,
  `404.html`.
- **Three-phase loading** (Eager-Lazy-Delayed) is non-negotiable.
  Violations MUST be caught in code review.
- **Auto-blocking** (`buildAutoBlocks` in `scripts.js`) is the
  mechanism for pattern-based block creation. New auto-blocks MUST be
  documented and tested.
- **Header and Footer** are loaded asynchronously by their respective
  blocks; they MUST NOT be in the eager phase.
- **Content lifecycle** is separate from code lifecycle. Code PRs MUST
  NOT require simultaneous content changes to function; new content
  features activate only after the author previews and publishes.
- **Third-party libraries** MUST be loaded via `loadScript()` inside
  the specific block that needs them, never in `head.html`. Large
  libraries SHOULD use `IntersectionObserver` for lazy loading.
- **Environment URLs** follow the pattern:
  - Preview: `https://{branch}--{repo}--{owner}.aem.page/`
  - Live: `https://main--{repo}--{owner}.aem.live/`

## Development Workflow & Coding Standards

- **Coding standards** are maintained as agent skills stored in
  `.claude/skills/`. All AI-generated and human-written code MUST
  adhere to these skills. When skills are available, agents MUST
  discover and execute them before performing development tasks.
- **Content-first**: Create or identify sample content before writing
  any code. Use `/drafts/{developer}/` folders for work-in-progress
  content.
- **Local development**: Run `npx -y @adobe/aem-cli up --no-open` and
  validate at `http://localhost:3000`. Inspect HTML output via `curl`.
- **Branch strategy**: Scaled trunk-based development. Short-lived
  feature branches, small focused PRs, merge your own PRs only after
  approval.
- **PR requirements**:
  1. Zero linting errors (`npm run lint`).
  2. Green PageSpeed Insights (mobile + desktop).
  3. Preview URL included in PR description.
  4. At least one reviewer approval before merge.
- **Deployment**: Merging to `main` triggers automatic production
  deployment via AEM Code Sync. There is no manual deploy step.

## Governance

This constitution is the highest-authority document for all technical
decisions in this project. When conflicts arise between this constitution
and other guidance, this constitution prevails.

- **Amendment process**: Any team member MAY propose an amendment via
  PR to `.specify/memory/constitution.md`. Amendments MUST include a
  rationale and a Sync Impact Report. Approval from the project lead
  or a designated maintainer is required before merge.
- **Versioning**: The constitution follows semantic versioning:
  - MAJOR: Principle removed, redefined, or backward-incompatible
    governance change.
  - MINOR: New principle or section added, or material expansion of
    existing guidance.
  - PATCH: Clarifications, wording fixes, non-semantic refinements.
- **Compliance review**: Every PR review MUST include a constitution
  compliance check. Reviewers SHOULD verify that changes respect all
  applicable principles (performance, accessibility, security, code
  quality, maintainability).
- **Coding standards enforcement**: Agent skills in `.claude/skills/`
  operationalize this constitution. When a skill conflicts with the
  constitution, the constitution MUST be updated or the skill
  corrected—they MUST NOT coexist in contradiction.
- **Guidance file**: The agent-file at `.specify/templates/agent-file-template.md`
  provides runtime development guidance and MUST be kept aligned with
  this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-03-15 | **Last Amended**: 2026-03-15
