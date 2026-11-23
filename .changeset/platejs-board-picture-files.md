---
'platejs': patch
---

- Paste text or a link onto a focused board to add it as a selected note at the pointer, or at the view's center when the pointer is off the board. One undo removes it.
- Paste or drop picture files onto a board to upload them as image shapes, in a row centered on the pointer or the drop point.
- Upload the file of a picture copied from a web page when its link does not load, so the picture still lands on the board.
- Add `upload(files)` to `useBoardActions()` to upload picture files, such as ones from a toolbar's file picker. Read `takesPictureFiles` through `useBoardView` to disable that button on a board that takes no picture files.
- Add `fitsAfter(key)` to the upload plugin's API to ask whether another file's placeholder fits after an upload placeholder, such as before a file picker opens for several files.
