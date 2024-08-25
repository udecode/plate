import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';

import type { MediaPluginOptions, TMediaElement } from '../media';

import { withImage } from './withImage';

export interface TImageElement extends TMediaElement {}

export type ImageConfig = PluginConfig<
  'img',
  {
    /** Disable url embed on insert data. */
    disableEmbedInsert?: boolean;

    /** Disable file upload on insert data. */
    disableUploadInsert?: boolean;

    /**
     * An optional method that will upload the image to a server. The method
     * receives the base64 dataUrl of the uploaded image, and should return the
     * URL of the uploaded image.
     */
    uploadImage?: (
      dataUrl: ArrayBuffer | string
    ) => ArrayBuffer | Promise<ArrayBuffer | string> | string;
  } & MediaPluginOptions
>;

/** Enables support for images. */
export const ImagePlugin = createTSlatePlugin<ImageConfig>({
  extendEditor: withImage,
  isElement: true,
  isVoid: true,
  key: 'img',
}).extend(({ plugin }) => ({
  parsers: {
    html: {
      deserializer: {
        parse: ({ element }) => ({
          type: plugin.type,
          url: element.getAttribute('src'),
        }),
        rules: [
          {
            validNodeName: 'IMG',
          },
        ],
      },
    },
  },
}));
