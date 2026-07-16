'use client';

import cloneDeep from 'lodash/cloneDeep.js';
import {
  AIChatPlugin,
  AIPlugin,
  applyAISuggestions,
  getInsertPreviewStart,
  streamInsertChunk,
  useChatChunk,
} from '@platejs/ai/react';
import { ElementApi, getPluginType, KEYS, PathApi } from 'platejs';
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

    const mode = usePluginOption(AIChatPlugin, 'mode');
    const toolName = usePluginOption(AIChatPlugin, 'toolName');
    useChatChunk({
      onChunk: ({ chunk, isFirst, nodes, text: content }) => {
        if (isFirst && mode === 'insert') {
          const selection = editor.read.selection();

          if (!selection) return;

          const { startBlock, startInEmptyParagraph } =
            getInsertPreviewStart(editor);

          editor.plugin(AIPlugin).api.beginPreview({
            originalBlocks:
              startInEmptyParagraph &&
              startBlock &&
              ElementApi.isElement(startBlock)
                ? [cloneDeep(startBlock)]
                : [],
          });

          editor.update({ history: 'skip' }).nodes.insert(
            {
              children: [{ text: '' }],
              type: getPluginType(editor, KEYS.aiChat),
            },
            {
              at: PathApi.next(selection.focus.path.slice(0, 1)),
            }
          );
          editor.plugin(AIChatPlugin).setOption('streaming', true);
        }

        if (mode === 'insert' && nodes.length > 0) {
          if (!getOption('streaming')) return;

          streamInsertChunk(editor, chunk, {
            autoScroll: true,
            textProps: {
              [getPluginType(editor, KEYS.ai)]: true,
            },
          });
        }

        if (toolName === 'edit' && mode === 'chat') {
          applyAISuggestions(editor, content, { split: isFirst });
        }
      },
      onFinish: () => {
        editor.plugin(AIChatPlugin).api.stop();
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
