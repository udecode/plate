---
'plitejs': patch
---

- Fix a Backspace run that empties a bold, linked or other formatted text leaf taking two undo steps to restore. One undo now brings back the whole run, as it does when a letter is left.
- Fix an update that removes content and puts the same content back, such as removing a paragraph's only empty text, adding an undo step that does nothing.
