---
'plitejs': patch
---

- Keep a range anchor made with `deletion: 'nearest'` on its text when a drag moves all of that text within one root, instead of leaving it collapsed where the text was. Undo and redo move it back and forth. A drag of part of the range leaves the anchor on the part that stays, unless the drop rebuilds the block that holds that part. A Suggesting move keeps the anchor on the struck original until the move is decided. A copy, a drag into another editor or root and an editor bound to Yjs or `plitejs/sync` map the range as before.
