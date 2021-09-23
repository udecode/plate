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

  /**
   * On keyboard shortcut or toolbar mousedown, get the link url by calling this promise. The
   * default behavior is to use the browser's native `prompt`.
   */
  getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
}
