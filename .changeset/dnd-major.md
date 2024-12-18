---
'@udecode/plate-dnd': major
---

- Removed `useDndBlock`, `useDragBlock`, and `useDropBlock` hooks in favor of `useDndNode`, `useDragNode`, and `useDropNode`.
- Removed `DndProvider` and `useDraggableStore`. Drop line state is now managed by `DndPlugin` as a single state object `dropTarget` containing both `id` and `line`.
- `useDropNode`: removed `onChangeDropLine` and `dropLine` options

Migration steps:

- Remove `DndProvider` from your draggable component (e.g. `draggable.tsx`)
- Replace `useDraggableStore` with `useEditorPlugin(DndPlugin).useOption`
