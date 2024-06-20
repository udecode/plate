'use client';

import React from 'react';

import {
  type TReply,
  useCommentItemContentState,
} from '@udecode/plate-comments';
import { formatDistance } from 'date-fns';

import { CommentAvatar } from './comment-avatar';
import { CommentMoreDropdown } from './comment-more-dropdown';
import { CommentResolveButton } from './comment-resolve-button';
import { CommentValue } from './comment-value';

type PlateCommentProps = {
  reply: TReply;
};

export function CommentItem({ reply }: PlateCommentProps) {
  const { commentText, isEditing, isMyComment, user } =
    useCommentItemContentState(reply);

  return (
    <div>
      <div className="relative flex items-center gap-2">
        <CommentAvatar userId={reply.userId} />

        <h4 className="text-sm font-semibold leading-none">{user?.name}</h4>

        <div className="text-xs leading-none text-muted-foreground">
          {formatDistance(reply.createdAt, Date.now())} ago
        </div>
        <CommentResolveButton reply={reply} />

        {isMyComment && (
          <div className="absolute -right-0.5 -top-0.5 flex space-x-1">
            <CommentMoreDropdown reply={reply} />
          </div>
        )}
      </div>

      <div className="mb-4 pl-7 pt-0.5">
        {isEditing ? (
          <CommentValue reply={reply} />
        ) : (
          <div className="whitespace-pre-wrap text-sm">{commentText}</div>
        )}
      </div>
    </div>
  );
}
