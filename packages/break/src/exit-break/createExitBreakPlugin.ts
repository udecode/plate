import { createPluginFactory } from '@udecode/plate-common/server';

import type { ExitBreakPlugin } from './types';

import { onKeyDownExitBreak } from './onKeyDownExitBreak';

export const KEY_EXIT_BREAK = 'exitBreak';

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const createExitBreakPlugin = createPluginFactory<ExitBreakPlugin>({
  handlers: {
    onKeyDown: onKeyDownExitBreak,
  },
  key: KEY_EXIT_BREAK,
  options: {
    rules: [
      { hotkey: 'mod+enter' },
      { before: true, hotkey: 'mod+shift+enter' },
    ],
  },
});
