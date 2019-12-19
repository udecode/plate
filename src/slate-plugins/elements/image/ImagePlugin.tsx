import { SlatePlugin } from 'slate-react';
import { renderElementImage } from './renderElementImage';
import { withImage } from './withImage';

export const ImagePlugin = (): SlatePlugin => ({
  editor: withImage,
  renderElement: renderElementImage(),
});
