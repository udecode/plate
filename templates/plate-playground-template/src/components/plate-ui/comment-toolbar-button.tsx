'use client';

import React from 'react';

import { getDraftCommentKey } from '@udecode/plate-comments';
import { useEditorPlugin } from '@udecode/plate/react';
import { MessageSquareTextIcon } from 'lucide-react';

import { commentsPlugin } from '@/components/editor/plugins/comments-plugin';

import { ToolbarButton } from './toolbar';

export function CommentToolbarButton() {
  const { editor, setOption, tf } = useEditorPlugin(commentsPlugin);

  const onCommentToolbarButton = React.useCallback(() => {
    if (!editor.selection) return;

    tf.comment.setDraft();
    editor.tf.collapse();
    setOption('activeId', getDraftCommentKey());
    setOption('commentingBlock', editor.selection.focus.path.slice(0, 1));
  }, [editor.selection, editor.tf, setOption, tf.comment]);

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
