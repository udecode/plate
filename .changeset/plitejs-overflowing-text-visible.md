---
'plitejs': patch
---

Fix `RangeGeometry.clipRect` and `visible` for an Editable whose text paints outside its own box without clipping, such as a board's. A popup placed by `useSelectionGeometry`, such as the floating toolbar, now shows over that text, and `useEditableClip` cuts by the same area.
