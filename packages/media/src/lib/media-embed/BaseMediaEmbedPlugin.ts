import { type InferConfig, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import {
  mediaElementProperties,
  type MediaPluginOptions,
} from '../media/types';

import { parseIframeUrl } from './parseIframeUrl';

const defaultOptions: MediaPluginOptions = {
  transformUrl: parseIframeUrl,
};

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const BaseMediaEmbedPlugin = createBasePlugin({
  key: KEYS.mediaEmbed,
  schema: {
    element: {
      properties: {
        ...mediaElementProperties,
        provider: property.string(),
        sourceUrl: property.string(),
      },
      void: 'block',
    },
  },
  type: NODES.mediaEmbed,
  options: defaultOptions,
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

export type MediaEmbedConfig = InferConfig<typeof BaseMediaEmbedPlugin>;
