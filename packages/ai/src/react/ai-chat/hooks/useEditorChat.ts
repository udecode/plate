'use client';

import { useEffect } from 'react';

import type { NodeEntry } from 'platejs';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import { useEditorPlugin, usePluginOption } from 'platejs/react';

import { AIChatPlugin } from '../AIChatPlugin';
import type { AIChatPlateEditor } from '../internal/editorTypes';

export type UseEditorChatOptions = {
  // @deprecated not used
  chat?: unknown;
  onOpenBlockSelection?: (blocks: NodeEntry[]) => void;
  onOpenChange?: (open: boolean) => void;
  onOpenCursor?: () => void;
  onOpenSelection?: () => void;
};

export const useEditorChat = ({
  onOpenBlockSelection,
  onOpenChange,
  onOpenCursor,
  onOpenSelection,
}: UseEditorChatOptions) => {
  const { editor } = useEditorPlugin(AIChatPlugin);
  const aiEditor = editor as AIChatPlateEditor;
  const open = usePluginOption(AIChatPlugin, 'open');

  useEffect(() => {
    onOpenChange?.(open);

    if (open) {
      if (onOpenBlockSelection) {
        const blockSelectionApi = aiEditor.api.blockSelection;
        const isBlockSelecting = editor.getOption(
          BlockSelectionPlugin,
          'isSelectingSome'
        );

        if (isBlockSelecting) {
          onOpenBlockSelection(blockSelectionApi.getNodes());

          return;
        }
      }
      if (onOpenCursor && aiEditor.api.isCollapsed()) {
        onOpenCursor();

        return;
      }
      if (onOpenSelection && aiEditor.api.isExpanded()) {
        onOpenSelection();

        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
};
