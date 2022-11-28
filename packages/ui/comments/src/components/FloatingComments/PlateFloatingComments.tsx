import React from 'react';
import { useCommentsSelectors } from '@udecode/plate-comments';
import { PortalBody } from '@udecode/plate-styled-components';
import { PlateComments } from '../CommentReplies/index';
import { CommentsPositioner } from './CommentsPositioner';
import { floatingCommentsRootCss } from './styles';

export const PlateFloatingComments = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId();

  if (!activeCommentId) return null;

  return (
    <PortalBody>
      <CommentsPositioner css={floatingCommentsRootCss}>
        <PlateComments
          commentId={activeCommentId}
          showResolveCommentButton
          showUnresolveCommentButton={false}
          showMoreButton
        />
      </CommentsPositioner>
    </PortalBody>
  );
};
