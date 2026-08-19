---
"@platejs/mention": major
---

Require React and React DOM 19.2 or newer.

Export `MentionPluginState` as the complete mutable state contract for
`BaseMentionPlugin`.

Move mention insertion to `editor.plugin(MentionPlugin).update.insert` and
register mention values in compiled schemas. Preserve plugin capability and
render-time node-context inference in typed component integrations.

Install the mention-input descriptor as a required plugin dependency. Its
capability name and persisted element type are both `mentionInput`.

Remove `getMentionOnSelectItem`; selection handlers call the installed plugin
update directly. The update accepts only persisted mention data (`ref` and
optional `label`) in its first argument and generic node options in its second;
combobox search text stays UI-local.

Use `TMentionItemBase<TRef = string>` to type application mention references.

**Migration:** Replace Mention node `key` / `value` with required `ref` and
optional `label`. Render visible text from `label ?? ref`.
