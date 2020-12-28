import { QueryOptions } from '@udecode/slate-plugins-common';

export interface SoftBreakRule {
  hotkey: string;
  /**
   * Filter the block types where the rule applies.
   */
  query?: QueryOptions;
}

export interface SoftBreakOnKeyDownOptions {
  rules?: SoftBreakRule[];
}

export interface SoftBreakPluginOptions extends SoftBreakOnKeyDownOptions {}
