---
date: 2026-04-09
topic: slate-v2-history-isHistory-recovery
status: completed
---

# Slate v2 History isHistory Recovery

## Goal

Restore the small legacy `History.isHistory(...)` helper on the current
`slate-history` package surface.

## Completed

- added `packages/slate-history/src/history.ts`
- exported `History` from the package root
- proved `History.isHistory(...)` in `history-contract.ts`
- updated the history front-door docs to name the helper

## Verification

- `yarn workspace slate-history run test`
- `yarn test:mocha`
- `yarn lint:typescript`
