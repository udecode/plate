---
date: 2026-04-17
topic: plite-slate-history-full-bun-cutover
status: completed
---

# Goal

Move `/Users/zbeyens/git/plite/packages/plite-history/test` fully onto Bun
and remove the last Mocha lane from the repo.

# Findings

- `packages/plite-history/test/index.js` had the same problem the old `slate`
  entry had: fixtures imported `jsx` from it while it also bootstrapped the
  whole suite
- the package only needs two fixture groups:
  - `undo`
  - `isHistory`
- one package-local Bun entry is enough to replace the Mocha harness

# Plan

1. Turn `packages/plite-history/test/index.js` into a pure helper export
2. Add one Bun suite entry for the full `plite-history` fixture corpus
3. Switch package and root scripts so Mocha is gone entirely
4. Verify package build, typecheck, lint, Bun, and root test flow

# Verification

- `pnpm --filter plite-history test`
- `pnpm turbo build --filter=./packages/plite-history`
- `pnpm turbo typecheck --filter=./packages/plite-history`
- `pnpm lint:fix`
- `pnpm typecheck`
- `pnpm test`
