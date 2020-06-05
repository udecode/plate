import { QueryOptions } from '../../common';

export interface ExitBreakRule {
  hotkey: string;
  defaultType?: string;
  /**
   * Filter the block types where the rule applies.
   */
  query?: QueryOptions & {
    /**
     * When the selection is at the start of the block.
     */
    start?: boolean;
    /**
     * When the selection is at the end of the block.
     */
    end?: boolean;
  };
  /**
   * Path level where to exit. Default is 1.
   */
  level?: number;
  /**
   * Exit before the selected block if true.
   */
  before?: boolean;
}

export interface ExitBreakOnKeyDownOptions {
  rules?: ExitBreakRule[];
}

export interface ExitBreakPluginOptions extends ExitBreakOnKeyDownOptions {}
