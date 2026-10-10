---
'platejs': major
---

Remove `@platejs/selection` integration, expose Plite one-or-many node selection through Plate editors, and add composable `NodeSelectionHighlight` and `NodeSelectionDrag` components. Cache selectable geometry per drag gesture, publish selection only when its exact node set or direction changes, and reuse mounted highlight portals as the selection grows.

Preserve multi-block selection when opening a context menu on selected content, move between sibling block selections with ArrowUp and ArrowDown, and extend or contract the selection with Shift+ArrowUp and Shift+ArrowDown.
