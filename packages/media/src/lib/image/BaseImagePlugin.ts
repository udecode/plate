import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';

import type { MediaPluginOptions, TMediaElement } from '../media';

import { withImage } from './withImage';

export interface TImageElement extends TMediaElement {}

export type ImageConfig = PluginConfig<
  'img',
  {
    /**
     * An optional method that will upload the image to a server. The method
     * receives the base64 dataUrl of the uploaded image, and should return the
     * URL of the uploaded image.
     */
    uploadImage?: (
      dataUrl: ArrayBuffer | string
    ) => ArrayBuffer | Promise<ArrayBuffer | string> | string;

    /** Disable url embed on insert data. */
    disableEmbedInsert?: boolean;

    /** Disable file upload on insert data. */
    disableUploadInsert?: boolean;
  } & MediaPluginOptions
>;

/** Enables support for images. */
export const BaseImagePlugin = createTSlatePlugin<ImageConfig>({
  key: 'img',
  extendEditor: withImage,
  node: {
    dangerouslyAllowElementAttributes: ['alt'],
    isElement: true,
    isVoid: true,
  },
}).extend(({ plugin }) => ({
  parsers: {
    html: {
      deserializer: {
        parse: ({ element }) => ({
          type: plugin.node.type,
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
