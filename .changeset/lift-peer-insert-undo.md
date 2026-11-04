---
'plitejs': patch
---

- Fix undo and redo losing or doubling a block after a teammate edits beside a block your step lifted, unwrapped or moved. Redoing a lift of a quote's second paragraph after a teammate inserted a paragraph at that point lost the lifted paragraph, and undoing a lift after a teammate removed the next paragraph doubled the one after it. Both blocks now survive, and a teammate's edit to the moved block that also adds a block beside it keeps both.
