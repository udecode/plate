import React from 'react';
import {
  SCOPE_ACTIVE_COMMENT,
  useCommentReplies,
} from '../../../comments/src/stores/comment/CommentProvider';
import { PlateComment } from './PlateComment';

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
