---
name: aem-deploy-content
description: Deploy JCR JSON content to a local AEM author instance via Sling POST import. Trigger when user asks to deploy test content, import JSON content to AEM, or run aem-test-content-deploy.
---

# AEM Deploy Content Workflow

Deploys JCR JSON content to AEM author via Sling POST import. Substitutes `/content/dam/test/*` with reference assets.

## Usage

```
aem-deploy-content <path/to/file.json> [--host URL] [--name PAGE_NAME] [--target PATH]
```

- **Required**: JSON file path (relative to workspace root or absolute)
- `--host`: default `http://localhost:5502`
- `--name`: page name, default `test-component`
- `--target`: default `/content/netcentric-digitalxn-reference/de/en/components`

## Steps

### 1. Parse Arguments

Extract JSON path (first non-flag argument), `--host`, `--name`, `--target` values.

### 2. Resolve Credentials

- **localhost** (any port): script uses `admin:admin` automatically
- **Non-localhost**: if `AEM_USER`/`AEM_PASSWORD` env vars not set, **prompt user** for credentials before running

### 3. Run Deploy Script

```bash
./scripts/aem-test-content-deploy.sh <JSON_PATH> [--host <HOST>] [--name <PAGE_NAME>] [--target <TARGET_PATH>]
```

The script:
- Validates the JSON file
- Applies DAM path substitution (`/content/dam/test/*` → reference assets)
- Runs Sling POST import
- Outputs `Success: <URL>` or `Error: HTTP <code>`

### 4. Report

Forward script output to user. On success, provide the page URL for verification.

## Error Handling

- Missing JSON path: report usage and stop
- Non-localhost without credentials: prompt user before running
- File not found / invalid JSON / curl failure: script handles and prints error only

## Example

```bash
aem-deploy-content path/to/component-content.json
```

```bash
aem-deploy-content content.json --target /content/my-site/us/en/test
```
