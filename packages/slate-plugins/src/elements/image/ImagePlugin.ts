import { SlatePlugin } from '../../common';
import { deserializeImage } from './deserializeImage';
import { renderElementImage } from './renderElementImage';
import { IMAGE, ImagePluginOptions } from './types';

/**
 * Enables support for images.
 */
export const ImagePlugin = (options?: ImagePluginOptions): SlatePlugin => ({
  renderElement: renderElementImage(options),
  deserialize: deserializeImage(options),
  inlineTypes: options?.inlineTypes || [],
  voidTypes: [options?.typeImg || IMAGE],
});
