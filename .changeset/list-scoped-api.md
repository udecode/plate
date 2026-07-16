---
"@platejs/list": major
---

Expose list state and commands through the scoped List plugin API, including location-aware toggle, indent, and outdent updates.

**Migration:** Use `editor.plugin(ListPlugin).api.isActive(...)` and `editor.plugin(ListPlugin).update.toggle(...)`, `.indent(...)`, or `.outdent(...)`.
