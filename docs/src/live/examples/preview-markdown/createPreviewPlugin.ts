import { createPlugin } from '@udecode/plate-core';
import { getPreviewDecorate } from './getPreviewDecorate';

export const createPreviewPlugin = createPlugin({
  decorate: getPreviewDecorate(),
});
