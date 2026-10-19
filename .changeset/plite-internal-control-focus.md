---
'plitejs': patch
---

Fix focus moving between two controls inside the editor, such as from one button in an element to another. When the editor held a selection, it wrote that selection back into the page as the first control lost focus, which could pull focus to the editor and away from the second control. Focus now stays on the second control.
