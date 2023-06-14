import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { SoftBreakPlugin } from '@udecode/plate-break';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { ELEMENT_TD } from '@udecode/plate-table';

import { MyPlatePlugin } from '@/plate/plate-types';

export const softBreakPlugin: Partial<MyPlatePlugin<SoftBreakPlugin>> = {
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
