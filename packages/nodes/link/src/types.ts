import { RangeBeforeOptions, TElement } from '@udecode/plate-core';

export interface TLinkElement extends TElement {
  url: string;
}

export interface LinkPlugin {
  /**
   * Allow custom config for rangeBeforeOptions.
   */
  rangeBeforeOptions?: RangeBeforeOptions;

  triggerFloatingLinkHotkeys?: string;

  /**
   * Callback to validate an url.
   */
  isUrl?: (text: string) => boolean;

  /**
   * Callback to optionally get the href for a url
   * @returns href: an optional link to be used that is different from the text content (example https://google.com for google.com)
   */
  getUrlHref?: (url: string) => string | undefined;

  /**
   * On keyboard shortcut or toolbar mousedown, get the link url by calling this promise. The
   * default behavior is to use the browser's native `prompt`.
   */
  getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
}
