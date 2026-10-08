---
'platejs': major
---

- Replace `@platejs/comment` plugins and comment marks with `CommentsPlugin` from `platejs/comments/react`, conversation records, and durable range attachments
- Load `initialState.initialComments` and save `api.toJSON()` alongside the exact document revision; reload starts a fresh local undo stack
- Replace one authoritative full-document comment snapshot with `api.replace(snapshot)` after replacing the matching document; validation and range staging complete before atomic publication, and late mutations from the retired snapshot cannot publish
- Await comment actions and configure `initialState.mutate` for authorization and persistence before publication; reopen resolved discussions independently of document undo
- Join successful local thread creation to document history and serialize its replay with later mutations of the same thread
- Resolve comment attachments and discussion positions in each mounted editor's projection while retaining one conversation and target
- Export `extractLegacyCommentRanges` from `platejs/migrations` for offline conversion of comment marks into ordered range groups and a sanitized document
- Record threads, replies and resolutions as the editor's `userId`, or as the local user, `'local'`, when the editor has none

**Migration:** Supply saved comments for the same document revision as the editor value:

```tsx
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor } from 'platejs/react';

const editor = createEditor({
  plugins: [
    CommentsPlugin.configure({
      initialState: { initialComments, users },
    }),
  ],
  initialValue,
  userId,
});

const value = editor.read.value();
const comments = editor.plugin(CommentsPlugin).api.toJSON();
```

Run `extractLegacyCommentRanges` before loading persisted documents that contain legacy comment properties.
