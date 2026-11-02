---
'plitejs': patch
---

- Fix a typed letter or Enter throwing in a document with no blocks, such as one whose only block a decision removed, or a Suggesting view whose blocks are all struck. The key now starts the block the schema names as the root's default, and does nothing when the schema names none.
- Fix a Suggesting edit inside an element that holds one text, such as a code block, throwing a schema error. Suggesting now refuses the edit and reports it through `subscribeRefusals`.
- Fix an `Editable` that shows a preview throwing an error on typing, deleting, Enter, paste, cut or drop. It now keeps its caret and selection and drops those edits. Undo and redo still work there.
- Fix a click past the end of a line throwing in an editable preview when a pending change ends that line. The caret now lands at the line's end.
