---
'platejs': patch
---

- Fix Markdown that read back differently after a save: code spans with line endings or edge spaces, emphasis around a link, nested emphasis, a bare URL right after text and an empty list item before a nested ordered list
- Fix streamed Markdown parses that missed a link definition inside a quote or a list item
