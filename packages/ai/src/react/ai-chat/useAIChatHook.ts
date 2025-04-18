import { PathApi } from '@udecode/plate';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import type { AIPluginConfig } from '../ai/AIPlugin';

import { streamInsertChunk, withAIBatch } from '../../lib';
import { type AIChatPluginConfig, AIChatPlugin } from './AIChatPlugin';
import { useChatChunk } from './hooks/useChatChunk';

const chunks: string[] = [];
export const useAIChatHooks = () => {
  const { editor, tf } = useEditorPlugin<AIPluginConfig>({ key: 'ai' });
  const mode = usePluginOption({ key: 'aiChat' } as AIChatPluginConfig, 'mode');

  useChatChunk({
    onChunk: ({ chunk, isFirst, nodes, text }) => {
      chunks.push(chunk);

      if (isFirst) {
        editor.tf.withoutSaving(() => {
          editor.tf.insertNodes(
            {
              children: [{ text: '' }],
              type: AIChatPlugin.key,
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
            streamInsertChunk(editor, chunk, {
              textProps: {
                ai: true,
              },
            });
          },
          { split: isFirst }
        );
      }
    },
    onFinish: ({ content }) => {
      editor.setOption(AIChatPlugin, 'streaming', false);
      editor.setOption(AIChatPlugin, '_blockChunks', '');
      editor.setOption(AIChatPlugin, '_blockPath', null);

      console.log(chunks, 'chunks');
    },
  });
};
