import {
  type ExtendConfig,
  type HotkeyPluginOptions,
  type OmitFirst,
  bindFirst,
} from '@udecode/plate-common';
import { toTPlatePlugin } from '@udecode/plate-common/react';

import {
  type LinkConfig as BaseLinkConfig,
  LinkPlugin as BaseLinkPlugin,
  type TLinkElement,
} from '../lib';
import { getLinkAttributes } from './utils';

export type LinkConfig = ExtendConfig<
  BaseLinkConfig,
  {
    /**
     * Default HTML attributes for link elements.
     *
     * @default { }
     */
    defaultLinkAttributes?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  } & HotkeyPluginOptions,
  {
    link: LinkApi;
  }
>;

export type LinkApi = {
  getAttributes: OmitFirst<typeof getLinkAttributes>;
};

/** Enables support for hyperlinks. */
export const LinkPlugin = toTPlatePlugin<LinkConfig>(BaseLinkPlugin, {
  options: {
    defaultLinkAttributes: {},
    triggerFloatingLinkHotkeys: 'meta+k, ctrl+k',
  },
})
  .extendEditorApi<LinkConfig['api']>(({ editor }) => ({
    link: {
      getAttributes: bindFirst(getLinkAttributes, editor),
    },
  }))
  .extend(({ api }) => ({
    props: ({ element }) => ({
      nodeProps: api.link.getAttributes(element as TLinkElement),
    }),
  }));
