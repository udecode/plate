import { BlockquotePlugin } from '@udecode/plate-block-quote';
import { SoftBreakPlugin } from '@udecode/plate-break';
import { CodeBlockPlugin } from '@udecode/plate-code-block';
import { TableCellPlugin } from '@udecode/plate-table';

export const softBreakPlugin = SoftBreakPlugin.configure({
  options: {
    rules: [
      { hotkey: 'shift+enter' },
      {
        hotkey: 'enter',
        query: {
          allow: [
            CodeBlockPlugin.key,
            BlockquotePlugin.key,
            TableCellPlugin.key,
          ],
        },
      },
    ],
  },
});
