---
title: Bun Check Fix
type: debugging
date: 2026-03-24
status: completed
---

# Bun Check Fix

## Goal

- Get `bun check` green again.
- Fix the first real failing stage only.

## Current Plan

1. Reproduce `bun check` and identify the first actual failure.
2. Patch the minimal failing seam.
3. Run targeted verification.
4. Rerun `bun check`.

## Findings

- The first real failure was in `@platejs/selection#typecheck`.
- The failing file was `packages/selection/src/react/hooks/useSelectionArea.spec.tsx`.
- The error was `TS2554: Expected 0 arguments, but got 1` at the mock instantiation `new SelectionAreaMock(options)`.
- That was a stale spec typing mismatch, not a runtime package bug.
- After that, the fast suite was still red because `test-fast.mjs` only isolated specs that directly contained `mock.module(`.
- `packages/toc/src/react/hooks/useContentObserver.spec.tsx` was still running in the shared batch because its `mock.module(...)` calls lived in `packages/toc/src/react/hooks/tocHookMocks.ts`.
- The runner now recursively follows local imports and isolates specs whose helper graph contains `mock.module(`.
- Root `bun check` then hit the known hashed-dist workspace race during `g:build`.
- `g:build` now falls back to `turbo --concurrency=1` after a failed parallel build, and `g:typecheck` uses that stabilized build wrapper once instead of doing two blind parallel retries.

## Verification

- `pnpm lint:fix`
- `bun tooling/scripts/test-fast.mjs`
- `bun check`
