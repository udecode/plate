import { type DefinitionOf, defineBasePlugin } from '@platejs/core';
import { property, schema } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';
import { sanitizeUrl } from '@udecode/utils';

import {
  defineMediaPlugin,
  mediaElementProperties,
  type MediaPluginState,
} from '../BaseMediaPlugin';

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

export type MediaEmbedPluginState = MediaPluginState & {
  transformUrl: (url: string) => string;
};

const initialState: MediaEmbedPluginState = {
  transformUrl: parseIframeUrl,
};

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const BaseMediaEmbedPlugin = defineBasePlugin(KEYS.mediaEmbed, {
  schema: {
    element: schema.element.textBlock({
      isolating: true,
      keyboardSelectable: true,
      properties: {
        ...mediaElementProperties,
        provider: property.string(),
        sourceUrl: property.string(),
      },
    }),
  },
  type: NODES.mediaEmbed,
  initialState,

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
      'text/markdown': {
        from: 'media_embed',
        kind: 'node',
        decode: ({ caption, decode, node, parseAttributes, type }) => {
          const { src, ...props } = parseAttributes(node.attributes);

          return {
            ...props,
            children: caption(decode(node.children)),
            type,
            url: typeof src === 'string' ? src : '',
          };
        },
        encode: ({
          encodePhrasing,
          node,
          propsToAttributes,
          readPlainInline,
          type,
        }) => {
          const { children, type: _, url, ...rest } = node;

          return {
            attributes: propsToAttributes({ ...rest, src: url }),
            children:
              readPlainInline(children) !== ''
                ? [
                    {
                      children: encodePhrasing(children),
                      type: 'paragraph',
                    },
                  ]
                : [],
            name: type,
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
}).extend(
  defineMediaPlugin((options, url) => {
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
  })
);

export type MediaEmbedDefinition = DefinitionOf<typeof BaseMediaEmbedPlugin>;
