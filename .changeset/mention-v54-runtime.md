---
"@platejs/mention": major
---

Move mention insertion to `editor.update.insert.mention` and configure `getMentionOnSelectItem` with a typed `plugin` option

**Migration:** Replace `getMentionOnSelectItem({ key })` with `getMentionOnSelectItem({ plugin })`.
