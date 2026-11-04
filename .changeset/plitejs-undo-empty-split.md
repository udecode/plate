---
'plitejs': patch
---

- Fix undo and redo of a split that leaves an empty block, such as splitting a quote before its first line or after its last, once a teammate's edit arrives, in the same editor or over Yjs. The undo threw, history dropped the step, and saving the history with `History.toJSON` threw too. The undo now joins the two blocks again and the redo splits them again, and both keep the teammate's edit. When the teammate removed the other block, the undo leaves the empty one. Over Yjs, a paragraph a teammate adds to the empty block while Bob undoes is still lost on both peers when the teammate also removes the other block's last line, or when both blocks are empty.
