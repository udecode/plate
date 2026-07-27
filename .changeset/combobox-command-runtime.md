---
"@platejs/combobox": major
---

- Handle trigger-combobox insertion through the typed `insertText` command
- Keep transient collaboration metadata on inserted combobox inputs
- Rename `TriggerComboboxPluginOptions` to `TriggerComboboxPluginState`

**Migration:** Replace `withTriggerCombobox` with
`createTriggerComboboxExtension` in the plugin constructor:

```ts
const BasePlugin = createBasePlugin({
  extension: (context) => createTriggerComboboxExtension(context),
  // ...
});
```
