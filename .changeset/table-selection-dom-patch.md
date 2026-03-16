---
'@platejs/table': patch
---

- Reduce large-table selection latency by deriving reactive table selection from editor selectors, keeping selected-cell DOM sync at the table root, and avoiding plugin-store writes on every `set_selection`.
