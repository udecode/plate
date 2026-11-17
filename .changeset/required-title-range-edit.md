---
'plitejs': patch
---

- Fix typing, Backspace, Delete or Enter over a selection from the start of a required title into a paragraph that another block follows, which threw an error and dropped the keystroke. The title keeps its place and takes the text left after the selection.
- Fix typing over a selection that ends right before a read-only inline, which put the letter inside the inline.
- Fix joining a paragraph that holds a link or another inline out of a quote or other container, which left the emptied container behind.
