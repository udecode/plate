import { createPlugin } from '@udecode/plate-common/server';

import type { ImagePluginOptions } from './types';

import { withImage } from './withImage';

export const ELEMENT_IMAGE = 'img';

/** Enables support for images. */
export const ImagePlugin = createPlugin<'img', ImagePluginOptions>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_IMAGE,
  withOverrides: withImage,
}).extend(({ plugin }) => ({
  deserializeHtml: {
    getNode: ({ element }) => ({
      type: plugin.type,
      url: element.getAttribute('src'),
    }),
    rules: [
      {
        validNodeName: 'IMG',
      },
    ],
  },
}));
