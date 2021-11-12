import { createPlugin } from '@udecode/plate-core';
import { getImageDeserialize } from './getImageDeserialize';
import { ImagePlugin } from './types';
import { withImageUpload } from './withImageUpload';

export const ELEMENT_IMAGE = 'img';

/**
 * Enables support for images.
 */
export const createImagePlugin = createPlugin<ImagePlugin>({
  key: ELEMENT_IMAGE,
  isElement: true,
  isVoid: true,
  deserialize: getImageDeserialize(),
  withOverrides: withImageUpload(),
});
