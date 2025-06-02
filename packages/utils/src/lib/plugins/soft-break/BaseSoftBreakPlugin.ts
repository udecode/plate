import type { QueryNodeOptions } from '@udecode/slate';

import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-core';

import { KEYS } from '../../plate-keys';

export type SoftBreakConfig = PluginConfig<
  'softBreak',
  {
    rules?: SoftBreakRule[];
  }
>;

export interface SoftBreakRule {
  hotkey: string;

  /** Filter the block types where the rule applies. */
  query?: QueryNodeOptions;
}

/**
 * Insert soft break following configurable rules. Each rule specifies a hotkey
 * and query options.
 */
export const BaseSoftBreakPlugin = createTSlatePlugin<SoftBreakConfig>({
  key: KEYS.softBreak,
  editOnly: true,
  options: {
    rules: [],
  },
});
