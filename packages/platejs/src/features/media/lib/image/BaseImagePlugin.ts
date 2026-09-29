import {
  isUrl,
  type Descendant,
  definePlugin,
  type DefinitionOf,
  type ElementOf,
  PLUGINS,
  property,
  schema,
  TextApi,
} from '../../../../core';
import { domCommands } from '../../../../dom/plite-dom.internal';
import { isScriptUrl, isStoredUrl } from '../../../../internal/utils/urlPolicy';
import {
  defineMediaPlugin,
  mediaElementProperties,
  type MediaPluginState,
} from '../BaseMediaPlugin';
import { readHtmlMediaWidth, writeHtmlMediaWidth } from '../mediaHtml.internal';

export type ImagePluginState = {
  /** Disable url embed on insert data. */
  disableEmbedInsert: boolean;
} & MediaPluginState;

const initialState: ImagePluginState = {
  disableEmbedInsert: false,
  isUrl: null,
  transformUrl: null,
};

const isPositiveSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const readPositiveNumber = (value: null | string) => {
  if (value === null) return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const readPositiveSafeInteger = (value: null | string) => {
  const parsed = readPositiveNumber(value);

  return isPositiveSafeInteger(parsed) ? parsed : undefined;
};

const readImageSize = (image: HTMLElement) => {
  const naturalHeight = readPositiveSafeInteger(
    image.dataset.editorNaturalHeight ?? null
  );
  const naturalWidth = readPositiveSafeInteger(
    image.dataset.editorNaturalWidth ?? null
  );
  const width =
    readHtmlMediaWidth(image.style.width) ??
    (naturalWidth === undefined
      ? readPositiveNumber(image.getAttribute('width'))
      : undefined);

  return {
    ...(naturalHeight === undefined ? {} : { naturalHeight }),
    ...(naturalWidth === undefined ? {} : { naturalWidth }),
    ...(width === undefined ? {} : { width }),
  };
};

const readImageText = (image: HTMLElement) => {
  const alt = image.getAttribute('alt');
  const title = image.getAttribute('title');

  return {
    ...(alt === null ? {} : { alt }),
    ...(title === null ? {} : { title }),
  };
};

// `<img>` names the intrinsic height `height` and the source `src`.
const markdownImageAttributes = {
  naturalHeight: 'height',
  url: 'src',
} as const;

/**
 * An `<img>` whose `src` is unusable, such as an unsafe one, is removed; its
 * caption, or else its alt text, stays as a paragraph.
 */
/**
 * An image whose `src` cannot load keeps its caption, or else its alt text, as
 * a paragraph. Markdown already reported a script `src` as a lossless removal;
 * any other source loses a visible image.
 */
const markdownImageFallback = (
  { alt, src }: Readonly<{ alt: unknown; src: string }>,
  captionChildren: readonly Descendant[],
  paragraphType: string,
  report: (
    diagnostic: Readonly<{
      action: 'unwrapped';
      message: string;
      nodeType: string;
    }>
  ) => void,
  nodeType: 'figure' | 'img'
): Descendant[] => {
  if (!isScriptUrl(src)) {
    report({
      action: 'unwrapped',
      message:
        '<img> has an invalid "src" value; the image was removed and its caption or alt text kept.',
      nodeType,
    });
  }
  const children = captionChildren.some(
    (child) => !TextApi.isText(child) || child.text !== ''
  )
    ? [...captionChildren]
    : typeof alt === 'string' && alt !== ''
      ? [{ text: alt }]
      : undefined;

  return children ? [{ children, type: paragraphType }] : [];
};

/** Enables support for images. */
export const BaseImagePlugin = definePlugin(PLUGINS.image, {
  initialState,
  schema: {
    element: schema.element.textBlock({
      object: true,
      properties: {
        url: property.string({
          required: true,
          validate: isStoredUrl('image'),
          validationVersion: 1,
        }),
        ...mediaElementProperties,
        alt: property.string(),
        naturalHeight: property.number({
          validate: isPositiveSafeInteger,
          validationVersion: 1,
        }),
        naturalWidth: property.number({
          validate: isPositiveSafeInteger,
          validationVersion: 1,
        }),
        title: property.string(),
      },
    }),
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      plainText: {
        encode: ({ children, node }) => {
          const label = children || node.alt || node.title || node.url;

          return label === node.url ? node.url : `${label} (${node.url})`;
        },
      },
      html: [
        {
          decode: ({ element }) => {
            const image = element.querySelector<HTMLElement>(':scope > img');

            if (!image) return undefined;

            const url = image.getAttribute('src');

            if (!url) return undefined;

            return { ...readImageText(image), ...readImageSize(image), url };
          },
          encode: ({ content, node, preserve }) => {
            if (typeof node.url !== 'string' || node.url.length === 0) {
              return null;
            }

            preserve(
              'alt',
              'naturalHeight',
              'naturalWidth',
              'title',
              'url',
              'width'
            );

            return {
              attributes: { class: 'editor-image' },
              children: [
                {
                  attributes: {
                    alt: node.alt,
                    'data-editor-natural-height': node.naturalHeight,
                    'data-editor-natural-width': node.naturalWidth,
                    height: node.naturalHeight,
                    src: node.url,
                    title: node.title,
                    width: node.naturalWidth,
                  },
                  style: { width: writeHtmlMediaWidth(node.width) },
                  tag: 'img',
                },
                { children: content, tag: 'figcaption' },
              ],
              tag: 'figure',
            };
          },
          match: [{ className: 'editor-image', tag: 'figure' }],
          priority: 20,
        },
        {
          decode: ({ element }) => {
            if (element.parentElement?.matches('figure.editor-image')) {
              return undefined;
            }

            const url = element.getAttribute('src');

            if (!url) return undefined;

            return {
              ...readImageText(element),
              children: [{ text: '' }],
              ...readImageSize(element),
              url,
            };
          },
          decodeOnly: true,
          match: [{ tag: 'img' }],
        },
      ],
      markdown: [
        {
          node: 'image',
          decode: ({ node }) => ({
            ...(node.alt === null || node.alt === undefined
              ? {}
              : { alt: node.alt }),
            ...(node.title ? { title: node.title } : {}),
            children: [{ text: '' }],
            type,
            url: node.url,
          }),
        },
        {
          tag: 'img',
          attributes: markdownImageAttributes,
          decode: ({
            caption,
            decode,
            node,
            readTagAttributes,
            refuse,
            registry,
            report,
          }) => {
            const { attributes, properties } = readTagAttributes();
            const captionChildren =
              node.children.length > 0
                ? caption(decode(node.children))
                : [{ text: '' }];

            if (!captionChildren) {
              return refuse(
                'Media captions must contain one Markdown paragraph.'
              );
            }
            if (
              typeof attributes.src === 'string' &&
              typeof properties.url !== 'string'
            ) {
              return markdownImageFallback(
                { alt: properties.alt, src: attributes.src },
                captionChildren,
                registry.type(PLUGINS.paragraph) ?? 'paragraph',
                report,
                'img'
              );
            }

            return {
              ...properties,
              children: captionChildren,
              type,
              url: typeof properties.url === 'string' ? properties.url : '',
            };
          },
          encode: ({
            encodeNodeAttributes,
            encodePhrasing,
            node,
            readPlainInline,
          }) => {
            const { alt, children, title, url } = node;
            const plainCaption = readPlainInline(children);
            const attributes = encodeNodeAttributes();
            // `![alt](src "title")` carries nothing else.
            const needsTag = attributes.some(
              ({ name }) => name !== 'alt' && name !== 'src' && name !== 'title'
            );

            if (plainCaption !== '') {
              const serializedChildren =
                plainCaption === null
                  ? encodePhrasing(children)
                  : [{ type: 'text' as const, value: plainCaption }];

              return {
                attributes: [],
                children: [
                  {
                    attributes,
                    children: [],
                    name: 'img',
                    type: 'mdxJsxFlowElement',
                  },
                  {
                    attributes: [],
                    children: [
                      { children: serializedChildren, type: 'paragraph' },
                    ],
                    name: 'figcaption',
                    type: 'mdxJsxFlowElement',
                  },
                ],
                name: 'figure',
                type: 'mdxJsxFlowElement',
              };
            }

            if (needsTag) {
              return {
                attributes,
                children: [],
                name: 'img',
                type: 'mdxJsxFlowElement',
              };
            }

            return {
              children: [
                {
                  alt: alt ?? '',
                  title,
                  type: 'image',
                  url: typeof url === 'string' ? url : '',
                },
              ],
              type: 'paragraph',
            };
          },
        },
        {
          nestedTags: ['figcaption'],
          tag: 'figure',
          attributes: markdownImageAttributes,
          decode: ({
            caption,
            decode,
            node,
            readTagAttributes,
            refuse,
            registry,
            report,
          }) => {
            const [image, figcaption] = node.children;

            if (
              node.children.length > 2 ||
              image?.type !== 'mdxJsxFlowElement' ||
              image.name !== 'img' ||
              image.children.length > 0 ||
              (figcaption !== undefined &&
                (figcaption.type !== 'mdxJsxFlowElement' ||
                  figcaption.name !== 'figcaption'))
            ) {
              return undefined;
            }

            const { attributes, properties } = readTagAttributes(image);
            const captionChildren = figcaption
              ? caption(decode(figcaption.children))
              : [{ text: '' }];

            if (!captionChildren) {
              return refuse(
                'Media captions must contain one Markdown paragraph.'
              );
            }
            if (
              typeof attributes.src === 'string' &&
              typeof properties.url !== 'string'
            ) {
              return markdownImageFallback(
                { alt: properties.alt, src: attributes.src },
                captionChildren,
                registry.type(PLUGINS.paragraph) ?? 'paragraph',
                report,
                'figure'
              );
            }

            return {
              ...properties,
              children: captionChildren,
              type,
              url: typeof properties.url === 'string' ? properties.url : '',
            };
          },
        },
      ],
    }),
})
  .extend(
    defineMediaPlugin('image', (options, url) => ({
      url: options.transformUrl?.(url) ?? url,
    }))
  )
  .extend(({ store }) => ({
    commands: ({ around }) => [
      around(domCommands.insertData, ({ input, next, state }) => {
        const text = input.getData('text/plain');
        const imageExtension = isUrl(text)
          ? new URL(text).pathname.split('.').pop()?.toLowerCase()
          : undefined;

        if (
          !store.get().disableEmbedInsert &&
          imageExtension &&
          imageExtensions.has(imageExtension)
        ) {
          let inserted = false;
          const transaction = state.transaction((tx) => {
            inserted = tx.image.insert({ url: text });
          });

          return inserted ? transaction : next();
        }

        return next();
      }),
    ],
  }));

export type ImageDefinition = DefinitionOf<typeof BaseImagePlugin>;
export type ImageElement = ElementOf<typeof BaseImagePlugin>;

const imageExtensions = new Set([
  '3dv',
  'ai',
  'amf',
  'art',
  'ase',
  'awg',
  'blp',
  'bmp',
  'bw',
  'cd5',
  'cdr',
  'cgm',
  'cit',
  'cmx',
  'cpt',
  'cr2',
  'cur',
  'cut',
  'dds',
  'dib',
  'djvu',
  'dxf',
  'e2d',
  'ecw',
  'egt',
  'emf',
  'eps',
  'exif',
  'fs',
  'gbr',
  'gif',
  'gpl',
  'grf',
  'hdp',
  'icns',
  'ico',
  'iff',
  'int',
  'inta',
  'jfif',
  'jng',
  'jp2',
  'jpeg',
  'jpg',
  'jps',
  'jxr',
  'lbm',
  'liff',
  'max',
  'miff',
  'mng',
  'msp',
  'nitf',
  'nrrd',
  'odg',
  'ota',
  'pam',
  'pbm',
  'pc1',
  'pc2',
  'pc3',
  'pcf',
  'pct',
  'pcx',
  'pdd',
  'pdn',
  'pgf',
  'pgm',
  'pi1',
  'pi2',
  'pi3',
  'pict',
  'png',
  'pnm',
  'pns',
  'ppm',
  'psb',
  'psd',
  'psp',
  'px',
  'pxm',
  'pxr',
  'qfx',
  'ras',
  'raw',
  'rgb',
  'rgba',
  'rle',
  'sct',
  'sgi',
  'sid',
  'stl',
  'sun',
  'svg',
  'sxd',
  'tga',
  'tif',
  'tiff',
  'v2d',
  'vnd',
  'vrml',
  'vtf',
  'wdp',
  'webp',
  'wmf',
  'x3d',
  'xar',
  'xbm',
  'xcf',
  'xpm',
]);
