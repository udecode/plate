import { SlatePlugin } from 'common/types';
import { renderElementImage } from 'elements/image/renderElementImage';
import { ImagePluginOptions } from 'elements/image/types';
import { deserializeImage } from './deserializeImage';

/**
 * Enables support for images.
 */
export const ImagePlugin = (options?: ImagePluginOptions): SlatePlugin => ({
  renderElement: renderElementImage(options),
  deserialize: deserializeImage(options),
});
