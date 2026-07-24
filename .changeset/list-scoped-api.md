---
"@platejs/list": major
---

Expose list state and commands through the scoped List plugin API, including
location-aware toggle, indent, and outdent updates, and register list and
indentation properties in compiled schemas. Compound list commands resolve
selection and sibling state from the active transaction.

**Migration:** Use `editor.plugin(ListPlugin).api.isActive(...)` and `editor.plugin(ListPlugin).update.toggle(...)`, `.indent(...)`, or `.outdent(...)`.
Configure list targets through the plugin's top-level `targetPluginKeys` field.

Project list HTML parsing through `inject.parsers`.
