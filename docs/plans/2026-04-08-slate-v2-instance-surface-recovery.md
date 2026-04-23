---
date: 2026-04-08
topic: slate-v2-instance-surface-recovery
status: completed
---

# Slate v2 Instance Surface Recovery

## Goal

Start `True Slate RC` tranche 2 by restoring an overrideable editor instance
surface for the methods the current engine already supports.

## Current Slice

1. add red tests for `createEditor()` instance methods and helper delegation
2. widen the `Editor` type and `createEditor()` instance shape
3. make `Editor` and `Transforms` namespace helpers delegate through instance
   methods where the engine already supports those seams
4. run targeted slate tests

## Notes

- This slice is not full legacy parity.
- `withoutNormalizing` is still a separate explicit decision unless the current
  transaction seam proves it is an honest alias.

## Result

- `createEditor()` now attaches an overrideable instance surface for the
  methods the current engine already supports.
- `Editor.*` delegates through that instance seam.
- `Transforms.*` stays low-level and unchanged, so the slice restores the
  override seam without silently changing transform semantics.
- the `slate` source barrel again exports the runtime helper surface currently
  consumed by sibling packages:
  `Node`, `Text`, `Element`, `Range`, `Path`, and `isObject`.
- the next behavior-method seam (`deleteBackward`, `deleteForward`,
  `deleteFragment`) is now also restored on the editor instance and on
  `Editor.*` using the current delete transform semantics.
- `withoutNormalizing` is now restored as an explicit compatibility alias over
  the current transaction boundary.
- `insertBreak` and `insertSoftBreak` are now recovered for the currently
  proved top-level block split seam, including edge-position `always` behavior
  at the start and end of a text node.
- `editor.isInline`, `editor.isVoid`, `Editor.isInline`, `Editor.isVoid`, and
  `Editor.isEditor` are now restored on the current query seam, with
  `EditableTextBlocks` using `editor.isInline` as the default runtime fallback
  when no explicit `isInline` prop is supplied.
- `markableVoid` is now restored on the current seam, and `addMark` /
  `removeMark` honor it for the text child inside a void element when the hook
  returns `true`.
- `normalizeNode` is now restored as a real outer-transaction multi-pass seam,
  and the forced-layout example/runtime proof uses that seam instead of the old
  subscribe-based workaround.
- verification:
  - `yarn test:custom`
  - `yarn lint:typescript`
