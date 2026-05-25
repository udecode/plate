---
date: 2026-04-09
topic: slate-v2-location-utility-surface-recovery
status: completed
---

# Slate v2 Location Utility Surface Recovery

## Goal

Recover the missing `Path`, `Point`, and `Range` helper breadth that serious
headless Slate callers still expect.

## Completed

- restored the missing `Path.*` relationship helpers:
  - `endsAfter`
  - `endsAt`
  - `endsBefore`
  - `isAfter`
  - `isChild`
  - `isCommon`
  - `isDescendant`
  - `isParent`
  - `isSibling`
  - `relative`
  - `operationCanTransformPath`
- restored `Path.transform(...)`
- restored `Point.transform(...)`
- restored the missing `Range.*` helpers:
  - `equals`
  - `surrounds`
  - `intersection`
  - `isBackward`
  - `isExpanded`
  - `isForward`
  - `points`
  - `transform`
- widened `snapshot-contract.ts` to prove the recovered location utility seam

## Verification

- `yarn test:custom`
- `yarn lint:typescript`
