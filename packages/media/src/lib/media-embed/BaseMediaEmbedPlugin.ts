import { type InferConfig, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import {
  defineMediaPlugin,
  mediaElementContent,
  mediaElementProperties,
  type MediaPluginOptions,
} from '../media/MediaPlugin.internal';

import {
  parseIframeUrl,
  parseMediaUrl,
  parseTwitterUrl,
  parseVideoUrl,
} from '../media/parseMediaUrl';

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const BaseMediaEmbedPlugin = defineMediaPlugin(
  createBasePlugin({
    key: KEYS.mediaEmbed,
    schema: {
      element: {
        content: mediaElementContent,
        isolating: true,
        keyboardSelectable: true,
        properties: {
          ...mediaElementProperties,
          provider: property.string(),
          sourceUrl: property.string(),
        },
      },
    },
    type: NODES.mediaEmbed,
    options: {
      transformUrl: parseIframeUrl,
    } as MediaPluginOptions,
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
                children: [{ text: '' }],
                type,
                url,
              };
            }
          },
        },
      },
    },
  }),
  (options, input) => {
    const transformedUrl = options.transformUrl?.(input.url) ?? input.url;
    const normalized = parseMediaUrl(transformedUrl, {
      urlParsers: [parseTwitterUrl, parseVideoUrl],
    });

    return {
      ...input,
      ...(normalized?.provider === undefined
        ? {}
        : { provider: normalized.provider }),
      ...(normalized?.sourceUrl === undefined
        ? {}
        : { sourceUrl: normalized.sourceUrl }),
      url: normalized?.url ?? transformedUrl,
    };
  }
);

export type MediaEmbedConfig = InferConfig<typeof BaseMediaEmbedPlugin>;
