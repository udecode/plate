---
"@platejs/mention": major
---

Move mention insertion to `editor.update.insert.mention`, configure
`getMentionOnSelectItem` with a typed `plugin` option, and register mention
values in compiled schemas.

Install the mention-input descriptor as a required plugin dependency.

**Migration:** Replace `getMentionOnSelectItem({ key })` with `getMentionOnSelectItem({ plugin })`.
