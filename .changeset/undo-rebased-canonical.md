---
'plitejs': patch
---

Fix an undo in a shared document that threw on every press after a peer's concurrent edit, such as bolding the text the undo restores, and blocked every older undo.
