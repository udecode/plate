import {
  type InferConfig,
  createBasePlugin,
  prepareInsertDataQuery,
} from '@platejs/core';
import { type NodeInsertNodesOptions, PathApi, property } from '@platejs/plite';
import { KEYS, type TImageElement } from '@platejs/utils';
import { isUrl } from '@udecode/utils';

import {
  mediaElementProperties,
  type MediaPluginOptions,
} from '../media/types';

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
export const BaseImagePlugin = createBasePlugin({
  key: KEYS.img,
  host: { dangerouslyAllowAttributes: ['alt', 'width', 'height'] },
  options: {} as ImagePluginOptions,
  schema: {
    element: {
      properties: {
        ...mediaElementProperties,
        initialHeight: property.number(),
        initialWidth: property.number(),
      },
      void: 'block',
    },
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'IMG',
          },
        ],
        parse: ({ element, type }) => {
          const url = element.getAttribute('src');

          if (url) return { type, url };
        },
      },
    },
  },
})
  .extendTx<{
    insert: (
      url: string,
      options?: NodeInsertNodesOptions<TImageElement>
    ) => void;
  }>(({ type }) => (tx) => ({
    insert: (url, options) => {
      const image = {
        children: [{ text: '' }],
        type,
        url,
      } satisfies TImageElement;

      if (options?.at === undefined) {
        tx.blocks.insertAfter(image, options);
      } else {
        tx.nodes.insert(image, options);
      }
    },
  }))
  .extendExtension(({ editor, getOptions, plugin, type }) => {
    const queryInsertData = prepareInsertDataQuery(editor, plugin);

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
            tx.blocks.insertAfter({
              children: [{ text: '' }],
              type,
              url: text,
            } satisfies TImageElement);

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

                editor.plugin(BaseImagePlugin).update.insert(url, {
                  at: blockPath ? PathApi.next(blockPath) : undefined,
                });
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
