---
date: 2026-04-09
topic: slate-v2-slate-provider-recovery
status: completed
---

# Slate v2 Slate Provider Recovery

## Goal

Recover the honest `<Slate>` provider surface that the live docs and examples
already depend on.

## Current Batch

1. restore `initialValue` initialization on the current editor/snapshot model
2. restore `onChange`, `onValueChange`, and `onSelectionChange`
3. prove initialization and callback semantics in runtime tests
4. align docs and RC ledgers to the recovered provider contract

## Result

- restored `initialValue` on the current provider seam, with one initialization
  pass per editor instance
- restored `onChange`, `onValueChange`, and `onSelectionChange`
- moved focused/readOnly/composing hook state to the provider seam so toolbar
  siblings can observe it too
- made value and selection callbacks diff snapshots directly instead of relying
  on raw operation classification, so `replace()` and similar helpers stay
  honest
- updated the `Slate` component docs to match the live provider surface
- updated the True Slate RC proof ledger and file-review ledger to carry the
  recovered provider contract explicitly

## Verification

- `yarn workspace slate-react run test`
- `yarn test:custom`
- `yarn lint:typescript`
