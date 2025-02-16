'use client';

import React from 'react';

import { TextApi } from '@udecode/plate';
import { getDraftCommentKey } from '@udecode/plate-comments';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { useEditorRef } from '@udecode/plate/react';
import { MessageSquareTextIcon } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function CommentToolbarButton() {
  const editor = useEditorRef();

  const onCommentToolbarButton = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!editor.selection) return;

      editor.tf.setNodes(
        {
          [CommentsPlugin.key]: true,
          [getDraftCommentKey()]: true,
        },
        { match: TextApi.isText, split: true }
      );
      editor.tf.collapse();
      editor.setOption(CommentsPlugin, 'activeId', getDraftCommentKey());
      editor.setOption(
        CommentsPlugin,
        'commentingBlock',
        editor.selection.focus.path.slice(0, 1)
      );
    },
    [editor]
  );

  return (
    <ToolbarButton
      onClick={onCommentToolbarButton}
      data-plate-prevent-overlay
      tooltip="Comment"
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}
