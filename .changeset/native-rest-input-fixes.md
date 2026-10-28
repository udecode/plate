---
'plitejs': patch
---

- Fix undo and redo in a text field inside the editor, such as a `textarea` or text `input` in a void element, which ran the editor's history instead of the field's own
- Fix Android Chrome showing no caret handle after a tap past the end of a line
- Fix Command+Option digit shortcuts such as `mod+alt+1` not firing in Safari, where Option turns the digit into a symbol
