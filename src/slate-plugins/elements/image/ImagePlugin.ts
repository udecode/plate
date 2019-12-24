import { SlatePlugin } from 'slate-plugins/types';
import { deserializeImage } from './deserializeImage';
import { renderElementImage } from './renderElementImage';

export const ImagePlugin = (): SlatePlugin => ({
  renderElement: renderElementImage(),
  deserialize: deserializeImage(),
});
