import { createRuleFactory } from '@platejs/core';
import type { BlockFenceInputRuleMatch, BaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

const isCodeBlockInputBlocked = (editor: BaseEditor) =>
  editor.read.nodes.some({
    match: { type: editor.getType(KEYS.codeBlock) },
  });

export const CodeBlockRules = {
  markdown: createRuleFactory<
    { on: 'break' | 'match' },
    { block: string; fence: string },
    BlockFenceInputRuleMatch
  >({
    type: 'blockFence',
    fence: '```',
    block: KEYS.p,
    enabled: ({ editor }) => !isCodeBlockInputBlocked(editor),
    priority: 100,
    apply: ({ editor, tx }, match) => {
      tx.nodes.remove({ at: match.path });
      tx.nodes.insert(
        {
          children: [
            {
              children: [{ text: '' }],
              type: editor.getType(KEYS.codeLine),
            },
          ],
          type: editor.getType(KEYS.codeBlock),
        },
        { at: match.path }
      );

      const start = editor.read.points.start([...match.path, 0]);

      if (start) {
        tx.selection.set(start);
      }

      return true;
    },
  }),
};
