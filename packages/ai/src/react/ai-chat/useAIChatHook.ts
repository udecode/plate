import type { Operation } from '@udecode/plate';

import { deserializeMd } from '@udecode/plate-markdown';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import type { AIPluginConfig } from '../ai/AIPlugin';
import type { AIChatPluginConfig } from './AIChatPlugin';

import { withAIBatch } from '../../lib';
import { useChatChunk } from './hooks/useChatChunk';

export const useAIChatHooks = () => {
  const { editor, tf } = useEditorPlugin<AIPluginConfig>({ key: 'ai' });
  const mode = usePluginOption({ key: 'aiChat' } as AIChatPluginConfig, 'mode');
  const anchorUpdate = usePluginOption(
    { key: 'aiChat' } as AIChatPluginConfig,
    'anchorUpdate'
  );

  useChatChunk({
    onChunk: ({ isFirst, nodes }) => {
      if (mode === 'insert' && nodes.length > 0) {
        withAIBatch(
          editor,
          () => {
            tf.ai.insertNodes(nodes);
          },
          { split: isFirst }
        );
      }
    },
    onFinish: ({ content }) => {
      if (mode !== 'insert') return;

      const blockAbove = editor.api.block();

      if (!blockAbove) return;

      editor.undo();
      editor.history.redos.pop();

      const deserialized = deserializeMd(editor, content);
      const nodes =
        deserialized.at(0)?.type === 'p'
          ? [...deserialized[0].children, ...deserialized.slice(1)]
          : deserialized;

      withAIBatch(
        editor,
        () => {
          tf.ai.insertNodes(nodes);
        },
        { split: true }
      );

      const lastAINode = editor.history.undos
        .at(-1)
        ?.operations.findLast(
          (op: Operation) => op.type === 'insert_node'
        )?.node;
      if (lastAINode && anchorUpdate) {
        anchorUpdate(lastAINode);
      }
    },
  });
};
