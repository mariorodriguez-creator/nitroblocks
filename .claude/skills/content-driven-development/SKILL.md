---
name: Using Content Driven Development
description: Apply a Content Driven Development process to AEM Edge Delivery Services development. Use for all development tasks, including building new blocks, modifying existing blocks, making changes to core decoration functionality, etc.
---

# Using Content Driven Development (CDD)

Content Driven Development is a mandatory process for AEM Edge Delivery Services development that prioritizes content and author needs over developer convenience. This skill orchestrates the development workflow to ensure code is built against real content with author-friendly content models.

## Why Content-First Matters

**Author needs come before developer needs.** When building for AEM Edge Delivery, authors are the primary users of the structures we create. Content models must be intuitive and easy to work with, even if that means more complex decoration code.

**Efficiency through preparation.** Creating or identifying test content before coding provides:
- **Immediate testing capability**: No need to stop development to create test content
- **Better PR workflows**: Test content doubles as PR validation links for PSI checks
- **Living documentation**: Test content often serves as author documentation and examples
- **Fewer assumptions**: Real content reveals edge cases code-first approaches miss

**NEVER start writing or modifying code without first identifying or creating the content you will use to test your changes.**

## When to Apply This Skill

Apply Content Driven Development principles to ALL AEM development tasks:

- ✅ Creating new blocks
- ✅ Modifying existing blocks (structural or functional changes)
- ✅ Changes to core decoration functionality
- ✅ Bug fixes that require validation
- ✅ Any code that affects how authors create or structure content

Skip CDD only for:
- ⚠️ Trivial CSS-only styling tweaks (but still identify test content for validation)
- ⚠️ Configuration changes that don't affect authoring

When in doubt, follow the CDD process. The time invested pays dividends in quality and efficiency.

## Related Skills

This skill orchestrates other skills at the appropriate stages:

- **content-modeling**: Invoked when new content models need to be designed or existing models modified
- **building-blocks**: Invoked during implementation phase for block creation or modification
- **testing-blocks**: Referenced during validation phase for comprehensive testing
- **block-collection-and-party**: Used to find similar blocks and reference implementations

## The Content-First Process

Follow these phases in order. Do not skip steps.

### Phase 1: Content Discovery and Modeling

The first phase establishes what content you're working with and ensures the content model is author-friendly.

**Initialize timing.** Use the block name as the run identifier (e.g., `countdown` → `cdd-countdown`):

```bash
python3 .specify/scripts/phase-timer.py init cdd-{block-name}
python3 .specify/scripts/phase-timer.py start cdd-discovery cdd-{block-name}
```

#### Single Discovery Prompt

**Ask the user all of the following in one message:**

> "To set up the development context, please answer these upfront:
>
> 1. **New or modification?** Creating a new block or modifying an existing one?
> 2. **Block name:** What should the block be called? (e.g., `countdown`)
> 3. **Existing content:** *(Modification only)* Do pages with this block already exist that we can test against? If yes — URL or path. If no — say "none".
> 4. **Content model:** How should we handle the content model?
>    - (a) Use the content-modeling skill to design it now
>    - (b) I'll describe the structure myself
>    - (c) Already defined — I'll describe or link to it
> 5. **Test content location:** Where should test content live?
>    - (a) CMS now (Google Drive/SharePoint/DA/Universal Editor)
>    - (b) Local HTML drafts (temporary — CMS content required before PR)
> 6. **Author docs:** Should test content also serve as author documentation? (yes/no)"

#### Branching After Discovery

Once answers are received, branch **without asking further questions**:

**Content model:**
- Answer (a) → Invoke **content-modeling** skill; return here when done
- Answer (b) or (c) → Document the described model and continue

**Modification with existing content (URL provided):**
- Validate the content loads locally
- Use it as test content → skip directly to Phase 2

**New block or modification with no existing content:**

*Option 5a — CMS content (recommended):*
- Guide the user through creating content in their CMS
- Wait for confirmation content is created and published
- Get the content URL(s) from the user
- Validate content loads in local dev environment

*Option 5b — Local HTML drafts (temporary):*
- Create HTML file(s) in `drafts/` matching the content model structure
- **DOM shape:** For `.plain.html` served into `<main>`, wrap the fragment in **one outer `<div>`** (or one wrapper per section) so each `div.{blockName}` is **`main > div.section > div > div.{blockName}`**, not a direct child of `main` next to other section divs — otherwise `decorateBlocks` in `scripts/aem.js` never runs on the block. See AGENTS.md (Use Drafts).
- Reference the [HTML Structure Guide](resources/html-structure.md) for proper file format
- When generating drafts with images: use `drafts/dev/media/*` if available, otherwise `https://picsum.photos/{width}/{height}`. Fallback: `https://placehold.co/{width}x{height}`
- Remind user: restart dev server with `aem up --html-folder drafts`
- Note: CMS content is required before raising a PR

**Author documentation (answer 6 = yes):**
- Structure test content with documentation in mind
- Create comprehensive examples showing all variants and edge cases
- Use realistic content; avoid "lorem ipsum"
- Place in an appropriate location:
  - Sidekick Library projects: `/tools/sidekick/library/` or equivalent
  - Document Authoring: DA Library structure
  - Simple docs: `/drafts/docs/` or `/drafts/library/`
  - Universal Editor: follow project-specific patterns

**End timing:**

```bash
python3 .specify/scripts/phase-timer.py end cdd-discovery cdd-{block-name}
python3 .specify/scripts/phase-timer.py start cdd-test-content cdd-{block-name}
# content creation happens here — end after content is confirmed accessible
python3 .specify/scripts/phase-timer.py end cdd-test-content cdd-{block-name}
```

### Phase 2: Implementation

**CRITICAL: Do not begin Phase 2 until you have confirmed test content exists and is accessible.**

```bash
python3 .specify/scripts/phase-timer.py start cdd-implement cdd-{block-name}
```

Now that test content exists, proceed with implementation:

#### For Block Development

Invoke the **building-blocks** skill:
- Provide the skill with the content model and test content URL(s)
- Follow the building-blocks process for implementation
- When building-blocks returns, end the implementation timer:
  ```bash
  python3 .specify/scripts/phase-timer.py end cdd-implement cdd-{block-name}
  ```
- Proceed to Phase 3

#### For Core Functionality Changes

Follow standard development practices:
- Make changes to scripts, styles, or configuration
- Test against the identified content throughout development
- Ensure changes don't break existing blocks or content models
- Proceed to Phase 3

### Phase 3: Validation

The final phase ensures the implementation works correctly with real content.

```bash
python3 .specify/scripts/phase-timer.py start cdd-validate cdd-{block-name}
```

#### Step 3.1: Test with Real Content

**Mandatory testing:**
- ✅ View test content in local dev environment
- ✅ Verify all variants render correctly
- ✅ Check responsive behavior (mobile, tablet, desktop)
- ✅ Test edge cases revealed by the actual content
- ✅ Validate accessibility basics (keyboard navigation, screen reader friendly)

#### Step 3.2: Run Quality Checks

**Required before considering implementation complete:**

```bash
npm run lint
```

If linting fails, fix issues with:
```bash
npm run lint:fix
```

#### Step 3.3: Comprehensive Testing

**The testing-blocks skill is automatically invoked by building-blocks** for block development.

For other code changes, or for additional testing guidance, invoke the **testing-blocks** skill which provides:
- Unit testing strategies for logic-heavy utilities
- Browser testing with Playwright/Puppeteer
- Linting and code quality checks
- Performance validation with GitHub checks
- Guidance on keeper vs throwaway tests

#### Step 3.4: PR Preparation

**Before raising a PR, ensure:**
- ✅ Test content exists in the CMS (not just local HTML)
- ✅ Test content URL is accessible for PSI checks
- ✅ All linting passes
- ✅ Author documentation is updated (if applicable)

The test content URL will be used as the PR validation link.

**Finalize timing:**

```bash
python3 .specify/scripts/phase-timer.py end cdd-validate cdd-{block-name}
python3 .specify/scripts/phase-timer.py finalize cdd-{block-name}
python3 .specify/scripts/phase-timer.py report cdd-{block-name}
```

## Anti-Patterns to Avoid

**Common mistakes:**
- ❌ Starting with code before understanding the content model
- ❌ Making assumptions about content structure without seeing real examples
- ❌ Creating developer-friendly but author-hostile content models
- ❌ Skipping content creation "to save time" (costs more time later)
- ❌ Testing against imagined content instead of real content
- ❌ Treating test content creation as separate from development workflow

## Workflow Summary

**Quick reference for the CDD process:**

```
1. CONTENT DISCOVERY
   └─ Existing content? → Use it
   └─ New block/structure? → Design content model → Create test content

2. IMPLEMENTATION
   └─ Build code against the real content model
   └─ Test continuously with actual content

3. VALIDATION
   └─ Comprehensive testing with test content
   └─ Quality checks (linting, accessibility)
   └─ PR preparation with test URL

KEY RULE: Never proceed to implementation without test content
```

## Scripts and Tools

### Finding Existing Block Content

Use the provided script to search for pages containing a specific block:

```bash
# Search on localhost (default)
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name>

# Search for specific variant
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name> localhost:3000 <variant>

# Search on live site
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name> main--repo--owner.aem.live

# Search on preview with variant
node .claude/skills/content-driven-development/scripts/find-block-content.js <block-name> main--repo--owner.aem.page <variant>
```

**Examples:**
```bash
node .claude/skills/content-driven-development/scripts/find-block-content.js hero
node .claude/skills/content-driven-development/scripts/find-block-content.js hero localhost:3000 dark
node .claude/skills/content-driven-development/scripts/find-block-content.js cards main--site--owner.aem.live three-up
```

This script queries the site's query-index to find all pages containing the specified block (and optional variant) and returns their URLs. The script uses proper DOM parsing to accurately identify blocks.

## Integration with Other Skills

This skill acts as the orchestrator for AEM development workflows:

**At Content Modeling stage:**
→ Invoke **content-modeling** skill for author-friendly design

**At Implementation stage:**
→ Invoke **building-blocks** skill for block development
→ Reference **block-collection-and-party** skill for patterns

**At Validation stage:**
→ Reference **testing-blocks** skill for comprehensive testing

Following this orchestration ensures all development follows content-first principles.
