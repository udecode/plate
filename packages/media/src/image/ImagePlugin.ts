import { createPlugin } from '@udecode/plate-common';

import type { ImagePluginOptions } from './types';

import { withImage } from './withImage';

/** Enables support for images. */
export const ImagePlugin = createPlugin<'img', ImagePluginOptions>({
  isElement: true,
  isVoid: true,
  key: 'img',
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
