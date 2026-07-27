'use client';

import cloneDeep from 'lodash/cloneDeep.js';
import { AIChatPlugin, AIPlugin, useChatChunk } from '@platejs/ai/react';
import { ElementApi, getPluginType, KEYS, PathApi } from 'platejs';
import { usePluginStore } from 'platejs/react';

import { AILoadingBar, AIMenu } from '@/registry/ui/ai-menu';
import { AIAnchorElement, AILeaf } from '@/registry/ui/ai-node';

import { useChat } from '../use-chat';
import { CursorOverlayKit } from './cursor-overlay-kit';

export const aiChatPlugin = AIChatPlugin.extend({
  initialState: {
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    },
  },
  render: {
    afterContainer: AILoadingBar,
    afterEditable: AIMenu,
  },
  shortcuts: { show: { keys: 'mod+j' } },
  useHooks: ({ api, editor, read, store, update }) => {
    useChat();

    const mode = usePluginStore(AIChatPlugin, 'mode');
    const toolName = usePluginStore(AIChatPlugin, 'toolName');
    useChatChunk({
      onChunk: ({ chunk, isFirst, nodes, text: content }) => {
        if (isFirst && mode === 'insert') {
          const selection = editor.read.selection();

          if (!selection) return;

          const { startBlock, startInEmptyParagraph } = read.insertStart();

          editor.update.ai.beginPreview({
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
          store.set({ streaming: true });
        }

        if (mode === 'insert' && nodes.length > 0) {
          if (!store.get('streaming')) return;

          update.insertChunk(chunk, {
            autoScroll: true,
            textProps: {
              [getPluginType(editor, KEYS.ai)]: true,
            },
          });
        }

        if (toolName === 'edit' && mode === 'chat') {
          update.applySuggestions(content, { split: isFirst });
        }
      },
      onFinish: () => {
        api.stop();
      },
    });
  },
});

export const AIKit = [
  ...CursorOverlayKit,
  AIPlugin.configure({ component: AILeaf }),
  aiChatPlugin.configure({ component: AIAnchorElement }),
];
