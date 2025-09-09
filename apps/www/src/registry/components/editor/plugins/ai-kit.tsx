'use client';

import type { AIChatPluginConfig } from '@platejs/ai/react';

import { withAIBatch } from '@platejs/ai';
import {
  AIChatPlugin,
  AIPlugin,
  streamInsertChunk,
  useChatChunk,
} from '@platejs/ai/react';
import { getPluginType, KEYS, PathApi } from 'platejs';
import { usePluginOption } from 'platejs/react';

import { AILoadingBar, AIMenu } from '@/registry/ui/ai-menu';
import { AIAnchorElement, AILeaf } from '@/registry/ui/ai-node';

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

    const mode = usePluginOption(
      { key: KEYS.aiChat } as AIChatPluginConfig,
      'mode'
    );

    useChatChunk({
      onChunk: ({ chunk, isFirst, nodes }) => {
        if (isFirst && mode == 'insert') {
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
          withAIBatch(
            editor,
            () => {
              if (!getOption('streaming')) return;
              editor.tf.withScrolling(() => {
                streamInsertChunk(editor, chunk, {
                  textProps: {
                    [getPluginType(editor, KEYS.ai)]: true,
                  },
                });
              });
            },
            { split: isFirst }
          );
        }
      },
      onFinish: () => {
        editor.setOption(AIChatPlugin, 'streaming', false);
        editor.setOption(AIChatPlugin, '_blockChunks', '');
        editor.setOption(AIChatPlugin, '_blockPath', null);
        editor.setOption(AIChatPlugin, '_mdxName', null);
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
