import { QueryNodeOptions } from '@udecode/plate-common';

export interface ExitBreakRule {
  /**
   * Hotkey to trigger exit break.
   */
  hotkey: string;

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

  defaultType?: string;
}

export interface ExitBreakPlugin {
  rules: ExitBreakRule[];
}
