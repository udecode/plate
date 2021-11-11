import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_IMAGE } from './defaults';
import { getImageDeserialize } from './getImageDeserialize';
import { WithImageUploadOptions } from './types';
import { withImageUpload } from './withImageUpload';

/**
 * Enables support for images.
 */
export const createImagePlugin = (
  options?: WithImageUploadOptions
): PlatePlugin => ({
  key: ELEMENT_IMAGE,
  isElement: true,
  isVoid: true,
  deserialize: getImageDeserialize(),
  withOverrides: withImageUpload(options),
});
