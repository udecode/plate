'use client';

import { SmileIcon } from 'lucide-react';
import { useEditor, useEditorReadOnly } from 'platejs/react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

import { EmojiPicker } from './emoji-picker';

export function EmojiToolbarButton(
  props: React.ComponentPropsWithoutRef<typeof ToolbarButton>
) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();

  return (
    <EmojiPicker
      onEmojiSelect={(emoji) => {
        if (!editor.read.selection()) return;

        editor.update({ history: 'new-batch' }, (tx) => {
          tx.text.insert(emoji);
        });
      }}
    >
      <ToolbarButton
        aria-label="Emoji"
        disabled={readOnly}
        tooltip="Emoji"
        isDropdown
        {...props}
      >
        <SmileIcon />
      </ToolbarButton>
    </EmojiPicker>
  );
}
