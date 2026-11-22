---
'plitejs': patch
---

Fix a click right of a code line putting the caret at another line's end or at the block's start

- A click past the end of a line in a code block puts the caret after that line's last character, and a click on an empty line puts it on that line. The editor reads the line from the code block's own layout, so the result no longer depends on where the browser places its own caret.
