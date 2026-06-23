---
date: 2026-04-09
topic: plite-workspace-root-entry-closure
status: completed
---

# Plite Workspace Root Entry Closure

## Goal

Make the workspace packages source-runnable under Yarn PnP instead of relying
on built `dist/` output just to resolve package-name imports.

## Completed

- added workspace root `index.ts` entries for:
  - `packages/plite`
  - `packages/plite-history`
  - `packages/plite-react`
  - `packages/plite-dom`
  - `packages/plite-browser`
- kept the root entries tiny:
  - `export * from './src'`

This mirrors the `plite-hyperscript` workspace fix and makes the package roots
source-addressable in the workspace even when `dist/` output is stale or absent.

## Verification

- `yarn lint:typescript`
- `yarn workspace slate-react run test`
- `yarn workspace plite-browser test`
