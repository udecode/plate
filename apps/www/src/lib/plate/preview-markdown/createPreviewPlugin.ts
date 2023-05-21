import { createPluginFactory } from '@udecode/plate';
import { decoratePreview } from './decoratePreview';

export const createPreviewPlugin = createPluginFactory({
  key: 'preview-md',
  decorate: decoratePreview,
});
