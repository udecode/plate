---
'platejs': patch
---

Remove `ElementIdPlugin`'s `read.entry(id)` and the `ElementIdEntry` type

**Migration:** Use `editor.read.nodes.byId(id)`. It returns `{ key, node, path, root? }`, with `root` left out for an element in the main document, and `null` instead of `undefined` when no element holds the id.
