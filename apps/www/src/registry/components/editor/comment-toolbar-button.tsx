'use client';

import { MessageSquareTextIcon } from 'lucide-react';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  useEditor,
  useEditorHasSelection,
  useEditorReadOnly,
} from 'platejs/react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function CommentToolbarButton() {
  const editor = useEditor();
  const comments = editor.plugin(CommentsPlugin);
  const readOnly = useEditorReadOnly();
  const hasSelection = useEditorHasSelection();

  if (!comments.installed) return null;

  const beginComment = () => comments.api.begin();

  return (
    <ToolbarButton
      aria-label="Comment"
      disabled={readOnly || !hasSelection}
      onClick={beginComment}
      data-plate-prevent-overlay
      tooltip="Comment"
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}
