---
'plitejs': patch
---

- Fix Backspace after a triple-click putting the caret at the end of the block above. The caret now starts the block that moves up.
- Fix Backspace after a triple-click on the last block, a block next to a table or a table's only cell removing it. The block or cell now stays, empty, with the caret in it.
- Fix Backspace over whole blocks selected as text replacing them with a paragraph. The first block stays, so a checklist item keeps its checkbox.
- Fix typing over several whole blocks giving the new text the default block type. The text now takes the first block's type.
- Fix a whole-block delete called without a range landing elsewhere than Backspace over the same selection when blocks stay beside the deleted ones.
- Fix redo of Backspace over a whole document that starts with a quote dropping a letter a collaborator typed into the quote after the undo.
- Fix cutting the whole document and pasting it back turning a leading quote or code block into a paragraph.
- Fix Backspace over an empty block up to the start of the next block leaving the selection in place. The caret now goes into the empty block.
