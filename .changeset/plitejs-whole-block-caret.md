---
'plitejs': patch
---

- Fix Backspace after a triple-click putting the caret at the end of the block above. The caret now starts the block that moves up.
- Fix Backspace after a triple-click on the last block, a block next to a table or a table's only cell removing it. The block or cell now stays, empty, with the caret in it.
- Fix Backspace over whole blocks selected as text replacing them with a paragraph. The first block stays, so a checklist item keeps its checkbox.
- Fix typing over several whole blocks giving the new text the default block type. The text now takes the first block's type.
