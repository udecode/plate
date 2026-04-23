# Slate v2 Op-family Twenty-first Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Broaden collapsed `delete(...)` across mixed-inline sibling leaves inside one
  supported top-level block.

## Scope

- Keep the slice collapsed-delete only.
- Support:
  - explicit `Point`
  - current collapsed selection
  - `reverse`
  - `distance`
- Support crossing sibling text leaves inside one supported top-level block,
  including inline descendants.
- Avoid arbitrary explicit multi-leaf `Range` deletion in this slice.

## Phases

- [x] Confirm the mixed-inline collapsed-delete semantics and current location seam
- [x] Write focused failing tests
- [x] Implement the smallest honest core/API slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs
