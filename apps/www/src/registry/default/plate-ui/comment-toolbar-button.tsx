'use client';

import React from 'react';

import { getDraftCommentKey } from '@udecode/plate-comments';
import {
  CommentsPlugin,
  useAddCommentMark,
} from '@udecode/plate-comments/react';
import { useEditorRef } from '@udecode/plate/react';
import { MessageSquareTextIcon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function CommentToolbarButton() {
  const editor = useEditorRef();
  const addMark = useAddCommentMark();

  const onCommentToolbarButton = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      addMark();
      editor.tf.collapse();
      editor.setOption(CommentsPlugin, 'activeId', getDraftCommentKey());
    },
    [addMark, editor]
  );

  return (
    <ToolbarButton
      onClick={onCommentToolbarButton}
      data-plate-prevent-overlay
      tooltip="Comment"
    >
      <MessageSquareTextIcon className="mr-1" />
      <span className="hidden sm:inline">Comment</span>
    </ToolbarButton>
  );
}
