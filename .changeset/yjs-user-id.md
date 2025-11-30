---
"@platejs/yjs": patch
---

Add `userId` option to **YjsPlugin** for combobox collaboration support

```tsx
YjsPlugin.configure({
  options: {
    userId: user?.id,
  },
})
```
