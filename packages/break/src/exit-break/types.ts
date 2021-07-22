import { QueryNodeOptions } from '@udecode/plate-common';
import { PlatePluginOptions } from '@udecode/plate-core';

export interface ExitBreakRule extends Pick<PlatePluginOptions, 'defaultType'> {
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
}

export interface ExitBreakOnKeyDownOptions {
  rules?: ExitBreakRule[];
}

export interface ExitBreakPluginOptions extends ExitBreakOnKeyDownOptions {}
