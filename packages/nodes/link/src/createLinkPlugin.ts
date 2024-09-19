import { AnchorHTMLAttributes } from 'react';
import {
  createPluginFactory,
  isUrl,
  RangeBeforeOptions,
} from '@udecode/plate-common';
import { getLinkAttributes, validateUrl } from './utils/index';
import { TLinkElement } from './types';
import { withLink } from './withLink';

export const ELEMENT_LINK = 'a';

export interface LinkPlugin {
  forceSubmit?: boolean;

  /**
   * Allow custom config for rangeBeforeOptions.
   * @example default
   * {
   *   matchString: ' ',
   *   skipInvalid: true,
   *   afterMatch: true,
   * }
   */
  rangeBeforeOptions?: RangeBeforeOptions;

  /**
   * Hotkeys to trigger floating link.
   * @default 'meta+k, ctrl+k'
   */
  triggerFloatingLinkHotkeys?: string | string[];

  /**
   * List of allowed URL schemes.
   * @default ['http', 'https', 'mailto', 'tel']
   */
  allowedSchemes?: string[];

  /**
   * Skips sanitation of links.
   * @default false
   */
  dangerouslySkipSanitization?: boolean;

  /**
   * Default HTML attributes for link elements.
   * @default {}
   */
  defaultLinkAttributes?: AnchorHTMLAttributes<HTMLAnchorElement>;

  /**
   * Keeps selected text on pasting links by default.
   * @default true
   */
  keepSelectedTextOnPaste?: boolean;

  /**
   * Callback to validate an url.
   * @default isUrl
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

/**
 * Enables support for hyperlinks.
 */
export const createLinkPlugin = createPluginFactory<LinkPlugin>({
  key: ELEMENT_LINK,
  isElement: true,
  isInline: true,
  dangerouslyAllowAttributes: ['target'],
  withOverrides: withLink,
  options: {
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    dangerouslySkipSanitization: false,
    defaultLinkAttributes: {},
    isUrl,
    rangeBeforeOptions: {
      matchString: ' ',
      skipInvalid: true,
      afterMatch: true,
    },
    triggerFloatingLinkHotkeys: 'meta+k, ctrl+k',
    keepSelectedTextOnPaste: true,
  },
  then: (editor, { type }) => ({
    props: ({ element }) => ({
      nodeProps: getLinkAttributes(editor, element as TLinkElement),
    }),
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'A',
        },
      ],
      getNode: (el) => {
        const url = el.getAttribute('href');

        if (url && validateUrl(editor, url)) {
          return {
            type,
            url,
            target: el.getAttribute('target') || '_blank',
          };
        }

        return undefined;
      },
    },
  }),
});
