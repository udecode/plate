import { createTPlugin } from '@udecode/plate-common';

import type { ExitBreakConfig } from './types';

import { onKeyDownExitBreak } from './onKeyDownExitBreak';

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const ExitBreakPlugin = createTPlugin<ExitBreakConfig>({
  handlers: {
    onKeyDown: onKeyDownExitBreak,
  },
  key: 'exitBreak',
  options: {
    rules: [
      { hotkey: 'mod+enter' },
      { before: true, hotkey: 'mod+shift+enter' },
    ],
  },
});
