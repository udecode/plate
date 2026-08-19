---
"@platejs/comment": major
---

Require React and React DOM 19.2 or newer.

Read comment marks through `editor.read.comment`, derive IDs with
`editor.api.comment.nodeId`, and mutate comments through
`editor.update.comment`. Register comment marks as boolean text properties in
compiled schemas.

Keep comment ID selection in copied comment UI instead of importing
`useCommentId` from the package.

Let comment leaf components inspect comment metadata without receiving the
underlying text string.
