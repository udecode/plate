---
'plitejs': patch
---

Let the caret enter struck-through suggested deletions. A click inside one places a painted caret at that point, arrow keys move through it one character at a time, and selections can end inside it. Typing, pasting or Enter inside it splits the deletion around the new content. Typing at the edge of your own deletion joins it as one replacement. In Suggesting mode, Backspace and Delete step over struck characters without changing them, then delete the next character and join your adjacent deletion, and copying leaves struck text out. In Editing mode, Backspace and Delete remove struck characters directly and undo returns them to the pending deletion. Keys and clicks beside struck text read only the caret's block, so their cost no longer grows with the number of pending deletions in the document.

Fix Editing-mode range deletion across pending inline suggestions and retained text, including selecting and deleting the entire document across multiple blocks. Preserve accepted text and suggestion visibility through deletion, undo, and redo.
