import type { SoftBreakPluginOptions } from '@udecode/plate-break';

import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { ELEMENT_TD } from '@udecode/plate-table';

export const softBreakOptions: Partial<SoftBreakPluginOptions> = {
  rules: [
    { hotkey: 'shift+enter' },
    {
      hotkey: 'enter',
      query: {
        allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD],
      },
    },
  ],
};
