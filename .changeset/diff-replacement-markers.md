---
"@platejs/diff": major
---

Fix replacement diffs so inserted and deleted text markers stay on the correct text ranges.

Replace the `withGetFragmentExcludeDiff` editor override with
`createExcludeDiffFragmentExtension` and expose `excludeDiffFromFragment` for
direct fragment cleanup.

**Migration:** Install the extension through a Plate plugin:

```tsx
createBasePlugin({ key: 'diff' }).extendExtension(
  createExcludeDiffFragmentExtension()
);
```
