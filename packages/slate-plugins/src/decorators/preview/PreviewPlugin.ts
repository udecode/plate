import { SlatePlugin } from 'common/types';
import { decoratePreview } from 'decorators/preview/decoratePreview';
import { renderLeafPreview } from 'decorators/preview/renderLeafPreview';

export const PreviewPlugin = (): SlatePlugin => ({
  decorate: decoratePreview(),
  renderLeaf: renderLeafPreview(),
});
