'use client';

import { useEffect, useRef } from 'react';

import cloneDeep from 'lodash/cloneDeep.js';
import { BaseAIPlugin, withAIBatch } from '@platejs/ai';
import {
  AIChatPlugin,
  AIPlugin,
  applyAISuggestions,
  getInsertPreviewStart,
  resetStreamInsertChunk,
  streamInsertChunk,
  useChatChunk,
} from '@platejs/ai/react';
import { ElementApi, getPluginType, KEYS, PathApi } from 'platejs';
import { usePluginOption } from 'platejs/react';

import { AILoadingBar, AIMenu } from '@/registry/ui/ai-menu';
import { AIAnchorElement, AILeaf } from '@/registry/ui/ai-node';
import { createAIStreamBatcher } from '@/registry/lib/ai-stream-batching';

import { useChat } from '../use-chat';
import { CursorOverlayKit } from './cursor-overlay-kit';
import { MarkdownKit } from './markdown-kit';

export const aiChatPlugin = AIChatPlugin.extend({
  options: {
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    },
  },
  render: {
    afterContainer: AILoadingBar,
    afterEditable: AIMenu,
    node: AIAnchorElement,
  },
  shortcuts: { show: { keys: 'mod+j' } },
  useHooks: ({ editor, getOption }) => {
    useChat();

    const mode = usePluginOption(AIChatPlugin, 'mode');
    const toolName = usePluginOption(AIChatPlugin, 'toolName');
    const insertStreamBatcherRef = useRef<ReturnType<
      typeof createAIStreamBatcher
    > | null>(null);

    if (!insertStreamBatcherRef.current) {
      insertStreamBatcherRef.current = createAIStreamBatcher({
        applyChunk: (chunk) => {
          editor.tf.withoutSaving(() => {
            if (!getOption('streaming')) return;

            editor.tf.withScrolling(() => {
              streamInsertChunk(editor, chunk, {
                textProps: {
                  [getPluginType(editor, KEYS.ai)]: true,
                },
              });
            });
          });
        },
      });
    }

    useEffect(
      () => () => {
        insertStreamBatcherRef.current?.reset();
      },
      []
    );

    useChatChunk({
      onChunk: ({ chunk, isFirst, nodes, text: content }) => {
        if (isFirst && mode === 'insert') {
          const { startBlock, startInEmptyParagraph } =
            getInsertPreviewStart(editor);

          editor.getTransforms(BaseAIPlugin).ai.beginPreview({
            originalBlocks:
              startInEmptyParagraph &&
              startBlock &&
              ElementApi.isElement(startBlock)
                ? [cloneDeep(startBlock)]
                : [],
          });

          editor.tf.withoutSaving(() => {
            editor.tf.insertNodes(
              {
                children: [{ text: '' }],
                type: getPluginType(editor, KEYS.aiChat),
              },
              {
                at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
              }
            );
          });
          editor.setOption(AIChatPlugin, 'streaming', true);
        }

        if (mode === 'insert' && nodes.length > 0) {
          insertStreamBatcherRef.current?.queue({ chunk, isFirst });
        }

        if (toolName === 'edit' && mode === 'chat') {
          withAIBatch(
            editor,
            () => {
              applyAISuggestions(editor, content);
            },
            {
              split: isFirst,
            }
          );
        }
      },
      onFinish: () => {
        insertStreamBatcherRef.current?.flush();
        editor.setOption(AIChatPlugin, 'streaming', false);
        resetStreamInsertChunk(editor);
        insertStreamBatcherRef.current?.reset();
      },
    });
  },
});

export const AIKit = [
  ...CursorOverlayKit,
  ...MarkdownKit,
  AIPlugin.withComponent(AILeaf),
  aiChatPlugin,
];
