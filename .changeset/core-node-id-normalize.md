---
'@platejs/core': patch
---

- Added `editor.tf.nodeId.normalize()` API to manually normalize node IDs in the document.

  ```ts
  // Normalize all nodes in the document to ensure they have IDs
  editor.tf.nodeId.normalize();
  ```

- Added `normalizeNodeId` pure function to normalize node IDs in a value without using editor operations.

  ```ts
  import { normalizeNodeId } from '@platejs/core';

  // Normalize a value without editor operations
  const normalizedValue = normalizeNodeId(value, {
    idKey: 'id',
    idCreator: () => nanoid(10),
    filterInline: true,
    filterText: true,
  });
  ```

  This is useful when the value is passed from server to client-side editor.

- Added `getFragment()` API method to **ViewPlugin** for accessing the selected DOM fragment.

**usePlateViewEditor**:

- Added `onReady` handler support for async rendering with automatic re-render when `isAsync` is true

```typescript
// New API usage
const fragment = editor.getApi(ViewPlugin).getFragment();

// Async rendering support
const editor = usePlateViewEditor({
  onReady: (ctx) => {
    // Called when editor is ready, supports async rendering
  },
});
```
