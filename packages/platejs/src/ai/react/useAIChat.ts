'use client';

import { useEffect, useRef } from 'react';

import type { Text } from '../../core';
import { usePluginStore } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';

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
  const toolName = usePluginStore(AIChatPlugin, 'toolName');
  const lastAssistantMessage = usePluginStore(
    AIChatPlugin,
    'lastAssistantMessage'
  );
  const isLoading = status === 'streaming' || status === 'submitted';
  const content =
    toolName === 'comment'
      ? undefined
      : lastAssistantMessage?.parts.find((part) => part.type === 'text')?.text;
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
