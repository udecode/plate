# Slate v2 Op-family Twenty-seventh Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land honest `Path` support for `Editor.before(...)` / `Editor.after(...)`.

## Scope

- Support `Path` by reusing the current node range.
- Keep the current `Point | Range` semantics unchanged.
- Support:
  - top-level block paths
  - supported mixed-inline descendant paths
- Avoid `voids` and unsupported-path parity in this slice.

## Phases

- [x] Confirm the Path before/after semantics and current location seams
- [x] Write focused failing tests
- [x] Implement the smallest honest Path support via `getCurrentRangeForPath(...)`
- [x] Sync package/public docs
- [x] Verify the touched package/docs
