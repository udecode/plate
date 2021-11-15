import { isUrl as isUrlProtocol } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getLinkDeserialize } from './getLinkDeserialize';
import { getLinkOnKeyDown } from './getLinkOnKeyDown';
import { LinkPlugin } from './types';
import { withLink } from './withLink';

export const ELEMENT_LINK = 'a';

/**
 * Enables support for hyperlinks.
 */
export const createLinkPlugin = createPluginFactory<LinkPlugin>({
  key: ELEMENT_LINK,
  isElement: true,
  isInline: true,
  deserialize: getLinkDeserialize(),
  props: ({ element }) => ({ nodeProps: { url: element?.url } }),
  handlers: {
    onKeyDown: getLinkOnKeyDown(),
  },
  withOverrides: withLink(),
  options: {
    isUrl: isUrlProtocol,
    rangeBeforeOptions: {
      matchString: ' ',
      skipInvalid: true,
      afterMatch: true,
      multiPaths: true,
    },
    hotkey: 'mod+k',
  },
});
