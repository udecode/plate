import React from 'react';
import { Chat } from '@styled-icons/material/Chat';
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
        icon={<Chat />}
        tooltip={commentTooltip}
        actionHandler="onMouseDown"
      />
    </MarkBalloonToolbar>
  );
}
