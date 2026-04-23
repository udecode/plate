---
date: 2026-04-09
topic: slate-v2-slate-browser-package-test-closure
status: completed
---

# Slate v2 Slate Browser Package Test Closure

## Goal

Make the `slate-browser` package-local `test` command match the package proof
claim instead of silently skipping the selection lane.

## Completed

- updated `packages/slate-browser/package.json` so package-local `test` runs:
  - `test:core`
  - `test:dom`
  - `test:selection`
- updated `packages/slate-browser/README.md` to document the package-local test
  lane

## Verification

- `yarn workspace slate-browser test`
