import { type InferConfig, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  mediaElementProperties,
  type MediaPluginOptions,
} from '../media/types';

import { insertImageFromFiles } from './transforms';
import { withImageEmbed } from './withImageEmbed';
import { withImageUpload } from './withImageUpload';

type ImagePluginOptions = {
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
} & MediaPluginOptions;

type ImagePluginApi = {
  imageFromFiles: (files: FileList) => void;
};

/** Enables support for images. */
const BaseImagePluginDefinition = createBasePlugin({
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
}).extendApi<ImagePluginApi>(({ editor }) => ({
  imageFromFiles: (files: FileList) => insertImageFromFiles(editor, files),
}));

export type ImagePluginContract = InferConfig<typeof BaseImagePluginDefinition>;

export const BaseImagePlugin =
  BaseImagePluginDefinition.extendExtension(withImageUpload).extendExtension(
    withImageEmbed
  );

export type ImageConfig = InferConfig<typeof BaseImagePlugin>;
