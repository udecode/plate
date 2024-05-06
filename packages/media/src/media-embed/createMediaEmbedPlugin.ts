import { createPluginFactory } from '@udecode/plate-common/server';

import type { MediaPlugin } from '../media/index';

import { parseIframeUrl } from './parseIframeUrl';

export const ELEMENT_MEDIA_EMBED = 'media_embed';

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const createMediaEmbedPlugin = createPluginFactory<MediaPlugin>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_MEDIA_EMBED,
  options: {
    transformUrl: parseIframeUrl,
  },
  then: (editor, { type }) => ({
    deserializeHtml: {
      getNode: (el: HTMLElement) => {
        const url = el.getAttribute('src');

        if (url) {
          return {
            type,
            url,
          };
        }
      },
      rules: [
        {
          validNodeName: 'IFRAME',
        },
      ],
    },
  }),
});
