'use client';

import { type UIMessage, DefaultChatTransport } from 'ai';
import { NodeApi } from 'platejs';
import { AIChatPlugin, useAIChat } from 'platejs/ai/react';
import { CommentsPlugin } from 'platejs/comments/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { useEditor, usePluginStore } from 'platejs/react';
import * as React from 'react';

import { createCommentValue } from '@/registry/components/editor/comment';

export type AIChatTransportPluginState = {
  chatOptions: { api: string; body: Record<string, unknown> };
};
const initialState: AIChatTransportPluginState = {
  chatOptions: { api: '/api/ai/command', body: {} },
};

export const AIChatTransportPlugin = AIChatPlugin.extend({
  initialState,
}).extend(({ store }) => {
  let api: string | undefined;
  let transport: DefaultChatTransport<UIMessage> | undefined;
  return {
    api: () => ({
      transport: () => {
        const options = store.get('chatOptions');
        if (!transport || options.api !== api) {
          ({ api } = options);
          transport = new DefaultChatTransport<UIMessage>({
            api,
            body: () => store.get('chatOptions').body,
          });
        }
        return transport;
      },
    }),
  };
});

export type ToolName = 'comment' | 'edit' | 'generate';

export type TComment = {
  comment: {
    blockRef: string;
    comment: string;
    content: string;
  } | null;
  status: 'finished' | 'streaming';
};

export type TTableCellUpdate = {
  cellUpdate: {
    content: string;
    ref: string;
  } | null;
  status: 'finished' | 'streaming';
};

export type MessageDataPart = {
  toolName: ToolName;
  comment: TComment;
  table: TTableCellUpdate;
};

export type ChatMessage = UIMessage<unknown, MessageDataPart>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const isStreamStatus = (value: unknown): value is 'finished' | 'streaming' =>
  value === 'finished' || value === 'streaming';
const isComment = (value: unknown): value is TComment =>
  isRecord(value) &&
  isStreamStatus(value.status) &&
  (value.comment === null ||
    (isRecord(value.comment) &&
      typeof value.comment.blockRef === 'string' &&
      typeof value.comment.comment === 'string' &&
      typeof value.comment.content === 'string'));

export function useEditorChat(
  editableRef: React.RefObject<HTMLElement | null>
) {
  const editor = useEditor();
  const comments = editor.plugin(CommentsPlugin);
  usePluginStore(AIChatTransportPlugin, 'chatOptions');
  const transport = editor.plugin(AIChatTransportPlugin).api.transport();
  const markdownApi = editor.plugin(MarkdownPlugin).api;
  useAIChat({
    editableRef,
    transport,
    onData: (data, signal) => {
      if (data.type === 'data-comment' && isComment(data.data)) {
        const commentData = data.data;

        if (commentData.status === 'finished') {
          editor.update.selection.set(null);

          return;
        }

        const aiComment = commentData.comment;

        if (aiComment == null) {
          throw new Error('Streaming comment data requires a comment');
        }

        const range = editor.plugin(AIChatPlugin).read.commentRange(aiComment);

        if (!range) {
          console.warn('No range found for AI comment');
          return;
        }

        if (!comments.installed) {
          console.warn('AI comments require CommentsPlugin');
          return;
        }

        void (async () => {
          let id: string | null;
          try {
            id = await comments.api.createThread({
              target: { range, type: 'range' },
              body: createCommentValue(aiComment.comment),
              excerpt: markdownApi
                .deserialize(aiComment.content)
                .children.map((node) => NodeApi.string(node))
                .join('\n'),
              status: 'draft',
            });
          } catch (error) {
            // The SDK does not await onData promises, so rejection must terminate here.
            if (!signal.aborted) {
              console.warn('Could not create AI comment', error);
            }
            return;
          }

          if (id) {
            if (!signal.aborted) {
              comments.api.setActive([id]);
            } else comments.api.discardDraft(id);
          }
        })();
      }
    },
  });
}
