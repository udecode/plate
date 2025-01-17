import { type PluginConfig, createTSlatePlugin } from '@udecode/plate';

import type { MediaPluginOptions, TMediaElement } from '../media/index';

import { parseIframeUrl } from './parseIframeUrl';

export interface TMediaEmbedElement extends TMediaElement {}

export type MediaEmbedConfig = PluginConfig<'media_embed', MediaPluginOptions>;

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const BaseMediaEmbedPlugin = createTSlatePlugin<MediaEmbedConfig>({
  key: 'media_embed',
  node: { isElement: true, isVoid: true },
  options: {
    transformUrl: parseIframeUrl,
  },
  parsers: {
    html: {
      deserializer: {
        parse: ({ element, type }) => {
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
    },
  },
});
