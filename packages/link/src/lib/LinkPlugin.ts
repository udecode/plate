import {
  type PluginConfig,
  type RangeBeforeOptions,
  createTSlatePlugin,
  isUrl,
} from '@udecode/plate-common';

import { validateUrl } from './utils/index';
import { withLink } from './withLink';

export type LinkConfig = PluginConfig<
  'a',
  {
    /**
     * List of allowed URL schemes.
     *
     * @default ['http', 'https', 'mailto', 'tel']
     */
    allowedSchemes?: string[];

    /**
     * Skips sanitation of links.
     *
     * @default false
     */
    dangerouslySkipSanitization?: boolean;

    forceSubmit?: boolean;

    /**
     * On keyboard shortcut or toolbar mousedown, get the link url by calling
     * this promise. The default behavior is to use the browser's native
     * `prompt`.
     */
    getLinkUrl?: (prevUrl: null | string) => Promise<null | string>;

    /**
     * Callback to optionally get the href for a url
     *
     * @returns Href: an optional link to be used that is different from the
     *   text content (example https://google.com for google.com)
     */
    getUrlHref?: (url: string) => string | undefined;

    /**
     * Callback to validate an url.
     *
     * @default isUrl
     */
    isUrl?: (text: string) => boolean;

    /**
     * Keeps selected text on pasting links by default.
     *
     * @default true
     */
    keepSelectedTextOnPaste?: boolean;

    /**
     * Allow custom config for rangeBeforeOptions.
     *
     * @example
     *   default
     *   {
     *   matchString: ' ',
     *   skipInvalid: true,
     *   afterMatch: true,
     *   }
     */
    rangeBeforeOptions?: RangeBeforeOptions;

    /**
     * Transform the content of the URL input before validating it. Useful for
     * adding a protocol to a URL. E.g. `google.com` -> `https://google.com`
     *
     * Similar to `getUrlHref` but is used on URL inputs. Whereas that is used
     * on any entered text.
     *
     * @returns The transformed URL.
     */
    transformInput?: (url: string) => string | undefined;

    /**
     * Hotkeys to trigger floating link.
     *
     * @default 'meta+k, ctrl+k'
     */
    triggerFloatingLinkHotkeys?: string | string[];
  }
>;

/** Enables support for hyperlinks. */
export const LinkPlugin = createTSlatePlugin<LinkConfig>({
  isElement: true,
  isInline: true,
  key: 'a',
  options: {
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    dangerouslySkipSanitization: false,
    isUrl,
    keepSelectedTextOnPaste: true,
    rangeBeforeOptions: {
      afterMatch: true,
      matchString: ' ',
      skipInvalid: true,
    },
  },
  withOverrides: withLink,
}).extend(({ editor, type }) => ({
  parsers: {
    html: {
      deserializer: {
        parse: ({ element }) => {
          const url = element.getAttribute('href');

          if (url && validateUrl(editor, url)) {
            return {
              target: element.getAttribute('target') || '_blank',
              type,
              url,
            };
          }
        },
        rules: [
          {
            validNodeName: 'A',
          },
        ],
      },
    },
  },
}));
