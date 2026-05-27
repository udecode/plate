# Slate v2 Op-family Nineteenth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Broaden `Editor.before(...)` / `Editor.after(...)` from one text node to the
  next honest seam: mixed-inline walking inside one supported top-level block.

## Scope

- Keep `Point | Range` support.
- Keep `distance`.
- Support walking across sibling text leaves inside one supported top-level
  block, including inline descendants.
- Keep boundary behavior honest:
  - `before(...)` returns the previous leaf end at a boundary
  - `after(...)` keeps walking forward through the block text stream
- Avoid cross-block walking and `Path` support in this slice.

## Phases

- [x] Confirm the narrow mixed-inline before/after semantics and current helpers
- [x] Write focused failing tests
- [x] Implement the smallest honest core/API slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs
