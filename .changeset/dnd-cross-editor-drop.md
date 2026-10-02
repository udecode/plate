---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Replace `@platejs/dnd` with native block drag and drop. Remove `DndPlugin`, `useDraggable`, `useDropLine` and the `react-dnd` peers. A handle calls `editor.api.dom.drag.start(event, { node })`, the editor resolves and lands every drop, and `useDropIndicator()` paints the indicator.

**Migration:** Uninstall `react-dnd` and `react-dnd-html5-backend`, reinstall the `dnd` registry item, and move `canDropNode` or `onDropHandler` rules into a `transferVeto` contribution.
