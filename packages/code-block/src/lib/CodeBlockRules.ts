import { createRuleFactory } from '@platejs/core';
import type { BlockFenceInputRuleMatch } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const CodeBlockRules = {
  markdown: createRuleFactory<
    { on: 'break' | 'match' },
    { block: string; fence: string },
    BlockFenceInputRuleMatch
  >({
    type: 'blockFence',
    fence: '```',
    block: KEYS.p,
    enabled: ({ editor }) =>
      !editor.read.nodes.some({
        match: { type: editor.getType(KEYS.codeBlock) },
      }),
    priority: 100,
    apply: ({ editor, tx }, match) => {
      tx.nodes.replace(
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

      const start = tx.points.start([...match.path, 0]);

      if (start) {
        tx.selection.set(start);
      }

      return true;
    },
  }),
};
