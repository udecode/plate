---
'plitejs': patch
---

Fix `tx.selection.set` throwing "Invalid text editor selection" when it sets a range while the caret holds pending marks, such as after toggling bold with nothing selected. The range now drops the pending marks.
