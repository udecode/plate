import {
  type PluginConfig,
  createTSlatePlugin,
  isUrl,
} from '@udecode/plate-common';

import type { MediaPluginOptions, TMediaElement } from '../media/index';

import { parseIframeUrl } from './parseIframeUrl';

export interface TMediaEmbedElement extends TMediaElement {}

export type BaseMediaEmbedConfig = PluginConfig<
  'media_embed',
  MediaPluginOptions
>;

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const BaseMediaEmbedPlugin = createTSlatePlugin<BaseMediaEmbedConfig>({
  key: 'media_embed',
  node: { isElement: true, isVoid: true },
  options: {
    isUrl: isUrl,
    transformUrl: parseIframeUrl,
  },
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        parse: ({ element }) => {
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
}));
