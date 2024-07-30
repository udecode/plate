import { createPlugin } from '@udecode/plate-common/server';

import type { ImagePluginOptions } from './types';

import { withImage } from './withImage';

export const ELEMENT_IMAGE = 'img';

/** Enables support for images. */
export const ImagePlugin = createPlugin<ImagePluginOptions>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_IMAGE,
  withOverrides: withImage,
}).extend((_, { type }) => ({
  deserializeHtml: {
    getNode: (el) => ({
      type,
      url: el.getAttribute('src'),
    }),
    rules: [
      {
        validNodeName: 'IMG',
      },
    ],
  },
}));
