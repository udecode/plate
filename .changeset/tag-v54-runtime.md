---
"@platejs/tag": major
---

Move tag insertion to `editor.update.tag.insert`, read selected items through
`editor.read.tag.getSelectedItems`, and compare values through
`editor.read.tag.isEqual`. Run multi-select behavior through Plite
transactions, register tag values in compiled schemas, and remove standalone
tag query helpers.
