# Slate v2 Op-family Sixteenth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the first honest `Transforms.move(...)` cut without pretending the full
  legacy selection-motion family already exists.

## Scope

- Start with selection motion only.
- Support `distance`, `reverse`, and `edge`.
- Keep motion within each moved point's current text node.
- Support:
  - default both-edge motion
  - `anchor`
  - `focus`
  - `start`
  - `end`
- Avoid `unit` parity and any cross-node cursor walking in this slice.

## Phases

- [x] Confirm the narrow move semantics and current selection-helper seams
- [x] Write focused failing tests
- [x] Implement the smallest honest core/API slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs
