import { useEffect, useRef } from 'react';

import type { TText } from '@udecode/plate';

import { usePluginOption } from '@udecode/plate/react';

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
  const { isLoading } = usePluginOption(
    { key: 'aiChat' } as AIChatPluginConfig,
    'chat'
  );
  const content = useLastAssistantMessage()?.content;
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
