import { QueryNodeOptions } from '../../common';

export interface SoftBreakRule {
  hotkey: string;
  /**
   * Filter the block types where the rule applies.
   */
  query?: QueryNodeOptions;
}

export interface SoftBreakOnKeyDownOptions {
  rules?: SoftBreakRule[];
}

export interface SoftBreakPluginOptions extends SoftBreakOnKeyDownOptions {}
