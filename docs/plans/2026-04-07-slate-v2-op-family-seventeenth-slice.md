# Slate v2 Op-family Seventeenth Slice

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

- Land the first honest location-walking seam: narrow `Editor.before(...)` and
  `Editor.after(...)`.

## Scope

- Start with same-text location walking only.
- Support `Point` and `Range`.
- Support `distance`.
- Resolve `Range` edges the honest way:
  - `before(...)` uses the start edge
  - `after(...)` uses the end edge
- Return `undefined` at the current text-node boundary.
- Avoid `Path`, `unit`, `voids`, and cross-node walking in this slice.

## Phases

- [x] Confirm the narrow before/after semantics and current location seams
- [x] Write focused failing tests
- [x] Implement the smallest honest core/API slice
- [x] Sync package/public docs
- [x] Verify the touched package/docs
