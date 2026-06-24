---
date: 2026-04-09
topic: plite-history-isHistory-recovery
status: completed
---

# Plite History isHistory Recovery

## Goal

Restore the small legacy `History.isHistory(...)` helper on the current
`plite-history` package surface.

## Completed

- added `packages/plite-history/src/history.ts`
- exported `History` from the package root
- proved `History.isHistory(...)` in `history-contract.ts`
- updated the history front-door docs to name the helper

## Verification

- `yarn workspace slate-history run test`
- `yarn test:mocha`
- `yarn lint:typescript`
