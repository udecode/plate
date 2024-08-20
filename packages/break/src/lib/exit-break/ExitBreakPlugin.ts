import { createTSlatePlugin } from '@udecode/plate-common';

import type { ExitBreakConfig } from './types';

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const ExitBreakPlugin = createTSlatePlugin<ExitBreakConfig>({
  key: 'exitBreak',
  options: {
    rules: [
      { hotkey: 'mod+enter' },
      { before: true, hotkey: 'mod+shift+enter' },
    ],
  },
});