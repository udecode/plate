---
'plitejs': patch
---

- Fix undo of a step that created the root holding the caret, such as unsyncing a synced block. The caret now returns to where it was before the step, in a shared root or the main document, and keyboard focus moves with it into that block, not another block that shows the same shared root, so the next typed character lands there instead of at the start of the document.
