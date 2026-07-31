---
"@platejs/diff": major
---

Keep inserted and deleted replacement markers on their exact text ranges.
Preserve exact formatting boundaries and JSON-compatible property removals in
derived diff spans.

Use `excludeDiffFromFragment` for direct fragment cleanup. `BaseDiffPlugin`
registers copied-fragment cleanup through its root `readMiddleware`.

Install the behavior through the plugin:

```tsx
createBasePlugin({
  name: 'diff',
  readMiddleware: ({ around }) => [
    around(editorReads.slice.export, ({ next }) => {
      const slice = next();

      return {
        ...slice,
        content: excludeDiffFromFragment(slice.content),
      };
    }),
  ],
});
```
