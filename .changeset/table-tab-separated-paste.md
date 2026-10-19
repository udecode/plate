---
'platejs': major
---

Paste tab-separated text onto selected table cells field by field, and copy selected cells as tab-separated plain text only.

- A tab-separated paste fills a rectangular cell selection one field per cell, keeps the rows and columns that fit, and reports the fields it leaves out through `onPasteResult`.
- A quoted field can hold tabs and line breaks; each line becomes a paragraph in its cell.
- Copying selected cells no longer writes `text/csv` or `text/tsv`; the tab-separated text is in `text/plain`.
