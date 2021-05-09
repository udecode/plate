import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getPreviewDecorate } from './getPreviewDecorate';
import { getPreviewRenderLeaf } from './getPreviewRenderLeaf';

export const createPreviewPlugin = (): SlatePlugin => ({
  decorate: getPreviewDecorate(),
  renderLeaf: getPreviewRenderLeaf(),
});
