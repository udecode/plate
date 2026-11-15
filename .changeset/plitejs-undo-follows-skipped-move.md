---
'plitejs': patch
---

- Fix undo after an update made with `history: 'skip'` and the editor's own commands moved a block and typed in it. The undo lost a letter that update typed, or put your edit back in the wrong line. When each undo and redo step holds one plain edit, such as letters typed or removed, one Enter, one line join or one block property set, undo, redo and each older undo now keep that update's move and its letters and give back only your own edit, also after `History.toJSON` and `History.fromJSON`. Other histories, a move between parents that allow different children, and a raw change such as a Yjs import undo as before.
- Fix a redo failing, with the error sent to `lifecycleErrorSink`, when a live anchor sat in a block that an update made with `history: 'skip'` moved.
- Fix anchors coming back one letter off after a redo and an undo, when an update made with `history: 'skip'` typed after your edit in the same line.
- `History.toJSON` writes version 7. `History.fromJSON` reads versions 4 to 7.
