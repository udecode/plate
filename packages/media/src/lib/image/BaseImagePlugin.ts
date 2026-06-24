import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  createEditorPlugin,
  KEYS,
} from 'platejs';

import type { MediaPluginOptions } from '../media';

import { ImageRules } from './ImageRules';
import { insertImageFromFiles } from './transforms';

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
  } & MediaPluginOptions,
  {},
  {},
  {},
  {
    insert: {
      imageFromFiles: OmitFirst<typeof insertImageFromFiles>;
    };
  }
>;

/** Enables support for images. */
export const BaseImagePlugin = createEditorPlugin<ImageConfig>({
  key: KEYS.img,
  node: {
    dangerouslyAllowAttributes: ['alt', 'width', 'height'],
    isElement: true,
    isVoid: true,
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'IMG',
          },
        ],
        parse: ({ element, type }) => ({
          type,
          url: element.getAttribute('src'),
        }),
      },
    },
  },
  inputRules: [ImageRules.upload(), ImageRules.embed()],
}).extendTxGroup('insert', ({ editor }) => () => ({
  imageFromFiles: bindFirst(insertImageFromFiles, editor),
}));
