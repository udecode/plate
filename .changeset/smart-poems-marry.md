---
"@udecode/plate-table": major
---

Fix: in v28, `TableProvider` was incorrectly shared by all tables in the editor. `TableProvider` must now be rendered as part of `TableElement`.
