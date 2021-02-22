import { QueryNodeOptions } from '../../common';

export interface ExitBreakRule {
  hotkey: string;
  defaultType?: string;

  /**
   * @see {@link QueryNodeOptions}
   */
  query?: QueryNodeOptions & {
    /**
     * When the selection is at the start of the block above.
     */
    start?: boolean;

    /**
     * When the selection is at the end of the block above.
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
