import React from 'react';
import { SCOPE_ACTIVE_COMMENT } from '../ActiveCommentProvider';
import { PlateComment } from '../Comment/index';
import { useCommentReplies } from '../CommentProvider';

export const PlateCommentReplies = () => {
  const commentReplies = useCommentReplies(SCOPE_ACTIVE_COMMENT);

  return (
    <>
      {Object.keys(commentReplies).map((id) => (
        <PlateComment key={id} commentId={id} />
      ))}
    </>
  );
};
