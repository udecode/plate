'use client';

import { useEffect, useRef } from 'react';

import type { NodeEntry } from '@platejs/plite';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import { useEditorPlugin, usePluginOption } from '@platejs/core/react';

import { AIChatPlugin } from '../AIChatPlugin';

export type UseEditorChatOptions = {
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
  const callbacksRef = useRef({
    onOpenBlockSelection,
    onOpenChange,
    onOpenCursor,
    onOpenSelection,
  });

  useEffect(() => {
    callbacksRef.current = {
      onOpenBlockSelection,
      onOpenChange,
      onOpenCursor,
      onOpenSelection,
    };
  }, [onOpenBlockSelection, onOpenChange, onOpenCursor, onOpenSelection]);

  useEffect(() => {
    const {
      onOpenBlockSelection,
      onOpenChange,
      onOpenCursor,
      onOpenSelection,
    } = callbacksRef.current;

    onOpenChange?.(open);

    if (!open) return;

    if (onOpenBlockSelection) {
      const blockSelection = editor.plugin(BlockSelectionPlugin);

      if (blockSelection.getOption('isSelectingSome')) {
        onOpenBlockSelection(blockSelection.api.getNodes({}));

        return;
      }
    }
    if (onOpenCursor && editor.read.selection.isCollapsed()) {
      onOpenCursor();

      return;
    }
    if (onOpenSelection && editor.read.selection.isExpanded()) {
      onOpenSelection();
    }
  }, [editor, open]);
};
