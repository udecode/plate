---
'plitejs': major
---

Expose exact mounted-editor geometry for transient selection UI.

`plitejs/react` exposes `useSelectionGeometry`, and `plitejs/yjs/react` exposes `useYjsRemoteCursorGeometry`. Each returns a `RangeGeometry` with the range's `boundingRect`, `focusRect` and `rects`, plus `clipRect`, the part of the Editable anyone can see, and `visible`, a `RangeRects` of the range's boxes cut to it, so a popup or caret can hide once its text scrolls out of view. The inactive and view-selection carets draw only inside that part. `useEditableClip` cuts boxes a popover measured itself, such as its anchor's lines, to that same part by the same rule.
