import React, { useEffect, useState } from 'react';
import { PortalBody } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateFloatingCommentsContent } from '../CommentReplies/index';
import {
  useCommentsSelectors,
  useResetCommentEditingValue,
} from '../CommentsProvider';
import { CommentsPositioner } from './CommentsPositioner';

export const floatingCommentsRootCss = css`
  ${tw`absolute z-10 pb-4 w-[418px]`}
`;

export const PlateFloatingComments = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const resetCommentEditingValue = useResetCommentEditingValue();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // reset comment editing value when active comment id changes
  useEffect(() => {
    if (activeCommentId) {
      resetCommentEditingValue();
    }
  }, [activeCommentId, resetCommentEditingValue]);

  if (!loaded) return null;
  if (!activeCommentId) return null;

  return (
    <PortalBody>
      <CommentsPositioner css={floatingCommentsRootCss}>
        <PlateFloatingCommentsContent />
      </CommentsPositioner>
    </PortalBody>
  );
};
