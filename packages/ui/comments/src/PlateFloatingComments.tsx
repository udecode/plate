import React from 'react';
import {
  CommentsPositioner,
  useFloatingCommentsState,
} from '@udecode/plate-comments';
import { PortalBody } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateFloatingCommentsContent } from './PlateFloatingCommentsContent';

export const floatingCommentsRootCss = css`
  ${tw`absolute z-10 pb-4 w-[418px]`}
`;

export const PlateFloatingComments = () => {
  const { loaded, activeCommentId } = useFloatingCommentsState();

  if (!loaded || !activeCommentId) return null;

  return (
    <PortalBody>
      <CommentsPositioner css={floatingCommentsRootCss}>
        <PlateFloatingCommentsContent />
      </CommentsPositioner>
    </PortalBody>
  );
};
