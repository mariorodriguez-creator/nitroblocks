---
name: figma-screenshot
description: Fetches a Figma node screenshot via MCP and saves it to disk. Use when the user asks to save a Figma design reference, capture a design for specs, or store a screenshot for verification.
---

# Figma Screenshot

Fetches a screenshot of a Figma node using the Figma MCP `get_screenshot` tool and saves it to the filesystem.

## Critical Constraints

1. **Read-only** — Fetch and save only. Do not modify any code.
2. **MCP required** — Figma MCP must be enabled (plugin-figma-figma or equivalent).

## Prerequisites

| Requirement | Purpose |
|-------------|---------|
| Figma MCP | `get_screenshot` tool available |
| Figma URL or `fileKey` + `nodeId` | Identifies the design node to capture |

## Inputs to Gather

| Input | Example | Source |
|-------|---------|--------|
| Figma URL | `https://figma.com/design/abc123/Component?node-id=1-2` | User, spec (e.g. `design.md`), or command args |
| fileKey | `abc123` | Extracted from URL |
| nodeId | `1:2` or `1-2` | Extracted from URL (`node-id=1-2` → `1:2` for MCP) |
| Output path | `.specify/specs/001-my-component/design-screenshot.png` | User, command args, or inferred from spec folder |

## Workflow

### Step 1: Resolve Inputs

- **Figma reference**: From user input, command args, open spec (e.g. `design.md` links), or ask the user.
- **URL parsing**: `https://figma.com/design/:fileKey/:name?node-id=1-2` → `fileKey=:fileKey`, `nodeId=1:2` (use colon format for MCP).
- **Output path**: From user/args, or `.specify/specs/{feature}/design-screenshot.png` when in a spec folder, else `figma-screenshot.png`.
- If Figma reference cannot be determined, ask the user.

### Step 2: Execute

1. Call MCP tool `get_screenshot` (server: `plugin-figma-figma`) with `fileKey` and `nodeId`.
2. Extract base64 image data from the response.
3. Decode and save: `echo "<base64>" | base64 -d > <output-path>` (or equivalent).

### Step 3: Report

Output the saved file path and confirm success.

## Key Rules

- Use absolute paths when referencing files.
- If Figma reference cannot be determined, ask the user.
- Do not modify any code; fetch and save only.