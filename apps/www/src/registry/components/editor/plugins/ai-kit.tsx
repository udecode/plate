'use client';

import cloneDeep from 'lodash/cloneDeep.js';
import { AIChatPlugin, AIPlugin, useChatChunk } from '@platejs/ai/react';
import { PLUGINS, ElementApi, PathApi } from 'platejs';
import { usePluginStore } from 'platejs/react';

import { AILoadingBar, AIMenu } from '@/registry/ui/ai-menu';
import { AIAnchorElement, AILeaf } from '@/registry/ui/ai-node';

import { AIChatTransportPlugin, useChat } from '../use-chat';
import { CursorOverlayKit } from './cursor-overlay-kit';

export const aiChatPlugin = AIChatTransportPlugin.extend({
  render: {
    afterContainer: AILoadingBar,
    afterEditable: AIMenu,
  },
  shortcuts: { show: { keys: 'mod+j' } },
  useHooks: ({ api, editor, read, store }) => {
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
              type: editor.plugin(PLUGINS.aiChat).schema.type,
            },
            {
              at: PathApi.next(selection.focus.path.slice(0, 1)),
            }
          );
          store.set({ streaming: true });
        }

        if (mode === 'insert' && nodes.length > 0) {
          if (!store.get('streaming')) return;

          editor.plugin(AIChatPlugin).update.insertChunk(chunk, {
            autoScroll: true,
            textProps: {
              [editor.plugin(PLUGINS.ai).schema.key]: true,
            },
          });
        }

        if (toolName === 'edit' && mode === 'chat') {
          editor
            .plugin(AIChatPlugin)
            .update.applySuggestions(content, { split: isFirst });
        }
      },
      onFinish: () => {
        api.stop();
      },
    });
  },
}).configure({ component: AIAnchorElement });

export const AIKit = [
  ...CursorOverlayKit,
  AIPlugin.configure({ component: AILeaf }),
  aiChatPlugin,
];
