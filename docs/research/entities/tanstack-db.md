---
title: TanStack DB
type: entity
status: partial
updated: 2026-04-14
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# TanStack DB

Type: normalized client-store reference

TanStack DB is the best non-editor analogy for annotation metadata in this
lane.

## Why it matters

- normalized collections and live queries fit external annotation stores well
- `useSyncExternalStore` plus stable snapshots is the right React posture
- better model for annotation metadata than rerender-time arrays

## Strongest local evidence

- `../db/README.md`
- `../db/packages/react-db/src/useLiveQuery.ts`

## Limits

- not an editor engine
- useful for store shape and runtime posture, not text semantics
