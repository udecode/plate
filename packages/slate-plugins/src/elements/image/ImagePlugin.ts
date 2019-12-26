import { SlatePlugin } from 'types';
import { RenderElementOptions } from '../types';
import { deserializeImage } from './deserializeImage';
import { renderElementImage } from './renderElementImage';

export const ImagePlugin = (options?: RenderElementOptions): SlatePlugin => ({
  renderElement: renderElementImage(options),
  deserialize: deserializeImage(),
});
