---
'platejs': patch
---

- Let Backspace at the start of a table cell lift a list item, remove one indent level or turn an empty code block into a paragraph, as it does outside a table; the caret still never leaves the cell
- Move the caret into the last cell on Backspace at the start of a block right after a table whose cells are all empty, instead of throwing
- Change the schema fingerprint of an editor with the table plugin, because tables and table cells now compile as isolating. History saved before the upgrade no longer restores, and every client in a Yjs room must upgrade at once
