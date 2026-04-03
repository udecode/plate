---
"@platejs/core": major
---

Add `lift` as a break and delete rule action for blocks that should leave one ancestor level instead of resetting or exiting.
Reset the trailing block to a paragraph when `splitReset` handles selected heading text.

**Migration:** Use `lift` in `rules.break.empty` or `rules.delete.start` when a block should outdent one matching container level.

```tsx
BlockquotePlugin.configure({
  rules: {
    break: { empty: 'lift' },
    delete: { start: 'lift' },
  },
});
```
