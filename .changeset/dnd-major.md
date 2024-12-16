---
'@udecode/plate-dnd': major
---

- Removed the `useDndBlock`, `useDragBlock`, and `useDropBlock` hooks in favor of `useDndNode` and `useDragNode`, `useDropNode`.
- Remove `DndProvider` and `useDraggableStore`. The drop line state is now managed by `DndPlugin`: `dropTarget` as a single state object containing both `id` and `line`. Migration steps:
  - Remove `DndProvider` from your draggable component (e.g. `draggable.tsx`)
  - Replace `useDraggableStore` with `useEditorPlugin(DndPlugin).useOption`.
- `useDropNode`: remove `onChangeDropLine`, `dropLine` options
