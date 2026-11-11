---
'plitejs': patch
---

- Add `nodeWriteVeto`, a plugin stage that refuses a type change, wrap or unwrap of a node before the write applies. `tx.nodes.lift` and `tx.nodes.merge` ask it for each element they unwrap
- Keep arrow keys and Shift+Arrow inside one member of a set content root, and let only that root's own view move a selection held in it
- Fix typing over a range with an explicit target writing into the block before the range when the removal drops the range's first block
- Fix text inserted over whole blocks through `tx.text.insert` landing inside a block void that follows them
- Fix a mark turned on at the caret being dropped from text the editor repairs after native typing
- Fix undo of a slice written into a content root while the caret sat in another root leaving the caret in the content root. The caret now returns to where it was before the write
