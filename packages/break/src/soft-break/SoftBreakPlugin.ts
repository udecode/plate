import { createPlugin } from '@udecode/plate-common';

import type { SoftBreakPluginOptions } from './types';

import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const SoftBreakPlugin = createPlugin<
  'softBreak',
  SoftBreakPluginOptions
>({
  handlers: {
    onKeyDown: onKeyDownSoftBreak,
  },
  key: 'softBreak',
  options: {
    rules: [{ hotkey: 'shift+enter' }],
  },
});
