---
'platejs': patch
---

- Paste picture files onto a focused board to upload them as image shapes, one per file in a row centered on the pointer, or on the view's center when the pointer is off the board.
- Drop picture files onto a board to upload them as image shapes, one per file in a row centered on the drop point.
- Upload the file of a picture copied from a web page when its link does not load, so the picture still lands on the board.
- Add `upload(files)` to `useBoardActions()` to upload picture files, such as ones a toolbar's file picker returns, as image shapes in a row centered on the view. Read `takesPictureFiles` through `useBoardView` to disable such a button on a board that takes no picture files.
- Add `fitsAfter(key)` to the upload plugin's API to ask whether a second file's placeholder fits after an upload placeholder, such as before a file picker opens for several files. It changes nothing in the document.
