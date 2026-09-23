import type { PluginReference, SelectionInputRuleContext } from '../../../core';
import { BaseParagraphPlugin, createBlockFenceInputRule } from '../../../core';
import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';

export const CodeBlockRules = {
  markdown: ({
    block = BaseParagraphPlugin,
    enabled,
    fence = '```',
    on,
    priority = 100,
  }: {
    block?: PluginReference | string;
    enabled?: (context: SelectionInputRuleContext) => boolean;
    fence?: string;
    on: 'break' | 'match';
    priority?: number;
  }) =>
    createBlockFenceInputRule({
      block,
      fence,
      on,
      priority,
      enabled: (context) =>
        (!enabled || enabled(context)) &&
        !context.editor.read.nodes.some({
          type: BaseCodeBlockPlugin,
        }),
      apply: ({ decline, editor, tx }, match) => {
        if (
          !tx.nodes.replace(
            {
              children: [{ text: '' }],
              type: editor.plugin(BaseCodeBlockPlugin).schema.type,
            },
            { at: match.path }
          )
        ) {
          return decline();
        }

        const start = tx.points.start(match.path);

        if (start) {
          tx.selection.set(start);
        }
      },
    }),
};
