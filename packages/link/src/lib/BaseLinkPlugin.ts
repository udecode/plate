import {
  type BaseEditor,
  type PlatePluginTxGroup,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import type { NodeInsertNodesOptions, Text } from '@platejs/plite';
import type { TLinkElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';
import { isUrl } from '@udecode/utils';

import {
  insertLink,
  type UpsertLinkOptions,
  upsertLink,
  upsertLinkText,
  type WrapLinkOptions,
  wrapLink,
} from './transforms';
import { type UnwrapLinkOptions, unwrapLink } from './transforms/unwrapLink';
import {
  type CreateLinkNodeOptions,
  getLinkAttributes,
  validateUrl,
} from './utils';
import { withLink } from './withLink';

export type BaseLinkConfig = PluginConfig<
  'a',
  {
    /** List of allowed URL schemes. */
    allowedSchemes?: string[];
    /** Skips sanitation of links. */
    dangerouslySkipSanitization?: boolean;
    defaultLinkAttributes?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
    forceSubmit?: boolean;
    /** Keeps selected text on pasting links by default. */
    keepSelectedTextOnPaste?: boolean;
    /** Configures the range used to find text before the selection. */
    rangeBeforeOptions?: Parameters<BaseEditor['read']['points']['before']>[1];
    /** Hotkeys that trigger the floating link UI. */
    triggerFloatingLinkHotkeys?: string[] | string;
    /** Resolves a URL for the keyboard shortcut and toolbar action. */
    getLinkUrl?: (prevUrl: string | null) => Promise<string | null>;
    /** Resolves an href that differs from the displayed URL. */
    getUrlHref?: (url: string) => string | undefined;
    /** Validates link text. */
    isUrl?: (text: string) => boolean;
    /** Transforms URL input before validation. */
    transformInput?: (url: string) => string | undefined;
  },
  {},
  {
    link: {
      insert: (
        node: CreateLinkNodeOptions,
        options?: NodeInsertNodesOptions<TLinkElement | Text>
      ) => void;
      unwrap: (options?: UnwrapLinkOptions) => boolean | void;
      upsert: (options: UpsertLinkOptions) => boolean | void;
      upsertText: (options: UpsertLinkOptions) => void;
      wrap: (options: WrapLinkOptions) => void;
    };
  }
>;

/** Enables support for hyperlinks. */
export const BaseLinkPlugin = createBasePlugin<BaseLinkConfig>({
  key: KEYS.link,
  node: {
    dangerouslyAllowAttributes: ['target'],
    isElement: true,
    isInline: true,
    props: ({ editor, element }) => getLinkAttributes(editor, element),
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
        rules: [{ validNodeName: 'A' }],
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
  rules: {
    normalize: { removeEmpty: true },
    selection: { affinity: 'directional' },
  },
})
  .extendExtension(withLink)
  .extendTxGroup<'link', PlatePluginTxGroup<BaseLinkConfig['tx']['link']>>(
    'link',
    ({ editor }) =>
      (tx) => ({
        insert: (node, options) => insertLink(editor, tx, node, options),
        unwrap: (options) => unwrapLink(editor, tx, options),
        upsert: (options) => upsertLink(editor, tx, options),
        upsertText: (options) => upsertLinkText(editor, tx, options),
        wrap: (options) => wrapLink(editor, tx, options),
      })
  );
