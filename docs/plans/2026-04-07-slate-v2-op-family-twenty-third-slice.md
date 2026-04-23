# Slate v2 Op-family Twenty-third Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Broaden mixed-inline non-empty `Range` deletion to spans that fully cover an
  interior inline subtree inside one supported top-level block.

## Scope

- Keep deletion inside one supported top-level block.
- Support:
  - explicit non-empty `Range`
  - current non-empty selection when `at` is omitted
- Support fully covered interior descendants between the start and end edges.
- Avoid cross-block deletion and generic arbitrary tree ranges in this slice.

## Phases

- [x] Confirm the wider mixed-inline range-delete semantics and current helpers
- [ ] Write focused failing tests
- [ ] Implement the smallest honest core/API slice
- [ ] Sync package/public docs
- [ ] Verify the touched package/docs
