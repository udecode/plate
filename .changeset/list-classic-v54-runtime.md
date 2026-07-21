---
"@platejs/list-classic": major
---

- Move classic-list queries, normalizers, and transforms to Plite reads and transactions
- Register classic-list and task-list properties in compiled schemas

**Migration:** Pass the active transaction to exported mutation helpers instead
of a Slate editor.
