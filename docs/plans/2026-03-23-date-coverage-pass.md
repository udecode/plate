---
title: Date Coverage Pass
date: 2026-03-23
---

# `date` Coverage Pass

## Summary

Do one tiny non-React pass on `@platejs/date`.

Real seams:

- `insertDate`
- a couple leftover `isPointNextToNode` branches

Nothing else here deserves a bigger campaign.

## Constraints

- fast lane only
- no `/react`
- no fake wrapper coverage beyond what proves the bound transform contract

## Planned Coverage

1. `insertDate.spec.tsx`
   - inserts a date node plus trailing spacer at the cursor
   - bound `insert.date` respects configured node type
   - forwards explicit insertion options like `at`

2. `isPointNextToNode.spec.tsx`
   - single-point empty-text boundary can detect the next inline node
   - throws when neither `selection` nor `at` is available
   - middle-of-text points still return false

## Verification

- targeted `bun test` on touched `date` specs
- `bun test packages/date/src`
- `pnpm test:profile -- --top 20 packages/date/src`
- `pnpm test:slowest -- --top 20 packages/date/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/date`
- `pnpm turbo typecheck --filter=./packages/date`
- `pnpm lint:fix`

## Deferred

- `/react`
- anything broader than the direct transform and query seam
