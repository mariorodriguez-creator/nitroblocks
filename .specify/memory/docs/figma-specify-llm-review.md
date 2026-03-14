# LLM Agent Review: `speckit.figma-specify.md`

**Reviewed**: 2026-03-06
**Source**: `.cursor/commands/speckit.figma-specify.md` (859 lines, 44.8KB)
**Purpose**: Evaluate how well coding agents (Opus, Composer, Gemini-Pro, Cline) can interpret and execute this command. Identify ambiguities, portability issues, and improvement areas.

---

## 1. Overall Assessment

**Strengths:**
- Exceptionally well-structured with clear step numbering (Steps 1-8)
- Strong separation of concerns — visual-only scope is repeatedly reinforced
- The `design.md` template in Step 5 is comprehensive and self-documenting
- Dynamic content detection with `~` tolerance convention is a sophisticated pattern
- Cross-validation against `spec.md` (Step 6) catches design/spec drift
- Quality validation checklist (Step 7) acts as a self-correction loop

**Weakness summary:** The command is 859 lines — one of the longest in the project (44.8KB). While thorough, this pushes context window limits for some agents, especially when combined with the rule files it instructs the agent to load in Step 3.

---

## 2. Ambiguity Analysis (by Step)

### Step 1: Locate existing spec directory
**Severity: Low**
- Clear and unambiguous. Abort conditions are well-defined.
- Minor: Line 56 has a typo — "exits" should be "exists"

### Step 2: Read Figma design context
**Severity: High — MCP tool dependency**

| Ambiguity | Impact | Agents affected |
|---|---|---|
| MCP server names (`plugin-figma-figma-desktop` vs `plugin-figma-figma`) are hardcoded but may differ across setups | Agent will fail silently or hallucinate tool calls if MCP servers aren't configured | All agents |
| `get_design_context` and `get_screenshot` are MCP tools — no schema or parameter docs are provided inline | Agent must discover tool signatures at runtime; if discovery fails, it cannot proceed | Gemini-Pro (no native MCP), Opus (depends on MCP config) |
| Option A says "Ask the user to select the target frame" — this is a multi-turn conversational flow that requires the agent to pause and wait | Agents optimized for single-turn execution (Composer in apply mode) may skip the wait or proceed with empty data | Cursor Composer |
| `mcp_auth` (Option C) — no details on what auth flow looks like or what to pass | Agent will guess parameters or fail | All agents |
| Step 2d requires **three separate user interactions** (desktop, tablet, mobile) — each with a pause-and-wait pattern | Long multi-turn chains increase the chance of context drift; agents may lose track of which breakpoint they're collecting | All agents, especially Gemini-Pro |
| "Store both the raw design context and screenshot in memory" — what does "memory" mean here? Agent working memory? A file? | Ambiguous — most agents will hold it in context window, but large Figma payloads may exceed token limits | All agents |

**Recommendation:** Add a note about expected `get_design_context` return shape (JSON structure, key fields). Consider providing a mock/example response so agents know what to parse.

### Step 3: Load project frontend conventions
**Severity: Medium — context window pressure**

| Ambiguity | Impact |
|---|---|
| "Read the project's SCSS abstracts and mixins" — this is an open-ended directory scan. The agent must recursively read files under a deep path and **infer** available mixins | Different agents will extract different subsets; no canonical list means inconsistent mixin usage across runs |
| Six rule files to read + SCSS source files = potentially 2000+ lines of additional context loaded into the window | Combined with the 859-line command + Figma API response + spec.md, this can exceed 100K tokens. Gemini-Pro (1M context) handles this; Claude may need to be selective |
| "Use what you find — do not rely on a static list" — this is good for freshness but bad for determinism | Two runs of the same command may produce different SCSS skeletons if the agent reads files in a different order or depth |

**Recommendation:** Consider providing a `mixins-manifest.md` or a script that auto-generates a mixin inventory. This gives agents a stable reference while staying up-to-date.

### Step 4: Extract and structure design information
**Severity: Medium — interpretation latitude**

| Ambiguity | Impact |
|---|---|
| "Analyse the raw Figma context" — the command assumes Figma API output is structured enough for programmatic extraction, but Figma MCP output format varies by plugin version | Agent may receive flat text, nested JSON, or a mix — extraction logic will differ |
| Dynamic Content Detection heuristics (lines 189-205) are described narratively, not as rules | Agent must use judgment to classify elements as dynamic vs static. "Common examples" is helpful but not exhaustive — edge cases (icons, badges, counts) may be missed or over-tagged |
| Embedded Component Detection reads `spec.md` for `dxn-*` references — "scan the acceptance criteria" is vague | Should it regex for `dxn-*`? Look for component names in backticks? Parse markdown structure? Different agents will use different strategies |
| Per-Breakpoint CSS Overrides tables: the command shows a template with `[e.g. ...]` placeholders — agents may copy the example format literally instead of replacing with actual values | This is a common LLM failure mode with heavily templated prompts |

**Recommendation:** For Embedded Component Detection, provide an explicit regex or pattern: "Search for any string matching `dxn-[a-z-]+` in code blocks or backtick-quoted text within spec.md."

### Step 5: Save `design.md`
**Severity: Medium — template vs. instruction confusion**

The 300+ line template is the core of the command. Key ambiguity:

| Issue | Detail |
|---|---|
| **Template-as-example vs template-as-literal** | The template mixes structural headings (keep as-is) with `[placeholder]` values (replace) and `[e.g. ...]` examples (replace with real data). An agent may struggle to distinguish which parts are scaffolding vs which are examples. The Visual Acceptance Checklist section (lines 589-738) is particularly dense with examples. |
| **Section ordering** | Step 6 says "append Spec-Design Discrepancies section at the end of design.md (before the Visual Acceptance Checklist)" — but the template shows Visual Acceptance Checklist *after* Design Token Mapping and Code Scaffold. This creates ambiguity about insertion point. |
| **Checklist granularity** | The Visual Acceptance Checklist template has ~80 example assertions. Should the agent generate a similar quantity? More? Fewer? No guidance on expected assertion count. |

### Step 6: Cross-validate against `spec.md`
**Severity: Low**
- Well-defined with concrete check categories and a clear output table format.
- Minor ambiguity: "Severity" column values (Low, Medium, High) have no definitions.

### Step 7: Validate `design.md` quality
**Severity: Low**
- The 7-check table is clear and actionable.
- Auto-fix vs. manual distinction is helpful for agents.
- Check 5 ("scan for keywords: shall, must accept...") is a good heuristic but may false-positive on quoted spec references.

### Step 8: Report completion
**Severity: Low**
- Clear output format. No ambiguity.

---

## 3. Agent-Specific Compatibility

### Claude Opus / Sonnet (via Cursor or CLI)
- **Context window**: 200K tokens — may be tight when loading all rule files + Figma response + command. Agent should be selective about which rule files to fully internalize.
- **MCP support**: Native in Claude Code CLI; Cursor supports MCP via plugin. The multi-turn Figma selection flow works well with Claude's conversational strengths.
- **Template handling**: Claude generally handles template-with-placeholders well but may over-copy examples from the Visual Acceptance Checklist.
- **Risk**: The instruction "hold extracted guidelines in context" (Step 3, line 159) is implicit — Claude will do this naturally, but if context compresses mid-task, earlier rule extractions may be lost.

### Cursor Composer (Apply mode)
- **Context window**: Depends on underlying model.
- **Multi-turn limitation**: Composer's apply mode is optimized for single-shot code generation. The three-interaction Figma collection flow (Step 2d) is awkward — Composer may try to batch all MCP calls without waiting for user selection.
- **MCP support**: Cursor has MCP integration, but tool names must match exactly.
- **Risk**: Composer may treat the entire `design.md` template as code to apply rather than a specification to interpret and fill.

### Gemini Pro
- **Context window**: 1M+ tokens — no concern about loading all files.
- **MCP support**: No native MCP integration. Gemini Pro would need tool-use API wrappers or a different Figma integration path.
- **Multi-turn**: Gemini handles multi-turn well via chat API but tool execution depends on orchestration layer.
- **Risk**: Without MCP, Steps 2/2c/2d are **completely blocked**. The command provides no fallback for environments without MCP (e.g., manual Figma JSON paste).

---

## 4. Structural Issues

| # | Issue | Lines | Detail |
|---|---|---|---|
| 1 | **No fallback for non-MCP environments** | 80-137 | If no Figma MCP server is available, the entire command fails. No option for pasting raw Figma JSON or providing a design token export. |
| 2 | **"Memory" storage is undefined** | 109, 137 | "Store in memory" is ambiguous — agent context window? A temp file? This matters for large Figma payloads. |
| 3 | **SCSS path is hardcoded** | 150 | `digitalxn-aem-base/digitalxn-aem-base-clientlibs-apps/frontend/digitalxn/base/clientlibs/commons/sass/` — if project structure changes, all agents break. Could reference a config variable. |
| 4 | **Rule file references use `.mdc` extension** | 148-157 | These are Cursor-specific rule files. Other agents (Claude CLI, Gemini) may not know to look in `.cursor/rules/frontend/`. The paths should be explicit. |
| 5 | **Step numbering inconsistency** | 105 | "Step 2c" is nested under Step 2 but formatted as a sub-step. Step 3 (Load conventions) is then referenced again as "Steps 3 and 4" in line 159, creating confusion about whether Step 3 in the outline is the same as Step 3 in the convention-loading section. |
| 6 | **Behaviour Rules at the end** | 850-859 | Critical constraints are buried at the very bottom. LLMs process instructions with a primacy/recency bias — middle sections get less attention. Consider duplicating key rules as inline warnings at the relevant steps. |

---

## 5. Recommendations Summary

| Priority | Recommendation |
|---|---|
| **High** | Add example Figma MCP response shape (even a 10-line mock) so agents know what to parse |
| **High** | Add Option D for non-MCP environments: manual paste of Figma JSON or Dev Mode export |
| **High** | Make `.mdc` rule file paths fully explicit (absolute or repo-relative) for non-Cursor agents |
| **Medium** | Create a `mixins-manifest.md` auto-generated from SCSS source to give agents a stable mixin reference |
| **Medium** | Clarify "store in memory" — recommend agents write intermediate state to a temp file if Figma payload exceeds ~5000 tokens |
| **Medium** | Add a "Minimum Output Expectations" note: e.g., "design.md should contain at least N breakpoint rows, N token mappings, N acceptance assertions" |
| **Low** | Move Behaviour Rules to the top of the document (after Outline) or inline them as warnings at each step |
| **Low** | Fix typo line 56: "exits" -> "exists" |
| **Low** | Define severity levels for the Spec-Design Discrepancies table |

---

## 6. Multi-Agent Portability Assessment

| Capability Required | Cursor (Composer/Agent) | Claude Code CLI | Windsurf | Gemini Pro | Cline/Continue |
|---|---|---|---|---|---|
| **MCP tool calls** (get_design_context, get_screenshot) | Native support | Native support | Partial (plugin-dependent) | No native MCP | Plugin-dependent |
| **Multi-turn conversational pauses** (wait for user to select Figma frame) | Works in Agent mode; Composer may skip | Works well — conversational by design | Works in chat mode | Works via chat API | Works in chat mode |
| **`.mdc` rule file auto-loading** | Native — auto-loads from `.cursor/rules/` | Must be explicitly read via tool calls | No `.mdc` support — must read as plain files | No `.mdc` support | Plugin-dependent |
| **Large context loading** (command + rules + Figma + spec) | ~128K-200K depending on model | 200K (Claude) | Varies by model | 1M+ — no concern | Varies by model |
| **File write (save design.md)** | Native | Native | Native | Needs orchestration | Native |

**Portability blockers:**
1. **MCP is the hard dependency.** Without it, Steps 2/2c/2d are impossible. Non-MCP agents need an alternative input path (e.g., paste raw Figma Dev Mode JSON, upload a Figma export file, or use Figma REST API with a personal access token).
2. **`.mdc` rule files are Cursor-specific.** Other agents must explicitly read these files. The command should provide full repo-relative paths (e.g., `.cursor/rules/frontend/aem-styles-rules.mdc`) rather than just filenames.
3. **The `check-prerequisites.sh --json` script** is agent-agnostic (shell) — this is good for portability.
4. **Handoffs metadata** (lines 3-11) is Cursor-specific YAML frontmatter. Other agents ignore it, which is fine — the handoff targets (`speckit.plan`, `speckit.clarify`) won't exist outside Cursor's command system anyway.

**Recommended portability additions:**
- Add `Option D — Manual input` to Step 2: Allow pasting Figma Dev Mode JSON or a design token export. This unblocks Gemini, Cline, and any agent without MCP.
- Provide explicit file paths for all `.mdc` references in Step 3 so non-Cursor agents can `read` them directly.
- Note that the `$ARGUMENTS` variable (line 16) is Cursor-specific; other agents should accept the same input as a user message or CLI argument.

---

## 7. What Works Exceptionally Well

1. **Scope boundaries** — The repeated "visual only" / "NOT functional" guardrails prevent LLM scope creep effectively
2. **Dynamic content tolerance (`~`)** — Sophisticated pattern that most LLMs can follow; the convention is clearly defined and consistently applied throughout the template
3. **Embedded component detection** — Prevents LLMs from re-implementing existing components (a very common LLM failure mode)
4. **Quality self-check (Step 7)** — Acts as a built-in reflection/correction loop, which is a best practice for LLM-driven code generation
5. **Mobile-first progressive override tables** — The Per-Breakpoint CSS Overrides format is implementation-ready and reduces LLM interpretation errors
6. **Cross-validation step** — Catching spec/design drift early is valuable and well-structured
