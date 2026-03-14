# Node 24 Frontend Migration Spec

## Goal

Migrate the frontend build toolchain from **Node 14.19.3 → Node 24**, updating all related configuration files, lockfile format, and CI/CD pipeline references.

---

## 1. Current State

| Item | Value |
|------|-------|
| Node version | 14.19.3 (pinned in `.nvmrc` and `pom.xml`) |
| npm version | 6.14.17 (Maven plugin) |
| Lockfile format | v1 |
| Frontend orchestrator | `@netcentric/fe-build@4.0.1` |
| Sass implementation | Dart Sass 1.77.2 (no native binding risk) |

Key pinning locations:
- `.nvmrc` — line 1
- `pom.xml` — lines 43–44 (`<nodeVersion>` and `<npmVersion>`)
- `digitalxn-aem-base-clientlibs-apps/pom.xml` — frontend-maven-plugin config

---

## 2. Files to Change

### `.nvmrc`
```
24
```

### `pom.xml` (root)
Update the `frontend-maven-plugin` configuration:
```xml
<nodeVersion>v24.x.x</nodeVersion>
<npmVersion>10.x.x</npmVersion>
```
Replace `x.x` with the latest stable Node 24 and npm 10 patch versions at time of migration.

### `digitalxn-aem-base-clientlibs-apps/pom.xml`
Apply the same `<nodeVersion>` and `<npmVersion>` changes as the root `pom.xml`.

### `frontend/package.json`
1. Bump `@netcentric/fe-build` to the latest Node-24-compatible release (verify against the package's release notes).
2. Add an `engines` field:
```json
"engines": {
  "node": ">=24"
}
```

### `frontend/package-lock.json`
Regenerate on Node 24 to upgrade from lockfile v1 → v3:
```bash
rm package-lock.json
npm install
```
Commit the resulting v3 lockfile. Ensure CI does not enforce lockfile version v1.

### `Jenkinsfile`
Verify or update the Node tool label to reference a Node 24 installation. Example change:
```groovy
// Before
tool name: 'NodeJS 14', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
// After
tool name: 'NodeJS 24', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
```
Confirm the Jenkins global tool configuration has a Node 24 installation registered.

---

## 3. Dependency Risk Matrix

| Package | Current Version | Node 24 Risk | Action |
|---------|----------------|-------------|--------|
| `@netcentric/fe-build` | 4.0.1 | **UNKNOWN** — must verify | Upgrade to latest; check changelog for Node 18/20/22/24 support notes |
| `webpack` | 5.91.0 (via fe-build) | Low — webpack 5 officially supports Node 18+ | Verify no sub-dependency uses legacy OpenSSL hash |
| `@babel/core` | 7.24.6 | None | — |
| `jest` | 29.7.0 | None | — |
| `sass` (Dart) | 1.77.2 | None — Dart Sass has no native binding | — |
| `postcss` | 8.4.38 | None | — |
| `eslint` | 8.57.0 | None | — |
| `npm-run-all` | 4.1.5 | Low — unmaintained; verify it resolves on Node 24 | Check for spawn issues; consider `npm-run-all2` fork if blocked |
| `husky` | 8.0.3 | None | — |
| `aemsync` | 5.0.4 | Unknown — verify Node 24 compatibility | Run manually and check for deprecation warnings |

---

## 4. Regression Test Checklist

After applying all changes, verify the following in order:

- [ ] `npm install` completes without errors and generates a v3 lockfile
- [ ] `npm run build` succeeds (webpack bundles all clientlibs)
- [ ] `npm run lint:js` passes with zero errors
- [ ] `npm run lint:css` passes with zero errors
- [ ] `npm run test` passes (jest 29.7.0 with jsdom environment)
- [ ] `npm run analyze` produces bundle analysis output
- [ ] Maven full build succeeds:
  ```bash
  mvn clean install -pl digitalxn-aem-base-clientlibs-apps
  ```
- [ ] Maven build with frontend-maven-plugin downloads Node 24 and npm 10 successfully
- [ ] CI pipeline (Jenkins / Cloud Manager) completes a full build green

---

## 5. Known Breaking Changes: Node 14 → 24

### ESM / CommonJS interop
`require()` of ES modules throws a `ERR_REQUIRE_ESM` error by default. Node 22 introduced experimental `require(esm)` support; behaviour changed again in Node 24. If any dependency in the tree ships only ESM, the build will fail. Audit with:
```bash
npx are-the-types-wrong --pack .
```
Mitigation: upgrade affected packages or add dynamic `import()` wrappers.

### Global `fetch` and `URL`
`fetch` and `URL` are now global in Node 24. Jest tests that mock `global.fetch` or `global.URL` may behave differently. Review test setup files for manual polyfills that should be removed.

### npm 10 and lockfile v3
npm 10 generates lockfile v3 by default. Any CI step that validates lockfile version or caches based on lockfile hash will break if it expects v1. Update cache keys and any `--prefer-offline` steps to use the new lockfile.

### OpenSSL 3 (introduced in Node 17)
Legacy hash algorithms (MD4, etc.) were removed. webpack 4 is affected but **webpack 5 is not** — no action required for this project. If a transitive dependency relies on `--openssl-legacy-provider`, it must be upgraded or replaced.

### `crypto.createHash`
API is stable and unchanged — no impact.

### npm engine warnings
With `"engines": { "node": ">=24" }` set, `npm install` on older Node versions will warn (not fail by default). This is intentional to document the requirement.

---

## Migration Steps (Ordered)

1. Create a feature branch from `main`.
2. Update `.nvmrc` to `24`.
3. Update `nodeVersion`/`npmVersion` in root `pom.xml` and `digitalxn-aem-base-clientlibs-apps/pom.xml`.
4. Switch local Node version: `nvm install 24 && nvm use 24`.
5. In `frontend/`:
   a. Remove `package-lock.json`.
   b. Bump `@netcentric/fe-build` in `package.json` to latest compatible version.
   c. Add `"engines": { "node": ">=24" }` to `package.json`.
   d. Run `npm install` — inspect for errors or peer-dependency conflicts.
6. Run the full regression test checklist above.
7. Update `Jenkinsfile` Node tool label.
8. Open PR; ensure CI passes end-to-end.
9. After merge, verify a Cloud Manager deployment completes successfully.
