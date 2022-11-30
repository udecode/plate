import React, { useEffect, useState } from 'react';
import { CommentsPositioner } from '@udecode/plate-comments';
import { PortalBody } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import {
  useCommentsSelectors,
  useResetNewCommentValue,
} from '../../../comments/src/stores/comments/CommentsProvider';
import { PlateFloatingCommentsContent } from './PlateFloatingCommentsContent';

export const floatingCommentsRootCss = css`
  ${tw`absolute z-10 pb-4 w-[418px]`}
`;

export const PlateFloatingComments = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const resetNewCommentValue = useResetNewCommentValue();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // reset comment editing value when active comment id changes
  useEffect(() => {
    if (activeCommentId) {
      resetNewCommentValue();
    }
  }, [activeCommentId, resetNewCommentValue]);

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
