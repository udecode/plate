import { createPluginFactory } from '@udecode/plate-core';
import { decoratePreview } from './decoratePreview';

export const createPreviewPlugin = createPluginFactory({
  decorate: decoratePreview,
});
