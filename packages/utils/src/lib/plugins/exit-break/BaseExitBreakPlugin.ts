import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-core';

import type { ExitBreakRule } from './types';

import { KEYS } from '../../plate-keys';

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
  key: KEYS.exitBreak,
  editOnly: true,
  options: {
    rules: [
      { hotkey: 'mod+enter' },
      { before: true, hotkey: 'mod+shift+enter' },
    ],
  },
});
