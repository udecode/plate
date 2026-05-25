---
date: 2026-04-09
topic: slate-v2-slate-react-surface-recovery
status: completed
---

# Slate v2 Slate-react Surface Recovery

## Goal

Close the next honest `packages/slate-react/src` public-surface gap in one
batch.

## Current Batch

1. audit the remaining missing `slate-react` public names against the current
   runtime shape
2. recover the honest hook/context/default-alias surface
3. recover a current `ReactEditor` / `withReact` seam only where the bridge can
   actually prove it
4. widen runtime proof and sync the proof ledgers

## Notes

- do not fake the old `slate-dom` plugin stack
- restore only the names that can be backed by the current React + DOM bridge
- if a legacy surface is still too broad, cut the overclaim in docs instead of
  lying in code

## Result

- restored `useElement`, `useElementIf`, and `useSelected` on the current
  render-element seam
- restored default component aliases:
  `DefaultElement`, `DefaultLeaf`, `DefaultText`, and `DefaultPlaceholder`
- restored `withReact` as a compatibility construction helper that records the
  current clipboard fragment format key without wrapping the editor instance
- restored a current `ReactEditor` namespace over the mounted bridge:
  `isComposing`, `isFocused`, `isReadOnly`, `blur`, `focus`, `deselect`,
  `findKey`, `findPath`, `hasDOMNode`, `toDOMNode`, `toDOMPoint`,
  `toDOMRange`, `toSlateNode`, `toSlatePoint`, `toSlateRange`, `insertData`,
  and `setFragmentData`
- widened the mounted DOM bridge enough to support that helper seam honestly
- updated the `slate-react` docs to describe the current proved helper surface
  instead of the old plugin-era overclaim
- updated the True Slate RC proof ledger and file-review ledger to carry the
  recovered `slate-react` surface explicitly

## Verification

- `yarn workspace slate-react run test`
- `yarn test:custom`
- `yarn lint:typescript`
