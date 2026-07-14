import { useEffect, useRef } from 'react';

import type { Text } from '@platejs/plite';

import { usePluginOption } from '@platejs/core/react';

import { AIChatPlugin } from '../AIChatPlugin';
import { useLastAssistantMessage } from '../utils/getLastAssistantMessage';

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
  const status = usePluginOption(AIChatPlugin, 'chat')?.status;
  const isLoading = status === 'streaming' || status === 'submitted';

  const content = useLastAssistantMessage()?.parts.find(
    (part) => part.type === 'text'
  )?.text;

  const insertedTextRef = useRef<string>('');
  const prevIsLoadingRef = useRef(isLoading);
  const prevContentRef = useRef(isLoading ? '' : (content ?? ''));
  const onChunkRef = useRef(onChunk);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onChunkRef.current = onChunk;
    onFinishRef.current = onFinish;
  }, [onChunk, onFinish]);

  useEffect(() => {
    const wasLoading = prevIsLoadingRef.current;
    const previousContent = prevContentRef.current;
    const nextContent = content ?? '';

    if (!wasLoading && isLoading) {
      insertedTextRef.current = '';
    }
    const contentChanged = nextContent !== previousContent;
    const chunk =
      nextContent && contentChanged && (wasLoading || isLoading)
        ? nextContent.slice(insertedTextRef.current.length)
        : '';

    const nodes: Text[] = [];

    if (chunk) {
      const isFirst = insertedTextRef.current === '';

      nodes.push({ text: chunk });
      onChunkRef.current({
        chunk,
        isFirst,
        nodes,
        text: nextContent,
      });
    }

    if (nextContent && contentChanged) {
      insertedTextRef.current = nextContent;
    }
    if (wasLoading && !isLoading) {
      onFinishRef.current?.({ content: nextContent });
    }

    prevContentRef.current = nextContent;
    prevIsLoadingRef.current = isLoading;
  }, [content, isLoading]);
};
