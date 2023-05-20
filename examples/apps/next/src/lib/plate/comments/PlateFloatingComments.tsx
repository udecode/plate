import React from 'react';
import {
  CommentsPositioner,
  useFloatingCommentsState,
} from '@udecode/plate-comments';
import { PortalBody } from '@udecode/plate-common';
import { PlateFloatingCommentsContent } from './PlateFloatingCommentsContent';

export function PlateFloatingComments() {
  const { loaded, activeCommentId } = useFloatingCommentsState();

  if (!loaded || !activeCommentId) return null;

  return (
    <PortalBody>
      <CommentsPositioner className="absolute z-10 w-[418px] pb-4">
        <PlateFloatingCommentsContent />
      </CommentsPositioner>
    </PortalBody>
  );
}
