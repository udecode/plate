# Slate v2 Op-family Twelfth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Broaden the first honest `delete` family cut in `slate` from exact `{ at: Path }` to the next exact case: `Point`.

## Scope

- Support exact point deletion only.
- Keep the slice narrow:
  - no range deletion
  - no unit/distance/reverse/hanging parity
  - no broad legacy `delete(...)` claim

## Phases

- [ ] Confirm the exact point-delete semantics and current helper seam
- [ ] Write focused failing tests
- [ ] Implement the smallest honest `delete` broadening
- [ ] Sync package/public docs
- [ ] Verify the touched package/docs
