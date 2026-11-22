---
'platejs': patch
---

- Fix Enter in the empty last body line of an open Details moving the caret into the block after the Details, so the next letters joined that block. Enter now adds an empty paragraph right after the Details and puts the caret in it, and the empty body line stays.
