---
"@platejs/code-block": major
---

Expose code-block mutations through `insert`, `toggle`, `tab`, `untab`, `resetBlock`, and `selectAll` installed commands.

**Migration:** Replace direct transform helper imports with `editor.update.code_block.*` commands. `insert()` accepts no options.
