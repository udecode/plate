---
"@platejs/toggle": major
---

Run toggle navigation and editing through Plite reads, schema, and transactions

**Migration:** Replace `editor.getApi(TogglePlugin).toggle.toggleIds(ids, force)`
with `editor.plugin(TogglePlugin).api.toggleIds(ids, force)`.
