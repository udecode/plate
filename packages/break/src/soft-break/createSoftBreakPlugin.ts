import { createPluginFactory } from '@udecode/plate-common/server';

import type { SoftBreakPlugin } from './types';

import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';

export const KEY_SOFT_BREAK = 'softBreak';

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const createSoftBreakPlugin = createPluginFactory<SoftBreakPlugin>({
  handlers: {
    onKeyDown: onKeyDownSoftBreak,
  },
  key: KEY_SOFT_BREAK,
  options: {
    rules: [{ hotkey: 'shift+enter' }],
  },
});
