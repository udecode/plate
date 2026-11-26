---
'plitejs': patch
---

Accept a collaborator's honest edits beside a suggestion in a sync room whose editors store element ids, such as with Plate's `ElementIdPlugin`. The room refused an edit, its undo or redo, an accept and a withdrawal that stored a spare line, and held back for review a decision that crossed a collaborator's concurrent change, such as a suggested wrap or unwrap. Such a decision also dropped the spare line the collaborator's change stored, and lost the collaborator's suggested unwrap of the quote that held the decided line. Accepting a suggested delete across lines that empties the first line now keeps the id that the same delete keeps in a plain editor.
