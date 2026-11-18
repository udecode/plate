---
'plitejs': patch
---

- Fix undo and redo in a text field inside the editor, such as a `textarea` or text `input` in a void element, which ran the editor's history instead of the field's own
- Fix Android Chrome showing no caret handle after a tap past the end of a line
- Fix digit shortcuts held with Command, or Control without Alt or AltGr, not firing when Shift, Option or the keyboard layout turns the digit into another character, such as `mod+shift+0` on Windows and Linux, `mod+1` on a French keyboard and `mod+alt+1` in Safari
