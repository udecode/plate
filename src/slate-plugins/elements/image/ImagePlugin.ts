import { SlatePlugin } from 'slate-react';
import { deserializeImage } from './deserializeImage';
import { renderElementImage } from './renderElementImage';

export const ImagePlugin = (): SlatePlugin => ({
  renderElement: renderElementImage(),
  deserialize: deserializeImage(),
});
