'use client';

import React from 'react';
import { useCommentAddButton } from '@udecode/plate-comments';

import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export function CommentToolbarButton() {
  const { props } = useCommentAddButton();

  if (props.disabled) return null;

  return (
    <ToolbarButton tooltip="Comment (⌘+⇧+M)" {...props}>
      <Icons.commentAdd />
    </ToolbarButton>
  );
}
