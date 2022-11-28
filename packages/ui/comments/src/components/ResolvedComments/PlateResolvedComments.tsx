import React from 'react';
import { useResolvedComments } from '@udecode/plate-comments';
import { PlateComment } from '../Comment/index';
import {
  resolvedCommentsBodyCss,
  resolvedCommentsHeaderCss,
  resolvedCommentsRootCss,
} from './styles';

export const PlateResolvedComments = () => {
  const resolvedComments = useResolvedComments();

  return (
    <div css={resolvedCommentsRootCss}>
      <h2 css={resolvedCommentsHeaderCss}>Resolved comments</h2>
      <div css={resolvedCommentsBodyCss}>
        {resolvedComments.map((comment) => (
          <PlateComment
            key={comment.id}
            commentId={comment.id}
            showResolveCommentButton={false}
            showUnresolveCommentButton
            showMoreButton={false}
            disableTextarea
          />
        ))}
      </div>
    </div>
  );
};
