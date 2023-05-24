import React from 'react';
import { WithPartial } from '@udecode/plate';
import { PlateCommentToolbarButton } from './PlateCommentToolbarButton';

import { Icons } from '@/components/icons';
import { MarkBalloonToolbar } from '@/plate/balloon-toolbar/MarkBalloonToolbar';
import { BalloonToolbarProps } from '@/plate/toolbar/BalloonToolbar';

export function CommentBalloonToolbar(
  props: WithPartial<BalloonToolbarProps, 'children'>
) {
  return (
    <MarkBalloonToolbar {...props}>
      <PlateCommentToolbarButton tooltip="Comment (⌘+⇧+M)">
        <Icons.comment />
      </PlateCommentToolbarButton>
    </MarkBalloonToolbar>
  );
}
