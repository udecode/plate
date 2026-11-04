---
'plitejs': patch
---

Fix typing at the end of a text property declared `inclusive: false` so the new text no longer takes that property, unless the next text in the block carries the same value.
