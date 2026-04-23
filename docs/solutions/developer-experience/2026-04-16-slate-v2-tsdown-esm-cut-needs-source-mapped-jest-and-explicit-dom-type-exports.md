---
title: Slate v2 tsdown ESM cut needs source-mapped Jest and explicit DOM type exports
date: 2026-04-16
category: developer-experience
module: slate-v2 package build
problem_type: developer_experience
component: tooling
symptoms:
  - hard-cutting Rollup in favor of tsdown made the Jest lane choke on ESM dist output from workspace packages
  - bundled declarations from slate-dom lost DOM helper type names like DOMElement and DOMRange
  - Next dev still needed to prove package src HMR without a package build loop
root_cause: config_error
resolution_type: code_fix
severity: high
tags: [slate-v2, tsdown, esm-only, jest, declarations, turbopack]
---

# Slate v2 tsdown ESM cut needs source-mapped Jest and explicit DOM type exports

## Problem

Moving `slate-v2` from Rollup to ESM-only `tsdown` cleaned up the package
surface, but two hidden build assumptions surfaced immediately:

1. Jest was still resolving workspace packages through built output.
2. `slate-dom` relied on DOM helper aliases that bundled declarations did not
   preserve automatically.

## Symptoms

- `packages/slate-react` tests failed on `Unexpected token 'export'` from
  `packages/slate/dist/index.js`.
- `packages/slate-react` typecheck failed on missing names like `DOMElement`,
  `DOMNode`, `DOMRange`, and `DOMSelection` from `slate-dom/dist/index.d.ts`.
- The app still needed proof that package source edits flowed through Next dev
  without rebuilding packages.

## What Didn't Work

- letting Jest import built workspace packages after switching them to ESM-only
- assuming `tsdown` bundled declarations would preserve the old DOM helper alias
  story automatically

## Solution

1. Move package tests back to source resolution in
   [jest.config.js](/Users/zbeyens/git/slate-v2/jest.config.js) with
   `moduleNameMapper` entries for workspace packages.
2. Run the `ts-jest` lane in isolated-module mode through
   [tsconfig.test.json](/Users/zbeyens/git/slate-v2/packages/slate-react/tsconfig.test.json)
   so Jest transpiles source instead of trying to be the global type gate.
3. Make the DOM helper exports explicit in
   [packages/slate-dom/src/utils/dom.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/utils/dom.ts)
   and
   [packages/slate-dom/src/index.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/index.ts):
   - type aliases for `DOMElement`, `DOMNode`, `DOMRange`, `DOMSelection`,
     `DOMStaticRange`, `DOMText`
   - explicit top-level type re-exports
4. Prove Next dev HMR by editing a package `src` file while the example app is
   already open, without running any package build command.

## Why This Works

- ESM-only package output is fine for build and publish, but Jest still wants a
  source-oriented test lane unless you fully retool it for ESM.
- DOM helper aliases that were tolerated in the old Rollup path need clearer
  type exports under bundled declaration output.
- Next dev source aliasing, not the package bundler, is the real HMR story.

## Prevention

- When cutting a library repo to ESM-only output, audit tests separately from
  build/publish. Jest often needs source mapping even when the package build is
  green.
- If declaration bundling drops helper alias names, fix the source export shape
  instead of patching `dist/`.
- For Next workspace dev, prove HMR with a live package `src` edit before
  declaring the migration complete.

## Related Issues

- [Next Turbopack + React Compiler + workspace packages](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-03-11-next-turbopack-react-compiler-workspace-aliases.md)
- [Slate v2 site should resolve workspace source with webpack and pin tsx test tsconfig](/Users/zbeyens/git/plate-2/docs/solutions/integration-issues/2026-04-11-slate-v2-site-should-resolve-workspace-source-with-webpack-and-pin-tsx-test-tsconfig.md)
