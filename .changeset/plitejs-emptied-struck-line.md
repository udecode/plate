---
'plitejs': patch
---

Fix typing in a line whose last live text was just deleted while another author's deletion of that line is pending. The letter now lands on that line instead of the end of the line before it, in Editing and Suggesting, and also when one update deletes and retypes the text.
