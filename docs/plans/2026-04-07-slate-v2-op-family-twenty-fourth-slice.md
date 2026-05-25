# Slate v2 Op-family Twenty-fourth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Broaden `Editor.before(...)` / `Editor.after(...)` across supported top-level
  block boundaries and let `Transforms.move(...)` inherit that seam.

## Scope

- Keep `Point | Range` and `distance`.
- Support walking across supported top-level blocks.
- Treat the boundary between block end and next block start as one step.
- Let `Transforms.move(...)` cash out the same broader location seam.
- Avoid `Path` support, unsupported blocks, and cross-block delete widening in
  this slice.

## Phases

- [x] Confirm the cross-block location semantics and current stepper behavior
- [x] Write focused failing tests
- [x] Implement the smallest honest cross-block stepper and move(...) follow-on
- [x] Sync package/public docs
- [x] Verify the touched package/docs
