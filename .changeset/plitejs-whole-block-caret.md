---
'plitejs': patch
---

- Fix Backspace after a triple-click putting the caret at the end of the block above. The caret now starts the block that moves up.
- Fix Backspace after a triple-click on the last block, a block next to a table or a table's only cell removing it. The block or cell now stays, empty, with the caret in it.
- Fix Backspace over whole blocks selected as text replacing them with a paragraph. The first block stays, so a checklist item keeps its checkbox.
- Fix typing over several whole blocks giving the new text the default block type. The text now takes the first block's type, and the marks of its first letter, as typing over text inside one block does.
- Fix a whole-block delete called without a range landing elsewhere than Backspace over the same selection when blocks stay beside the deleted ones.
- Fix redo of Backspace over a whole document that starts with a quote dropping a letter a collaborator typed into the quote after the undo.
- Fix cutting the whole document and pasting it back turning a leading quote or code block into a paragraph.
- Fix Backspace over an empty block up to the start of the next block leaving the selection in place. The caret now goes into the empty block.
- Fix a delete command run right after a triple-click, such as from a plugin's key handler, emptying the block instead of removing it as Backspace does.
- Fix typing over whole blocks that start with a quote putting the text straight into the quote. The text now goes into the quote's paragraph.
- Fix Return over whole blocks removing a quote or a line, or putting the caret one block too low. Return now gives what Backspace then Return gives.
- Fix Shift+Return over whole blocks pulling the text of the block after them into the line. The line break now goes into the first block, and the block after it stays.
- Fix typing and Return over whole blocks landing on the old selection when the editor moves the selection just before the command runs, such as to match the browser. Typing over two paragraphs no longer joins the text with the next paragraph, and Return no longer drops a block.
