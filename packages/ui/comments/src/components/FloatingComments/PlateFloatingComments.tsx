import React, { useEffect, useState } from 'react';
import { PortalBody } from '@udecode/plate-styled-components';
import { PlateFloatingCommentsContent } from '../CommentReplies/index';
import { useCommentsSelectors } from '../CommentsProvider';
import { CommentsPositioner } from './CommentsPositioner';
import { floatingCommentsRootCss } from './styles';

export const PlateFloatingComments = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) return null;
  if (!activeCommentId) return null;

  return (
    <PortalBody>
      <CommentsPositioner css={floatingCommentsRootCss}>
        <PlateFloatingCommentsContent
          showResolveCommentButton
          showUnresolveCommentButton={false}
          showMoreButton
        />
      </CommentsPositioner>
    </PortalBody>
  );
};
