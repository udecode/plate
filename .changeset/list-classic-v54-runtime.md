---
"@platejs/list-classic": major
---

- Move classic-list queries, normalizers, and transforms to Plite reads and transactions
- Register classic-list and task-list properties in compiled schemas
- Install all classic-list structural descriptors through required dependencies
- Configure `validLiChildren` on `ListItemPlugin`

**Migration:** Pass the active transaction to exported mutation helpers instead
of a Slate editor.
