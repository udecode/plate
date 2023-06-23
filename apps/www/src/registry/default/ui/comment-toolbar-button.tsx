'use client';

import React from 'react';
import { useCommentAddButton } from '@udecode/plate-comments';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/registry/default/ui/toolbar';

export function CommentToolbarButton() {
  const { props } = useCommentAddButton();

  return (
    <ToolbarButton tooltip="Comment (⌘+⇧+M)" {...props}>
      <Icons.commentAdd />
    </ToolbarButton>
  );
}
