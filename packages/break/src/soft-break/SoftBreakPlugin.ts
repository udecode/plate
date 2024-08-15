import { createTPlugin } from '@udecode/plate-common';

import type { SoftBreakConfig } from './types';

import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const SoftBreakPlugin = createTPlugin<SoftBreakConfig>({
  handlers: {
    onKeyDown: onKeyDownSoftBreak,
  },
  key: 'softBreak',
  options: {
    rules: [{ hotkey: 'shift+enter' }],
  },
});
