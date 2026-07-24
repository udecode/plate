import {
  type InferConfig,
  createBasePlugin,
  prepareHtmlParserQuery,
} from '@platejs/core';
import { PathApi, property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isUrl } from '@udecode/utils';

import {
  defineMediaPlugin,
  mediaElementContent,
  mediaElementProperties,
  type MediaPluginOptions,
} from '../media/MediaPlugin.internal';

export type ImagePluginOptions = {
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
} & MediaPluginOptions;

/** Enables support for images. */
export const BaseImagePlugin = defineMediaPlugin(
  createBasePlugin({
    key: KEYS.img,
    options: {} as ImagePluginOptions,
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
  }),
  (options, input) => ({
    ...input,
    url: options.transformUrl?.(input.url) ?? input.url,
  })
)
  .extendHtmlCodec(() => ({
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
                typeof node.width === 'number' ? `${node.width}px` : node.width,
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
  }))
  .extendHtmlCodec(() => ({
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
  }))
  .extendExtension(({ editor, getOptions, plugin }) => {
    const queryInsertData = prepareHtmlParserQuery(editor, plugin);

    return {
      clipboard: {
        insertData(dataTransfer, { next, tx }) {
          const format = 'text/plain';
          const text = dataTransfer.getData(format);
          const imageExtension = isUrl(text)
            ? new URL(text).pathname.split('.').pop()?.toLowerCase()
            : undefined;

          if (
            !getOptions().disableEmbedInsert &&
            imageExtension &&
            imageExtensions.has(imageExtension)
          ) {
            tx.img.insert({ url: text });

            return true;
          }

          if (!getOptions().disableUploadInsert && !text) {
            const { files } = dataTransfer;
            const imageFiles = Array.from(files).filter((file) =>
              file.type.startsWith('image/')
            );

            if (imageFiles.length === 0) return next(dataTransfer);
            if (
              !editor.read((state) =>
                queryInsertData(state, {
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

                const uploadImage = getOptions().uploadImage;
                const url = uploadImage
                  ? await uploadImage(reader.result)
                  : reader.result;
                const blockPath = block
                  ? editor.read.nodes.path(block)
                  : undefined;

                if (block && !blockPath) return;

                editor.plugin(BaseImagePlugin).update.insert(
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
