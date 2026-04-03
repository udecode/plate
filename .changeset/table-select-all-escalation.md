---
"@platejs/table": major
---

Escalate the second `selectAll` from the current table to the whole document.

**Migration:** If you intercepted repeated `selectAll` while a table was already selected, expect the second call to select the document instead of reselecting the same table range.
