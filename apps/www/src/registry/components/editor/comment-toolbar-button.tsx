'use client';

import { MessageSquareTextIcon } from 'lucide-react';
import { useEditor } from 'platejs/react';
import * as React from 'react';

import { commentPlugin } from '@/registry/components/editor/comment';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function CommentToolbarButton() {
  const editor = useEditor();

  return (
    <ToolbarButton
      onClick={() => {
        editor.plugin(commentPlugin).update.setDraft();
      }}
      data-plate-prevent-overlay
      tooltip="Comment"
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}
