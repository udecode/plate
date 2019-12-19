import { SlatePlugin } from 'slate-react';
import { renderElementImage } from './renderElementImage';

export const ImagePlugin = (): SlatePlugin => ({
  renderElement: renderElementImage(),
});
