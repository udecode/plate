---
'@udecode/plate-reset-node': minor
---

- Delete when selecting the whole document (e.g. `cmd+a`) will now reset the editor children. Also happens on `deleteBackward` when the value is empty.
- Delete when cursor is at the start of the document will now reset the first block (i.e. type)
  - Fixes #1861