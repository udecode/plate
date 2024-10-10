---
'@udecode/plate-floating': patch
---

- `getSelectionBoundingClientRect` is now returning the bounding client rect of the editor selection instead of the dom selection. This is more robust for cases like floating toolbar.
- Update floating toolbar position on value change, in addition to selection change.
- Return `clickOutsideRef` from `useFloatingToolbar` so it can be used to close the toolbar when clicking outside of it. Use `ignore-click-outside/toolbar` class to ignore clicks outside of the toolbar.
