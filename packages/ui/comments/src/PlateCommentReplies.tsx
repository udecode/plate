import React from 'react';
import {
  SCOPE_ACTIVE_COMMENT,
  useCommentReplies,
} from '@udecode/plate-comments';
import { PlateComment } from './PlateComment';

export function PlateCommentReplies() {
  const commentReplies = useCommentReplies(SCOPE_ACTIVE_COMMENT);

  return (
    <>
      {Object.keys(commentReplies).map((id) => (
        <PlateComment key={id} commentId={id} />
      ))}
    </>
  );
}
