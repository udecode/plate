import { resetStreamingStore, steamInsertChunk } from '@udecode/plate-markdown';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import type { AIPluginConfig } from '../ai/AIPlugin';
import type { AIChatPluginConfig } from './AIChatPlugin';

import { withAIBatch } from '../../lib';
import { useChatChunk } from './hooks/useChatChunk';

export const useAIChatHooks = () => {
  const { editor, tf } = useEditorPlugin<AIPluginConfig>({ key: 'ai' });
  const mode = usePluginOption({ key: 'aiChat' } as AIChatPluginConfig, 'mode');

  useChatChunk({
    onChunk: ({ chunk, isFirst, nodes, text }) => {
      // if (isFirst) {
      //   editor.tf.insertNodes(
      //     [
      //       {
      //         children: [{ text: 'anchor' }],
      //         type: 'p',
      //       },
      //       {
      //         children: [{ text: 'anchor' }],
      //         type: 'p',
      //       },
      //     ],
      //     {
      //       at: [0],
      //       nextBlock: true,
      //     }
      //   );
      // }

      if (mode === 'insert' && nodes.length > 0) {
        withAIBatch(
          editor,
          () => {
            steamInsertChunk(editor, chunk, {
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
      // if (mode !== 'insert') return;

      // const blockAbove = editor.api.block();

      // if (!blockAbove) return;

      resetStreamingStore();

      // editor.undo();
      // editor.history.redos.pop();

      // const nodes = deserializeInlineMd(editor, content);

      // withAIBatch(
      //   editor,
      //   () => {
      //     tf.ai.insertNodes(nodes);
      //   },
      //   { split: true }
      // );
    },
  });
};
