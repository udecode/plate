---
'plitejs': patch
---

- Fix removing a block while a teammate's one edit changes both inside it and after it, such as wrapping a line in the block and typing in the next paragraph. Merging the two dropped what the teammate typed or added after the block, or ignored the removal, depending on which change came first, and a redo of the removal could drop the teammate's letter. The merge now removes the block and keeps what the teammate typed or added after it.
