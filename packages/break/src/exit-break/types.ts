import type { QueryNodeOptions } from '@udecode/plate-common';

export interface ExitBreakRule {
  /** Hotkey to trigger exit break. */
  hotkey: string;

  /** Exit before the selected block if true. */
  before?: boolean;

  defaultType?: string;

  /** Path level where to exit. Default is 0. */
  level?: number;

  /** @see {@link QueryNodeOptions} */
  query?: {
    /** When the selection is at the end of the block above. */
    end?: boolean;

    /** When the selection is at the start of the block above. */
    start?: boolean;
  } & QueryNodeOptions;

  /**
   * If true, exit relative to current level. Otherwise, exit at the given
   * level. Default is false.
   */
  relative?: boolean;
}

export interface ExitBreakPluginOptions {
  rules?: ExitBreakRule[];
}
