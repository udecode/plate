---
'plitejs': patch
---

Fix Backspace or typing over a block selection in Editing mode leaving another author's pending deletion struck when the selected blocks hold all of it. The write now accepts that deletion, as it already did over a text selection.
