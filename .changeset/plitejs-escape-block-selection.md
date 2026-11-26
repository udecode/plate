---
'plitejs': patch
---

- Fix `Escape` leaving a block selection in place. When no earlier handler takes the key, `Escape` leaves a caret at the end of the block the selection ends on, or right after a selected image or other object. A read-only editor keeps the selection.
