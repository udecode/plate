'use client';

import { useEffect } from 'react';

import type { NodeEntry } from '@udecode/plate';
import type { UseChatHelpers } from 'ai/react';

import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import { AIChatPlugin } from '../AIChatPlugin';

export type UseEditorChatOptions = {
  chat: UseChatHelpers;
  onOpenBlockSelection?: (blocks: NodeEntry[]) => void;
  onOpenChange?: (open: boolean) => void;
  onOpenCursor?: () => void;
  onOpenSelection?: () => void;
};

export const useEditorChat = ({
  chat,
  onOpenBlockSelection,
  onOpenChange,
  onOpenCursor,
  onOpenSelection,
}: UseEditorChatOptions) => {
  const { editor, setOption } = useEditorPlugin(AIChatPlugin);
  const open = usePluginOption(AIChatPlugin, 'open');

  // Sync useChat with AIChatPlugin
  useEffect(() => {
    setOption('chat', chat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.input, chat.messages, chat.isLoading, chat.data, chat.error]);

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
