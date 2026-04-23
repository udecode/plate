# Slate v2 Op-family Twentieth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Cash out the broader mixed-inline `Editor.before(...)` / `Editor.after(...)`
  seam into `Transforms.move(...)`.

## Scope

- Keep `distance`, `reverse`, and `edge`.
- Support moving across sibling text leaves inside one supported top-level
  block, including inline descendants.
- Keep `start` / `end` resolution from selection direction.
- Avoid cross-block movement and `unit` parity in this slice.

## Phases

- [x] Confirm the mixed-inline move semantics and the current location seam
- [x] Write focused failing tests
- [x] Implement the smallest honest core/API slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs
