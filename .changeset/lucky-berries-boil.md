---
'@udecode/plate-comments': major
---

This is a rewrite of the comments plugin to have default UI logic – **headless**.

**Plugin Options**

- Removed configuration options from plugin options in favor of component-level control:
  - `options.comments`
  - `options.myUserId`
  - `options.users`

**Components**

- Removed legacy components:
  - `CommentDeleteButton`
  - `CommentEditActions`
  - `CommentEditButton`
  - `CommentEditCancelButton`
  - `CommentEditSaveButton`
  - `CommentEditTextarea`
  - `CommentNewSubmitButton`
  - `CommentNewTextarea`
  - `CommentResolveButton`
  - `CommentsPositioner`
  - `CommentUserName`

**API**

- Removed functions in favor of new API methods:
  - `findCommentNode` → `api.comment.node()`
  - `findCommentNodeById` → `api.comment.node({ id })`
  - `getCommentNodeEntries` → `api.comment.nodes()`
  - `getCommentNodesById` → `api.comment.nodes({ id })`
  - `removeCommentMark` → `tf.comment.remove()`
  - `unsetCommentNodesById` → `tf.comment.unsetMark({ id })`
- Removed unused functions:
  - `getCommentFragment`
  - `getCommentUrl`
  - `getElementAbsolutePosition`
  - `getCommentPosition`
- Updated `getCommentCount` to exclude draft comments

**State Management**

- Removed `CommentProvider` - users should implement their own state management – `block-discussion.tsx`
- Moved `useHooksComments` to UI registry – `comments-plugin.tsx`
- Removed hooks no longer needed with new UI:
  - `useActiveCommentNode`
  - `useCommentsResolved`
  - `useCommentAddButton`
  - `useCommentItemContent`
  - `useCommentLeaf`
  - `useCommentsShowResolvedButton`
  - `useFloatingCommentsContentState`
  - `useFloatingCommentsState`

**Types**

- Removed `CommentUser`
- Moved `TComment` to UI registry – `comment.tsx`
