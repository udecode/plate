import { renderElementImage } from 'elements/image/renderElementImage';
import { SlatePlugin } from 'types';
import { RenderElementOptions } from '../types';
import { deserializeImage } from './deserializeImage';

export const ImagePlugin = (
  options?: RenderElementOptions & { typeImg?: string }
): SlatePlugin => ({
  renderElement: renderElementImage(options),
  deserialize: deserializeImage(options),
});
