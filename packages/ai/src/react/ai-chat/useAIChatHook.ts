import { getBlockAbove } from '@udecode/plate-common';
import { useEditorPlugin } from '@udecode/plate-common/react';
import { deserializeInlineMd } from '@udecode/plate-markdown';

import type { AIPluginConfig } from '../ai/AIPlugin';
import type { AIChatPluginConfig } from './AIChatPlugin';

import { useChatChunk } from './hooks/useChatChunk';

export const useAIChatHooks = () => {
  const { editor, tf } = useEditorPlugin<AIPluginConfig>({ key: 'ai' });
  const { useOption } = useEditorPlugin<AIChatPluginConfig>({ key: 'aiChat' });
  const mode = useOption('mode');

  useChatChunk({
    onChunk: ({ isFirst, nodes }) => {
      if (mode === 'insert' && nodes.length > 0) {
        tf.ai.insertNodes(nodes, { history: isFirst ? 'default' : 'merge' });
      }
    },
    onFinish: ({ content }) => {
      if (mode !== 'insert') return;

      const blockAbove = getBlockAbove(editor);

      if (!blockAbove) return;

      editor.undo();
      editor.history.redos.pop();

      setTimeout(() => {
        const nodes = deserializeInlineMd(editor, content);

        tf.ai.insertNodes(nodes);
      }, 0);
    },
  });
};
