'use client';

import { AIChatPlugin, AIPlugin, useChatChunk } from '@platejs/ai/react';
import cloneDeep from 'lodash/cloneDeep.js';
import { ElementApi, PathApi, PLUGINS } from 'platejs';
import {
  PlateElement,
  PlateText,
  usePluginStore,
  type PlateElementProps,
  type PlateTextProps,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { AILoadingBar, AIMenu } from '@/registry/components/editor/ai-menu';

import { CursorOverlayKit } from './cursor-overlay';
import { AIChatTransportPlugin, useChat } from './use-chat';

export function AILeaf(props: PlateTextProps<typeof AIPlugin>) {
  const streaming = usePluginStore(AIChatPlugin, 'streaming');
  const streamingLeaf = props.editor
    .plugin(AIChatPlugin)
    .read.node({ streaming: true });

  const isLast = streamingLeaf?.[0] === props.text;

  return (
    <PlateText
      className={cn(
        'border-b-2 border-b-purple-100 bg-purple-50 text-purple-800',
        'transition-all duration-200 ease-in-out',
        isLast &&
          streaming &&
          'after:ml-1.5 after:inline-block after:h-3 after:w-3 after:rounded-full after:bg-primary after:align-middle after:content-[""]'
      )}
      {...props}
    />
  );
}

export function AIAnchorElement(props: PlateElementProps<typeof AIChatPlugin>) {
  return (
    <PlateElement {...props}>
      <div className="h-[0.1px]" />
    </PlateElement>
  );
}

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

          const { path, startBlock, startInEmptyParagraph } =
            read.insertStart();

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
              at: PathApi.next(path),
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
