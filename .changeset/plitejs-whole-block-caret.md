---
'plitejs': patch
---

- Fix Backspace after a triple-click putting the caret at the end of the block above, so the next letter went into a heading or a closed Details summary. The caret now starts the block that moves up.
- Fix Backspace after a triple-click on the last block or a block next to a table removing that block. The block now stays, empty, with the caret in it, so the next letter never lands in a table cell.
- Fix Backspace after a triple-click in the only cell of a table removing the table. The cell now empties.
- Fix Backspace over whole blocks selected as text replacing them with a paragraph. The first block now stays, emptied, with the caret in it, so a checklist item keeps its checkbox.
- Fix typing over several whole blocks giving the new text the default block type. The new text now takes the first block's type, so typing over checklist items leaves one checklist item.
