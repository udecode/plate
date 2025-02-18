---
'@udecode/plate-comments': major
---

UI Updates:

- Removed configuration options from the plugin options:

  - `options.comments`
  - `options.myUserId`
  - `options.users` These parameters can now be fully controlled within the component itself.

- Consolidated comment-related components:

  - Removed `comments-popover.tsx`, `comment-reply-items.tsx`, and `comment-value.tsx`
  - Replaced with the new `block-discussion.tsx` component
  - Removed `comment-reply-items.tsx`
  - Remove `comment-resolve-button.tsx` use `comment-item.tsx` instead
  - Updated `comment-create-form.tsx` to use a minimal Plate editor for the input box

- Type
  - Remove type `CommentUser` `TComment` Now we have `TCommentItem` `TDiscussion` in `block-discussion.tsx`

API Updates:

- Removed `findCommentNode.ts` use `api.comment.node()` instead
- Removed `findCommentNodeById.ts` use `api.comment.node({ id })` instead
- Removed `getCommentFragment.ts`
- Removed `getCommentNodeEntries.ts` use `api.comment.nodes()` instead
- Removed `getCommentNodesById.ts` use `api.comment.nodes({ id })` instead
- Removed `removeCommentMark.ts` use `tf.comment.remove()` instead
- Removed `unsetCommentNodesById.ts` use `tf.comment.unsetMark({ id })` instead
- Removed `getCommentUrl.ts`
- Updated `getCommentCount.ts` to exclude draft comments from count
- Removed `getElementAbsolutePosition.tsx` as it's no longer needed with the new UI
- Removed `getCommentPosition.ts` as it's no longer needed with the new UI
- Removed state management components `CommentProvider.tsx`. Users should implement their own state management solution.
- Remove `useActiveCommentNode.ts`, `useCommentsResolved.ts` as it's no longer needed with the new UI
- Move `useHooksComments.ts` to client side,

- Removed legacy comment components in favor of new unified components:
  The following components have been removed and their functionality is now handled by:

  - `block-discussion.tsx` (main container component)
  - `comment-item.tsx` (individual comment display)
  - `comment-create-form.tsx` (comment input)
  - `comment-avatar.tsx` (user avatars)
  - `comment-more-dropdown.tsx` (comment actions menu)

  Removed components:

  - CommentDeleteButton.tsx
  - CommentEditActions.tsx
  - CommentEditButton.tsx
  - CommentEditCancelButton.tsx
  - CommentEditSaveButton.tsx
  - CommentEditTextarea.tsx
  - CommentNewSubmitButton.tsx
  - CommentNewTextarea.tsx
  - CommentResolveButton.tsx
  - CommentsPositioner.tsx
  - CommentUserName.tsx
  - index.ts
  - useCommentAddButton.ts
  - useCommentItemContent.ts
  - useCommentLeaf.ts
  - useCommentsShowResolvedButton.ts
  - useFloatingCommentsContentState.ts
  - useFloatingCommentsState.ts
