import { createPlugin } from '@udecode/plate-common/server';

import type { MediaPluginOptions } from '../media/index';

import { parseIframeUrl } from './parseIframeUrl';

export const ELEMENT_MEDIA_EMBED = 'media_embed';

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const MediaEmbedPlugin = createPlugin<'media_embed', MediaPluginOptions>(
  {
    isElement: true,
    isVoid: true,
    key: ELEMENT_MEDIA_EMBED,
    options: {
      transformUrl: parseIframeUrl,
    },
  }
).extend(({ plugin: { type } }) => ({
  deserializeHtml: {
    getNode: ({ element }) => {
      const url = element.getAttribute('src');

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
}));
