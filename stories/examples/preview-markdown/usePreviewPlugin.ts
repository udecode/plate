import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useDecoratePreview } from './useDecoratePreview';
import { useRenderLeafPreview } from './useRenderLeafPreview';

export const usePreviewPlugin = (): SlatePlugin => ({
  decorate: useDecoratePreview(),
  renderLeaf: useRenderLeafPreview(),
});
