---
'plitejs': patch
---

- Fix undo and redo of a split that leaves an empty block, such as splitting a quote before its first line or after its last, once a teammate's edit arrives, in the same editor or over Yjs. The undo threw, history dropped the step, and saving the history with `History.toJSON` threw too. The undo now joins the two blocks again and the redo splits them again, and both keep the teammate's edit. When the teammate removed the other block, the undo leaves the empty one. Over Yjs, a paragraph a teammate adds to the empty block while the undo runs now shows on both peers, also when the teammate removes the other block's last line or both blocks are empty. After a redo it sits in the first block. It is still lost when the undoing peer unwraps the first block before the teammate's edit arrives.
- Rooms now use schema metadata format 8, or 9 for a schema with a property that merges per member only under some parents. This version refuses a room saved by an earlier version, so start a fresh room, and an earlier version refuses a room this version saved.
