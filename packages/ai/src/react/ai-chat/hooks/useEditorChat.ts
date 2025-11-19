'use client';

import { useEffect } from 'react';

import type { NodeEntry } from 'platejs';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import { useEditorPlugin, usePluginOption } from 'platejs/react';

import { AIChatPlugin } from '../AIChatPlugin';

export type UseEditorChatOptions = {
  // @deprecated not used
  chat?: any;
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
  const open = usePluginOption(AIChatPlugin, 'open');

  useEffect(() => {
    onOpenChange?.(open);

    if (open) {
      if (onOpenBlockSelection) {
        const blockSelectionApi =
          editor.getApi(BlockSelectionPlugin).blockSelection;
        const isBlockSelecting = editor.getOption(
          BlockSelectionPlugin,
          'isSelectingSome'
        );

        if (isBlockSelecting) {
          onOpenBlockSelection(blockSelectionApi.getNodes());

          return;
        }
      }
      if (onOpenCursor && editor.api.isCollapsed()) {
        onOpenCursor();

        return;
      }
      if (onOpenSelection && editor.api.isExpanded()) {
        onOpenSelection();

        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
};
