import { createPluginFactory } from '@udecode/plate-core';
import { getPreviewDecorate } from './getPreviewDecorate';

export const createPreviewPlugin = createPluginFactory({
  decorate: getPreviewDecorate(),
});
