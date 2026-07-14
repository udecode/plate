import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { MediaPluginOptions } from '../media/index';

import { parseIframeUrl } from './parseIframeUrl';

export type MediaEmbedConfig = PluginConfig<'media_embed', MediaPluginOptions>;

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const BaseMediaEmbedPlugin = createBasePlugin<MediaEmbedConfig>({
  key: KEYS.mediaEmbed,
  node: { isElement: true, isVoid: true },
  options: {
    transformUrl: parseIframeUrl,
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'IFRAME',
          },
        ],
        parse: ({ element, type }) => {
          const url = element.getAttribute('src');

          if (url) {
            return {
              type,
              url,
            };
          }
        },
      },
    },
  },
});
