---
title: Slate Yjs package-local aliases can hide duplicate installs
date: 2026-05-29
category: docs/solutions/developer-experience
module: slate-v2 yjs collaboration package
problem_type: developer_experience
component: tooling
symptoms:
  - site typecheck reports incompatible Y.Doc types from two Yjs versions
  - package-local node_modules contains a stale Yjs copy after the lockfile pins another version
  - a tsconfig path alias can make the site pass while depending on local install layout
root_cause: config_error
resolution_type: dependency_update
severity: high
tags: [slate-v2, yjs, typecheck, package-alias, bun]
---

# Slate Yjs package-local aliases can hide duplicate installs

## Problem

The Slate v2 site typecheck can pass for the wrong reason when `site/tsconfig`
aliases `yjs` to `../packages/slate-yjs/node_modules/yjs`. That path depends on
whatever package-local install happens to exist, so changing the audited Yjs
version can leave the site and package compiling against different `Y.Doc`
types.

## Symptoms

- `bun typecheck:site` reports `Y.Doc` incompatibilities between
  `node_modules/.bun/yjs@13.6.30` and `packages/slate-yjs/node_modules`
  resolving to `yjs@13.6.31`.
- `bun install --lockfile-only` updates `bun.lock` but does not remove stale
  package-local installs.
- A local `bun install` can hang before repairing the package-local tree.

## What Didn't Work

- Keeping the site alias to `../packages/slate-yjs/node_modules/yjs`. It made
  type resolution depend on install shape rather than the workspace dependency
  graph.
- Running only `bun install --lockfile-only`. That regenerated `bun.lock`, but
  stale package-local `node_modules/yjs` still shadowed the root package.
- Waiting indefinitely on a silent `bun install`. When it stalls, inspect the
  actual installed versions instead of guessing.

## Solution

Make the dependency graph boring:

```json
{
  "dependencies": {
    "yjs": "13.6.30"
  },
  "peerDependencies": {
    "yjs": "13.6.30"
  }
}
```

Remove the site `paths.yjs` alias entirely, then verify the installed graph:

```bash
node -p "require('./node_modules/yjs/package.json').version"
node -p "try{require('./packages/slate-yjs/node_modules/yjs/package.json').version}catch(e){'missing'}"
```

If the package-local copy is stale and the lockfile already pins the correct
version, remove only that stale package-local dependency:

```bash
rm -rf packages/slate-yjs/node_modules/yjs
bun --filter @slate/yjs typecheck
bun typecheck:site
```

Add a contract test that fails if `site/tsconfig.json` reintroduces a
package-local `yjs` path or if package manifests loosen the audited Yjs version.

## Why This Works

Yjs types are structurally deep enough that two patch versions can become
nominally incompatible through nested private-ish types. The root dependency and
the package dependency need to resolve to the same physical version for
TypeScript to see one `Y.Doc` type.

The site should resolve `yjs` through normal workspace dependency resolution.
Pointing at a package-local `node_modules` directory is a hidden environment
contract, not an architecture choice.

## Prevention

- Do not alias third-party packages to another workspace package's
  `node_modules`.
- When pinning a third-party package for an audited runtime contract, pin root,
  package dependency, peer dependency, and lockfile together.
- After lockfile-only changes, check for stale package-local copies before
  blaming source code for duplicate-type errors.
- Keep a package config test that asserts `site/tsconfig.json` has no
  package-local `yjs` alias.

## Related Issues

- [Yjs slow tests need explicit Bun paths and bootstrapped shared types](../test-failures/2026-03-22-yjs-slow-tests-need-explicit-bun-paths-and-bootstrapped-shared-types.md)
- [Slate workspace packages should have live root source entries under PnP](./2026-04-09-slate-workspace-packages-should-have-live-root-source-entries-under-pnp.md)
- [Slate v2 Yjs readiness needs core contracts before package work](./2026-05-13-slate-v2-yjs-readiness-needs-core-contracts-before-package-work.md)
