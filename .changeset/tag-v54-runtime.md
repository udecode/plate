---
"@platejs/tag": major
---

Move tag insertion to `editor.update.tag.insert` and run multi-select behavior through Plite transactions

Accept typed Plate editors with custom values and plugin configs in `isEqualTags`.

**Migration:** Replace `editor.tf.insert.tag(props, options)` with `editor.update.tag.insert(props, options)`.
