import { type PluginConfig, createTPlugin } from '@udecode/plate-common';

import type { MediaPluginOptions } from '../media/index';

import { parseIframeUrl } from './parseIframeUrl';

export type MediaEmbedConfig = PluginConfig<'media_embed', MediaPluginOptions>;

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const MediaEmbedPlugin = createTPlugin<MediaEmbedConfig>({
  isElement: true,
  isVoid: true,
  key: 'media_embed',
  options: {
    transformUrl: parseIframeUrl,
  },
}).extend(({ type }) => ({
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
