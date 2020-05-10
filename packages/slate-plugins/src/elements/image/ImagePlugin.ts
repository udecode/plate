import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { renderElementImage } from 'elements/image/renderElementImage';
import { deserializeImage } from './deserializeImage';

export const ImagePlugin = (
  options?: RenderElementOptions & { typeImg?: string }
): SlatePlugin => ({
  renderElement: renderElementImage(options),
  deserialize: deserializeImage(options),
});
