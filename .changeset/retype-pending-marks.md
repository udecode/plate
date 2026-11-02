---
'plitejs': patch
---

- Fix an error when you press Enter at the end of formatted text and the new line then changes block type or moves to a place with other formatting rules, locally, from a Yjs peer or on redo. A Yjs peer no longer stops taking edits in that case.
