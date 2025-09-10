import { useEffect, useRef } from 'react';

import type { TText } from 'platejs';

import { KEYS } from 'platejs';
import { usePluginOption } from 'platejs/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import { useLastAssistantMessage } from '../utils/getLastAssistantMessage';

export const useChatChunk = ({
  onChunk,
  onFinish,
}: {
  onChunk: (chunk: {
    chunk: string;
    isFirst: boolean;
    nodes: TText[];
    text: string;
  }) => void;
  onFinish?: ({ content }: { content: string }) => void;
}) => {
  const { status } = usePluginOption(
    { key: KEYS.aiChat } as AIChatPluginConfig,
    'chat'
  );
  const isLoading = status === 'streaming' || status === 'submitted';

  const content = useLastAssistantMessage()?.parts.find(
    (part) => part.type === 'text'
  )?.text;

  const insertedTextRef = useRef<string>('');
  const prevIsLoadingRef = useRef(isLoading);

  useEffect(() => {
    if (!isLoading) {
      insertedTextRef.current = '';
    }
    if (prevIsLoadingRef.current && !isLoading) {
      onFinish?.({ content: content ?? '' });
    }

    prevIsLoadingRef.current = isLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if (!content) {
      return;
    }

    const chunk = content.slice(insertedTextRef.current.length);

    const nodes: TText[] = [];

    if (chunk) {
      const isFirst = insertedTextRef.current === '';

      nodes.push({ text: chunk });
      onChunk({
        chunk,
        isFirst,
        nodes,
        text: content,
      });
    }

    insertedTextRef.current = content;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);
};
