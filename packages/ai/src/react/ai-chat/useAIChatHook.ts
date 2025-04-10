import { PathApi } from '@udecode/plate';
import {
  type PlateEditor,
  useEditorPlugin,
  usePluginOption,
} from '@udecode/plate/react';

import type { AIPluginConfig } from '../ai/AIPlugin';

import { resetStreamingStore, streamInsertChunk, withAIBatch } from '../../lib';
import { type AIChatPluginConfig, AIChatPlugin } from './AIChatPlugin';
import { useChatChunk } from './hooks/useChatChunk';

export const getAnchorNode = (editor: PlateEditor) => {
  return editor.api.node({ at: [], match: (n) => n.anchor });
};

export const useAIChatHooks = () => {
  const { editor, tf } = useEditorPlugin<AIPluginConfig>({ key: 'ai' });
  const mode = usePluginOption({ key: 'aiChat' } as AIChatPluginConfig, 'mode');

  useChatChunk({
    onChunk: ({ chunk, isFirst, nodes, text }) => {
      if (isFirst) {
        editor.tf.insertNodes(
          {
            anchor: true,
            children: [{ text: ' ' }],
            type: 'p',
          },
          {
            at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
          }
        );

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
      // if (mode !== 'insert') return;

      // const blockAbove = editor.api.block();

      // if (!blockAbove) return;

      editor.setOption(AIChatPlugin, 'streaming', false);
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
