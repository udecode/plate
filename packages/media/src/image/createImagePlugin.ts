import { createPluginFactory } from '@udecode/plate-common/server';

import type { ImagePlugin } from './types';

import { withImage } from './withImage';

export const ELEMENT_IMAGE = 'img';

/** Enables support for images. */
export const createImagePlugin = createPluginFactory<ImagePlugin>({
  isElement: true,
  isVoid: true,
  key: ELEMENT_IMAGE,
  then: (editor, { type }) => ({
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
  }),
  withOverrides: withImage,
});
