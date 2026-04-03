---
title: Selection Internals
type: testing
date: 2026-03-17
status: completed
---

# Selection Internals

## Goal

Complete ordered slice 2 only:

- add pure specs for the untested non-React selection helpers
- fix the real `shouldTrigger` bug if the new spec proves it
- add one focused `SelectionArea` suite for threshold and scroll behavior

## Scope

- `packages/selection/src/internal/utils/*`
- `packages/selection/src/internal/EventEmitter.ts`
- `packages/selection/src/internal/SelectionArea.ts`

## Findings

- `shouldTrigger` returns on the first trigger instead of checking whether any configured trigger matches
- there are no helper specs yet for `frames`, `selectAll`, `intersectsScroll`, or `EventTarget`
- `SelectionArea` is large, but the highest-value non-React seam is still threshold-start and scroll/frame scheduling
- numeric `startThreshold` is inclusive and uses the combined client-coordinate delta, so `30,40 -> 33,43` already crosses a threshold of `6`
- `pnpm turbo typecheck --filter=./packages/selection` only went green after a full root `pnpm build`; the earlier filtered build was not enough to satisfy workspace-built exports for this package

## Progress

- [x] add helper specs
- [x] fix `shouldTrigger` if red test proves the bug
- [x] add focused `SelectionArea` coverage
- [x] run targeted verification

## Verification

- `bun run test packages/selection/src/internal/utils/shouldTrigger.spec.ts packages/selection/src/internal/utils/frames.spec.ts packages/selection/src/internal/utils/selectAll.spec.ts packages/selection/src/internal/utils/intersects.spec.ts packages/selection/src/internal/EventEmitter.spec.ts packages/selection/src/internal/SelectionArea.spec.ts`
- `pnpm install`
- `pnpm turbo build --filter=./packages/selection`
- `pnpm turbo typecheck --filter=./packages/selection`
- `pnpm lint:fix`
- `bun run test packages/selection/src/internal/utils/shouldTrigger.spec.ts packages/selection/src/internal/utils/frames.spec.ts packages/selection/src/internal/utils/selectAll.spec.ts packages/selection/src/internal/utils/intersects.spec.ts packages/selection/src/internal/EventEmitter.spec.ts packages/selection/src/internal/SelectionArea.spec.ts`
- `pnpm build`
- `pnpm turbo typecheck --filter=./packages/selection`

## Outcome

- added pure helper coverage for `shouldTrigger`, `frames`, `selectAll`, `intersectsScroll`, and `EventTarget`
- added focused `SelectionArea` coverage for drag threshold start, single-click behavior, and manual scroll frame scheduling
- fixed the real `shouldTrigger` bug so later configured triggers can match
- confirmed package typecheck passes once the workspace is built at the repo root
