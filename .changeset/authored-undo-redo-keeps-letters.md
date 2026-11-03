---
'plitejs': patch
---

- Fix undo and redo losing letters when a merge of two lines and a teammate's accept in the merged line are both undone. In the flow where Bob merges `AAAA` and `BBBB`, Dan accepts erin's suggested deletion of the last `B`, both undo and Dan redoes, both peers gave `AAB` and `CCCC`. They now give `AAAA`, `BBB` and `CCCC`, as a fresh accept does.
- Fix undoing a merge into a quoted line failing, or dropping letters typed in the merged text, after a teammate undid first.
- Fix undoing a merge whose update also bolded or colored text: the undo failed, dropped a teammate's letter, left the mark behind or moved a teammate's mark onto other letters. The mark can still stay on letters a teammate moved as their own piece of text or inside a link.
- Fix undoing a merge into a quoted line scattering its letters when a teammate moved the quote and typed elsewhere in the same update.
- Fix a Yjs import retyping letters its peer kept, or moving a mark onto a neighbor's letter, when the peer edits inside a line.
- Save history at version 5 when an undo step keeps `rest` or `carried`. `History.fromJSON` reads versions 4 and 5.
