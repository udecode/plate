import { type InferConfig, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';
import { sanitizeUrl } from '@udecode/utils';

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

const MEDIA_EMBED_URL_ATTRIBUTE = 'data-plate-media-url';
const MEDIA_EMBED_WIDTH_ATTRIBUTE = 'data-plate-media-width';

const sanitizeMediaEmbedUrl = (url: string | null | undefined) =>
  sanitizeUrl(url ?? undefined, {
    allowedSchemes: ['http', 'https'],
    permitInvalid: true,
  }) ?? undefined;

const normalizeMediaEmbedWidth = (
  element: HTMLElement,
  width: string | null
) => {
  if (!width) return;
  const style = element.ownerDocument.createElement('div').style;

  style.width = width;

  return style.width || undefined;
};

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

    codecs: ({ defineCodecs }) =>
      defineCodecs({
        'text/html': [
          {
            decode: ({ element }) => {
              const iframe =
                element.querySelector<HTMLElement>(':scope > iframe');
              const url =
                sanitizeMediaEmbedUrl(iframe?.getAttribute('src')) ??
                sanitizeMediaEmbedUrl(
                  element.getAttribute(MEDIA_EMBED_URL_ATTRIBUTE)
                );

              if (!url) return;

              const width =
                iframe?.style.width ||
                normalizeMediaEmbedWidth(
                  element,
                  element.getAttribute(MEDIA_EMBED_WIDTH_ATTRIBUTE)
                );

              return {
                ...(width === undefined ? {} : { width }),
                url,
              };
            },
            encode: ({ content, node }) => {
              const url =
                typeof node.url === 'string'
                  ? sanitizeMediaEmbedUrl(node.url)
                  : undefined;
              const width =
                typeof node.width === 'number' ? `${node.width}px` : node.width;

              if (
                !url ||
                node.isUpload !== undefined ||
                node.name !== undefined ||
                node.placeholderId !== undefined
              ) {
                return null;
              }

              return {
                attributes: {
                  class: 'plate-media-embed',
                  [MEDIA_EMBED_URL_ATTRIBUTE]: url,
                  [MEDIA_EMBED_WIDTH_ATTRIBUTE]: width,
                },
                children: [
                  {
                    attributes: {
                      allowfullscreen: true,
                      src: url,
                      title: 'Embedded media',
                    },
                    children: [],
                    style: { width },
                    tag: 'iframe',
                  },
                  { children: content, tag: 'figcaption' },
                ],
                tag: 'figure',
              };
            },
            match: [{ className: 'plate-media-embed', tag: 'figure' }],
            priority: 10,
          },
          {
            decode: ({ element }) => {
              if (element.parentElement?.matches('figure.plate-media-embed')) {
                return;
              }

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
          },
        ],
      }),
  }),
  (options, url) => {
    const transformedUrl = options.transformUrl?.(url) ?? url;
    const normalized = parseMediaUrl(transformedUrl, {
      urlParsers: [parseTwitterUrl, parseVideoUrl],
    });

    return {
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
