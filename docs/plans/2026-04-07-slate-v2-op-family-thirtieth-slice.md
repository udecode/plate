# Slate v2 Op-family Thirtieth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the first honest range/current-selection `liftNodes(...)` cut for
  top-level wrapper-child spans.

## Scope

- Keep exact `Path` lifting intact.
- Support:
  - exact `Path`
  - explicit `Range`
  - current selection when `at` is omitted
- For `Range` or current selection, lift intersected child blocks out of one
  top-level wrapper parent.
- Keep the slice to wrapper-child spans only.
- Avoid deeper arbitrary range lifting in this slice.

## Phases

- [x] Confirm the wrapper-child range-lift semantics and current structural seams
- [x] Add focused failing tests for path/range/current-selection lifting
- [x] Implement the smallest honest range-based `liftNodes(...)` follow-on
- [x] Sync package/public docs
- [x] Verify the touched package/docs
