---
'@platejs/selection': major
---

Replace `rightSelectionAreaClassName` with `selectionAreaClassName` for styling the block-selection marquee portal

**Migration:** Rename the configured state key:

Before:

```tsx
BlockSelectionPlugin.configure({
  initialState: {
    rightSelectionAreaClassName: 'my-marquee',
  },
});
```

After:

```tsx
BlockSelectionPlugin.configure({
  initialState: {
    selectionAreaClassName: 'my-marquee',
  },
});
```
