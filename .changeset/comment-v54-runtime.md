---
'platejs': major
---

- Replace `@platejs/comment` plugins and comment marks with `CommentsPlugin` from `platejs/comments/react`, conversation records, and durable range attachments
- Load `initialState.initialComments` and save `api.toJSON()` alongside the exact document revision; reload starts a fresh local undo stack
- Await comment actions and configure `initialState.mutate` for authorization and persistence before publication; reopen resolved discussions independently of document undo
- Resolve comment attachments and discussion positions in each mounted editor's projection while retaining one conversation and target
- Export `extractLegacyCommentRanges` from `platejs/migrations` for offline conversion of comment marks into ordered range groups and a sanitized document

**Migration:** Supply saved comments for the same document revision as the editor value:

```tsx
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor } from 'platejs/react';

const editor = createEditor({
  plugins: [
    CommentsPlugin.configure({
      initialState: { initialComments, users, currentUserId },
    }),
  ],
  initialValue,
});

const value = editor.read.value();
const comments = editor.plugin(CommentsPlugin).api.toJSON();
```

Run `extractLegacyCommentRanges` before loading persisted documents that contain legacy comment properties.
