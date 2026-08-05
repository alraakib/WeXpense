# Monorepo Management

## Turborepo

- **Pipeline config:** `turbo.json` defines task dependencies and outputs. Tasks run in topological order respecting dependency graph.
- **Caching:** Compute cache stores task outputs (build, lint, test) keyed by file contents + env vars + dependencies. Incremental builds on subsequent runs.
- **Remote caching:** Share cache across CI runners via Vercel Remote Caching, or self-hosted with `TURBO_API`, `TURBO_TOKEN`, `TURBO_TEAM`.
- **Task orchestration:** `dependsOn` defines ordering (e.g., `build` depends on `^build` meaning upstream packages must build first). `outputs` specifies cacheable artifacts.
- **Parallelism:** Runs independent tasks in parallel. Controlled by `--concurrency` (default: 10).
- **Filtering:** `--filter=./packages/*` — run against a subset of the monorepo.

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

---

## Nx

- **Affected commands:** `nx affected:test --base=main` — only runs tasks for projects affected by changed files. Uses git HEAD comparison.
- **Dependency graph:** `nx graph` — interactive browser visualization of project dependencies and task execution order.
- **Computation caching:** Like Turborepo. Cacheable tasks defined in `project.json` or `nx.json`. Remote caching via Nx Cloud.
- **Generators:** Code generation with `nx generate @nrwl/react:component --name=Button`. Create custom generators with `nx generate @nrwl/workspace:generator`.
- **Executors:** Task runners with configurable options — `@nrwl/web:build`, `@nrwl/node:build`, `@nrwl/next:build`. Custom executors extend functionality.
- **Nx plugins:** Pre-built integrations for Angular, React, Next.js, Node, NestJS, and more.

```bash
nx affected:test --base=origin/main --parallel=3
nx graph
nx run my-app:build --prod
nx generate @nrwl/react:component --name=Button --project=ui-lib
```

---

## pnpm Workspaces / npm Workspaces

- **pnpm workspaces:** Uses `pnpm-workspace.yaml` to define workspace root and packages. Uses content-addressable store (hard links) — saves disk space.
- **npm workspaces:** Declared in root `package.json` under `"workspaces"`. Simpler but lacks pnpm's strict dependency isolation.
- **Hoisting:** pnpm uses `node_modules/.pnpm` — strict, no phantom dependencies. npm hoists to root `node_modules` (may produce unresolved peer issues).
- **Common commands:**
  - `pnpm install` — installs all workspace packages
  - `pnpm --filter <pkg> add <dep>` — add dep to specific workspace package
  - `pnpm -r run build` — run build in all packages (respects workspace topology if `--workspace-concurrency` used)
- **`.npmrc` for workspaces:** `shamefully-hoist=true` (pnpm), `legacy-peer-deps=true` (if needed).

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'
```

---

## Conventional Commits & Semver

- **Conventional Commits format:** `type(scope): description` — e.g., `feat(api): add user search`
- **Types:** `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`
- **Semver mapping:**
  - `feat` → MINOR version bump
  - `fix` → PATCH version bump
  - `BREAKING CHANGE:` in footer or `!` after type/scope → MAJOR version bump
- **Commitlint:** Enforce convention in CI with `@commitlint/config-conventional`
- **Commitizen:** Interactive CLI to generate properly formatted commits (`cz-cli`)

---

## Changesets

- **Workflow:** Developer adds a changeset file describing the change → CI aggregates into changelog → changeset version bumps packages and updates `CHANGELOG.md` → release publishes updated packages.
- **Core commands:**
  - `pnpm changeset` — interactively create a changeset (select packages, bump type, write summary)
  - `pnpm changeset version` — consume changesets, bump versions, generate changelogs
  - `pnpm changeset publish` — publish packages to npm registry
- **Version policies:** Fixed (single version for all packages) or independent (per-package version). Configured in `.changeset/config.json`.
- **Integration:** Works with GitHub Actions — `changeset/action` creates Version Packages PR. Merge that PR to publish.

```json
{
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@org/dev-tools"],
  "___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": {
    "onlyUpdatePeerDependentsWhenOutOfRange": true
  }
}
```

---

## Shared Config Packages

- **TypeScript:** `@org/tsconfig` — base `tsconfig.json` with strict mode, project references, paths.
- **ESLint:** `@org/eslint-config` — shared rules extending `eslint:recommended`, `plugin:@typescript-eslint/recommended`, plugin imports.
- **Prettier:** `@org/prettier-config` — `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`, `semi: true`.
- **Vitest:** `@org/vitest-config` — shared test setup, coverage config, reporters.
- **Consumption pattern:** Workspace packages extend configs via `"extends": "@org/tsconfig/base.json"` or `require('@org/eslint-config')`.

```js
// packages/shared-config/vitest/base.js
export default {
  testEnvironment: 'node',
  coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  reporters: ['default', ['junit', { outputFile: 'coverage/junit.xml' }]],
};
```

---

## Build Orchestration

- **Task dependency graph:** All tools derive a DAG from package dependencies. `build` of `app-a` waits for `build` of its dependency `lib-b`.
- **Topological ordering:** `pnpm --filter ... --workspace-concurrency 4` runs builds in topological order. Turborepo and Nx do this automatically.
- **Incremental builds:** Turborepo/Nx skip tasks whose inputs (source files + deps' outputs) haven't changed — critical for large monorepos.
- **CI optimization:** Cache restoration in CI (Turbo remote cache, Nx Cloud) avoids rebuilding unchanged packages on every PR.

---

## Package Dependency Management

- **Hoisting strategies:**
  - pnpm: Content-addressable store, no hoisting by default (`node_modules/.pnpm`)
  - npm/yarn: Hoists to root, may cause phantom dependencies
  - Yarn Berry (PnP): No `node_modules` at all — zip-based package resolution
- **Deduplication:** `pnpm dedupe`, `npm dedupe` — flattens duplicate versions of same package
- **Overrides/resolutions:** Force specific package versions across all workspace packages:
  - pnpm: `pnpm.overrides` in `package.json`
  - npm: `overrides` in `package.json`
  - yarn: `resolutions` in `package.json`
- **Depcheck:** `depcheck` CLI with `@depcheck` — detects unused dependencies and missing ones. Run in CI.
- **Renovate / Dependabot:** Automated dependency update PRs with grouping, scheduling, auto-merge for minor/patch.
