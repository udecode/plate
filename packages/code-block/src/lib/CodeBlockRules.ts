import { BaseParagraphPlugin, createRuleFactory } from '@platejs/core';
import type { BlockFenceInputRuleMatch, PluginReference } from '@platejs/core';
import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';
import { BaseCodeLinePlugin } from './BaseCodeBlockPlugin';

const createCodeBlockRule = createRuleFactory(BaseCodeBlockPlugin);

export const CodeBlockRules = {
  markdown: createCodeBlockRule<
    { on: 'break' | 'match' },
    { block: PluginReference | string; fence: string },
    BlockFenceInputRuleMatch
  >({
    type: 'blockFence',
    fence: '```',
    block: BaseParagraphPlugin,
    enabled: ({ editor }) =>
      !editor.read.nodes.some({
        type: BaseCodeBlockPlugin,
      }),
    priority: 100,
    apply: ({ editor, tx }, match) => {
      tx.nodes.replace(
        {
          children: [
            {
              children: [{ text: '' }],
              type: editor.plugin(BaseCodeLinePlugin).schema.type,
            },
          ],
          type: editor.plugin(BaseCodeBlockPlugin).schema.type,
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
