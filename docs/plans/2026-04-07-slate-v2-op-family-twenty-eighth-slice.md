# Slate v2 Op-family Twenty-eighth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the first honest range-based `wrapNodes(...)` cut for top-level block
  spans.

## Scope

- Keep path-based wrapping intact.
- Support:
  - exact `Path`
  - explicit `Range`
  - current selection when `at` is omitted
- For `Range` or current selection, wrap the intersected top-level blocks.
- Keep the slice to supported top-level block spans only.
- Avoid mixed-inline partial-range wrapping and unwrap-range work in this slice.

## Phases

- [x] Confirm the top-level block range-wrap semantics and current structural seams
- [x] Add focused failing tests for path/range/current-selection block wrapping
- [x] Implement the smallest honest range-based `wrapNodes(...)` follow-on
- [x] Sync package/public docs
- [x] Verify the touched package/docs
