import {
  createPluginFactory,
  isUrl as isUrlProtocol,
} from '@udecode/plate-core';
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
  // renderAfterEditable: RenderAfterEditableLink,
  withOverrides: withLink,
  options: {
    isUrl: isUrlProtocol,
    rangeBeforeOptions: {
      matchString: ' ',
      skipInvalid: true,
      afterMatch: true,
    },
    triggerFloatingLinkHotkeys: 'command+k, ctrl+k',
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
