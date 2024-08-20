'use client';

import React from 'react';

import {
  CommentProvider,
  useCommentById,
  useCommentItemContentState,
} from '@udecode/plate-comments/react';
import { formatDistance } from 'date-fns';

import { CommentAvatar } from './comment-avatar';
import { CommentMoreDropdown } from './comment-more-dropdown';
import { CommentResolveButton } from './comment-resolve-button';
import { CommentValue } from './comment-value';

type PlateCommentProps = {
  commentId: string;
};

function CommentItemContent() {
  const {
    comment,
    commentText,
    editingValue,
    isMyComment,
    isReplyComment,
    user,
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
            {isReplyComment ? null : <CommentResolveButton />}

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
    <CommentProvider id={commentId} key={commentId}>
      <CommentItemContent />
    </CommentProvider>
  );
}
