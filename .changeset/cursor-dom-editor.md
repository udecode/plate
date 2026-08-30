---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Keep refresh scheduling and resize observation inside `useCursorOverlayPositions`; remove the standalone `useRequestReRender` and `useRefreshOnResize` hooks. Keep cursor rendering in copied registry UI and remove the package `CursorOverlay` and `CursorOverlayContent` components.

Accept the minimal Plite DOM and read capabilities used by cursor geometry helpers, including layered Plate editors, instead of requiring or rebuilding a complete `DOMEditor`. Own generic cursor overlay state, positioning, resize refresh, and minimum-width normalization in `platejs/react`.

**Migration:** Replace `Editor` annotations used with cursor geometry helpers with `DOMEditor` from `plitejs/dom`. Build custom overlays from `useCursorOverlayPositions` in `platejs/react`.
