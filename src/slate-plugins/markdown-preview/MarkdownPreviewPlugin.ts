import { SlatePlugin } from 'slate-react';
import { decoratePreview } from './decoratePreview';
import { renderLeafPreview } from './renderLeafPreview';

export const MarkdownPreviewPlugin = (): SlatePlugin => ({
  decorate: decoratePreview,
  renderLeaf: renderLeafPreview,
});
