---
'plitejs': patch
---

Fix commands over a line that someone moved between the two halves of a pending join. A Backspace at the start of such a line now merges it the way a plain editor does, where it used to delete the wrong letter and drop the moved line from the saved document. Typing, deleting and joining around it land where the editor shows them, in Suggesting and Editing. An edit the review marks cannot record next to such a line is refused whole, and nothing of it is saved.
