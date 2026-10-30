---
'platejs': major
---

Remove `@platejs/selection` integration, expose Plite one-or-many node selection through Plate editors, and add composable `NodeSelectionHighlight` and `NodeSelectionDrag` components. Cache selectable geometry per drag gesture, publish selection only when its exact node set or direction changes, and reuse mounted highlight portals as the selection grows.

`NodeSelectionDrag` also moves a block selection between sibling blocks with ArrowUp and ArrowDown, extends or contracts it with Shift+ArrowUp and Shift+ArrowDown, and keeps it when a context menu opens on a selected block. Mark a descendant with `data-node-selection-target` to limit an element's drag hit area.

Keep block selection scrolling while the pointer stays near an edge of the editor's visible area, at the same speed as text selection, keep the drag's starting point on the content where it began while the editor scrolls or changes size, and clip the drag rectangle to the visible part of the editor. Render the drag rectangle where `NodeSelectionDrag` is placed instead of at the end of the document body, so a stacking context around the editor also contains it.

Keep marquee hit areas current when blocks resize during a drag, including media that reveal captions inside fixed-size editors.

End block marquee selection when releasing the pointer over native media controls or losing pointer capture.
