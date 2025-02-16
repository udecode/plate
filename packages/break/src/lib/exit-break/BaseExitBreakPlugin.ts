import { type PluginConfig, createTSlatePlugin } from '@udecode/plate';

import type { ExitBreakRule } from './types';

export type ExitBreakConfig = PluginConfig<
  'exitBreak',
  {
    rules?: ExitBreakRule[];
  }
>;

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const BaseExitBreakPlugin = createTSlatePlugin<ExitBreakConfig>({
  key: 'exitBreak',
  options: {
    rules: [
      { hotkey: 'mod+enter' },
      { before: true, hotkey: 'mod+shift+enter' },
    ],
  },
});
