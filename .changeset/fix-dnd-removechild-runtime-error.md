---
"@platejs/dnd": patch
---

Fix `removeChild` RuntimeError when dragging and dropping blocks on the homepage playground editor. `useDomDropNode` now defers node moves in the drop handler to the next event loop tick (`setTimeout(..., 0)`), preventing synchronous React DOM unmounting collisions with native HTML5 drag-and-drop event execution.
