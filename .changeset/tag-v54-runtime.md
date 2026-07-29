---
"@platejs/tag": major
---

Move tag insertion to `editor.plugin(MultiSelectPlugin).update.insert`, read
selected items through
`editor.plugin(MultiSelectPlugin).read.getSelectedItems`, and compare values
through `editor.plugin(MultiSelectPlugin).read.isEqual`. Run multi-select
behavior through Plite transactions, register tag values in compiled schemas,
and remove standalone tag query helpers.
