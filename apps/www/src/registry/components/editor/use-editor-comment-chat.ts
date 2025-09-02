'use client';

import * as React from 'react';

import { useChat as useBaseChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { useEditorRef } from 'platejs/react';
import { AIChatPlugin } from '@platejs/ai/react';

export interface AIComment {
  blockId: string;
  content: string;
  comment: string;
}

interface UseEditorCommentChatOptions {
  onNewComment?: (comment: AIComment) => void;
  onError?: (error: Error) => void;
  onFinish?: () => void;
  api?: string;
}

export function useEditorCommentChat(
  options: UseEditorCommentChatOptions = {}
) {
  const editor = useEditorRef();

  const { onNewComment, onError, onFinish, api = '/api/ai/command' } = options;

  const processedCommentsRef = React.useRef<Set<string>>(new Set());
  const lastProcessedLengthRef = React.useRef(0);

  const parseStreamedComments = React.useCallback(
    (content: string, fromIndex: number = 0) => {
      if (!onNewComment) return;

      const newContent = content.substring(fromIndex);
      if (!newContent.trim()) return;

      const lines = newContent.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);

          if (
            parsed.blockId &&
            parsed.content &&
            (parsed.comment || parsed.comments)
          ) {
            const aiComment: AIComment = {
              blockId: parsed.blockId,
              content: parsed.content,
              comment: parsed.comment || parsed.comments,
            };

            const commentKey = `${aiComment.blockId}-${aiComment.content}`;

            if (!processedCommentsRef.current.has(commentKey)) {
              processedCommentsRef.current.add(commentKey);
              onNewComment(aiComment);
            }
          }
        } catch (e) {
          console.debug('Skipping non-JSON line:', line);
        }
      }
    },
    [onNewComment]
  );

  const chat = useBaseChat<UIMessage>({
    transport: new DefaultChatTransport({
      api,
    }),
    onFinish: () => {
      processedCommentsRef.current.clear();
      lastProcessedLengthRef.current = 0;
      onFinish?.();
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const { messages, sendMessage, status, error } = chat;

  React.useEffect(() => {
    editor.setOption(AIChatPlugin, 'chat', chat);
  }, [status]);

  React.useEffect(() => {
    if (status !== 'streaming') return;

    const lastMessage = messages.findLast(
      (message) => message.role === 'assistant'
    );

    const content = lastMessage?.parts.find(
      (part) => part.type === 'text'
    )?.text;

    if (lastMessage && lastMessage.role === 'assistant' && content) {
      const contentLength = content.length;
      if (contentLength > lastProcessedLengthRef.current) {
        parseStreamedComments(content, lastProcessedLengthRef.current);
        lastProcessedLengthRef.current = contentLength;
      }
    }
  }, [messages, status, parseStreamedComments]);

  const startCommentGeneration = React.useCallback(
    (promptText: string, systemText: string) => {
      processedCommentsRef.current.clear();
      lastProcessedLengthRef.current = 0;

      sendMessage(
        { text: promptText },
        {
          body: {
            system: systemText,
            prompt: promptText,
          },
        }
      );
    },
    [sendMessage]
  );

  return {
    startCommentGeneration,
    status,
    error,
  };
}
