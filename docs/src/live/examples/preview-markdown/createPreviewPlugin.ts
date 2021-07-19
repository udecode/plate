import { PlatePlugin } from '@udecode/plate-core';
import { getPreviewDecorate } from './getPreviewDecorate';
import { getPreviewRenderLeaf } from './getPreviewRenderLeaf';

export const createPreviewPlugin = (): PlatePlugin => ({
  decorate: getPreviewDecorate(),
  renderLeaf: getPreviewRenderLeaf(),
});
