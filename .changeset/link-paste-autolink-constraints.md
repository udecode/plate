---
"@platejs/link": major
---

Keep pasted URLs literal inside markdown link source entry by default

**Migration:** If you want the old eager paste behavior, opt back in:

```tsx
BaseLinkPlugin.configure({
  options: {
    shouldAutoLinkPaste: ({ editor, text, textBefore, url }) => true,
  },
});
```
