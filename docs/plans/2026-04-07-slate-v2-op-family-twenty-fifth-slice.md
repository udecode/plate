# Slate v2 Op-family Twenty-fifth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Broaden collapsed `delete(...)` across adjacent supported top-level block
  boundaries.

## Scope

- Keep the slice collapsed-delete only.
- Support:
  - explicit `Point`
  - current collapsed selection
  - `reverse`
  - `distance`
- Support adjacent supported top-level block crossings only.
- Require same-type/same-props block merges in this slice.
- Avoid multi-block deletion and cross-block explicit `Range` deletion in this
  slice.

## Phases

- [x] Confirm the adjacent cross-block delete semantics and current merge seam
- [x] Write focused failing tests
- [x] Implement the smallest honest adjacent cross-block delete follow-on
- [x] Sync package/public docs
- [x] Verify the touched package/docs
