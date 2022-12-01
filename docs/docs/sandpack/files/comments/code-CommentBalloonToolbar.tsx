export const commentBalloonToolbarCode = `import React from 'react';
import { Chat } from '@styled-icons/material/Chat';
import { TippyProps } from '@tippyjs/react';
import { PlateCommentToolbarButton } from '@udecode/plate';
import {
  MarkBalloonToolbar,
  markTooltip,
} from '../balloon-toolbar/MarkBalloonToolbar';

export const commentTooltip: TippyProps = {
  content: 'Comment (⌘+⇧+M)',
  ...markTooltip,
};

export const CommentBalloonToolbar = () => (
  <MarkBalloonToolbar>
    <PlateCommentToolbarButton icon={<Chat />} tooltip={commentTooltip} />
  </MarkBalloonToolbar>
);
`;

export const commentBalloonToolbarFile = {
  '/comments/CommentBalloonToolbar.tsx': commentBalloonToolbarCode,
};
