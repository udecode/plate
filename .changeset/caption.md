---
'@udecode/plate-caption': major
---

- Option `plugins` is now `query.allow` with plugin keys. Migration:

```tsx
// Before
CaptionPlugin.configure({
  options: {
    plugins: [ImagePlugin],
  },
});

// After
CaptionPlugin.configure({
  options: {
    query: {
      allow: [KEYS.img],
    },
  },
});
```
