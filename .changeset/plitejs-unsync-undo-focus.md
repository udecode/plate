---
'plitejs': patch
---

- Fix undo focusing another copy of a shared content root instead of the copy the caret left, when the undo gives that root back to a block, as undoing Unsync of a synced block does.
