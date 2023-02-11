import React from 'react';
import { Chat } from '@styled-icons/material/Chat';
import { TippyProps } from '@tippyjs/react';
import { PlateCommentToolbarButton } from '@udecode/plate';
import {
  MarkBalloonToolbar,
  markTooltip,
} from '../balloon-toolbar/MarkBalloonToolbar';

export const CommentBalloonToolbar = () => {
  const commentTooltip: TippyProps = {
    content: 'Comment (⌘+⇧+M)',
    ...markTooltip,
  };

  return (
    <MarkBalloonToolbar>
      <PlateCommentToolbarButton
        icon={<Chat />}
        tooltip={commentTooltip}
        actionHandler="onMouseDown"
      />
    </MarkBalloonToolbar>
  );
};
