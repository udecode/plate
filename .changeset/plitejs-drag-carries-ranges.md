---
'plitejs': patch
---

- Keep a range anchor made with `deletion: 'nearest'` on its text when a drag, or a paste that directly follows its cut in the same editor, moves all of that text within one root, instead of leaving it collapsed where the text was. Undo and redo move it back and forth. Moving part of the range leaves the anchor on the part that stays, unless a drop rebuilds the block that holds that part. A Suggesting move keeps the anchor on the struck original until the move is decided. A copy, a second paste, a paste without formatting, a paste after another edit or into another editor or root, and an editor bound to Yjs or `plitejs/sync` map the range as before.
- Keep a range anchor made with `association: 'inward'` or `'forward'` on the rest of its text when a delete that starts inside the range joins other text to it, such as the next paragraph or same-style text after a bold word, instead of moving an end onto the joined text.
