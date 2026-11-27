---
'plitejs': patch
---

Fix a letter typed after Backspace removes the last letter of a line that another author's pending join strikes landing at the end of the line before. The letter now stays on that line, in Editing and Suggesting, and accepting the join still puts it after the text of the line before.
