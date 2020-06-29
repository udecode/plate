import { SlatePlugin } from '@udecode/core';
import { decoratePreview } from './decoratePreview';
import { renderLeafPreview } from './renderLeafPreview';

export const PreviewPlugin = (): SlatePlugin => ({
  decorate: decoratePreview(),
  renderLeaf: renderLeafPreview(),
});
