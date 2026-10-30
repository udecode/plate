---
'plitejs': patch
---

Fix Cmd+Z and Cmd+Shift+Z inside a widget that a void element renders, such as a drawing canvas. The widget now gets the key first. When its handler calls `preventDefault`, the editor leaves the key alone, so the widget's own undo runs and focus stays in the widget. Otherwise the editor undoes the document, as before. In a void inside a nested editable root, the editor still runs document history before the widget sees the key.
