---
'platejs': patch
---

Fix indent and outdent with the caret in a Details title. When Indent targets Details, `increase`, `decrease`, Tab and Shift+Tab now change the Details. The commands used to throw there, and the keys moved focus out of the editor.

Fix Tab and Shift+Tab on a selected range. They now indent and outdent every block the range spans instead of moving focus out of the editor.
