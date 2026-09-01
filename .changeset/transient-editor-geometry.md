---
'plitejs': major
---

Expose exact mounted-editor geometry for transient selection UI.

`plitejs/react` exposes `useSelectionGeometry`, `usePliteWidgetGeometry`, and `usePliteWidgetIds`. Widget descriptors use `target` with `selection`, `node`, or `annotation` targets; resolved widgets expose `available`; widget stores expose their owning `editor`.
