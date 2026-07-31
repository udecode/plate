---
"@platejs/combobox": major
---

- Handle trigger-combobox insertion through the typed `insertText` command
- Keep transient collaboration metadata on inserted combobox inputs
- Rename `TriggerComboboxPluginOptions` to `TriggerComboboxPluginState`

**Migration:** Replace `withTriggerCombobox` with
`BaseTriggerComboboxPlugin`, which declares the command behavior directly.
