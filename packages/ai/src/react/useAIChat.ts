'use client';

import { useEffect, useMemo, useRef } from 'react';

import type { MarkdownEditor } from '@platejs/markdown';
import type { NodeEntry, Text } from '@platejs/plite';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import {
  type PlateEditor,
  useEditorPlugin,
  useEditorRuntimeState,
  usePluginStore,
} from '@platejs/core/react';

import { AIChatPlugin } from './AIChatPlugin';

export const useAIChatEditor = (
  editor: MarkdownEditor<PlateEditor>,
  content: string
) => {
  const { store } = useEditorPlugin(AIChatPlugin);
  const document = useMemo(
    () => editor.api.markdown.deserialize(content),
    [content, editor]
  );
  const value = useEditorRuntimeState(editor, (state) => state.children());

  useEffect(() => {
    editor.update({ history: 'skip' }).value.replace(document);
    store.set({ previewValue: editor.read.children() });
  }, [document, editor, store]);

  return value;
};

export const useLastAssistantMessage = () => {
  const toolName = usePluginStore(AIChatPlugin, 'toolName');
  const chat = usePluginStore(AIChatPlugin, 'chat');

  if (toolName === 'comment') return;

  return chat?.messages?.findLast((message) => message.role === 'assistant');
};

export const useChatChunk = ({
  onChunk,
  onFinish,
}: {
  onChunk: (chunk: {
    chunk: string;
    isFirst: boolean;
    nodes: Text[];
    text: string;
  }) => void;
  onFinish?: ({ content }: { content: string }) => void;
}) => {
  const status = usePluginStore(AIChatPlugin, 'chat')?.status;
  const isLoading = status === 'streaming' || status === 'submitted';
  const content = useLastAssistantMessage()?.parts.find(
    (part) => part.type === 'text'
  )?.text;
  const insertedTextRef = useRef('');
  const previousLoadingRef = useRef(isLoading);
  const previousContentRef = useRef(isLoading ? '' : (content ?? ''));
  const onChunkRef = useRef(onChunk);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onChunkRef.current = onChunk;
    onFinishRef.current = onFinish;
  }, [onChunk, onFinish]);

  useEffect(() => {
    const wasLoading = previousLoadingRef.current;
    const previousContent = previousContentRef.current;
    const nextContent = content ?? '';

    if (!wasLoading && isLoading) insertedTextRef.current = '';

    const contentChanged = nextContent !== previousContent;
    const chunk =
      nextContent && contentChanged && (wasLoading || isLoading)
        ? nextContent.slice(insertedTextRef.current.length)
        : '';

    if (chunk) {
      onChunkRef.current({
        chunk,
        isFirst: insertedTextRef.current === '',
        nodes: [{ text: chunk }],
        text: nextContent,
      });
    }
    if (nextContent && contentChanged) insertedTextRef.current = nextContent;
    if (wasLoading && !isLoading) {
      onFinishRef.current?.({ content: nextContent });
    }

    previousContentRef.current = nextContent;
    previousLoadingRef.current = isLoading;
  }, [content, isLoading]);
};

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
  const open = usePluginStore(AIChatPlugin, 'open');
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
    const callbacks = callbacksRef.current;

    callbacks.onOpenChange?.(open);

    if (!open) return;
    if (callbacks.onOpenBlockSelection) {
      const blockSelection = editor.plugin(BlockSelectionPlugin);

      if (blockSelection.store.get('isSelectingSome')) {
        callbacks.onOpenBlockSelection([...blockSelection.read.getNodes({})]);

        return;
      }
    }
    if (callbacks.onOpenCursor && editor.read.selection.isCollapsed()) {
      callbacks.onOpenCursor();

      return;
    }
    if (callbacks.onOpenSelection && editor.read.selection.isExpanded()) {
      callbacks.onOpenSelection();
    }
  }, [editor, open]);
};
