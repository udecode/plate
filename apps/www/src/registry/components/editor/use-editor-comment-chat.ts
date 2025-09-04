'use client';

import * as React from 'react';

import type { Chat } from '@platejs/ai/react';

export interface AIComment {
  blockId: string;
  comment: string;
  content: string;
}

interface UseEditorCommentChatOptions {
  chat: Chat;
  onNewComment?: (comment: AIComment) => void;
}

export function useEditorCommentChat({
  chat,
  onNewComment,
}: UseEditorCommentChatOptions) {
  const processedCommentsRef = React.useRef<Set<string>>(new Set());
  const lastProcessedLengthRef = React.useRef(0);

  const parseStreamedComments = React.useCallback(
    (content: string, fromIndex = 0) => {
      if (!onNewComment) return;

      const newContent = content.slice(Math.max(0, fromIndex));
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
              comment: parsed.comment || parsed.comments,
              content: parsed.content,
            };

            const commentKey = `${aiComment.blockId}-${aiComment.content}`;

            if (!processedCommentsRef.current.has(commentKey)) {
              processedCommentsRef.current.add(commentKey);
              onNewComment(aiComment);
            }
          }
        } catch (error_) {
          console.debug('Skipping non-JSON line:', line);
        }
      }
    },
    [onNewComment]
  );

  const { error, messages, sendMessage, status } = chat;

  React.useEffect(() => {
    if (chat.choice !== 'comment') return;

    if (status === 'ready') {
      processedCommentsRef.current.clear();
      lastProcessedLengthRef.current = 0;
    }

    if (status !== 'streaming') return;

    const lastMessage = messages?.findLast(
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
    ({ commentPrompt }: { commentPrompt: string }) => {
      processedCommentsRef.current.clear();
      lastProcessedLengthRef.current = 0;

      sendMessage?.(
        { text: commentPrompt },
        {
          body: {
            commentPrompt: commentPrompt,
          },
        }
      );
    },
    [sendMessage]
  );

  return {
    error,
    startCommentGeneration,
    status,
  };
}
