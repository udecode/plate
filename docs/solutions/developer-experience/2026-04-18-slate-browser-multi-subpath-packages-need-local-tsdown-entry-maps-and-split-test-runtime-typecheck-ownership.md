---
title: Slate-browser multi-subpath packages need local tsdown entry maps and split test-runtime typecheck ownership
date: 2026-04-18
category: developer-experience
module: slate-v2 package build
problem_type: developer_experience
component: tooling
symptoms:
  - slate-browser exports promised ./core, ./browser, ./playwright, and ./transports, but the live tsdown config only built src/index.ts
  - one TypeScript test project tried to typecheck Bun core tests and Vitest browser tests together and blew up on mixed global test types
  - the standalone Playwright tsconfig missed Node types even though it referenced node:os and process
root_cause: config_error
resolution_type: config_change
severity: high
tags: [slate-v2, slate-browser, tsdown, subpath-exports, bun, vitest, typescript]
---

# Slate-browser multi-subpath packages need local tsdown entry maps and split test-runtime typecheck ownership

## Problem

Pulling `slate-browser` into live `slate-v2` looked simple until the current
toolchain shape said otherwise.

The draft package was real, but the live repo had already hard-cut Rollup and
standardized on a shared `tsdown` config that only builds `src/index.ts`.

That is fine for one-entry packages.
It is wrong for a proof package whose public surface is mostly subpaths.

## Symptoms

- `packages/slate-browser/package.json` exported:
  - `.`
  - `./core`
  - `./browser`
  - `./playwright`
  - `./transports`
- the shared `config/tsdown.config.mts` only emitted `dist/index.js`
- a naive `tsc --project tsconfig.test.json` on all tests failed once Bun and
  Vitest globals lived in the same project
- `playwright/tsconfig.json` failed standalone typecheck because it used Node
  APIs without explicit Node types

## What Didn't Work

- copying the draft package as-is and keeping the old Rollup-era manifest
  assumptions
- reusing the shared one-entry `tsdown` config for a multi-subpath package
- treating Bun core tests and Vitest browser tests as one TypeScript ownership
  surface
- adding a speculative Playwright path alias that depended on deprecated
  `baseUrl` behavior under TypeScript 6

## Solution

Make `slate-browser` own its current package shape explicitly.

1. Give the package a local multi-entry build config in
   [packages/slate-browser/tsdown.config.mts](/Users/zbeyens/git/slate-v2/packages/slate-browser/tsdown.config.mts)
   so every exported subpath gets a real `dist/**` output:

```ts
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'browser/index': 'src/browser/index.ts',
    'core/index': 'src/core/index.ts',
    'playwright/index': 'src/playwright/index.ts',
    'transports/index': 'src/transports/index.ts',
  },
  format: ['esm'],
  platform: 'node',
  tsconfig: 'tsconfig.build.json',
})
```

2. Update
   [packages/slate-browser/package.json](/Users/zbeyens/git/slate-v2/packages/slate-browser/package.json)
   to match the live repo:
   - private proof package
   - ESM-only output
   - export map with explicit `types` + `default`
   - Bun-era scripts

3. Split TS ownership:
   - [tsconfig.build.json](/Users/zbeyens/git/slate-v2/packages/slate-browser/tsconfig.build.json)
     for package build declarations
   - [tsconfig.test.json](/Users/zbeyens/git/slate-v2/packages/slate-browser/tsconfig.test.json)
     for source + browser-test typecheck only
   - let `bun test test/core` verify the Bun test lane directly instead of
     forcing Bun and Vitest globals into one `tsc` project

4. Fix
   [playwright/tsconfig.json](/Users/zbeyens/git/slate-v2/playwright/tsconfig.json)
   with explicit Node types instead of leaning on accidental ambient state.

## Why This Works

- Multi-subpath packages need a build graph that matches their actual export
  contract. One-entry build config plus five exported subpaths is fake green.
- Bun and Vitest are two different test-runtime owners. Their globals do not
  belong in one catch-all TS project unless you enjoy type soup.
- Standalone config verification is useful precisely because it catches missing
  ambient assumptions like Node types before they leak into Playwright work.

## Prevention

- If a package exports subpaths, verify that the build config emits every one of
  them before trusting the manifest.
- Prefer package-local build config when one package breaks the repo-wide build
  assumptions. Shared config is a convenience, not a religion.
- Do not merge Bun and Vitest globals into one TS test project unless both
  lanes truly need it.
- For proof packages, let runtime-owned tests prove their own lane:
  - `bun test` for Bun-owned specs
  - `vitest` for browser-owned specs
- Run standalone config typechecks when you touch TS config files, especially
  around Playwright and build tooling.

## Related Issues

- [Package type publishing should sync lib declarations into dist in one build step](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-12-package-type-publishing-should-sync-lib-declarations-into-dist-in-one-build-step.md)
- [Slate v2 tsdown ESM cut needs source-mapped Jest and explicit DOM type exports](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-16-slate-v2-tsdown-esm-cut-needs-source-mapped-jest-and-explicit-dom-type-exports.md)
- [Slate workspace packages should have live root source entries under PnP](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-workspace-packages-should-have-live-root-source-entries-under-pnp.md)
