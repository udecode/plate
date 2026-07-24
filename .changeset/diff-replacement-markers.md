---
"@platejs/diff": major
---

Keep inserted and deleted replacement markers on their exact text ranges.
Preserve exact formatting boundaries and JSON-compatible property removals in
derived diff spans.

Use `createExcludeDiffFragmentExtension` to exclude diff markers from copied
fragments and `excludeDiffFromFragment` for direct fragment cleanup.

Install the extension through a Plate plugin:

```tsx
createBasePlugin({ key: 'diff' }).extendExtension(
  createExcludeDiffFragmentExtension()
);
```
