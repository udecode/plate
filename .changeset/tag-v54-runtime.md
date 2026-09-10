---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Keep tag selection UI in the copied `select-editor` component. The package exports the tag descriptors and scoped semantic capabilities.

Use `BaseMultiSelectPlugin` for constrained tag pickers and `BaseTagPlugin` for ordinary inline tags that preserve surrounding text. `MultiSelectPlugin` supplies the React adapter for the constrained picker.

Move tag insertion to `editor.plugin(MultiSelectPlugin).update.insert`, read selected items through `editor.plugin(MultiSelectPlugin).read.getSelectedItems`, and compare values through `editor.plugin(MultiSelectPlugin).read.isEqual`. Run multi-select behavior through Plite transactions, register tag values in compiled schemas, and remove standalone tag query helpers.
