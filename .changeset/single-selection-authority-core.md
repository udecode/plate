---
'@platejs/core': major
---

Remove `@platejs/selection` integration, expose Plite one-or-many node selection through Plate editors, and add composable `NodeSelectionHighlight` and `NodeSelectionDrag` components. Cache selectable geometry per drag gesture, publish selection only when its exact node set or direction changes, and reuse mounted highlight portals as the selection grows.
