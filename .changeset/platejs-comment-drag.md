---
'platejs': patch
---

- Move a comment thread with its text when a drag, or a paste that directly follows its cut in the same editor, moves all of that text, and back again on undo. Moving part of the text leaves the thread on the part that stays. Undoing a drag and the thread's creation, then redoing both, puts the thread back on its text.
- Keep a comment thread on the rest of its text when Backspace or a cut that starts inside the thread joins other text to it, such as the next paragraph or same-style text after a bold word, instead of moving the thread onto the joined text.
