---
'plitejs': patch
---

- Fix undoing a move of text into a link's end on the same line after a teammate's edit, such as wrapping the line in a quote or typing in or after the link. The undo copied the whole line into a second paragraph. It now puts the moved letters back once and keeps the teammate's wrap, letters and marks. When the teammate deleted the moved letters, removed the link or moved the letters into an element of their own, the undo leaves the line as the teammate left it.
- Fix undo losing a teammate's letter after they moved the whole line that holds Bob's moved text.
