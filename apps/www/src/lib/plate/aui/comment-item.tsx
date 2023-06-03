import React from 'react';
import { CommentProvider, useCommentById } from '@udecode/plate-comments';
import { formatDistance } from 'date-fns';
import { CommentAvatar } from './comment-avatar';
import { CommentMoreDropdown } from './comment-more-dropdown';
import { CommentResolveButton } from './comment-resolve-button';
import { CommentValue } from './comment-value';

import { useCommentItemContentState } from '@/lib/@/useCommentItemContent';

type PlateCommentProps = {
  commentId: string;
};

function CommentItemContent() {
  const {
    comment,
    isMyComment,
    isReplyComment,
    user,
    editingValue,
    commentText,
  } = useCommentItemContentState();

  return (
    <div>
      <div className="relative flex items-center gap-2">
        <CommentAvatar userId={comment.userId} />

        <h4 className="text-sm font-semibold leading-none">{user?.name}</h4>

        <div className="text-xs leading-none text-muted-foreground">
          {formatDistance(comment.createdAt, Date.now())} ago
        </div>

        {isMyComment && (
          <div className="absolute -right-0.5 -top-0.5 flex space-x-1">
            {!isReplyComment ? <CommentResolveButton /> : null}

            <CommentMoreDropdown />
          </div>
        )}
      </div>

      <div className="mb-4 pl-7 pt-0.5">
        {editingValue ? (
          <CommentValue />
        ) : (
          <div className="whitespace-pre-wrap text-sm">{commentText}</div>
        )}
      </div>
    </div>
  );
}

export function CommentItem({ commentId }: PlateCommentProps) {
  const comment = useCommentById(commentId);
  if (!comment) return null;

  return (
    <CommentProvider key={commentId} id={commentId}>
      <CommentItemContent />
    </CommentProvider>
  );
}
