import {
  createPluginFactory,
  isUrl as isUrlProtocol,
} from '@udecode/plate-core';
import { onKeyDownLink } from './onKeyDownLink';
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
  props: ({ element }) => ({ nodeProps: { href: element?.url } }),
  handlers: {
    onKeyDown: onKeyDownLink,
  },
  withOverrides: withLink,
  options: {
    isUrl: isUrlProtocol,
    rangeBeforeOptions: {
      matchString: ' ',
      skipInvalid: true,
      afterMatch: true,
    },
    hotkey: 'mod+k',
  },
  then: (editor, { type }) => ({
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'A',
        },
      ],
      getNode: (el) => ({
        type,
        url: el.getAttribute('href'),
      }),
    },
  }),
});
