---
"@platejs/mention": major
---

Export `MentionPluginState` as the complete mutable state contract for
`BaseMentionPlugin`.

Move mention insertion to `editor.plugin(MentionPlugin).update.insert` and
register mention values in compiled schemas. Preserve plugin capability and
render-time node-context inference in typed component integrations.

Install the mention-input descriptor as a required plugin dependency.
Its plugin identity is `mentionInput`; persisted elements remain
`mention_input`.

Remove `getMentionOnSelectItem`; selection handlers call the installed plugin
update directly. The update accepts only persisted mention data (`key` and
`value`); combobox search text stays UI-local.

Use `TMentionItemBase<TKey = unknown>` to type arbitrary item-key domains
without an unsafe `any`.
