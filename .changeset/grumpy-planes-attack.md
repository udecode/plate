---
'@udecode/plate-comments': major
---

- Renamed the `comments` prop on CommentsProvider to `initialComments` to reflect the fact that updating its value after the initial render has no effect
- Removed the following props from CommentsProvider, since they represent the internal state of the comments plugin and should not be controlled externally:
  - `activeCommentId`
  - `addingCommentId`
  - `newValue`
  - `focusTextarea`
- The following props on CommentsProvider can now be updated after the initial render (whereas prior to this version, doing so had no effect):
  - `myUserId`
  - `users`
  - `onCommentAdd`
  - `onCommentUpdate`
  - `onCommentDelete`
