# Slate v2 Op-family Twenty-sixth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Cash out explicit non-empty `Range` deletion across adjacent supported
  top-level block boundaries.

## Scope

- Keep the slice to adjacent supported top-level block crossings only.
- Support:
  - explicit non-empty `Range`
  - current non-empty selection when `at` is omitted
- Keep same-type/same-props block merge requirements.
- Avoid wider multi-block range deletion in this slice.

## Phases

- [x] Confirm the adjacent cross-block range-delete semantics and current helper coverage
- [x] Write focused failing tests
- [x] Implement or confirm the smallest honest adjacent cross-block range-delete slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs
