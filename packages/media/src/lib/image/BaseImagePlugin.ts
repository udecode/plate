import { type InferConfig, createBasePlugin } from '@platejs/core';
import {
  pipePreparedInsertDataQuery,
  prepareHtmlRegistry,
} from '@platejs/core/internal';
import { PathApi, property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isUrl } from '@udecode/utils';

import {
  defineMediaPlugin,
  mediaElementContent,
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

/** Enables support for images. */
export const BaseImagePlugin = createBasePlugin({
  key: KEYS.img,
  initialState,
  schema: {
    element: {
      content: mediaElementContent,
      isolating: true,
      keyboardSelectable: true,
      properties: {
        ...mediaElementProperties,
        alt: property.string(),
        initialHeight: property.number(),
        initialWidth: property.number(),
      },
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': [
        {
          decode: ({ element }) => {
            const image = element.querySelector<HTMLElement>(':scope > img');

            if (!image) return;

            const url = image.getAttribute('src');

            if (!url) return;

            const alt = image.getAttribute('alt');
            const initialHeight = Number(image.getAttribute('height'));
            const initialWidth = Number(image.getAttribute('width'));
            const width = image.style.width || undefined;

            return {
              ...(alt === null ? {} : { alt }),
              ...(Number.isFinite(initialHeight) && initialHeight > 0
                ? { initialHeight }
                : {}),
              ...(Number.isFinite(initialWidth) && initialWidth > 0
                ? { initialWidth }
                : {}),
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
              attributes: { class: 'plate-image' },
              children: [
                {
                  attributes: {
                    alt: node.alt,
                    height: node.initialHeight,
                    src: node.url,
                    width: node.initialWidth,
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
            if (element.parentElement?.matches('figure.plate-image')) return;

            const url = element.getAttribute('src');

            if (!url) return;

            const alt = element.getAttribute('alt');
            const initialHeight = Number(element.getAttribute('height'));
            const initialWidth = Number(element.getAttribute('width'));
            const width = element.style.width || undefined;

            return {
              ...(alt === null ? {} : { alt }),
              children: [{ text: '' }],
              ...(Number.isFinite(initialHeight) && initialHeight > 0
                ? { initialHeight }
                : {}),
              ...(Number.isFinite(initialWidth) && initialWidth > 0
                ? { initialWidth }
                : {}),
              ...(width === undefined ? {} : { width }),
              url,
            };
          },
          decodeOnly: true,
          match: [{ tag: 'img' }],
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
      (candidate) => candidate.key === plugin.key
    );

    if (!preparedHtmlPlugin) {
      throw new Error(`Parser plugin "${plugin.key}" is not installed.`);
    }

    return {
      extension: {
        clipboard: {
          insertData(dataTransfer, { next, transaction: tx }) {
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
              if (!tx.img.insert({ url: text })) {
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

                reader.addEventListener('load', async () => {
                  if (typeof reader.result !== 'string') return;

                  const uploadImage = store.get().uploadImage;
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
                });
                reader.readAsDataURL(file);
              }

              return true;
            }

            return next(dataTransfer);
          },
        },
      },
    };
  });

export type ImageConfig = InferConfig<typeof BaseImagePlugin>;

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
