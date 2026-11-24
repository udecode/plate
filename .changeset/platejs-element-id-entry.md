---
'platejs': patch
---

- Accept `at: { id }` in node reads and transforms, including those that select by plugin, such as `editor.read.nodes.block({ at: { id }, type: BaseParagraphPlugin })`, and in the `insert` of date, mention, inline equation, field and footnote.
- Remove `ElementIdPlugin`'s `read.entry(id)` and the `ElementIdEntry` type.

**Migration:** Use `editor.read.nodes.byId(id)`. It returns `{ key, node, path, root? }`, or `null` instead of `undefined` when no element holds the id.
