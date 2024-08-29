---
'@udecode/plate-dnd': major
---

- `createDndPlugin` -> `DndPlugin`
- Remove `editor.isDragging`, use `editor.getOptions(DndPlugin).isDragging` instead
- Move `dndStore` to `DndPlugin`
