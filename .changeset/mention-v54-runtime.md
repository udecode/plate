---
"@platejs/mention": major
---

Move mention insertion to `editor.plugin(MentionPlugin).update.insert` and
register mention values in compiled schemas. Preserve plugin capability and
render-time node-context inference in typed component integrations.

Install the mention-input descriptor as a required plugin dependency.
Its plugin identity is `mentionInput`; persisted elements remain
`mention_input`.

Remove `getMentionOnSelectItem`; selection handlers call the installed plugin
update directly.
