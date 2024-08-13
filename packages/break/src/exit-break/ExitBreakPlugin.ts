import { createPlugin } from '@udecode/plate-common';

import type { ExitBreakPluginOptions } from './types';

import { onKeyDownExitBreak } from './onKeyDownExitBreak';

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const ExitBreakPlugin = createPlugin<
  'exitBreak',
  ExitBreakPluginOptions
>({
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
