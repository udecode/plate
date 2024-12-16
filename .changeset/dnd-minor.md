---
'@udecode/plate-dnd': minor
---

- `useDndNode` now supports horizontal orientation. New option is `orientation?: 'horizontal' | 'vertical'`. Default is `vertical`.
- `useDraggableState`, `useDndNode`: add `canDropNode` callback option to query if a dragged node can be dropped onto a hovered node.
- `useDropLine`:
  - Added `id` option to show dropline only for hovered element. Default is `useElement().id`.
  - Added `orientation` option to filter droplines by orientation (`'horizontal' | 'vertical'`). Default is `vertical`.
  - Returns empty dropline if orientation doesn't match (e.g., horizontal dropline in vertical orientation)
  - Returns empty dropline if elementId doesn't match current hovered element
