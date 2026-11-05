---
'plitejs': patch
---

- Fix redo dropping a teammate's quote, line or letters beside a restored line when the undone update merged a quoted line with the next line and also added a line, split the quote or wrapped the line. When a schema rule or a transaction guard refuses that redo, it falls back to restoring the update as it was.
- `History.toJSON` writes version 6 when a waiting redo keeps that fallback. `History.fromJSON` reads versions 4, 5 and 6.
