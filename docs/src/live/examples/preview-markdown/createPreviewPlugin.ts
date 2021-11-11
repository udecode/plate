import { PlatePlugin } from '@udecode/plate-core';
import { getPreviewDecorate } from './getPreviewDecorate';

export const createPreviewPlugin = (): PlatePlugin => ({
  decorate: getPreviewDecorate(),
});
