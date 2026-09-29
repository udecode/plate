import {
  definePlugin,
  type DefinitionOf,
  type ElementOf,
  PLUGINS,
  property,
  schema,
} from '../../../../core';
import { decideUrl, isStoredUrl } from '../../../../internal/utils/urlPolicy';
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
import {
  readHtmlMediaProvider,
  readHtmlMediaWidth,
  writeHtmlMediaProvider,
  writeHtmlMediaWidth,
} from '../mediaHtml.internal';

const MEDIA_EMBED_URL_ATTRIBUTE = 'data-editor-media-url';
const MEDIA_EMBED_WIDTH_ATTRIBUTE = 'data-editor-media-width';

const sanitizeMediaEmbedUrl = (url: string | null | undefined) => {
  const decision = url ? decideUrl('embed', url) : undefined;

  return decision?.ok ? decision.url : undefined;
};

const normalizeMediaEmbedWidth = (
  element: HTMLElement,
  width: string | null
) => {
  if (!width) return undefined;
  const { style } = element.ownerDocument.createElement('div');

  style.width = width;

  return style.width || undefined;
};

export type MediaEmbedPluginState = MediaPluginState & {
  transformUrl: (url: string) => string;
};

const initialState: MediaEmbedPluginState = {
  isUrl: null,
  transformUrl: parseIframeUrl,
};

/**
 * Enables support for embeddable media such as YouTube or Vimeo videos,
 * Instagram posts and tweets or Google Maps.
 */
export const BaseMediaEmbedPlugin = definePlugin(PLUGINS.mediaEmbed, {
  schema: {
    element: schema.element.textBlock({
      object: true,
      properties: {
        url: property.string({
          required: true,
          validate: isStoredUrl('embed'),
          validationVersion: 1,
        }),
        ...mediaElementProperties,
        provider: property.string(),
        sourceUrl: property.string({
          validate: isStoredUrl('navigation'),
          validationVersion: 1,
        }),
      },
    }),
  },
  initialState,

  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: [
        {
          decode: ({ element, report }) => {
            const iframe =
              element.querySelector<HTMLElement>(':scope > iframe');
            const dataUrl = element.getAttribute(MEDIA_EMBED_URL_ATTRIBUTE);
            const url =
              sanitizeMediaEmbedUrl(iframe?.getAttribute('src')) ??
              sanitizeMediaEmbedUrl(dataUrl);

            if (!url) {
              // HTML safety reports an unsafe iframe `src`; this attribute is
              // the embed's own.
              if (dataUrl) {
                report({
                  action: 'dropped',
                  kind: 'element',
                  message: `HTML media embed URL "${dataUrl}" cannot be embedded; the embed was removed.`,
                });
              }

              return undefined;
            }

            const width = readHtmlMediaWidth(
              iframe?.style.width ||
                normalizeMediaEmbedWidth(
                  element,
                  element.getAttribute(MEDIA_EMBED_WIDTH_ATTRIBUTE)
                )
            );

            return {
              ...readHtmlMediaProvider(element, report),
              ...(width === undefined ? {} : { width }),
              url,
            };
          },
          encode: ({ content, node, preserve }) => {
            const url =
              typeof node.url === 'string'
                ? sanitizeMediaEmbedUrl(node.url)
                : undefined;
            const width = writeHtmlMediaWidth(node.width);

            if (!url) {
              return null;
            }

            preserve('provider', 'sourceUrl', 'url', 'width');

            return {
              attributes: {
                class: 'editor-media-embed',
                [MEDIA_EMBED_URL_ATTRIBUTE]: url,
                [MEDIA_EMBED_WIDTH_ATTRIBUTE]: width,
                ...writeHtmlMediaProvider(node),
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
          match: [{ className: 'editor-media-embed', tag: 'figure' }],
          priority: 10,
        },
        {
          decode: ({ element }) => {
            if (element.parentElement?.matches('figure.editor-media-embed')) {
              return undefined;
            }

            const url = element.getAttribute('src');

            if (!url) return undefined;

            const width = readHtmlMediaWidth(element.style.width);

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
      markdown: { tag: type, attributes: { url: 'src' } },
    }),
}).extend(
  defineMediaPlugin('embed', (options, url) => {
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
export type MediaEmbedElement = ElementOf<typeof BaseMediaEmbedPlugin>;
