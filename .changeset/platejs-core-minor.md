---
"@platejs/core": minor
---

Added `getFragment()` API method to **ViewPlugin** for accessing the selected DOM fragment.

**usePlateViewEditor**: 
- Added `'use client'` directive for Next.js client component compatibility
- Added `onReady` handler support for async rendering with automatic re-render when `isAsync` is true

```typescript
// New API usage
const fragment = editor.getApi(ViewPlugin).getFragment();

// Async rendering support
const editor = usePlateViewEditor({
  onReady: (ctx) => {
    // Called when editor is ready, supports async rendering
  }
});
```