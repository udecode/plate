import { useEffect, useRef } from 'react';

import type { TText } from '@udecode/plate-common';

import { useEditorPlugin } from '@udecode/plate-common/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import { useLastAssistantMessage } from '../utils/getLastAssistantMessage';

export const useChatChunk = ({
  onChunk,
  onFinish,
}: {
  onChunk: (chunk: { isFirst: boolean; nodes: TText[]; text: string }) => void;
  onFinish?: ({ content }: { content: string }) => void;
}) => {
  const { useOption } = useEditorPlugin<AIChatPluginConfig>({ key: 'aiChat' });
  const { isLoading } = useOption('chat');
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
    const isFirst = insertedTextRef.current === '';
    insertedTextRef.current = content;

    const nodes: TText[] = [];

    if (chunk) {
      nodes.push({ text: chunk });
      onChunk({
        isFirst,
        nodes,
        text: content,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);
};
