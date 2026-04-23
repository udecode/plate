# Slate v2 Op-family Twenty-second Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Broaden explicit non-empty `Range` deletion across adjacent mixed-inline
  sibling leaves inside one supported top-level block.

## Scope

- Keep the slice to adjacent sibling-leaf crossings only.
- Support:
  - explicit non-empty `Range`
  - current non-empty selection when `at` is omitted
- Keep deletion inside one supported top-level block.
- Avoid arbitrary multi-leaf or cross-block range deletion in this slice.

## Phases

- [x] Confirm the adjacent mixed-inline range-delete semantics and current helper seams
- [x] Write focused failing tests
- [x] Implement the smallest honest core/API slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs
