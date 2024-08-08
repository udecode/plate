import type { QueryNodeOptions } from '@udecode/plate-common/server';

export interface SoftBreakRule {
  hotkey: string;

  /** Filter the block types where the rule applies. */
  query?: QueryNodeOptions;
}

export interface SoftBreakPluginOptions {
  rules?: SoftBreakRule[];
}
