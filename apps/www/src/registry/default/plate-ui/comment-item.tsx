'use client';

import React from 'react';

import {
  CommentProvider,
  CommentsPlugin,
  useCommentItemContentState,
} from '@udecode/plate-comments/react';
import { usePluginOption } from '@udecode/plate/react';
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

        <h4 className="text-sm leading-none font-semibold">{user?.name}</h4>

        <div className="text-xs leading-none text-muted-foreground">
          {formatDistance(comment.createdAt, Date.now())} ago
        </div>

        {isMyComment && (
          <div className="absolute -top-0.5 -right-0.5 flex space-x-1">
            {isReplyComment ? null : <CommentResolveButton />}

            <CommentMoreDropdown />
          </div>
        )}
      </div>

      <div className="mb-4 pt-0.5 pl-7">
        {editingValue ? (
          <CommentValue />
        ) : (
          <div className="text-sm whitespace-pre-wrap">{commentText}</div>
        )}
      </div>
    </div>
  );
}

export function CommentItem({ commentId }: PlateCommentProps) {
  const comment = usePluginOption(CommentsPlugin, 'commentById', commentId);

  if (!comment) return null;

  return (
    <CommentProvider id={commentId} key={commentId}>
      <CommentItemContent />
    </CommentProvider>
  );
}
