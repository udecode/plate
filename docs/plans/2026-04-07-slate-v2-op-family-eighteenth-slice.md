# Slate v2 Op-family Eighteenth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the first honest collapsed-delete follow-on after the narrow
  `Editor.before(...)` / `Editor.after(...)` seam.

## Scope

- Keep `delete(...)` same-text only for collapsed point/selection deletion.
- Support `reverse`.
- Support `distance`.
- Support:
  - explicit `Point`
  - current collapsed selection when `at` is omitted
- Keep explicit non-empty range deletion narrow and unchanged in this slice.
- Avoid cross-node deletion, `unit`, and hanging parity in this slice.

## Phases

- [x] Confirm the narrow collapsed-delete semantics and current text/location seams
- [x] Write focused failing tests
- [x] Implement the smallest honest core/API slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs
