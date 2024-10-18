'use client';

import { useEffect } from 'react';

import type { UseChatHelpers } from 'ai/react';

import {
  type TNodeEntry,
  isCollapsed,
  isSelectionExpanded,
} from '@udecode/plate-common';
import { useEditorPlugin } from '@udecode/plate-common/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

import { AIChatPlugin } from '../AIChatPlugin';

export type EditorChatState =
  | 'cursorCommand'
  | 'cursorSuggestion'
  | 'selectionCommand'
  | 'selectionSuggestion';

export type UseEditorChatOptions = {
  chat: UseChatHelpers;
  onOpenBlockSelection?: (blocks: TNodeEntry[]) => void;
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
  const { editor, setOption, setOptions, useOption } =
    useEditorPlugin(AIChatPlugin);
  const open = useOption('open');

  // Sync useChat with AIChatPlugin
  useEffect(() => {
    setOption('chat', chat);
  }, [chat, setOption, setOptions]);

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
        }
      }
      if (onOpenCursor && isCollapsed(editor.selection)) {
        onOpenCursor();
      }
      if (onOpenSelection && isSelectionExpanded(editor)) {
        onOpenSelection();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
};
