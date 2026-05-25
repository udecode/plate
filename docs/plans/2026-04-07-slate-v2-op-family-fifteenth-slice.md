# Slate v2 Op-family Fifteenth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the exact-path structural counterpart after `wrapNodes(...)` and
  `unwrapNodes(...)`: a narrow `liftNodes(...)` cut.

## Scope

- Start with exact path-based lifting only.
- Start with element nodes only.
- Support the honest exact structural cases:
  - only child
  - first child
  - middle child
  - last child
- Avoid match/mode/selection/void parity in this slice.

## Phases

- [x] Confirm the exact path lift semantics and current structural seams
- [x] Write focused failing tests
- [x] Implement the smallest honest core/API slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs
