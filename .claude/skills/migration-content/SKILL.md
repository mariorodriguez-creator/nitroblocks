---
name: migration-content
description: Migrate content from source site to EDS using agentic batch processing. Wraps page-import with migration context (block mapping, template classification) and adds review checkpoints. Use after migration-site-build to import content into the implemented block system.
---

# Migration Content

Execution Phase 4 of the EDS migration pipeline. Migrates content from the
source site into the EDS block system using page-import in an agentic batch
loop with human review checkpoints.

## When to Use

- After `migration-site-build` has implemented all required blocks
- To migrate content for a specific template type or single page
- To test the content migration pipeline against a representative page

## Input

- **Required:** migration-planner output in `./migration-work/proposal/`
  - `04-block-mapping.md` -- which blocks to use for each organism
  - `05-work-items.md` -- MIGRATE- work items with template groupings
- **Required:** implemented blocks in `blocks/` (from migration-site-build)
- **Required:** page URLs to migrate (from sitemap or planner page inventory)
- **Optional:** specific template type to migrate (e.g., "blog posts only")

## Output

- Migrated HTML content files in the correct paths
- Image assets organized per page
- Migration log with per-page status
- SEO redirect mapping

## Workflow

### Step 0: Load Migration Context

Read from the planner proposal:
1. `05-work-items.md` -- MIGRATE- items grouped by template
2. `04-block-mapping.md` -- block assignments per organism
3. Page inventory (from `./migration-work/sitemap.xml` or planner)

Group pages by template type:
```
Template: blog-post (45 pages)
Template: product-page (12 pages)
Template: landing-page (8 pages)
Template: docs-page (23 pages)
```

### Step 1: Single-Page Test Run

Before batch processing, validate the pipeline on one page per template:

**Invoke page-import skill** on a representative page from each template type.

The page-import skill runs:
1. `scrape-webpage` -- extract content
2. `identify-page-structure` -- find sections and sequences
3. `authoring-analysis` -- assign blocks (should align with planner mapping)
4. `generate-import-html` -- create HTML content file
5. `preview-import` -- verify in local dev server

**Validation checkpoint:**
- Does the imported page use the blocks the planner specified?
- Do images render correctly?
- Is the content complete (no truncation)?
- Does the layout match the original (compare screenshots)?

If the test page fails, stop and diagnose before proceeding to batch.

### Step 2: Batch Migration

For each template group, ordered by the planner's phase plan:

**2a. Prepare batch**

Collect all page URLs for this template type. Create a tracking document:

```markdown
# Migration Batch: [template-type]

| # | URL | Status | Notes |
|---|-----|--------|-------|
| 1 | /path/to/page-1 | pending | |
| 2 | /path/to/page-2 | pending | |
```

**2b. Execute batch**

For each page in the batch:

1. **Invoke page-import skill** with the page URL
2. Record result: success / partial / failed
3. If failed: log the error, skip, continue with next page
4. Update tracking document

**2c. Review checkpoint**

After completing a batch (or every N pages):

- Present sample of migrated pages for human review
- Compare screenshots: original vs imported
- Check for common issues:
  - Missing images
  - Incorrect block assignments
  - Truncated content
  - Broken layout
- Human decides: approve and continue / fix issues and retry

### Step 3: SEO Redirect Mapping

For each migrated page:

1. Record the original URL
2. Record the new EDS path (from metadata.json `paths.documentPath`)
3. If paths differ, add to redirect mapping

Write `./migration-work/redirects.md`:
```markdown
# SEO Redirects

| Original URL | EDS Path | Status |
|-------------|----------|--------|
| /old/path/page | /new/path/page | redirect needed |
| /same/path | /same/path | no redirect |
```

This maps to the EDS redirects spreadsheet for bulk import.

### Step 4: Media Asset Migration

Verify all images and media from migrated pages:
- Images downloaded and accessible
- Large images optimized (EDS handles this for authored content, but
  check assets committed to git)
- Video embeds preserved (using appropriate blocks)
- Document downloads linked correctly

### Step 5: Migration Log

Write `./migration-work/content-migration-log.md`:

```markdown
# Content Migration Log

## Summary
- **Total pages:** [n]
- **Successfully migrated:** [n]
- **Partial (needs review):** [n]
- **Failed:** [n]
- **Redirects needed:** [n]

## Per-Template Results
| Template | Total | Success | Partial | Failed |
|----------|-------|---------|---------|--------|
[One row per template type]

## Issues Encountered
[List of common issues and how they were resolved]

## Pages Requiring Manual Attention
[List of failed/partial pages with specific issues]
```

## Testing Against a Single Page

To validate content migration for the homepage:
```
Input: https://example.com/ + implemented blocks
Steps: page-import (scrape -> structure -> authoring -> generate -> preview)
Output: homepage HTML + images in correct EDS path
Validation: renders in dev server, blocks match planner mapping, content complete
```

Compare:
- Block assignments vs planner's `04-block-mapping.md`
- Content completeness (no truncation)
- Image availability
- Layout fidelity (screenshot comparison)

## Agentic Batch Mode

For large migrations, the batch loop runs autonomously:

```
FOR each template_group in planner.work_items(MIGRATE-):
  FOR each page_url in template_group.pages:
    result = invoke(page-import, url=page_url)
    log(page_url, result.status)
    IF result.failed:
      log_error(page_url, result.error)
      CONTINUE
  REVIEW_CHECKPOINT(template_group)
  IF human_rejects:
    FIX_ISSUES()
    RETRY_FAILED()
```

The agent pauses at each review checkpoint. The human reviews a sample, approves,
or requests fixes before the agent continues.

## Related Skills

- **migration-planner** -- produces template groups and block mapping
- **migration-site-build** -- implements blocks before content migration
- **page-import** -- invoked for each individual page migration
- **scrape-webpage** -- invoked by page-import for content extraction
- **identify-page-structure** -- invoked by page-import for structure analysis
- **authoring-analysis** -- invoked by page-import for block assignment
- **generate-import-html** -- invoked by page-import for HTML generation
- **preview-import** -- invoked by page-import for verification
