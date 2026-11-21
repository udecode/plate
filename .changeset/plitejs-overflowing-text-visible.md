---
'plitejs': patch
---

Fix `RangeGeometry.clipRect` and `visible` for an Editable whose text paints outside its own box without clipping, such as a board's Editable, whose notes paint outside it. That text counted as hidden, so a popup placed by `useSelectionGeometry`, such as the copied floating toolbar, never showed over it. `clipRect` is the viewport cut by every box that clips the Editable, and the Editable's own box cuts it only when its overflow clips. `useEditableClip` cuts by the same area.
