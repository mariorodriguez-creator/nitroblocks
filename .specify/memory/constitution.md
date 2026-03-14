# AEM Platform Core Constitution

## Core Principles

### I. Code Quality & Maintainability

All code MUST meet enterprise-grade quality standards to ensure long-term maintainability and developer productivity.

**Mandatory Requirements:**
- Java code MUST follow Oracle Java Code Conventions and adhere to project-specific Checkstyle rules
- HTL/Sightly templates MUST be semantic, avoiding inline JavaScript and minimizing logic
- JavaScript/TypeScript MUST follow ESLint configuration with strict mode enabled
- CSS/SCSS MUST use BEM methodology or component-scoped styling (avoid global styles)
- All public APIs (OSGi services, Sling Models) MUST include JavaDoc with @param, @return, @throws
- Code complexity MUST be justified: cyclomatic complexity >10 requires architectural review
- No deprecated AEM APIs may be used without documented migration path
- SonarQube quality gates MUST pass (0 blocker/critical issues, <3% code duplication)

**Rationale**: AEM projects have long lifecycles (5-10 years). Technical debt compounds rapidly in enterprise CMS platforms where multiple teams contribute. Clear standards prevent degradation and reduce onboarding time for new developers.

### II. Coding Standards & Skill Compliance (NON-NEGOTIABLE)

All code MUST strictly adhere to project-specific coding standards as defined in agent skills to ensure consistency, quality, and maintainability across the entire codebase.

**Rules**:
- All developers and AI assistants MUST consult applicable skills before creating or modifying code
- Skills are maintained in `.claude/skills/` directory, organized by domain (e.g. aem-java-backend, aem-htl-component, aem-styles, aem-dialog, aem-testing, aem-frontend-js, aem-wcag, aem-analytics)
- Code reviews MUST verify adherence to applicable skills
- Deviations from skill guidance MUST be documented with clear justification and approved by technical leadership
- Skills MUST be kept up-to-date as patterns evolve; updates require technical leadership approval
- New team members MUST review all applicable skills during onboarding

**Rationale**: Inconsistent coding patterns create overhead and bugs. Centralized standards — embodied in Agent Skills — ensure all developers and AI produce consistent, proven-pattern code, reducing review cycles and preventing anti-patterns. Agent skills are the single source of truth for implementation patterns.

### III. Testing Standards (NON-NEGOTIABLE)

Testing is mandatory and MUST cover unit, integration, and UI layers before code review.

**Test-First Workflow (Strictly Enforced):**
1. Write failing tests that validate acceptance criteria
2. Obtain approval from stakeholder/reviewer on test scenarios
3. Verify tests fail (Red)
4. Implement minimum code to pass tests (Green)
5. Refactor while maintaining green state
6. No code review accepted without corresponding tests

**Coverage Requirements:**
- Unit tests (JUnit 5, Mockito): ≥80% line coverage for Java services/models
- Integration tests (AEM Mocks, Sling Mocks): All OSGi service interactions

**Frontend (JavaScript) Unit Tests — Optional:**
- **Do NOT** automatically add Jest unit tests for every JS component.
- Unit tests are **optional** for frontend clientlibs and SHOULD only be added when the component contains **isolatable pure logic** (calculations, state transitions, validation, analytics payload building, etc.).
- **Skip** unit tests for decorative components, thin glue/wiring (event delegation, init, setRefs), or components with no meaningful isolatable logic.
- **Test** extracted pure functions and business logic—not component load, param passing, or DOM wiring.
- When in doubt, prefer E2E tests (e.g. Playwright) over brittle unit tests. See `.github/instructions/fe.testing.instructions.md`.

**Test Organization:**
- Unit: `src/test/java/biz/netcentric/digitalxn/aem/{module}/`
- Integration: `digitalxn-aem-ui-tests/digitalxn-aem-ui-tests-automation/`
- Frontend unit (optional): `digitalxn-aem-base-clientlibs-apps/frontend/.../*.test.js`

**Rationale**: AEM projects deploy to production environments serving millions of users. Bugs in content delivery or authoring workflows cause business disruption. Test-first development catches issues before they reach QA, reducing cycle time and defect escape rates.

### IV. Security First

All code MUST be secure by default, following OWASP Top 10 and Adobe Security best practices.

**Mandatory Security Controls:**
- Input validation: All user input MUST be validated against whitelist patterns (regex, allowed values)
- Output encoding: Use OWASP Java Encoder or HTL context-aware encoding (text, html, attribute, uri, js)
- Authentication: Leverage AEM's built-in authentication; no custom auth implementations
- Authorization: Use Sling Resource Access Control (ACLs on /content, /conf paths)
- CSRF protection: All POST/PUT/DELETE endpoints MUST validate Granite CSRF token
- XSS prevention: Never use innerHTML or dangerouslySetInnerHTML; sanitize with OWASP policies
- Secrets management: No credentials in code; use OSGi configurations with AEM Crypto support
- Dependency scanning: Regularly update dependencies; block known CVEs via OWASP Dependency Check
- Dispatcher security: Implement filter rules to block direct access to /apps, /libs, .json selectors

**Security Review Gates:**
- All servlet/filter implementations require security review
- Content-Type headers MUST be explicit (no sniffing)
- HTTPS-only cookies with SameSite=Strict for session management

**Rationale**: Corporate websites are high-value targets. A single XSS vulnerability can lead to account takeover or data breaches. AEM's Java stack requires explicit security measures that are not enforced by framework defaults.

### V. Accessibility (WCAG 2.2 AA Compliance)

All UI components and content MUST be accessible to users with disabilities, meeting WCAG 2.2 Level AA standards.

**Mandatory Accessibility Requirements:**
- All interactive elements MUST be keyboard accessible with visible focus indicators
- All images MUST include descriptive alt text; decorative images marked with empty alt=""
- Color contrast ratios MUST meet WCAG AA minimums (4.5:1 normal text, 3:1 large text)
- All forms MUST include properly associated labels and error messages
- Page structure MUST use semantic HTML5 elements and ARIA landmarks appropriately
- Dynamic content changes MUST be announced to screen readers via ARIA live regions
- Video and audio content MUST have captions and transcripts
- Components MUST be tested with assistive technologies (NVDA, JAWS, VoiceOver)
- Automated accessibility testing (axe, Lighthouse, Pa11y) MUST pass before merge
- Manual testing with keyboard navigation and screen reader MUST be performed for new UI features
- New components MUST include accessibility acceptance criteria in specifications

**Accessibility Testing Gates:**
- Manual: Axe DevTools scans with 0 critical or serious issues. Keyboard-only navigation test for all user journeys.
- Audit: Annual WCAG audit by accessibility specialist

**Rationale**: Accessibility is a legal requirement (ADA, Section 508) and expands audience reach. AEM's authoring interface can inadvertently generate inaccessible markup if components don't enforce accessibility constraints. Building accessibility in from the start is 10x cheaper than retrofitting.

### VI. Performance & Optimization

System performance MUST meet or exceed defined targets to ensure optimal user experience.

**Performance Targets (NON-NEGOTIABLE):**
- Page load time MUST NOT exceed 3 seconds on 3G connection (Lighthouse performance score ≥85)
- AEM component rendering MUST complete within 200ms for 95th percentile requests
- Client-side JavaScript bundles MUST be code-split and lazy-loaded; initial bundle <200KB gzipped
- Images MUST be optimized and served in modern formats (WebP) with appropriate responsive sizes
- Critical rendering path MUST be optimized: inline critical CSS, defer non-critical resources
- Backend queries MUST be indexed; query execution time <100ms for 95th percentile
- Client libraries MUST be minified and cached with appropriate cache headers
- Performance budgets MUST be established and monitored; regressions require justification

**Optimization Requirements:**
- Client libraries: Minify and combine JS/CSS; use categories intelligently (per-page loading)
- Client-side JavaScript bundles MUST be code-split and lazy-loaded; initial bundle <200KB gzipped
- Client libraries MUST be minified and cached with appropriate cache headers
- Images: Use responsive images with srcset; lazy-load below-the-fold images
- Images MUST be optimized and served in modern formats (WebP)
- AEM caching: Implement Sling Dynamic Include for personalized fragments
- Query optimization: All Oak queries MUST use indexes (query performance logs monitored)
- Critical rendering path MUST be optimized: inline critical CSS, defer non-critical resources
- Component efficiency: Avoid deep component hierarchies (max 5 levels); lazy-load dialogs
- CDN usage: Static assets served via CDN with long TTLs (1 year for versioned assets)

**Performance Testing Gates:**
- Load tests: JMeter scripts simulating 1000 concurrent users
- Lighthouse CI: Automated checks on every PR (score regression tolerance: -5 points)

**Rationale**: Performance directly impacts SEO rankings (Core Web Vitals) and conversion rates (1-second delay = 7% conversion drop). AEM's Java architecture can be resource-intensive; proactive optimization prevents performance degradation as content grows.

### VII. Component Architecture (AEM-Specific)

AEM components MUST be modular, reusable, and follow Adobe's recommended patterns.

**Mandatory Requirements:**
- Components MUST be built on Core Components v2.22.0+ (proxy pattern for customization)
- Custom components MUST implement Sling Models with @Model annotation (prefer interface delegation)
- Dialog definitions MUST use Granite UI Touch UI (no Classic UI)
- Components MUST be authored through templates (editable templates, not static)
- Content structure MUST separate /apps (code), /conf (config), /content (authored data)
- No business logic in HTL; use Sling Models or OSGi services
- Component groups MUST be organized by function (e.g., digitalxn.content, digitalxn.structure)
- Resource types MUST follow naming: /apps/digitalxn/base/components/{component-name}/v1/{component-name}

**Rationale**: AEM's component model is the foundation of content authoring. Inconsistent patterns create fragmented authoring experiences and make upgrades difficult. Core Components provide Adobe-tested implementations that reduce maintenance burden.

### VIII. Maintainability & Technical Debt Management

Code MUST be designed for long-term maintainability to ensure sustainable development velocity.

**Rules**:
- Component design MUST follow single responsibility principle; avoid god components
- Dependencies MUST be managed explicitly via Maven; avoid version conflicts and unnecessary transitive deps
- Configuration MUST be externalized using OSGi configs and environment-specific runmodes
- Deprecated AEM APIs MUST be avoided; migration paths documented when legacy APIs used
- Logging MUST be structured and meaningful (SLF4J); appropriate levels (ERROR for exceptions, INFO for business events, DEBUG for diagnostic)

**Rationale**: AEM projects have 5-10 year lifespans. Technical debt accumulation destroys productivity and increases defect rates. Proactive maintainability investment yields 5x ROI over time.

### IX. Observability & Monitoring

All systems MUST be observable to enable rapid diagnosis and resolution of issues.

**Mandatory Observability Practices:**
- Structured logging: Use SLF4J with JSON formatter; include correlation IDs (request tracking)
- Log levels: ERROR (action required), WARN (potential issue), INFO (business events), DEBUG (dev diagnostics)
- Metrics: Expose JMX metrics for OSGi services (invocation count, duration, error rate)
- Error tracking: Integrate with application monitoring (e.g., Splunk, Datadog) for alerting
- Audit logging: Log all authoring changes (who, what, when) to /var/audit
- Dispatcher logs: Monitor cache hit/miss ratios, response times, 5xx errors
- Health checks: Implement custom health checks for critical dependencies (search, DAM, external APIs)
- Request tracing: Enable AEM request logs with timing breakdown (Sling request processing)

**Monitoring Dashboards:**
- Real-time: Response times, error rates, cache hit ratios
- Business: Content publish velocity, authoring session concurrency
- Infrastructure: JVM heap usage, thread pools, disk I/O

**Rationale**: AEM environments are complex (Author, Publish, Dispatcher, CDN layers). Without observability, troubleshooting production incidents is time-consuming and error-prone. Structured logs and metrics enable proactive issue detection and data-driven optimization.

### IX. Project-Specific Context & Configuration

**Statement**: Platform features MUST be designed as reusable capabilities while implementation MUST be adapted to specific project requirements and business contexts defined in the project registry.

**Mandatory Requirements:**
- All specifications MUST identify applicable project(s) from `./specify/memory/projects/` directory
- Feature designs MUST support multi-project reusability; project-specific variations handled via configuration
- Implementation plans MUST document project-specific adaptations (UI variants, workflows, integrations)
- Task breakdowns MUST include project-specific validation steps and acceptance criteria
- New projects MUST be registered in `./specify/memory/projects/` with documented requirements and constraints
- Cross-project dependencies MUST be explicitly declared and validated

**Project Documentation Structure** (`./specify/memory/projects/{project-name}.md`):
- **Business Context**: Project goals, target audience, brand guidelines
- **Technical Constraints**: Infrastructure setup, third-party integrations, performance requirements
- **User Journeys**: Describing multi-page use cases along with the components they use and their specific configuration
- **Test Scenarios**: Project-specific test suites, edge cases, environment configurations, data requirements, and integration testing workflows unique to this project's features and compliance needs

**Example Project Variations**:
- Multi-brand sites with different design systems on shared platform
- Regional variations with compliance requirements (GDPR, accessibility standards)

**Rationale**: DXn's AEM platform serves multiple projects with distinct business requirements, user flows, and brand identities. Generic platform capabilities must be flexible enough to support varied use cases without code duplication. Project-specific configuration ensures maintainability—changes to one project don't inadvertently impact others. Clear project context prevents feature bloat and ensures specifications address real business needs rather than hypothetical requirements.

## Security & Compliance Requirements

### Data Protection
- All Personally Identifiable Information (PII) MUST be handled according to GDPR/privacy regulations
- PII MUST NOT be logged or exposed in error messages
- Data retention policies MUST be implemented and enforced
- User consent MUST be obtained and tracked for cookies and data collection

### Dependency Management
- All dependencies MUST be sourced from approved internal repositories (Azure Artifacts)
- Dependency versions MUST be explicitly declared in parent POM
- Vulnerability scanning MUST run on every build; builds fail on critical vulnerabilities
- License compliance MUST be verified; restrictive licenses (GPL) prohibited without approval

### Deployment Security
- Production credentials MUST be managed via secure vault systems; no plaintext passwords
- CI/CD pipelines MUST enforce security scanning and compliance checks
- Deployment artifacts MUST be signed and verified
- Environment-specific configurations MUST be isolated; no production keys in lower environments

## Technical Standards

### Technology Stack (Locked)
- **AEM Version**: 6.5.15.0 (as defined in pom.xml)
- **Core Components**: 2.22.0+
- **Java**: 11+ (target bytecode 1.8 for AEM compatibility)
- **Maven**: 3.6+ with Azure DevOps artifact repository
- **Frontend Build**: Node 20.16.0, npm 10.8.1
- **Testing**: JUnit 5, Mockito, AEM Mocks, Selenium WebDriver

### Dependency Management
- All dependencies MUST be declared in parent pom.xml with version properties
- Third-party libraries require security review (OWASP Dependency Check)
- Upgrades require regression testing and approval

## Development Workflow

### Branch Strategy
- Feature branches: `feature/###-feature-name` (### = ticket number)
- Release branches: `release/X.Y.Z`
- Hotfix branches: `hotfix/###-description`

### Code Review Requirements
- All changes MUST pass PR review by ≥1 senior developer
- Review checklist: Tests present, security validated, accessibility checked, documentation updated
- No direct commits to main/master branches

### Testing Gates
- Unit tests MUST pass with minimum coverage thresholds before merge
- Integration tests MUST execute successfully in CI pipeline
- UI tests MUST pass for changes affecting user interfaces
- Performance regression tests MUST be run for critical path changes

### CI/CD Pipeline (Azure DevOps)
- Build: Maven clean install with all tests
- Quality gates: SonarQube analysis, Checkstyle, dependency scan
- Deployment: Automated to DEV, manual approval for STAGE/PROD
- Rollback: Automated rollback on health check failure

### Deployment Approval
- QA environment validation required before UAT promotion
- UAT sign-off required before production deployment
- Production deployments require change management approval
- Rollback procedures MUST be tested and documented

### Documentation Requirements
- Feature specs: `./specify/specs/###-feature-name/spec.md` (user stories, acceptance criteria)
- Implementation plans: `./specify/specs/###-feature-name/plan.md` (technical design)
- API documentation: JavaDoc for all public interfaces
- Runbooks: Operational procedures for new features (deployment, monitoring, troubleshooting)
- All new features MUST include user-facing documentation
- Breaking changes MUST include migration guides
- Architecture decisions MUST be recorded in ADR format

## Governance

This constitution is the authoritative source for all development practices on the AEM Platform Core project. All pull requests, code reviews, and architectural decisions MUST demonstrate compliance with these principles.

**Amendment Process:**
1. Proposed amendments MUST be documented with rationale and impact analysis
2. Amendments require approval from technical lead and product owner
3. MAJOR version bump for backward-incompatible changes (principle removal/redefinition)
4. MINOR version bump for new principles or materially expanded guidance
5. PATCH version bump for clarifications, wording, or non-semantic refinements

**Compliance Verification:**
- All PRs MUST include constitution compliance checklist
- Quarterly reviews to identify technical debt and non-compliance
- Violations require remediation plan with timeline

### Conflict Resolution
- When principles conflict, security and quality take precedence over velocity
- Temporary exceptions require documented justification and remediation plan
- Technical debt exceptions require approval and must be tracked to resolution

**Escalation:**
- Complexity requiring principle exceptions MUST be justified in writing
- Exceptions require technical lead approval and sunset date for remediation

**Version**: 1.2.1 | **Ratified**: 2025-12-07 | **Last Amended**: 2026-03-01
