import { RangeBeforeOptions } from '@udecode/plate-common';

export interface LinkNodeData {
  url: string;
}

export interface WithLinkOptions {
  /**
   * Allow custom config for rangeBeforeOptions.
   */
  rangeBeforeOptions?: RangeBeforeOptions;

  /**
   * Callback to validate an url.
   */
  isUrl?: (text: string) => boolean;
}
