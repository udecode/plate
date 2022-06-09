import {
  HotkeyPlugin,
  RangeBeforeOptions,
  TElement,
} from '@udecode/plate-core';

export interface TLinkElement extends TElement {
  url: string;
}

export interface LinkPlugin extends HotkeyPlugin {
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
