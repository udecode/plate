---
'platejs': major
---

Remove `@platejs/selection` integration, expose Plite one-or-many node selection through Plate editors, and add composable `NodeSelectionHighlight` and `NodeSelectionDrag` components. Cache selectable geometry per drag gesture, publish selection only when its exact node set or direction changes, and reuse mounted highlight portals as the selection grows.

`NodeSelectionDrag` also moves a block selection between sibling blocks with ArrowUp and ArrowDown, extends or contracts it with Shift+ArrowUp and Shift+ArrowDown, and keeps it when a context menu opens on a selected block. Mark a descendant with `data-node-selection-target` to limit an element's drag hit area.
