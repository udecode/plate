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
)
  .extendHtmlCodec(() => ({
    decode: ({ element }) => {
      const iframe = element.querySelector<HTMLElement>(':scope > iframe');

      if (!iframe) return;

      const url = iframe.getAttribute('src');

      if (!url) return;

      const width = iframe.style.width || undefined;

      return {
        ...(width === undefined ? {} : { width }),
        url,
      };
    },
    encode: ({ content, node }) => {
      if (
        typeof node.url !== 'string' ||
        node.url.length === 0 ||
        node.isUpload !== undefined ||
        node.name !== undefined ||
        node.placeholderId !== undefined
      ) {
        return null;
      }

      return {
        attributes: { class: 'plate-media-embed' },
        children: [
          {
            attributes: {
              allowfullscreen: true,
              src: node.url,
              title: 'Embedded media',
            },
            children: [],
            style: {
              width:
                typeof node.width === 'number' ? `${node.width}px` : node.width,
            },
            tag: 'iframe',
          },
          { children: content, tag: 'figcaption' },
        ],
        tag: 'figure',
      };
    },
    match: [{ className: 'plate-media-embed', tag: 'figure' }],
    priority: 10,
  }))
  .extendHtmlCodec(() => ({
    decode: ({ element }) => {
      if (element.parentElement?.matches('figure.plate-media-embed')) return;

      const url = element.getAttribute('src');

      if (!url) return;

      const width = element.style.width || undefined;

      return {
        children: [{ text: '' }],
        ...(width === undefined ? {} : { width }),
        url,
      };
    },
    decodeOnly: true,
    match: [{ tag: 'iframe' }],
  }));

export type MediaEmbedConfig = InferConfig<typeof BaseMediaEmbedPlugin>;
