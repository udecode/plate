---
'plitejs': patch
---

Fix deciding a suggestion throwing `Document admission repaired its own repair twice.` when another pending suggestion gives a text a value it cannot keep, such as a color on a text an edit emptied, or superscript on a text that is subscript.
