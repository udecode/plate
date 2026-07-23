import { type InferConfig, createBasePlugin } from '@platejs/core';
import { type NodeInsertNodesOptions, property } from '@platejs/plite';
import { KEYS, NODES, type TMediaEmbedElement } from '@platejs/utils';

import {
  mediaElementProperties,
  type MediaPluginOptions,
} from '../media/types';

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
              type,
              url,
            };
          }
        },
      },
    },
  },
}).extendTx<{
  insert: (
    url: string,
    options?: NodeInsertNodesOptions<TMediaEmbedElement>
  ) => void;
}>(({ getOptions, type }) => (tx) => ({
  insert: (url, options = {}) => {
    if (!tx.selection() && options.at === undefined) return;

    const transformedUrl = getOptions().transformUrl?.(url) ?? url;
    const normalized = parseMediaUrl(transformedUrl, {
      urlParsers: [parseTwitterUrl, parseVideoUrl],
    });
    const media = {
      children: [{ text: '' }],
      ...(normalized?.provider === undefined
        ? {}
        : { provider: normalized.provider }),
      ...(normalized?.sourceUrl === undefined
        ? {}
        : { sourceUrl: normalized.sourceUrl }),
      type,
      url: normalized?.url ?? transformedUrl,
    } satisfies TMediaEmbedElement;

    if (options.at === undefined) {
      tx.blocks.insertAfter(media, options);
    } else {
      tx.nodes.insert(media, options);
    }
  },
}));

export type MediaEmbedConfig = InferConfig<typeof BaseMediaEmbedPlugin>;
