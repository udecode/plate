---
'platejs': major
---

- Replace `@platejs/comment` plugins and comment marks with `CommentsPlugin` from `platejs/comments/react` and serializable thread records with document ranges
- Load fetched records through `initialState.initialThreads` or `api.setThreads` and save mapped records through `api.getThreads` alongside the editor value
- Export `extractLegacyCommentRanges` from `platejs/migrations` for offline conversion of comment marks into ordered range groups and a sanitized document

**Migration:** Supply thread records for the same document revision as the editor value:

```tsx
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor } from 'platejs/react';

const editor = createEditor({
  plugins: [
    CommentsPlugin.configure({
      initialState: { initialThreads, users, currentUserId },
    }),
  ],
  initialValue,
});

const value = editor.read.value();
const threads = editor.plugin(CommentsPlugin).api.getThreads();
```

Run `extractLegacyCommentRanges` before loading persisted documents that contain legacy comment properties.
