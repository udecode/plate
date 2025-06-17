---
'@platejs/core': patch
---

- Added support for both synchronous and asynchronous functions in the `value` option for `createPlateEditor` and `usePlateEditor`. If async, `usePlateEditor` will trigger a re-render when the value is loaded.
- Added `onReady` callback option to `createPlateEditor` and `usePlateEditor` called after (async) editor initialization.

```ts
const editor = usePlateEditor({
  value: async () => {
    const response = await fetch('/api/document');
    const data = await response.json();
    return data.content;
  },
  onReady: ({ editor, value }) => {
    console.log('Editor ready with value:', value);
  },
});
```
