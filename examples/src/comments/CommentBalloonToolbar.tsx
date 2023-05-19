import React from 'react';
import { TippyProps } from '@tippyjs/react';
import {
  BalloonToolbarProps,
  PlateCommentToolbarButton,
  WithPartial,
} from '@udecode/plate';
import {
  MarkBalloonToolbar,
  markTooltip,
} from '../balloon-toolbar/MarkBalloonToolbar';
import { Icons } from '../common/icons';

export function CommentBalloonToolbar(
  props: WithPartial<BalloonToolbarProps, 'children'>
) {
  const commentTooltip: TippyProps = {
    content: 'Comment (⌘+⇧+M)',
    ...markTooltip,
  };

  return (
    <MarkBalloonToolbar {...props}>
      <PlateCommentToolbarButton
        icon={<Icons.comment />}
        tooltip={commentTooltip}
        actionHandler="onMouseDown"
      />
    </MarkBalloonToolbar>
  );
}
