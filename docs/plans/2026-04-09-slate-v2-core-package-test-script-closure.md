---
date: 2026-04-09
topic: slate-v2-core-package-test-script-closure
status: completed
---

# Slate v2 Core Package Test Script Closure

## Goal

Make the core package proof lanes runnable package-by-package instead of only
through root-level custom commands.

## Completed

- added a package-local `test` script to:
  - `packages/slate/package.json`
  - `packages/slate-history/package.json`
- fixed the `slate-hyperscript` package-local `test` script so it runs from the
  repo root where the shared `mocha` dependency actually exists under Yarn PnP
- widened the root `test:mocha` lane so it includes the full
  `slate-hyperscript` fixture suite, not just the smoke file

## Verification

- `yarn workspace slate run test`
- `yarn workspace slate-history run test`
- `yarn workspace slate-hyperscript run test`
- `yarn test:mocha`
