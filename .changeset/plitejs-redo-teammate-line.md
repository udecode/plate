---
'plitejs': patch
---

- Fix redo dropping a teammate's quote, line or letters beside a restored line when the undone update merged a quoted line with the next line and also added a line, split the quote or wrapped the line. When a schema rule or a transaction guard refuses that redo, it falls back to restoring the update as it was.
- Saved history keeps a waiting redo's fallback.
