---
'plitejs': patch
---

Fix deciding a suggested line split in a different order giving a different document once someone moved the split's lower line: rejecting the split now joins the line it cut with the line now after it, as Google Docs does, and waits for another pending suggestion on that next line.
