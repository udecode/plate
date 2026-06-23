---
date: 2026-04-09
topic: plite-plite-browser-package-test-closure
status: completed
---

# Plite Plite Browser Package Test Closure

## Goal

Make the `plite-browser` package-local `test` command match the package proof
claim instead of silently skipping the selection lane.

## Completed

- updated `packages/plite-browser/package.json` so package-local `test` runs:
  - `test:core`
  - `test:dom`
  - `test:selection`
- updated `packages/plite-browser/README.md` to document the package-local test
  lane

## Verification

- `yarn workspace plite-browser test`
