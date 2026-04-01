import { useEffect, useEffectEvent, useRef } from 'react';

import type { TText } from 'platejs';

import { KEYS } from 'platejs';
import { usePluginOption } from 'platejs/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import { subscribeChatTextStream } from '../streaming/chatTextStreamTransport';
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
  onFinish?: ({
    content,
    interrupted,
  }: {
    content: string;
    interrupted?: boolean;
  }) => void;
}) => {
  const chat = usePluginOption(
    { key: KEYS.aiChat } as AIChatPluginConfig,
    'chat'
  );
  const { status } = chat;
  const isLoading = status === 'streaming' || status === 'submitted';
  const textStreamChannelId = chat?.__plateTextStreamChannelId;

  const content = useLastAssistantMessage()?.parts.find(
    (part) => part.type === 'text'
  )?.text;

  const insertedTextRef = useRef<string>('');
  const prevIsLoadingRef = useRef(isLoading);
  const streamedTextRef = useRef<string>('');
  const receivedTextEndRef = useRef(false);

  const handleChunk = useEffectEvent(
    ({
      chunk,
      isFirst,
      text,
    }: {
      chunk: string;
      isFirst: boolean;
      text: string;
    }) => {
      onChunk({
        chunk,
        isFirst,
        nodes: [{ text: chunk }],
        text,
      });
    }
  );

  const handleFinish = useEffectEvent((text: string, interrupted?: boolean) => {
    onFinish?.({ content: text, interrupted });
  });

  useEffect(() => {
    if (!textStreamChannelId) return;

    return subscribeChatTextStream(textStreamChannelId, (chunk) => {
      if (chunk.type === 'text-start') {
        receivedTextEndRef.current = false;

        return;
      }

      if (chunk.type === 'text-delta') {
        const isFirst = streamedTextRef.current.length === 0;
        const text = `${streamedTextRef.current}${chunk.delta}`;

        streamedTextRef.current = text;

        handleChunk({
          chunk: chunk.delta,
          isFirst,
          text,
        });

        return;
      }

      receivedTextEndRef.current = true;
      handleFinish(streamedTextRef.current, false);
    });
  }, [textStreamChannelId]);

  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading) {
      if (textStreamChannelId) {
        if (!receivedTextEndRef.current) {
          handleFinish(streamedTextRef.current, true);
        }
      } else {
        handleFinish(content ?? '', false);
      }
    }

    if (!isLoading) {
      insertedTextRef.current = '';
      streamedTextRef.current = '';
      receivedTextEndRef.current = false;
    }

    prevIsLoadingRef.current = isLoading;
  }, [content, isLoading, textStreamChannelId]);

  useEffect(() => {
    if (textStreamChannelId || !content) {
      return;
    }

    const chunk = content.slice(insertedTextRef.current.length);

    if (chunk) {
      handleChunk({
        chunk,
        isFirst: insertedTextRef.current === '',
        text: content,
      });
    }

    insertedTextRef.current = content;
  }, [content, textStreamChannelId]);
};
