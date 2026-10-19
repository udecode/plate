---
'platejs': patch
---

Fix inline void inserts leaving the caret inside the element, including at the end of a block. The generated plugin `insert` and `MentionPlugin`'s `insert` place the caret after the void; pass `select` to the generated `insert` to choose the selection yourself.
