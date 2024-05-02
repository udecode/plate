import { createPluginFactory } from '@udecode/plate-common/server';

import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';
import { SoftBreakPlugin } from './types';

export const KEY_SOFT_BREAK = 'softBreak';

/**
 * Insert soft break following configurable rules.
 * Each rule specifies a hotkey and query options.
 */
export const createSoftBreakPlugin = createPluginFactory<SoftBreakPlugin>({
  key: KEY_SOFT_BREAK,
  handlers: {
    onKeyDown: onKeyDownSoftBreak,
  },
  options: {
    rules: [{ hotkey: 'shift+enter' }],
  },
});
