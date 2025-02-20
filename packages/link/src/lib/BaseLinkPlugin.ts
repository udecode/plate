import {
  type EditorBeforeOptions,
  type PluginConfig,
  createTSlatePlugin,
  getEditorPlugin,
  isUrl,
} from '@udecode/plate';
import {
  RemoveEmptyNodesPlugin,
  withRemoveEmptyNodes,
} from '@udecode/plate-normalizers';

import type { TLinkElement } from './types';

import { getLinkAttributes } from './utils/getLinkAttributes';
import { validateUrl } from './utils/index';
import { withLink } from './withLink';

export type BaseLinkConfig = PluginConfig<
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
    defaultLinkAttributes?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
    forceSubmit?: boolean;
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
     *   {
     *     "matchString": " ",
     *     "skipInvalid": true,
     *     "afterMatch": true
     *   }
     */
    rangeBeforeOptions?: EditorBeforeOptions;
    /**
     * Hotkeys to trigger floating link.
     *
     * @default 'meta+k, ctrl+k'
     */
    triggerFloatingLinkHotkeys?: string[] | string;
    /**
     * On keyboard shortcut or toolbar mousedown, get the link url by calling
     * this promise. The default behavior is to use the browser's native
     * `prompt`.
     */
    getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
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
     * Transform the content of the URL input before validating it. Useful for
     * adding a protocol to a URL. E.g. `google.com` -> `https://google.com`
     *
     * Similar to `getUrlHref` but is used on URL inputs. Whereas that is used
     * on any entered text.
     *
     * @returns The transformed URL.
     */
    transformInput?: (url: string) => string | undefined;
  }
>;

/** Enables support for hyperlinks. */
export const BaseLinkPlugin = createTSlatePlugin<BaseLinkConfig>({
  key: 'a',
  node: {
    dangerouslyAllowAttributes: ['target'],
    isElement: true,
    isInline: true,
    props: ({ editor, element }) => ({
      nodeProps: getLinkAttributes(editor, element as TLinkElement),
    }),
  },
  options: {
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    dangerouslySkipSanitization: false,
    defaultLinkAttributes: {},
    isUrl,
    keepSelectedTextOnPaste: true,
    rangeBeforeOptions: {
      afterMatch: true,
      matchBlockStart: true,
      matchString: ' ',
      skipInvalid: true,
    },
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'A',
          },
        ],
        parse: ({ editor, element, type }) => {
          const url = element.getAttribute('href');

          if (url && validateUrl(editor, url)) {
            return {
              target: element.getAttribute('target') || '_blank',
              type,
              url,
            };
          }
        },
      },
    },
  },
})
  .overrideEditor(withLink)
  .overrideEditor(
    ({ editor, type }) =>
      withRemoveEmptyNodes(
        getEditorPlugin(
          editor,
          RemoveEmptyNodesPlugin.configure({
            options: { types: type },
          })
        )
      ) as any
  );
