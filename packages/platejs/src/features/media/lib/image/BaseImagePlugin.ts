import {
  isUrl,
  defineBasePlugin,
  type DefinitionOf,
  type ElementOf,
  PathApi,
  pipePreparedInsertDataQuery,
  PLUGINS,
  prepareHtmlRegistry,
  property,
  schema,
} from '../../../../core';
import { clipboardHandler } from '../../../../dom/plite-dom.internal';
import {
  defineMediaPlugin,
  mediaElementProperties,
  type MediaPluginState,
} from '../BaseMediaPlugin';

export type ImagePluginState = {
  /** Disable url embed on insert data. */
  disableEmbedInsert?: boolean;
  /** Disable file upload on insert data. */
  disableUploadInsert?: boolean;
  /**
   * An optional method that will upload the image to a server. The method
   * receives the base64 dataUrl of the uploaded image, and should return the
   * URL of the uploaded image.
   */
  uploadImage?: (dataUrl: string) => Promise<string> | string;
} & MediaPluginState;

const initialState: ImagePluginState = {};

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
    image.dataset.plateNaturalHeight ?? null
  );
  const naturalWidth = readPositiveSafeInteger(
    image.dataset.plateNaturalWidth ?? null
  );
  const width =
    image.style.width ||
    (naturalWidth === undefined
      ? readPositiveNumber(image.getAttribute('width'))
      : undefined);

  return {
    ...(naturalHeight === undefined ? {} : { naturalHeight }),
    ...(naturalWidth === undefined ? {} : { naturalWidth }),
    ...(width === undefined ? {} : { width }),
  };
};

/** Enables support for images. */
export const BaseImagePlugin = defineBasePlugin(PLUGINS.image, {
  initialState,
  schema: {
    element: schema.element.textBlock({
      isolating: true,
      keyboardSelectable: true,
      properties: {
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
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': [
        {
          decode: ({ element }) => {
            const image = element.querySelector<HTMLElement>(':scope > img');

            if (!image) return undefined;

            const url = image.getAttribute('src');

            if (!url) return undefined;

            const alt = image.getAttribute('alt');
            return {
              ...(alt === null ? {} : { alt }),
              ...readImageSize(image),
              url,
            };
          },
          encode: ({ content, node }) => {
            if (typeof node.url !== 'string' || node.url.length === 0) {
              return null;
            }

            return {
              attributes: { class: 'plate-image' },
              children: [
                {
                  attributes: {
                    alt: node.alt,
                    'data-plate-natural-height': node.naturalHeight,
                    'data-plate-natural-width': node.naturalWidth,
                    height: node.naturalHeight,
                    src: node.url,
                    width: node.naturalWidth,
                  },
                  style: {
                    width:
                      typeof node.width === 'number'
                        ? `${node.width}px`
                        : node.width,
                  },
                  tag: 'img',
                },
                { children: content, tag: 'figcaption' },
              ],
              tag: 'figure',
            };
          },
          match: [{ className: 'plate-image', tag: 'figure' }],
          priority: 20,
        },
        {
          decode: ({ element }) => {
            if (element.parentElement?.matches('figure.plate-image')) {
              return undefined;
            }

            const url = element.getAttribute('src');

            if (!url) return undefined;

            const alt = element.getAttribute('alt');
            return {
              ...(alt === null ? {} : { alt }),
              children: [{ text: '' }],
              ...readImageSize(element),
              url,
            };
          },
          decodeOnly: true,
          match: [{ tag: 'img' }],
        },
      ],
      'text/markdown': [
        {
          from: 'image',
          kind: 'node',
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
          from: 'img',
          kind: 'node',
          decode: ({ caption, decode, node, parseAttributes }) => {
            const {
              alt: altAttribute,
              src,
              ...rest
            } = parseAttributes(node.attributes);
            const captionChildren =
              node.children.length > 0
                ? caption(decode(node.children))
                : [{ text: '' }];

            return {
              ...rest,
              ...(typeof altAttribute === 'string'
                ? { alt: altAttribute }
                : {}),
              children: captionChildren,
              type,
              url: typeof src === 'string' ? src : '',
            };
          },
          encode: ({
            encodePhrasing,
            node,
            propsToAttributes,
            readPlainInline,
          }) => {
            const { children, type: _, url, ...rest } = node;
            const plainCaption = readPlainInline(children);
            const {
              alt: altProperty,
              title: titleProperty,
              ...properties
            } = rest;
            const alt =
              typeof altProperty === 'string' ? altProperty : undefined;
            const title =
              typeof titleProperty === 'string' ? titleProperty : undefined;
            const attributes = propsToAttributes({
              ...(alt === undefined ? {} : { alt }),
              ...properties,
              src: url,
              ...(title === undefined ? {} : { title }),
            });

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

            if (Object.keys(properties).length > 0) {
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
          from: 'figure',
          kind: 'node',
          decode: ({ caption, decode, node, parseAttributes }) => {
            const [image, figcaption] = node.children;

            if (
              node.children.length !== 2 ||
              image?.type !== 'mdxJsxFlowElement' ||
              image.name !== 'img' ||
              image.children.length > 0 ||
              figcaption?.type !== 'mdxJsxFlowElement' ||
              figcaption.name !== 'figcaption'
            ) {
              return undefined;
            }

            const { src, ...properties } = parseAttributes(image.attributes);

            return {
              ...properties,
              children: caption(decode(figcaption.children)),
              type,
              url: typeof src === 'string' ? src : '',
            };
          },
        },
      ],
    }),
})
  .extend(
    defineMediaPlugin((options, url) => ({
      url: options.transformUrl?.(url) ?? url,
    }))
  )
  .extend(({ editor, store, plugin, update }) => {
    const preparedHtmlPlugin = prepareHtmlRegistry(editor).plugins.find(
      (candidate) => candidate.name === plugin.name
    );

    if (!preparedHtmlPlugin) {
      throw new Error(`Parser plugin "${plugin.name}" is not installed.`);
    }

    return {
      contributions: [
        clipboardHandler({
          insertData(dataTransfer, { next, tx }) {
            const format = 'text/plain';
            const text = dataTransfer.getData(format);
            const imageExtension = isUrl(text)
              ? new URL(text).pathname.split('.').pop()?.toLowerCase()
              : undefined;

            if (
              !store.get().disableEmbedInsert &&
              imageExtension &&
              imageExtensions.has(imageExtension)
            ) {
              if (!tx.image.insert({ url: text })) {
                return next(dataTransfer);
              }

              return true;
            }

            if (!store.get().disableUploadInsert && !text) {
              const { files } = dataTransfer;
              const imageFiles = Array.from(files).filter((file) =>
                file.type.startsWith('image/')
              );

              if (imageFiles.length === 0) return next(dataTransfer);
              if (
                !editor.read((state) =>
                  pipePreparedInsertDataQuery(state, [preparedHtmlPlugin], {
                    data: text,
                    format,
                    source: dataTransfer,
                  })
                )
              ) {
                return next(dataTransfer);
              }

              const block = tx.nodes.block()?.[0];

              for (const file of imageFiles) {
                const reader = new FileReader();

                const insertImage = async () => {
                  if (typeof reader.result !== 'string') return;

                  const { uploadImage } = store.get();
                  const url = uploadImage
                    ? await uploadImage(reader.result)
                    : reader.result;
                  const blockPath = block
                    ? editor.read.nodes.path(block)
                    : undefined;

                  if (block && !blockPath) return;

                  update.insert(
                    { url },
                    {
                      at: blockPath ? PathApi.next(blockPath) : undefined,
                    }
                  );
                };

                reader.addEventListener('load', () => {
                  void insertImage();
                });
                reader.readAsDataURL(file);
              }

              return true;
            }

            return next(dataTransfer);
          },
        }),
      ],
    };
  });

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
