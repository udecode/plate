---
"@platejs/core": patch
"@platejs/combobox": patch
---

Add `userId` option to editor for collaborative features

- Add `userId` option to `usePlateEditor`/`createSlateEditor` options
- Add `editor.meta.userId` for accessing the current user ID
- **Breaking**: Remove `getUserId` option from `TriggerComboboxPluginOptions`. Use `editor.meta.userId` instead.

Migration:

```tsx
// Before
MentionPlugin.configure({
  options: {
    getUserId: (editor) => "123",
  },
})

// After
const editor = usePlateEditor({
  plugins: [MentionPlugin],
  userId: "123",
})
```
