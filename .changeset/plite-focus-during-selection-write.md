---
'plitejs': patch
---

Fix the editable's `onFocus` not running when focus arrives while the editor is writing its selection, or right after a press outside the editor. Focus that arrives in either case now also marks the editor focused and restores its caret, so a popover that hands focus back after a button click no longer leaves the caret where an edit made meanwhile moved it.

Fix a blurred editor taking focus back. A selection change while the editor is not focused, such as an edit made in `onBlur`, no longer writes the page selection or scrolls; focusing the editor applies it.
