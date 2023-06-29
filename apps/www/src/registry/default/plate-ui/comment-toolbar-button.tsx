'use client';

import React from 'react';
import { useCommentAddButton } from '@udecode/plate-comments';
import { MessageSquarePlus } from 'lucide-react';
import { ToolbarButton } from './toolbar';

export function CommentToolbarButton() {
  const { props } = useCommentAddButton();

  return (
    <ToolbarButton tooltip="Comment (⌘+⇧+M)" {...props}>
      <MessageSquarePlus />
    </ToolbarButton>
  );
}
