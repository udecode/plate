---
"@platejs/combobox": patch
---

Add `getUserId` option to `TriggerComboboxPluginOptions` to fix combobox popover opening for all users in Yjs collaboration mode

When a user types a trigger character (e.g. `/` or `@`), the combobox input now stores the creator's `userId`. Only the creator will see the auto-focused combobox popover.

```tsx
SlashPlugin.configure({
  options: {
    getUserId: (editor) => editor.getOption(YjsPlugin, 'userId'),
  },
})

MentionPlugin.configure({
  options: {
    getUserId: (editor) => editor.getOption(YjsPlugin, 'userId'),
  },
})
```
