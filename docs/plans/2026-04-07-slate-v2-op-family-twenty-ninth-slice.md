# Slate v2 Op-family Twenty-ninth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the first honest range-based `unwrapNodes(...)` cut for top-level wrapper
  block spans.

## Scope

- Keep exact `Path` unwrapping intact.
- Support:
  - exact `Path`
  - explicit `Range`
  - current selection when `at` is omitted
- For `Range` or current selection, unwrap intersected top-level wrapper blocks.
- Keep the slice to top-level wrappers whose direct children are elements.
- Avoid mixed-inline partial-range unwrapping in this slice.

## Phases

- [x] Confirm the top-level range-unwrap semantics and current structural seams
- [x] Add focused failing tests for path/range/current-selection unwrapping
- [x] Implement the smallest honest range-based `unwrapNodes(...)` follow-on
- [x] Sync package/public docs
- [x] Verify the touched package/docs
