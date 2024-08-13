import type { SoftBreakPluginOptions } from '@udecode/plate-break';

import { BlockquotePlugin } from '@udecode/plate-block-quote';
import { CodeBlockPlugin } from '@udecode/plate-code-block';
import { TableCellPlugin } from '@udecode/plate-table';

export const softBreakOptions: Partial<SoftBreakPluginOptions> = {
  rules: [
    { hotkey: 'shift+enter' },
    {
      hotkey: 'enter',
      query: {
        allow: [CodeBlockPlugin.key, BlockquotePlugin.key, TableCellPlugin.key],
      },
    },
  ],
};
