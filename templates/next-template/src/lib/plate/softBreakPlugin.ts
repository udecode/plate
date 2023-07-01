import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { SoftBreakPlugin } from '@udecode/plate-break';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_TD } from '@udecode/plate-table';

export const softBreakPlugin: Partial<PlatePlugin<SoftBreakPlugin>> = {
  options: {
    rules: [
      { hotkey: 'shift+enter' },
      {
        hotkey: 'enter',
        query: {
          allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD],
        },
      },
    ],
  },
};
