'use client';

import React from 'react';

import { useCommentReplies } from '@udecode/plate-comments';

import { CommentItem } from './comment-item';

interface CommentReplyItems {
  commentId: string;
}

export function CommentReplyItems({ commentId }: CommentReplyItems) {
  const commentReplies = useCommentReplies(commentId);

  return (
    <>
      {commentReplies.map((item) => (
        <CommentItem key={item.id} reply={item}></CommentItem>
      ))}
    </>
  );
}
