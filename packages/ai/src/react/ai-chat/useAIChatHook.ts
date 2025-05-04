import { PathApi } from '@udecode/plate';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import { streamInsertChunk, withAIBatch } from '../../lib';
import { type AIChatPluginConfig, AIChatPlugin } from './AIChatPlugin';
import { useChatChunk } from './hooks/useChatChunk';

/** @deprecated Already moved to registry ai-plugins.tsx */
export const useAIChatHooks = () => {
  const { editor, getOption } = useEditorPlugin(AIChatPlugin);

  const mode = usePluginOption({ key: 'aiChat' } as AIChatPluginConfig, 'mode');

  useChatChunk({
    onChunk: ({ chunk, isFirst, nodes, text }) => {
      if (isFirst && mode == 'insert') {
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
            if (!getOption('streaming')) return;
            editor.tf.withScrolling(() => {
              streamInsertChunk(editor, chunk, {
                textProps: {
                  ai: true,
                },
              });
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
      editor.setOption(AIChatPlugin, 'experimental_lastTextId', null);
    },
  });
};
